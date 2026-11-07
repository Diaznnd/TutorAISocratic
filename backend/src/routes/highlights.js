import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const r = Router();
r.use(requireAuth, requireRole('mahasiswa'));

const highlightLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Terlalu banyak sorotan dalam waktu singkat. Harap perlambat aktivitas.',
  keyGenerator: (req) => `${req.user?.id || req.ip}_hl`,
});

r.post('/', highlightLimiter, async (req, res) => {
  const p = z
    .object({
      paragraphId: z.number().int().positive(),
      selectedText: z.string().trim().min(1).max(2000),
      note: z.string().trim().max(500).optional(),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Data sorotan tidak valid' });

  const para = await prisma.paragraph.findUnique({ where: { id: p.data.paragraphId }, include: { material: true } });
  if (!para) return res.status(404).json({ error: 'Paragraf tidak ditemukan' });

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: req.user.id, classId: para.material.classId } },
  });
  if (!enrolled) return res.status(403).json({ error: 'Akses ditolak' });

  // Keamanan: Validasi bahwa teks yang disorot benar-benar merupakan bagian dari paragraf materi
  const selected = p.data.selectedText;
  if (!para.text.includes(selected)) {
    return res.status(400).json({ error: 'Teks yang disorot tidak ditemukan di dalam paragraf materi ini' });
  }

  // Cek apakah mahasiswa sudah pernah menyorot teks yang sama di paragraf ini (hindari duplikasi baris database)
  const existing = await prisma.highlight.findFirst({
    where: { userId: req.user.id, paragraphId: para.id, selectedText: selected },
  });
  if (existing) {
    if (p.data.note !== undefined && p.data.note !== existing.note) {
      const updated = await prisma.highlight.update({
        where: { id: existing.id },
        data: { note: p.data.note },
      });
      return res.json(updated);
    }
    return res.json(existing);
  }

  const h = await prisma.highlight.create({
    data: {
      userId: req.user.id,
      paragraphId: para.id,
      selectedText: selected,
      note: p.data.note,
    },
  });
  res.status(201).json(h);
});

export default r;
