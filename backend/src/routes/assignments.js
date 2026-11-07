import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';

const r = Router({ mergeParams: true }); // akses :classId dari parent
r.use(requireAuth);

// Helper: cek akses kelas
async function canAccess(user, classId) {
  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return false;
  if (user.role === 'dosen') return cls.ownerId === user.id;
  return !!(await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: user.id, classId } },
  }));
}

/* ─── GET /api/classes/:classId/assignments ─── */
r.get('/', async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0)
    return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccess(req.user, classId)))
    return res.status(403).json({ error: 'Akses ditolak' });

  const assignments = await prisma.assignment.findMany({
    where: { classId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { submissions: true } },
      // Mahasiswa: ambil submission miliknya saja
      submissions:
        req.user.role === 'mahasiswa'
          ? { where: { userId: req.user.id }, select: { id: true, grade: true, submittedAt: true } }
          : false,
    },
  });
  res.json(assignments);
});

/* ─── GET /api/classes/:classId/assignments/:id — detail tugas tunggal ─── */
r.get('/:id', async (req, res) => {
  const classId = Number(req.params.classId);
  const id = Number(req.params.id);
  if (!Number.isInteger(classId) || classId <= 0 || !Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: 'ID tidak valid' });
  if (!(await canAccess(req.user, classId)))
    return res.status(403).json({ error: 'Akses ditolak' });

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          code: true,
          owner: { select: { id: true, name: true, email: true } },
        },
      },
      submissions:
        req.user.role === 'mahasiswa'
          ? {
              where: { userId: req.user.id },
              select: {
                id: true,
                content: true,
                linkUrl: true,
                fileUrl: true,
                fileName: true,
                grade: true,
                feedback: true,
                submittedAt: true,
                gradedAt: true,
              },
            }
          : {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
    },
  });
  if (!assignment || assignment.classId !== classId) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan' });
  }
  res.json(assignment);
});

/* ─── POST /api/classes/:classId/assignments — dosen buat tugas ─── */
r.post('/', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0)
    return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccess(req.user, classId)))
    return res.status(403).json({ error: 'Akses ditolak' });

  const p = z
    .object({
      title: z.string().trim().min(2).max(200),
      description: z.string().trim().max(5000).default(''),
      dueDate: z.string().datetime({ offset: true }).optional().nullable(),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0]?.message || 'Data tidak valid' });

  const assignment = await prisma.assignment.create({
    data: {
      classId,
      title: p.data.title,
      description: p.data.description,
      dueDate: p.data.dueDate ? new Date(p.data.dueDate) : null,
    },
  });
  res.status(201).json(assignment);
});

/* ─── PATCH /api/classes/:classId/assignments/:id — dosen edit tugas ─── */
r.patch('/:id', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  const id = Number(req.params.id);
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });

  const p = z
    .object({
      title: z.string().trim().min(2).max(200).optional(),
      description: z.string().trim().max(5000).optional(),
      dueDate: z.string().datetime({ offset: true }).nullable().optional(),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Data tidak valid' });

  const assignment = await prisma.assignment.update({
    where: { id, classId },
    data: {
      ...(p.data.title !== undefined && { title: p.data.title }),
      ...(p.data.description !== undefined && { description: p.data.description }),
      ...(p.data.dueDate !== undefined && { dueDate: p.data.dueDate ? new Date(p.data.dueDate) : null }),
    },
  });
  res.json(assignment);
});

/* ─── DELETE /api/classes/:classId/assignments/:id — dosen hapus tugas ─── */
r.delete('/:id', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  const id = Number(req.params.id);
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });
  await prisma.assignment.delete({ where: { id, classId } });
  res.json({ ok: true });
});

/* ─── GET /api/classes/:classId/assignments/:id/submissions — dosen lihat semua submission ─── */
r.get('/:id/submissions', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  const assignmentId = Number(req.params.id);
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    orderBy: { submittedAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json(submissions);
});

/* ─── POST /api/classes/:classId/assignments/:id/upload-pdf — mahasiswa upload PDF tugas ─── */
r.post('/:id/upload-pdf', requireRole('mahasiswa'), handleUpload, async (req, res) => {
  const classId = Number(req.params.classId);
  const assignmentId = Number(req.params.id);
  if (!Number.isInteger(classId) || classId <= 0 || !Number.isInteger(assignmentId) || assignmentId <= 0) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });
  if (!req.file) return res.status(400).json({ error: 'File PDF tidak ditemukan' });

  const url = `/uploads/${req.file.filename}`;
  res.json({ url, name: req.file.originalname, size: req.file.size });
});

/* ─── POST /api/classes/:classId/assignments/:id/submit — mahasiswa kumpul tugas ─── */
r.post('/:id/submit', requireRole('mahasiswa'), async (req, res) => {
  const classId = Number(req.params.classId);
  const assignmentId = Number(req.params.id);
  if (!Number.isInteger(classId) || classId <= 0 || !Number.isInteger(assignmentId) || assignmentId <= 0) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });

  // Pastikan tugas ini benar ada dalam kelas
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, classId },
  });
  if (!assignment) return res.status(404).json({ error: 'Tugas tidak ditemukan' });

  const p = z
    .object({
      content: z.string().trim().max(20000).default(''),
      linkUrl: z.string().url().optional().nullable().or(z.literal('')),
      fileUrl: z.string().max(500).optional().nullable(),
      fileName: z.string().trim().max(200).optional().nullable(),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0]?.message || 'Data tidak valid' });

  const effectiveLink = p.data.linkUrl && p.data.linkUrl.trim() ? p.data.linkUrl.trim() : null;

  // Minimal satu dari tiga harus diisi
  if (!p.data.content && !effectiveLink && !p.data.fileUrl) {
    return res.status(400).json({ error: 'Isi jawaban teks, link dokumen, atau file PDF wajib diisi' });
  }

  const submission = await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: req.user.id } },
    update: {
      content: p.data.content || '',
      linkUrl: effectiveLink,
      fileUrl: p.data.fileUrl ?? null,
      fileName: p.data.fileName ?? null,
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: req.user.id,
      content: p.data.content || '',
      linkUrl: effectiveLink,
      fileUrl: p.data.fileUrl ?? null,
      fileName: p.data.fileName ?? null,
    },
  });
  res.status(201).json(submission);
});

/* ─── PATCH /api/classes/:classId/assignments/:id/submissions/:subId/grade — dosen nilai ─── */
r.patch('/:id/submissions/:subId/grade', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  const subId = Number(req.params.subId);
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });

  const p = z
    .object({
      grade: z.number().int().min(0).max(100),
      feedback: z.string().trim().max(2000).optional().default(''),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Nilai harus angka 0-100' });

  const submission = await prisma.submission.update({
    where: { id: subId },
    data: { grade: p.data.grade, feedback: p.data.feedback, gradedAt: new Date() },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json(submission);
});

export default r;
