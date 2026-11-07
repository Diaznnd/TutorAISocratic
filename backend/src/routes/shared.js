import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router({ mergeParams: true });
r.use(requireAuth);

async function canAccess(user, classId) {
  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return false;
  if (user.role === 'dosen') return cls.ownerId === user.id;
  return !!(await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: user.id, classId } },
  }));
}

/* ─── GET /api/classes/:classId/shared ─── */
r.get('/', async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0)
    return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccess(req.user, classId)))
    return res.status(403).json({ error: 'Akses ditolak' });

  const items = await prisma.sharedMaterial.findMany({
    where: { classId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

/* ─── POST /api/classes/:classId/shared — dosen unggah file (URL/link) ─── */
r.post('/', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0)
    return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccess(req.user, classId)))
    return res.status(403).json({ error: 'Akses ditolak' });

  const p = z
    .object({
      title: z.string().trim().min(2).max(200),
      fileUrl: z.string().url('URL tidak valid').max(2000),
      fileName: z.string().trim().min(1).max(200),
      fileType: z.string().trim().max(100).default('application/pdf'),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0]?.message || 'Data tidak valid' });

  const item = await prisma.sharedMaterial.create({
    data: {
      classId,
      title: p.data.title,
      fileUrl: p.data.fileUrl,
      fileName: p.data.fileName,
      fileType: p.data.fileType,
    },
  });
  res.status(201).json(item);
});

/* ─── DELETE /api/classes/:classId/shared/:id — dosen hapus ─── */
r.delete('/:id', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  const id = Number(req.params.id);
  if (!(await canAccess(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });
  await prisma.sharedMaterial.delete({ where: { id, classId } });
  res.json({ ok: true });
});

export default r;
