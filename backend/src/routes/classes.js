import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

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

export default r;
