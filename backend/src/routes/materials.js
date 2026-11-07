import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const r = Router();
r.use(requireAuth);

async function canAccessClass(user, classId) {
  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return false;
  if (user.role === 'dosen') return cls.ownerId === user.id;
  return !!(await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: user.id, classId } },
  }));
}

// Dosen menambah materi teks (dipecah per paragraf) + opsional simpan URL PDF terpisah
r.post('/classes/:classId/materials', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0) return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccessClass(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });

  const p = z
    .object({
      title: z.string().trim().min(2).max(200),
      content: z.string().trim().max(100000).optional().default(''),
      pdfUrl: z.string().max(500).optional().nullable(),
      pdfName: z.string().trim().max(200).optional().nullable(),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0]?.message || 'Data tidak valid' });

  const rawContent = p.data.content?.trim() || '';
  if (!rawContent && !p.data.pdfUrl) {
    return res.status(400).json({ error: 'Harap masukkan teks materi atau lampirkan file PDF materi' });
  }

  const effectiveContent = rawContent || `Materi perkuliahan "${p.data.title}" tersedia dalam dokumen PDF terlampir (${p.data.pdfName || 'Dokumen PDF'}). Silakan baca dan pelajari dokumen tersebut.`;
  const parts = effectiveContent.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 250) return res.status(400).json({ error: 'Materi terlalu panjang (maksimal 250 paragraf)' });

  const material = await prisma.material.create({
    data: {
      classId,
      title: p.data.title,
      pdfUrl: p.data.pdfUrl ?? null,
      pdfName: p.data.pdfName ?? null,
      paragraphs: { create: parts.map((text, index) => ({ index, text })) },
    },
  });
  res.status(201).json(material);
});

// Upload PDF untuk materi — multipart/form-data, field "file"
// Mengembalikan { url, name } untuk dipakai di POST materi di atas
r.post('/classes/:classId/materials/upload-pdf', requireRole('dosen'), handleUpload, async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0) return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccessClass(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });
  if (!req.file) return res.status(400).json({ error: 'File PDF tidak ditemukan' });

  const url = `/uploads/${req.file.filename}`;
  res.json({ url, name: req.file.originalname, size: req.file.size });
});

// Upload PDF untuk submission mahasiswa
r.post('/classes/:classId/assignments/:assignmentId/upload-pdf', requireRole('mahasiswa'), handleUpload, async (req, res) => {
  const classId = Number(req.params.classId);
  if (!(await canAccessClass(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });
  if (!req.file) return res.status(400).json({ error: 'File PDF tidak ditemukan' });

  const url = `/uploads/${req.file.filename}`;
  res.json({ url, name: req.file.originalname, size: req.file.size });
});

r.get('/materials/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID materi tidak valid' });

  const material = await prisma.material.findUnique({
    where: { id },
    include: { paragraphs: { orderBy: { index: 'asc' } } },
  });
  if (!material || !(await canAccessClass(req.user, material.classId)))
    return res.status(404).json({ error: 'Materi tidak ditemukan' });

  if (req.user.role === 'dosen') {
    const hs = await prisma.highlight.findMany({
      where: { paragraph: { materialId: id } },
      select: { paragraphId: true, userId: true },
      distinct: ['paragraphId', 'userId'],
    });
    const counts = new Map();
    for (const h of hs) counts.set(h.paragraphId, (counts.get(h.paragraphId) || 0) + 1);
    material.paragraphs = material.paragraphs.map((p) => ({ ...p, students: counts.get(p.id) || 0 }));
  }
  res.json(material);
});

// Dosen menghapus materi
r.delete('/materials/:id', requireRole('dosen'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID materi tidak valid' });

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material || !(await canAccessClass(req.user, material.classId))) {
    return res.status(404).json({ error: 'Materi tidak ditemukan' });
  }

  await prisma.material.delete({ where: { id } });
  res.json({ ok: true });
});

export default r;
