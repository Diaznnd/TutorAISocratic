import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { streamChat } from '../ai/llm.js';

console.log('🚀 Loading pretest routes...');

const r = Router();
r.use(requireAuth, requireRole('mahasiswa'));

console.log('✅ Pretest router created with middleware');

// Rate limiter untuk Pre-Test
const pretestLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 30,
  message: 'Terlalu banyak permintaan Pre-Test. Harap tunggu sebentar.',
  keyGenerator: (req) => `${req.user?.id || req.ip}_pretest`,
});

// System prompt untuk Pre-Test
const pretestSystemPrompt = (materialContext) => `Kamu adalah sistem Pre-Test AI yang interaktif untuk mengevaluasi pemahaman mahasiswa.

${materialContext ? `KONTEKS MATERI:\n${materialContext}\n` : ''}

PERAN:
- Ajukan pertanyaan pemahaman konsep satu per satu
- Evaluasi jawaban mahasiswa apakah benar atau salah
- Gunakan metode Socratic untuk menggali pemahaman

FORMAT RESPONSE:
1. Ketika mengajukan pertanyaan baru, mulai dengan "[PERTANYAAN]"
2. Ketika mengevaluasi jawaban mahasiswa, mulai dengan "[EVALUASI]" diikuti "[BENAR]" atau "[SALAH]"

ATURAN PENJELASAN:
**UNTUK JAWABAN BENAR ([BENAR]):**
- Berikan konfirmasi singkat (1-2 kalimat)
- JANGAN berikan penjelasan panjang
- Contoh: "[EVALUASI] [BENAR] Tepat sekali! Mari lanjut ke pertanyaan berikutnya."

**UNTUK JAWABAN SALAH ([SALAH]):**
- Berikan penjelasan RINCI dan LENGKAP (3-5 kalimat atau lebih)
- Jelaskan MENGAPA jawaban salah
- Berikan KONSEP yang benar dengan detail
- Berikan CONTOH konkret jika diperlukan
- Tambahkan CATATAN PENTING untuk pemahaman
- Penjelasan ini akan DISIMPAN di history untuk review mahasiswa

CONTOH:
[PERTANYAAN] Apa yang dimaksud dengan algoritma?

Mahasiswa: "Algoritma adalah langkah-langkah untuk menyelesaikan masalah"
[EVALUASI] [BENAR] Tepat sekali! Definisi Anda sudah benar.

Mahasiswa: "Algoritma adalah bahasa pemrograman"
[EVALUASI] [SALAH] 
PENJELASAN RINCI:
Algoritma BUKAN bahasa pemrograman. Algoritma adalah serangkaian langkah-langkah logis dan terstruktur yang digunakan untuk menyelesaikan suatu masalah atau mencapai tujuan tertentu.

PERBEDAAN PENTING:
- Algoritma = Konsep/cara berpikir (language-independent)
- Bahasa Pemrograman = Tools untuk mengimplementasikan algoritma (Python, Java, C++, dll)

ANALOGI:
Algoritma seperti resep masakan (langkah-langkah memasak), sedangkan bahasa pemrograman seperti alat masak yang Anda gunakan (kompor gas, kompor listrik, microwave).

CONTOH KONKRET:
Algoritma: "Urutkan data dari kecil ke besar"
Implementasi: Bisa ditulis dalam Python, Java, C++, atau bahasa apapun.

CATATAN: Pahami bahwa satu algoritma bisa diimplementasikan dalam berbagai bahasa pemrograman yang berbeda.

ATURAN UMUM:
- Tanyakan 5-10 pertanyaan untuk pre-test lengkap
- Variasi tingkat kesulitan dari mudah ke sulit
- Fokus pada pemahaman konsep, bukan hafalan
- Jika mahasiswa mengetik "selesai" atau "cukup", akhiri pre-test
- Selalu berikan feedback yang konstruktif`;

