import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { streamChat } from '../ai/llm.js';
import { tutorSystemPrompt } from '../ai/tutorPrompt.js';

const r = Router();
r.use(requireAuth, requireRole('mahasiswa'));

// Batasi panggilan tutor: maks 20 kali per 2 menit per mahasiswa untuk mencegah abuse kuota LLM
const tutorLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 20,
  message: 'Terlalu banyak permintaan ke tutor AI. Harap tunggu sebentar sebelum mengirim pesan baru.',
  keyGenerator: (req) => `${req.user?.id || req.ip}_tutor`,
});

// Aturan sederhana: tingkat petunjuk naik hanya bila mahasiswa jelas tersangkut.
const STUCK = /(tidak|nggak|gak|ga|belum)\s*(tahu|paham|ngerti|mengerti)|bingung|\?\?/i;

r.post('/', tutorLimiter, async (req, res) => {
  const p = z
    .object({
      sessionId: z.number().int().positive().optional(),
      paragraphId: z.number().int().positive(),
      selectedText: z.string().trim().min(1).max(2000),
      message: z.string().trim().min(1).max(1000).optional(),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Data permintaan tutor tidak valid' });

  const para = await prisma.paragraph.findUnique({ where: { id: p.data.paragraphId }, include: { material: true } });
  if (!para) return res.status(404).json({ error: 'Paragraf tidak ditemukan' });

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: req.user.id, classId: para.material.classId } },
  });
  if (!enrolled) return res.status(403).json({ error: 'Akses ditolak' });

  // Keamanan: Validasi bahwa selectedText memang ada di dalam materi
  if (!para.text.includes(p.data.selectedText)) {
    return res.status(400).json({ error: 'Teks yang disorot tidak ditemukan di dalam paragraf materi ini' });
  }

  let session;
  if (p.data.sessionId) {
    session = await prisma.tutorSession.findUnique({ where: { id: p.data.sessionId } });
    // Validasi kepemilikan dan keterkaitan paragraf
    if (!session || session.userId !== req.user.id || session.paragraphId !== para.id) {
      return res.status(404).json({ error: 'Sesi tidak valid untuk paragraf ini' });
    }
  } else {
    session = await prisma.tutorSession.create({
      data: { userId: req.user.id, paragraphId: para.id, selectedText: p.data.selectedText },
    });
  }

  // messages sudah berupa array native (kolom Json PostgreSQL)
  let messages = Array.isArray(session.messages) ? session.messages : [];

  // Batasi panjang riwayat percakapan untuk mencegah pembengkakan token dan biaya LLM
  if (messages.length >= 30) {
    return res.status(400).json({ error: 'Sesi bimbingan ini telah mencapai batas interaksi. Silakan buat sesi baru untuk materi ini.' });
  }

  let hintLevel = session.hintLevel;
  const userText = p.data.message || `Saya belum paham bagian ini: "${p.data.selectedText}"`;
  if (p.data.message && STUCK.test(p.data.message)) hintLevel = Math.min(5, hintLevel + 1);
  messages.push({ role: 'user', content: userText });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  const send = (obj) => {
    if (!isAborted) res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };
  send({ type: 'session', sessionId: session.id, hintLevel });

  let full = '';
  try {
    const system = tutorSystemPrompt({ paragraphText: para.text, selectedText: session.selectedText, hintLevel });
    for await (const chunk of streamChat({ system, messages })) {
      if (isAborted) break;
      full += chunk;
      send({ type: 'delta', text: chunk });
    }
    if (full) {
      messages.push({ role: 'assistant', content: full });
      await prisma.tutorSession.update({
        where: { id: session.id },
        data: { messages, hintLevel },
      });
    }
    if (!isAborted) send({ type: 'done' });
  } catch (e) {
    console.error(e);
    if (!isAborted) send({ type: 'error', error: 'Tutor sedang tidak dapat dihubungi. Sorotanmu tetap tersimpan.' });
  }
  if (!isAborted) res.end();
});

export default r;
