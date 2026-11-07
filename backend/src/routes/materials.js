import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

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

// Dosen menambah materi (teks). Dipecah per paragraf agar sorotan stabil.
// Catatan: unggah PDF belum ada; konversi PDF -> teks bisa ditambahkan di sini.
r.post('/classes/:classId/materials', requireRole('dosen'), async (req, res) => {
  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId) || classId <= 0) return res.status(400).json({ error: 'ID kelas tidak valid' });
  if (!(await canAccessClass(req.user, classId))) return res.status(403).json({ error: 'Akses ditolak' });

  const p = z
    .object({
      title: z.string().trim().min(2).max(200),
      content: z.string().trim().min(10).max(100000),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Judul (2-200 karakter) dan isi materi (10-100.000 karakter) wajib diisi' });

  const parts = p.data.content.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 250) {
    return res.status(400).json({ error: 'Materi terlalu panjang (maksimal 250 paragraf)' });
  }

  const material = await prisma.material.create({
    data: {
      classId,
      title: p.data.title,
      paragraphs: { create: parts.map((text, index) => ({ index, text })) },
    },
  });
  res.status(201).json(material);
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

  // Dosen: jumlah mahasiswa berbeda yang menyorot tiap paragraf (peta panas, agregat tanpa nama)
  if (req.user.role === 'dosen') {
    const hs = await prisma.highlight.findMany({
      where: { paragraph: { materialId: id } },
      select: { paragraphId: true, userId: true },
      distinct: ['paragraphId', 'userId'],
    });
    const counts = new Map();
    for (const h of hs) {
      counts.set(h.paragraphId, (counts.get(h.paragraphId) || 0) + 1);
    }
    material.paragraphs = material.paragraphs.map((p) => ({ ...p, students: counts.get(p.id) || 0 }));
  }
  res.json(material);
});

export default r;