// POST /api/pretest/start - Mulai pre-test baru
r.post('/start', pretestLimiter, async (req, res) => {
  const p = z
    .object({
      classId: z.number().int().positive(),
      materialId: z.number().int().positive().optional(),
    })
    .safeParse(req.body);

  if (!p.success) return res.status(400).json({ error: 'Data tidak valid' });

  // Validasi enrollment
  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: req.user.id, classId: p.data.classId } },
  });
  if (!enrolled) return res.status(403).json({ error: 'Anda tidak terdaftar di kelas ini' });

  // Ambil konteks materi jika ada
  let materialContext = '';
  if (p.data.materialId) {
    const material = await prisma.material.findFirst({
      where: { id: p.data.materialId, classId: p.data.classId },
      include: { paragraphs: { orderBy: { index: 'asc' }, take: 10 } },
    });
    if (material) {
      materialContext = `JUDUL MATERI: ${material.title}\n\n`;
      materialContext += material.paragraphs.map((p) => p.text).join('\n\n');
      // Batasi panjang konteks
      if (materialContext.length > 3000) {
        materialContext = materialContext.substring(0, 3000) + '...';
      }
    }
  }

  // Buat sesi pre-test baru
  const pretest = await prisma.preTest.create({
    data: {
      userId: req.user.id,
      classId: p.data.classId,
      materialId: p.data.materialId,
      messages: [],
      status: 'ongoing',
    },
  });

  res.json({
    pretestId: pretest.id,
    message: 'Pre-test dimulai. Saya akan mengajukan beberapa pertanyaan untuk mengevaluasi pemahaman Anda.',
    materialContext: materialContext ? 'Berdasarkan materi yang dipilih' : 'Pre-test umum',
  });
});

// POST /api/pretest/chat - Kirim jawaban atau terima pertanyaan
r.post('/chat', pretestLimiter, async (req, res) => {
  const p = z
    .object({
      pretestId: z.number().int().positive(),
      message: z.string().trim().min(1).max(2000),
    })
    .safeParse(req.body);

  if (!p.success) return res.status(400).json({ error: 'Data tidak valid' });

  const pretest = await prisma.preTest.findUnique({
    where: { id: p.data.pretestId },
  });

  if (!pretest || pretest.userId !== req.user.id) {
    return res.status(404).json({ error: 'Pre-test tidak ditemukan' });
  }

  if (pretest.status === 'completed') {
    return res.status(400).json({ error: 'Pre-test sudah selesai' });
  }

  // Ambil konteks materi jika ada
  let materialContext = '';
  if (pretest.materialId) {
    const material = await prisma.material.findUnique({
      where: { id: pretest.materialId },
      include: { paragraphs: { orderBy: { index: 'asc' }, take: 10 } },
    });
    if (material) {
      materialContext = `JUDUL MATERI: ${material.title}\n\n`;
      materialContext += material.paragraphs.map((p) => p.text).join('\n\n');
      if (materialContext.length > 3000) {
        materialContext = materialContext.substring(0, 3000) + '...';
      }
    }
  }

  let messages = Array.isArray(pretest.messages) ? pretest.messages : [];
  
  // Batasi panjang percakapan
  if (messages.length >= 50) {
    return res.status(400).json({ error: 'Pre-test telah mencapai batas pertanyaan. Silakan selesaikan pre-test ini.' });
  }

  // Check jika user ingin mengakhiri
  const endKeywords = /^(selesai|cukup|stop|akhiri|finish|done)$/i;
  const isEnding = endKeywords.test(p.data.message.trim());

  // Tambahkan pesan user
  messages.push({ role: 'user', content: p.data.message });

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

  send({ type: 'pretestId', pretestId: pretest.id });

  let fullResponse = '';
  try {
    const system = pretestSystemPrompt(materialContext);
    
    // Jika user minta selesai, beri kesimpulan
    if (isEnding) {
      const conclusionPrompt = 'Mahasiswa ingin mengakhiri pre-test. Berikan ringkasan evaluasi singkat dan ucapan penutup.';
      messages.push({ role: 'user', content: conclusionPrompt });
    }

    // Stream response dari AI
    for await (const chunk of streamChat({ system, messages })) {
      if (isAborted) break;
      fullResponse += chunk;
      send({ type: 'delta', text: chunk });
    }

    // Analisis response untuk deteksi evaluasi
    let isCorrect = null;
    if (fullResponse.includes('[EVALUASI]')) {
      if (fullResponse.includes('[BENAR]')) {
        isCorrect = true;
      } else if (fullResponse.includes('[SALAH]')) {
        isCorrect = false;
      }
    }

    // Simpan response AI dengan metadata lengkap
    if (fullResponse) {
      // Extract user's answer (last user message)
      const userAnswer = messages[messages.length - 1]?.content || '';
      
      // Simpan dengan metadata lengkap
      const messageData = { 
        role: 'assistant', 
        content: fullResponse,
        isCorrect: isCorrect,
        timestamp: new Date().toISOString(),
        userAnswer: userAnswer, // Simpan jawaban user untuk context
        hasDetailedExplanation: isCorrect === false, // Flag untuk jawaban salah yang perlu review
      };
      
      messages.push(messageData);

      // Update statistik jika ada evaluasi
      let updateData = { messages };
      
      if (isCorrect !== null) {
        const totalQA = pretest.totalQA + 1;
        const correctQA = pretest.correctQA + (isCorrect ? 1 : 0);
        const score = totalQA > 0 ? (correctQA / totalQA) * 100 : 0;
        
        updateData = {
          ...updateData,
          totalQA,
          correctQA,
          score,
        };
      }

      // Jika user minta selesai, tandai sebagai completed
      if (isEnding) {
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      }

      await prisma.preTest.update({
        where: { id: pretest.id },
        data: updateData,
      });

      if (isCorrect !== null) {
        send({ 
          type: 'evaluation', 
          isCorrect, 
          totalQA: updateData.totalQA || pretest.totalQA,
          correctQA: updateData.correctQA || pretest.correctQA,
          score: updateData.score || pretest.score,
        });
      }
    }

    if (!isAborted) send({ type: 'done' });
  } catch (e) {
    console.error('Pre-test error:', e);
    if (!isAborted) send({ type: 'error', error: 'Terjadi kesalahan saat memproses pre-test' });
  }

  if (!isAborted) res.end();
});

