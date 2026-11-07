import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import assignmentsRouter from './assignments.js';
import sharedRouter from './shared.js';

const r = Router();
r.use(requireAuth);

// Gunakan CSPRNG untuk menghasilkan kode kelas acak yang aman dan tidak dapat diprediksi
const makeCode = () => crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();

// Batasi percobaan join kelas (maks 15 kali per 10 menit per mahasiswa) untuk mencegah tebak kode
const joinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'Terlalu banyak percobaan memasukkan kode kelas. Coba lagi dalam 10 menit.',
  keyGenerator: (req) => `${req.user?.id || req.ip}_join`,
});

r.post('/', requireRole('dosen'), async (req, res) => {
  const p = z.object({ name: z.string().trim().min(2).max(100) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Nama kelas wajib diisi (2-100 karakter)' });

  // Coba buat kelas dengan penanganan tabrakan kode unik (maksimal 3 percobaan)
  let cls;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      cls = await prisma.class.create({
        data: { name: p.data.name, code: makeCode(), ownerId: req.user.id },
      });
      break;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
  res.status(201).json(cls);
});

r.post('/join', requireRole('mahasiswa'), joinLimiter, async (req, res) => {
  const p = z
    .object({
      code: z.string().trim().min(4).max(12).regex(/^[A-Za-z0-9]+$/, 'Format kode tidak valid'),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Format kode kelas tidak valid' });

  const code = p.data.code.toUpperCase();
  const cls = await prisma.class.findUnique({ where: { code } });
  if (!cls) return res.status(404).json({ error: 'Kode kelas tidak ditemukan' });

  await prisma.enrollment.upsert({
    where: { userId_classId: { userId: req.user.id, classId: cls.id } },
    update: {},
    create: { userId: req.user.id, classId: cls.id },
  });
  res.json(cls);
});

r.get('/', async (req, res) => {
  const include = { materials: { select: { id: true, title: true }, orderBy: { id: 'desc' } } };
  const classes =
    req.user.role === 'dosen'
      ? await prisma.class.findMany({ where: { ownerId: req.user.id }, include })
      : await prisma.class.findMany({ where: { enrollments: { some: { userId: req.user.id } } }, include });
  res.json(classes);
});

// GET kelas tunggal by id (beserta owner, materi, assignment + submissions milik user, shared)
r.get('/:classId', async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0)
    return res.status(400).json({ error: 'ID kelas tidak valid' });

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      materials: { select: { id: true, title: true, pdfUrl: true, pdfName: true, createdAt: true }, orderBy: { id: 'desc' } },
      assignments: {
        orderBy: { createdAt: 'desc' },
        include: {
          // Mahasiswa: sertakan submission miliknya saja agar badge "Dikumpulkan" persistent
          submissions: req.user.role === 'mahasiswa'
            ? {
                where: { userId: req.user.id },
                select: { id: true, content: true, linkUrl: true, fileUrl: true, fileName: true, grade: true, feedback: true, submittedAt: true },
              }
            : false,
        },
      },
      sharedMaterials: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!cls) return res.status(404).json({ error: 'Kelas tidak ditemukan' });

  const hasAccess =
    cls.ownerId === req.user.id ||
    !!(await prisma.enrollment.findUnique({
      where: { userId_classId: { userId: req.user.id, classId } },
    }));
  if (!hasAccess) return res.status(403).json({ error: 'Akses ditolak' });

  res.json(cls);
});

// GET /api/classes/mine/assignments — semua tugas di kelas yang diikuti mahasiswa (untuk halaman Daftar Tugas)
r.get('/mine/assignments', requireRole('mahasiswa'), async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          owner: { select: { id: true, name: true } },
          assignments: {
            orderBy: { dueDate: 'asc' },
            include: {
              submissions: {
                where: { userId: req.user.id },
                select: { id: true, grade: true, submittedAt: true },
              },
            },
          },
        },
      },
    },
  });

  // Flatten: setiap assignment disertai info kelas
  const result = [];
  for (const e of enrollments) {
    for (const a of e.class.assignments) {
      result.push({
        ...a,
        className: e.class.name,
        classId: e.class.id,
        ownerName: e.class.owner.name,
      });
    }
  }
  // Sort: yang belum dikumpulkan dulu, kemudian by dueDate asc
  result.sort((a, b) => {
    const aSub = a.submissions.length > 0;
    const bSub = b.submissions.length > 0;
    if (aSub !== bSub) return aSub ? 1 : -1;
    return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
  });
  res.json(result);
});

// GET /api/classes/mine/notifications — notifikasi: tugas baru dalam 7 hari terakhir
r.get('/mine/notifications', requireRole('mahasiswa'), async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          owner: { select: { name: true } },
          assignments: {
            where: { createdAt: { gte: sevenDaysAgo } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, dueDate: true, createdAt: true },
          },
        },
      },
    },
  });

  const notifs = [];
  for (const e of enrollments) {
    for (const a of e.class.assignments) {
      notifs.push({
        type: 'new_assignment',
        title: `Tugas baru dari ${e.class.owner.name}`,
        body: `${a.title} — ${e.class.name}`,
        classId: e.class.id,
        assignmentId: a.id,
        createdAt: a.createdAt,
      });
    }
  }
  notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifs);
});

// Mount sub-router assignments dan shared
r.use('/:classId/assignments', assignmentsRouter);
r.use('/:classId/shared', sharedRouter);

export default r;