// GET /api/pretest/history/:classId - Ambil history pre-test untuk kelas tertentu
console.log('📝 Registering GET /history/:classId');
r.get('/history/:classId', async (req, res) => {
  const classId = parseInt(req.params.classId);
  if (isNaN(classId)) return res.status(400).json({ error: 'Class ID tidak valid' });

  // Validasi enrollment
  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: req.user.id, classId } },
  });
  if (!enrolled) return res.status(403).json({ error: 'Akses ditolak' });

  const history = await prisma.preTest.findMany({
    where: { userId: req.user.id, classId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json(history);
});

// POST /api/pretest/:id/complete - Selesaikan pre-test (bisa dipanggil kapan saja)
console.log('📝 Registering POST /:id/complete');
r.post('/:id/complete', async (req, res) => {
  const pretestId = parseInt(req.params.id);
  if (isNaN(pretestId)) return res.status(400).json({ error: 'Pre-test ID tidak valid' });

  const pretest = await prisma.preTest.findUnique({
    where: { id: pretestId },
  });

  if (!pretest || pretest.userId !== req.user.id) {
    return res.status(404).json({ error: 'Pre-test tidak ditemukan' });
  }

  const score = pretest.totalQA > 0 ? (pretest.correctQA / pretest.totalQA) * 100 : 0;
  const updated = await prisma.preTest.update({
    where: { id: pretestId },
    data: {
      status: 'completed',
      score: pretest.score != null ? pretest.score : score,
      completedAt: new Date(),
    },
  });

  res.json({ ok: true, pretest: updated });
});

// PUT /api/pretest/:id/notes - Simpan catatan pribadi mahasiswa untuk pre-test ini
console.log('📝 Registering PUT /:id/notes');
r.put('/:id/notes', async (req, res) => {
  const pretestId = parseInt(req.params.id);
  if (isNaN(pretestId)) return res.status(400).json({ error: 'Pre-test ID tidak valid' });

  const p = z
    .object({
      notes: z.record(z.string()).or(z.string()),
    })
    .safeParse(req.body);

  if (!p.success) return res.status(400).json({ error: 'Format catatan tidak valid' });

  const pretest = await prisma.preTest.findUnique({
    where: { id: pretestId },
  });

  if (!pretest || pretest.userId !== req.user.id) {
    return res.status(404).json({ error: 'Pre-test tidak ditemukan' });
  }

  let messages = Array.isArray(pretest.messages) ? pretest.messages : [];
  let metaIdx = messages.findIndex((m) => m._type === 'pretest_meta');
  
  if (metaIdx === -1) {
    messages.push({
      _type: 'pretest_meta',
      notes: typeof p.data.notes === 'object' ? p.data.notes : { general: p.data.notes },
    });
  } else {
    const existing = messages[metaIdx];
    messages[metaIdx] = {
      ...existing,
      notes:
        typeof p.data.notes === 'object'
          ? { ...(existing.notes || {}), ...p.data.notes }
          : { ...(existing.notes || {}), general: p.data.notes },
    };
  }

  await prisma.preTest.update({
    where: { id: pretestId },
    data: { messages },
  });

  res.json({ ok: true, message: 'Catatan berhasil disimpan' });
});

// GET /api/pretest/:id/review - Ambil rangkuman materi & review dari SEMUA pertanyaan (benar & salah)
// HARUS SEBELUM /:id karena Express match route pertama
console.log('📝 Registering GET /:id/review');
r.get('/:id/review', async (req, res) => {
  const pretestId = parseInt(req.params.id);
  if (isNaN(pretestId)) {
    return res.status(400).json({ error: 'Pre-test ID tidak valid' });
  }

  const pretest = await prisma.preTest.findUnique({
    where: { id: pretestId },
  });

  if (!pretest || pretest.userId !== req.user.id) {
    return res.status(404).json({ error: 'Pre-test tidak ditemukan' });
  }

  let materialInfo = null;
  if (pretest.materialId) {
    materialInfo = await prisma.material.findUnique({
      where: { id: pretest.materialId },
      select: { id: true, title: true, pdfName: true },
    });
  }

  const messages = Array.isArray(pretest.messages) ? pretest.messages : [];
  const metaMsg = messages.find((m) => m._type === 'pretest_meta');
  const savedNotes = metaMsg?.notes || {};

  const allQA = [];
  const wrongAnswers = [];
  const correctAnswers = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    // Identifikasi pesan evaluasi assistant
    if (msg.role === 'assistant' && msg.isCorrect !== undefined && msg.isCorrect !== null) {
      // Cari pertanyaan sebelumnya
      let question = '';
      for (let j = i - 1; j >= 0; j--) {
        if (messages[j]?.content && messages[j].content.includes('[PERTANYAAN]')) {
          question = messages[j].content;
          break;
        }
      }
      if (!question && i > 0 && messages[i - 1]?.role === 'user') {
        for (let j = i - 2; j >= 0; j--) {
          if (messages[j]?.content && messages[j].content.includes('[PERTANYAAN]')) {
            question = messages[j].content;
            break;
          }
        }
      }

      const qIndex = allQA.length;
      const cleanQuestion = question.replace(/\[PERTANYAAN\]/gi, '').trim();
      const cleanExplanation = (msg.content || '')
        .replace(/\[EVALUASI\]/gi, '')
        .replace(/\[BENAR\]/gi, '')
        .replace(/\[SALAH\]/gi, '')
        .trim();

      const item = {
        questionIndex: qIndex,
        questionNumber: qIndex + 1,
        question: cleanQuestion || `Pertanyaan #${qIndex + 1}`,
        userAnswer: msg.userAnswer || (messages[i - 1]?.role === 'user' ? messages[i - 1].content : ''),
        isCorrect: Boolean(msg.isCorrect),
        explanation: cleanExplanation,
        note: savedNotes[qIndex] || '',
        timestamp: msg.timestamp,
      };

      allQA.push(item);
      if (msg.isCorrect) {
        correctAnswers.push(item);
      } else {
        wrongAnswers.push(item);
      }
    }
  }

  // Buat rangkuman materi komprehensif dari seluruh sesi
  const materialTitle = materialInfo?.title || 'Pre-Test Evaluasi';
  const total = allQA.length > 0 ? allQA.length : pretest.totalQA;
  const correct = correctAnswers.length > 0 ? correctAnswers.length : pretest.correctQA;
  const score = total > 0 ? Math.round((correct / total) * 100) : (pretest.score || 0);

  res.json({
    pretestId: pretest.id,
    classId: pretest.classId,
    materialId: pretest.materialId,
    materialTitle,
    status: pretest.status,
    score,
    totalQA: total,
    correctQA: correct,
    wrongQA: total - correct,
    allQA,
    correctAnswers,
    wrongAnswers,
    savedNotes,
    createdAt: pretest.createdAt,
    completedAt: pretest.completedAt,
  });
});

// GET /api/pretest/:id - Ambil detail pre-test tertentu
console.log('📝 Registering GET /:id');
r.get('/:id', async (req, res) => {
  const pretestId = parseInt(req.params.id);
  if (isNaN(pretestId)) return res.status(400).json({ error: 'Pre-test ID tidak valid' });

  const pretest = await prisma.preTest.findUnique({
    where: { id: pretestId },
  });

  if (!pretest || pretest.userId !== req.user.id) {
    return res.status(404).json({ error: 'Pre-test tidak ditemukan' });
  }

  res.json(pretest);
});

console.log('✅ All pretest routes registered');
export default r;
