import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, streamTutor } from '../api.js';
import { useAuth } from '../auth.jsx';
import { markMaterialRead } from '../progress.js';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';

/* ─── Pilihan 4 Warna Stabilo Lengkap ─── */
const STABILO_COLORS = {
  yellow: {
    id: 'yellow',
    name: 'STABILO KUNING',
    bg: '#FEF08A',
    colorHex: '#FACC15',
    border: '#FDE047',
    badgeBg: '#FEF9C3',
    badgeText: '#854D0E',
    textColor: '#1E1C1E',
  },
  green: {
    id: 'green',
    name: 'STABILO HIJAU NEON',
    bg: '#BBF7D0',
    colorHex: '#4ADE80',
    border: '#86EFAC',
    badgeBg: '#DCFCE7',
    badgeText: '#166534',
    textColor: '#064E3B',
  },
  orange: {
    id: 'orange',
    name: 'STABILO ORANYE',
    bg: '#FED7AA',
    colorHex: '#FB923C',
    border: '#FDBA74',
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
    textColor: '#7C2D12',
  },
  pink: {
    id: 'pink',
    name: 'STABILO PINK',
    bg: '#FBCFE8',
    colorHex: '#F472B6',
    border: '#F472B6',
    badgeBg: '#FCE7F3',
    badgeText: '#9D174D',
    textColor: '#831843',
  },
};

export default function Material() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(true);

  // PDF.js State
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [pdfRendering, setPdfRendering] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  // Kontrol Ukuran Zoom
  const [zoomLevel, setZoomLevel] = useState(100);

  // Stabilo State
  const [stabiloActive, setStabiloActive] = useState(true);
  const [activeColor, setActiveColor] = useState('yellow');
  const [eraserMode, setEraserMode] = useState(false);
  const [filterColor, setFilterColor] = useState('all');

  // Catatan Singkat Mahasiswa: Dinamis mengikuti highlight.
  // Jika belum ada yang distabilo, maka belum ada catatan (array kosong).
  const [highlights, setHighlights] = useState(() => {
    try {
      const saved = localStorage.getItem(`sorotpaham_pdf_highlights_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal & Toast State
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Socratic AI Tutor State
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutor, setTutor] = useState(null); // { text, page, sessionId, hint, msgs }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  // Refs untuk render canvas PDF & textLayer interaktif
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const endRef = useRef(null);
  const notesSectionRef = useRef(null);

  // Simpan highlights ke LocalStorage otomatis setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem(`sorotpaham_pdf_highlights_${id}`, JSON.stringify(highlights));
    } catch (e) {
      console.warn('Gagal menyimpan highlights:', e);
    }
  }, [id, highlights]);

  // Load Material dari backend
  useEffect(() => {
    markMaterialRead(id);
    setLoading(true);
    api(`/materials/${id}`)
      .then((data) => {
        setM(data);
        setLoading(false);
      })
      .catch((e) => {
        console.warn('Load material error:', e.message);
        setLoading(false);
      });
  }, [id]);

  // Sinkronkan sorotan/stabilo dari database server saat materi dibuka
  useEffect(() => {
    if (!id) return;
    api(`/highlights/material/${id}`)
      .then((dbHighlights) => {
        if (!Array.isArray(dbHighlights) || dbHighlights.length === 0) return;
        setHighlights((prev) => {
          const parsedDb = dbHighlights.map((dh, idx) => {
            let meta = {};
            if (dh.note && dh.note.startsWith('{')) {
              try {
                meta = JSON.parse(dh.note);
              } catch {}
            }
            return {
              id: `db-${dh.id}`,
              dbId: dh.id,
              number: meta.number || idx + 1,
              color: meta.color || 'yellow',
              text: meta.text || dh.selectedText || '',
              page: meta.page || 1,
              rects: meta.rects || [{ x: 10, y: 15, w: 35, h: 4 }],
              time: meta.time || '10:00',
              note: meta.note || (dh.note && !dh.note.startsWith('{') ? dh.note : ''),
            };
          });

          // Pertahankan highlight lokal yang mungkin baru dibuat dan belum tersinkron
          const existingTexts = new Set(parsedDb.map((p) => p.text));
          const localOnly = prev.filter((h) => !h.dbId && !existingTexts.has(h.text));
          return [...parsedDb, ...localOnly];
        });
      })
      .catch((err) => {
        console.warn('Gagal memuat highlight dari database:', err.message);
      });
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  /* ─── Inisialisasi dan Baca Berkas PDF Menggunakan PDF.js ─── */
  useEffect(() => {
    if (!m) return;

    let isMounted = true;
    const fileUrl = m.pdfUrl
      ? m.pdfUrl.startsWith('http') || m.pdfUrl.startsWith('/')
        ? m.pdfUrl
        : `/${m.pdfUrl}`
      : null;

    if (!fileUrl) {
      setPdfLoadError(true);
      return;
    }

    const loadPdfDoc = async () => {
      try {
        setPdfRendering(true);
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const loadingTask = window.pdfjsLib.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          if (!isMounted) return;

          setPdfDoc(pdf);
          setNumPages(pdf.numPages || 1);
          setPdfLoadError(false);
        }
      } catch (err) {
        console.warn('Gagal memuat dokumen PDF melalui PDF.js:', err);
        if (isMounted) setPdfLoadError(true);
      } finally {
        if (isMounted) setPdfRendering(false);
      }
    };

    loadPdfDoc();

    return () => {
      isMounted = false;
    };
  }, [m]);

  /* ─── Render Halaman PDF Visual Asli ke Canvas & Lapisan Teks ─── */
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(activePage);
        if (isCancelled || !canvasRef.current) return;

        // Hitung skala viewport yang pas untuk kanvas dokumen
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        // Target lebar kanvas dokumen asli sekitar 620px
        const baseScale = 620 / unscaledViewport.width;
        const currentScale = baseScale * (zoomLevel / 100);
        const viewport = page.getViewport({ scale: currentScale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Dukungan layar tajam (HiDPI / Retina)
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        renderTask = page.render({
          canvasContext: context,
          transform,
          viewport,
        });

        await renderTask.promise;

        // Render Lapisan Teks di Atas Kanvas untuk Seleksi & Stabilo
        if (textLayerRef.current) {
          const textDiv = textLayerRef.current;
          textDiv.innerHTML = '';
          textDiv.style.width = Math.floor(viewport.width) + 'px';
          textDiv.style.height = Math.floor(viewport.height) + 'px';

          const textContent = await page.getTextContent();
          if (window.pdfjsLib?.renderTextLayer) {
            window.pdfjsLib.renderTextLayer({
              textContentSource: textContent,
              container: textDiv,
              viewport,
              textDivs: [],
            });
          }
        }
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') {
          console.warn('Canvas render error:', e);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, activePage, zoomLevel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutor?.msgs]);

  /* ─── Tangkap Seleksi Kursor Langsung pada Teks Dokumen Asli PDF ─── */
  const handleCanvasTextSelection = () => {
    if (!stabiloActive || eraserMode) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 2) return;

    const range = sel.getRangeAt(0);
    const container = canvasWrapperRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const clientRects = range.getClientRects();
    const rects = [];

    // Hitung posisi koordinat relatif (%) agar stabilo tetap pas saat zoom / resize
    for (let i = 0; i < clientRects.length; i++) {
      const r = clientRects[i];
      if (r.width > 3 && r.height > 3) {
        rects.push({
          x: ((r.left - containerRect.left) / containerRect.width) * 100,
          y: ((r.top - containerRect.top) / containerRect.height) * 100,
          w: (r.width / containerRect.width) * 100,
          h: (r.height / containerRect.height) * 100,
        });
      }
    }

    // Bersihkan highlight bawaan browser
    sel.removeAllRanges();

    const nextNumber = highlights.length > 0 ? Math.max(...highlights.map((h) => h.number)) + 1 : 1;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newHighlight = {
      id: `hl-${Date.now()}`,
      number: nextNumber,
      color: activeColor,
      text: text.slice(0, 160),
      page: activePage,
      rects: rects.length > 0 ? rects : [{ x: 10, y: 15, w: 35, h: 4 }],
      time: timeStr,
      note: `Konsep penting pada Halaman ${activePage}. Diskusikan dengan Tutor AI untuk memperdalam pemahaman.`,
    };

    // Tambahkan stabilo (stabilo sebelumnya tidak akan hilang)
    setHighlights((prev) => [...prev, newHighlight]);
    showToast(`Stabilo #${nextNumber} berhasil ditandai pada dokumen PDF!`);

    // Sinkronkan ke database dengan seluruh koordinat visual terenkapsulasi
    if (m?.paragraphs?.[0]?.id) {
      const payloadNote = JSON.stringify({
        number: newHighlight.number,
        color: newHighlight.color,
        text: newHighlight.text,
        page: newHighlight.page,
        rects: newHighlight.rects,
        time: newHighlight.time,
        note: newHighlight.note,
      });

      api('/highlights', {
        method: 'POST',
        body: {
          paragraphId: m.paragraphs[0].id,
          selectedText: text.slice(0, 150),
          note: payloadNote,
        },
      })
        .then((saved) => {
          if (saved?.id) {
            setHighlights((prev) =>
              prev.map((h) => (h.id === newHighlight.id ? { ...h, dbId: saved.id } : h))
            );
          }
        })
        .catch(() => {});
    }
  };

  /* ─── Hapus Stabilo ─── */
  const deleteHighlight = (hlId) => {
    const target = highlights.find((h) => h.id === hlId);
    setHighlights((prev) => prev.filter((h) => h.id !== hlId));
    if (target?.dbId) {
      api(`/highlights/${target.dbId}`, { method: 'DELETE' }).catch(() => {});
    }
    showToast('Stabilo dan catatan berhasil dihapus.');
  };

  /* ─── Simpan Perubahan Catatan Mahasiswa ─── */
  const saveEditedNote = (e) => {
    e.preventDefault();
    if (!editingHighlight) return;
    const updatedNote = customNoteInput.trim();

    setHighlights((prev) =>
      prev.map((h) => {
        if (h.id === editingHighlight.id) {
          const updated = { ...h, note: updatedNote };
          if (h.dbId) {
            const payloadNote = JSON.stringify({
              number: updated.number,
              color: updated.color,
              text: updated.text,
              page: updated.page,
              rects: updated.rects,
              time: updated.time,
              note: updatedNote,
            });
            api(`/highlights/${h.dbId}`, {
              method: 'PUT',
              body: { note: payloadNote },
            }).catch(() => {});
          }
          return updated;
        }
        return h;
      })
    );
    setEditingHighlight(null);
    setCustomNoteInput('');
    showToast('Catatan berhasil diperbarui!');
  };

  /* ─── Kirim Pesan ke Tutor AI Sokrates ─── */
  const sendTutorMessage = async (payload) => {
    setBusy(true);
    try {
      await streamTutor(payload, (ev) => {
        if (ev.type === 'session') {
          setTutor((t) => ({ ...t, sessionId: ev.sessionId, hint: ev.hintLevel }));
        }
        if (ev.type === 'delta') {
          setTutor((t) => {
            if (!t) return t;
            const msgs = [...t.msgs];
            msgs[msgs.length - 1] = {
              ...msgs[msgs.length - 1],
              content: msgs[msgs.length - 1].content + ev.text,
            };
            return { ...t, msgs };
          });
        }
      });
    } catch (e) {
      console.warn('Stream tutor error:', e.message);
    }
    setBusy(false);
  };

  /* ─── Buka Sesi Tutor AI untuk Kutipan Tertentu Berdasarkan Berkas PDF ─── */
  const openTutorForQuote = (quoteText, pageNum = activePage) => {
    setTutorOpen(true);
    const pid = m?.paragraphs?.[0]?.id || 1;
    const base = {
      paragraphId: pid,
      selectedText: quoteText || 'Konsep Utama Materi',
    };

    setTutor({
      ...base,
      page: pageNum,
      sessionId: null,
      hint: 1,
      msgs: [
        {
          role: 'assistant',
          content: `Halo ${user?.name || 'Mahasiswa'}! Kamu menyorot "${base.selectedText}" pada dokumen asli "${fileName}" (Halaman ${pageNum}). Berdasarkan isi dokumen ini, menurut penalaranmu apa fungsi atau makna penting dari konsep tersebut dalam topik yang sedang dipelajari?`,
        },
      ],
    });

    sendTutorMessage(base);
  };

  /* ─── Aksi Tombol Tanya Tutor AI Utama ─── */
  const handleMainTutorClick = () => {
    if (highlights.length === 0) {
      showToast('Tandai (stabilo) kalimat yang belum dipahami pada dokumen terlebih dahulu.');
      setTutorOpen(true);
      setTutor({
        selectedText: 'Belum ada sorotan',
        page: activePage,
        sessionId: null,
        hint: 1,
        msgs: [
          {
            role: 'assistant',
            content: `Halo ${user?.name || 'Mahasiswa'}! Belum ada bagian teks yang kamu beri stabilo di dokumen. Silakan gunakan Mode Stabilo pada dokumen di sebelah kiri untuk menandai kata atau kalimat yang membingungkan, lalu tanyakan kepada saya untuk kita bedah bersama dengan metode Sokrates!`,
          },
        ],
      });
      return;
    }

    const pageHighlight = highlights.find((h) => h.page === activePage) || highlights[highlights.length - 1];
    openTutorForQuote(pageHighlight.text, pageHighlight.page);
  };

  /* ─── Kirim Balasan Mahasiswa ke Tutor AI ─── */
  const replyTutor = (e) => {
    e.preventDefault();
    if (!input.trim() || busy || !tutor) return;
    const message = input.trim();
    setInput('');
    setTutor((t) => ({
      ...t,
      msgs: [...t.msgs, { role: 'user', content: message }, { role: 'assistant', content: '' }],
    }));
    sendTutorMessage({
      paragraphId: tutor.paragraphId,
      selectedText: tutor.selectedText,
      sessionId: tutor.sessionId,
      message,
    });
  };

  /* ─── Salin Tautan Berkas ─── */
  const copySlideLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Filter Kartu Catatan Singkat
  const filteredHighlights = highlights.filter((h) => {
    if (filterColor === 'all') return true;
    return h.color === filterColor;
  });

  const courseTitle = m?.class?.title || 'Procurement Management';
  const fileName = m?.pdfName || m?.title || 'Dokumen_Materi.pdf';
  const fileUrl = m?.pdfUrl
    ? m.pdfUrl.startsWith('http') || m.pdfUrl.startsWith('/')
      ? m.pdfUrl
      : `/${m.pdfUrl}`
    : null;

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] flex">
        <StudentSidebar activeItem="kelas" />
        <div className="flex-1 flex flex-col min-w-0">
          <StudentTopbar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#6B1224] animate-ping" />
              <p className="text-xs font-bold text-[#6B1224]">Membuka Ruang Baca Dokumen Asli PDF...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] flex">
      {/* Sidebar Navigasi Mahasiswa */}
      <StudentSidebar activeItem="kelas" />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentTopbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5">
          {/* Toast Salin Link */}
          {copiedToast && (
            <div className="fixed top-20 right-8 z-50 bg-[#1E1C1E] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
              <span>✓ Tautan materi berhasil disalin!</span>
            </div>
          )}

          {/* Toast Umum */}
          {toastMessage && (
            <div className="fixed top-20 right-8 z-50 bg-[#6B1224] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
              <span>✓ {toastMessage}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              1. HERO CARD / HEADER RUANG BACA (Warna Marun Desain)
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="bg-gradient-to-r from-[#631122] via-[#6B1224] to-[#7A152B] rounded-3xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
            {/* Breadcrumb Navigasi */}
            <div className="flex items-center gap-2 text-xs text-rose-100 font-medium mb-4 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="hover:underline flex items-center gap-1 font-bold text-white cursor-pointer"
              >
                <span>← Kembali ke Detail Tugas</span>
              </button>
              <span>/</span>
              <Link to="/app" className="hover:underline text-rose-200">
                Kelas Saya
              </Link>
              <span>/</span>
              <span className="text-rose-200">{courseTitle}</span>
              <span>/</span>
              <span className="text-white font-semibold truncate max-w-xs">{fileName}</span>
            </div>

            {/* Baris Judul & Aksi */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
                  <span className="text-xs font-black text-white bg-red-600 px-1.5 py-0.5 rounded">PDF</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                    {fileName}
                  </h1>
                  <p className="text-xs text-rose-200/90 font-medium flex items-center gap-2 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Dokumen Asli PDF ({numPages} Halaman)</span>
                    <span>•</span>
                    <span>Tata Letak Visual Asli</span>
                  </p>
                </div>
              </div>

              {/* Tombol Unduh & Tanya Tutor AI */}
              <div className="flex items-center gap-2.5 shrink-0">
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1E1C1E] hover:bg-rose-50 transition shadow-xs cursor-pointer no-underline"
                  >
                    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Unduh PDF</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => showToast('Dokumen materi siap diunduh.')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1E1C1E] hover:bg-rose-50 transition shadow-xs cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Unduh Dokumen</span>
                  </button>
                )}

                {/* Tombol Tanya Tutor AI Utama */}
                <button
                  type="button"
                  onClick={handleMainTutorClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#520C1A]/70 hover:bg-[#520C1A] border border-white/25 px-4 py-2.5 text-xs font-bold text-white transition shadow-xs cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <span>Tanya Tutor AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              2. TOOLBAR STABILO
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:px-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Grup Tombol Stabilo & Pilihan 4 Warna */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStabiloActive(!stabiloActive);
                    setEraserMode(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer ${
                    stabiloActive && !eraserMode
                      ? 'bg-[#6B1224] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                  <span>{stabiloActive && !eraserMode ? 'Mode Stabilo (Aktif)' : 'Mode Stabilo'}</span>
                </button>

                {/* 4 Lingkaran Warna Stabilo */}
                <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-full border border-gray-200">
                  {Object.values(STABILO_COLORS).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      onClick={() => {
                        setActiveColor(c.id);
                        setStabiloActive(true);
                        setEraserMode(false);
                      }}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative ${
                        activeColor === c.id && !eraserMode
                          ? 'scale-115 ring-2 ring-offset-1 ring-gray-900 shadow-xs'
                          : 'hover:scale-110 opacity-90'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                    />
                  ))}
                </div>

                <div className="h-5 w-px bg-gray-200" />

                {/* Tombol Hapus Stabilo */}
                <button
                  type="button"
                  onClick={() => setEraserMode(!eraserMode)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    eraserMode
                      ? 'bg-rose-100 text-rose-800 ring-2 ring-rose-400'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                    <path d="M22 21H7" />
                    <path d="m5 11 9 9" />
                  </svg>
                  <span>Hapus Stabilo</span>
                </button>
              </div>

              {/* Teks Petunjuk */}
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <span className="text-rose-700 font-bold">ⓘ</span>
                <span>Tarik kursor langsung pada teks dokumen PDF untuk menandai konsep penting</span>
              </div>
            </div>

            {/* Baris Kontrol Zoom */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-xl px-2 py-1 gap-1.5 text-xs font-bold text-gray-700">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="p-1 hover:bg-gray-200 rounded-lg cursor-pointer"
                    title="Perkecil"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{zoomLevel}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1 hover:bg-gray-200 rounded-lg cursor-pointer"
                    title="Perbesar"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-600 text-xs font-semibold cursor-pointer border border-gray-200"
                  title="Ukuran Standar"
                >
                  Fit Page
                </button>
              </div>

              <div className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Dokumen Asli PDF Interaktif (Bisa Distabilo Langsung)</span>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              3. AREA UTAMA: PRATINJAU KIRI DIBERI BORDER + KANVAS DI KANAN
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ─── Kolom Kiri: Pratinjau Halaman dengan Border Rapi Sesuai Permintaan ─── */}
            <div className="lg:col-span-3 rounded-2xl border border-gray-200/90 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span className="text-xs font-black tracking-wider uppercase text-gray-800">
                    PRATINJAU HALAMAN
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-700">{numPages} Halaman</span>
              </div>

              {/* List Thumbnails Halaman Ber-border Rapi */}
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
                {Array.from({ length: numPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = activePage === pNum;
                  return (
                    <div
                      key={pNum}
                      onClick={() => setActivePage(pNum)}
                      className={`group rounded-xl p-2.5 transition-all cursor-pointer ${
                        isActive
                          ? 'border-2 border-[#6B1224] ring-2 ring-[#6B1224]/15 bg-white shadow-xs'
                          : 'border border-gray-200/90 bg-[#FAF7F2] hover:border-gray-400'
                      }`}
                    >
                      {/* Top Label */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1.5">
                        <span>Halaman {pNum}</span>
                        <span className={`text-[9.5px] px-1.5 py-0.5 rounded ${isActive ? 'bg-[#6B1224]/10 text-[#6B1224]' : 'text-gray-400'}`}>
                          {pNum === 1 ? 'Judul Utama ✓' : `Hal ${pNum}`}
                        </span>
                      </div>

                      {/* Miniatur Kanvas Halaman */}
                      <div className="h-24 rounded-lg bg-white border border-[#EBE4D5] flex flex-col justify-center items-center p-2 relative overflow-hidden shadow-2xs">
                        <div className="w-full text-center p-1">
                          <span className="text-[10px] font-black text-gray-700 block truncate">
                            Hal {pNum}
                          </span>
                          <span className="text-[8px] text-gray-400 block mt-1 truncate">
                            {fileName}
                          </span>
                        </div>
                      </div>

                      {/* Caption Halaman */}
                      <p className="text-[11.5px] font-bold text-gray-800 mt-2 truncate">
                        {pNum === 1 ? 'Cover & Halaman Awal' : `Bagian Halaman ${pNum}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Kolom Kanan: Kanvas PDF Asli Diperkecil & Langsung Diberi Stabilo ─── */}
            <div className="lg:col-span-9 flex flex-col items-center w-full space-y-4">
              {/* Kanvas Dokumen PDF Asli: Ukuran Proporsional & Dinamis (max-w-2xl) */}
              <div
                className="w-full max-w-2xl mx-auto rounded-3xl border border-[#E2DDD5] bg-[#EDE9E3] shadow-inner p-3 sm:p-5 flex flex-col items-center justify-center min-h-[480px] overflow-auto"
              >
                {/* Pembungkus Kanvas Halaman PDF Asli */}
                <div
                  ref={canvasWrapperRef}
                  onMouseUp={handleCanvasTextSelection}
                  className="relative bg-white shadow-xl rounded-lg overflow-hidden border border-gray-300 select-text transition-transform"
                >
                  {/* 1. Canvas Render PDF Asli (Visual Grafis, Font, & Tata Letak Asli 100%) */}
                  <canvas ref={canvasRef} className="block max-w-full" />

                  {/* 2. Lapisan Teks Transparan Di Atas Canvas (Untuk Seleksi Teks dengan Mouse) */}
                  <div
                    ref={textLayerRef}
                    className="pdf-text-layer absolute inset-0 pointer-events-auto leading-none overflow-hidden select-text textLayer"
                    style={{
                      opacity: 0.15,
                    }}
                  />

                  {/* 3. Lapisan Stabilo Berkelanjutan dengan Nomor Bulat (Langsung di Dokumen PDF) */}
                  {highlights
                    .filter((hl) => (hl.page || 1) === activePage)
                    .map((hl) => {
                      const col = STABILO_COLORS[hl.color] || STABILO_COLORS.yellow;
                      return (
                        <div key={hl.id} className="pointer-events-auto">
                          {/* Kotak-kotak stabilo transparan yang menutupi teks PDF */}
                          {hl.rects?.map((r, rIdx) => (
                            <div
                              key={rIdx}
                              style={{
                                left: `${r.x}%`,
                                top: `${r.y}%`,
                                width: `${r.w}%`,
                                height: `${r.h}%`,
                                backgroundColor: col.colorHex,
                                opacity: 0.45,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (eraserMode) deleteHighlight(hl.id);
                                else openTutorForQuote(hl.text, activePage);
                              }}
                              className="absolute rounded-xs cursor-pointer hover:opacity-75 transition-opacity"
                              title={`Stabilo #${hl.number}: "${hl.text}" - Klik untuk tanya Tutor AI`}
                            />
                          ))}

                          {/* Badge Nomor Stabilo Bulat Menempel di Atas Teks PDF Asli */}
                          {hl.rects?.[0] && (
                            <span
                              style={{
                                left: `calc(${hl.rects[0].x}% - 8px)`,
                                top: `calc(${hl.rects[0].y}% - 14px)`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (eraserMode) deleteHighlight(hl.id);
                                else openTutorForQuote(hl.text, activePage);
                              }}
                              className="absolute w-4 h-4 rounded-full bg-[#520C1A] text-white font-black text-[9px] flex items-center justify-center shadow-xs cursor-pointer select-none z-20 hover:scale-110 transition"
                            >
                              {hl.number}
                            </span>
                          )}
                        </div>
                      );
                    })}

                  {/* Fallback Jika Dokumen PDF Sedang Dimuat atau Berupa Teks */}
                  {pdfLoadError && (
                    <div className="p-6 sm:p-8 bg-white max-w-xl mx-auto text-left space-y-3">
                      <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                        {m?.title || 'Bahan Ajar Perkuliahan'}
                      </h3>
                      {m?.paragraphs?.length > 0 ? (
                        <div className="space-y-3 text-xs sm:text-sm text-gray-800 leading-relaxed font-serif">
                          {m.paragraphs.map((p, pIdx) => (
                            <p key={p.id || pIdx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                              {p.text}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Memuat tampilan dokumen PDF...
                        </p>
                      )}
                      {fileUrl && (
                        <iframe
                          src={`${fileUrl}#page=${activePage}`}
                          title={fileName}
                          className="w-[580px] h-[440px] border rounded-lg mt-3"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Bar Navigasi Bawah Kanvas PDF ─── */}
              <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200/80 p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                {/* Tombol Sebelumnya & Berikutnya */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activePage <= 1}
                    onClick={() => setActivePage((s) => Math.max(1, s - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <span>‹ Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    disabled={activePage >= numPages}
                    onClick={() => setActivePage((s) => Math.min(numPages, s + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <span>Berikutnya ›</span>
                  </button>
                  <span className="text-xs text-gray-500 font-medium ml-1">
                    Halaman {activePage} dari {numPages}
                  </span>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copySlideLink}
                    className="p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
                    title="Salin Tautan Halaman"
                  >
                    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => notesSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6B1224] text-white text-xs font-bold hover:bg-[#80142A] transition shadow-xs cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Lihat Catatan ({highlights.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              4. CATATAN SINGKAT MAHASISWA: DINAMIS MENGIKUTI HIGHLIGHT
                 (JIKA BELUM ADA STABILO -> BELUM ADA CATATAN)
             ═════════════════════════════════════════════════════════════════════ */}
          <section ref={notesSectionRef} className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm space-y-5">
            {/* Header Bagian Catatan */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#6B1224] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      Catatan Singkat Mahasiswa (Terhubung Stabilo)
                    </h3>
                    <span className="bg-rose-100 text-[#6B1224] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                      {highlights.length} Catatan Aktif
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Kartu catatan terbentuk secara dinamis saat mahasiswa memberi stabilo pada dokumen asli PDF di atas.
                  </p>
                </div>
              </div>

              {/* Filter Warna */}
              {highlights.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <select
                    value={filterColor}
                    onChange={(e) => setFilterColor(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-[#6B1224] cursor-pointer"
                  >
                    <option value="all">Semua Stabilo</option>
                    <option value="yellow">Stabilo Kuning</option>
                    <option value="green">Stabilo Hijau Neon</option>
                    <option value="orange">Stabilo Oranye</option>
                    <option value="pink">Stabilo Pink</option>
                  </select>
                </div>
              )}
            </div>

            {/* Jika Belum Ada yang Distabilo: Tampilkan Pesan Bersih Sesuai Permintaan */}
            {highlights.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-[#FCFBFD] p-8 sm:p-12 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 text-xl">
                  ✏️
                </div>
                <h4 className="text-sm font-extrabold text-gray-900">
                  Belum Ada Catatan Konsep Mahasiswa
                </h4>
                <p className="mx-auto max-w-md text-xs leading-relaxed text-gray-500 font-medium">
                  Tarik kursor langsung pada teks dokumen asli PDF di atas menggunakan <strong>Mode Stabilo</strong> untuk menandai konsep penting yang ingin kamu pelajari. Catatan akan otomatis muncul di sini!
                </p>
              </div>
            ) : (
              /* Grid Kartu Catatan Singkat Dinamis */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHighlights.map((hl) => {
                  const col = STABILO_COLORS[hl.color] || STABILO_COLORS.yellow;
                  return (
                    <div
                      key={hl.id}
                      className="rounded-2xl border-2 p-4 bg-white flex flex-col justify-between hover:shadow-md transition-shadow relative"
                      style={{ borderColor: col.border }}
                    >
                      <div>
                        {/* Baris Atas: Nomor, Badge Warna, Jam */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#520C1A] text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                              {hl.number}
                            </span>
                            <span
                              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: col.badgeBg, color: col.badgeText }}
                            >
                              {col.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">{hl.time}</span>
                        </div>

                        {/* Kotak Kutipan Stabilo */}
                        <div className="rounded-xl p-2.5 bg-gray-50 border border-gray-100 mb-3">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-0.5">
                            KUTIPAN STABILO:
                          </span>
                          <p className="text-xs font-black text-gray-900 break-words">
                            "{hl.text}"
                          </p>
                        </div>

                        {/* Catatan Penjelasan Mahasiswa */}
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {hl.note}
                        </p>
                      </div>

                      {/* Footer Kartu Catatan */}
                      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setActivePage(hl.page || 1)}
                          className="font-bold text-[#6B1224] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          📍 Halaman {hl.page || 1}
                        </button>

                        <div className="flex items-center gap-2">
                          {/* Tombol Bahas dengan Tanya Tutor AI Berdasarkan Highlight */}
                          <button
                            type="button"
                            onClick={() => openTutorForQuote(hl.text, hl.page || 1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            title="Bahas konsep ini dengan Tutor AI Socratic"
                          >
                            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            <span>Tanya AI</span>
                          </button>

                          {/* Tombol Edit Catatan */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHighlight(hl);
                              setCustomNoteInput(hl.note);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Ubah Catatan"
                          >
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                          </button>

                          {/* Tombol Hapus Stabilo & Catatan */}
                          <button
                            type="button"
                            onClick={() => deleteHighlight(hl.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Stabilo &amp; Catatan"
                          >
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          5. DRAWER TUTOR AI SOKRATES (Bahas Highlight Mahasiswa Secara Socratic)
         ═════════════════════════════════════════════════════════════════════ */}
      {tutorOpen && tutor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setTutorOpen(false)}
          />

          {/* Panel Konten Dialog Sokrates */}
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
            {/* Header Drawer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6B1224] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SP
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-tight">
                    Tutor AI Socratic
                  </h4>
                  <span className="text-[10px] font-bold text-[#6B1224]">
                    Metode Sokrates • Tangga Petunjuk {tutor.hint || 1}/5
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTutorOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Kotak Kutipan yang Disorot Mahasiswa pada Berkas Asli */}
            <div className="p-3 bg-amber-50/70 border-b border-amber-100 text-xs text-amber-900 flex items-start gap-2">
              <span className="font-bold text-amber-800 shrink-0">💡 Kutipan Terkait:</span>
              <div className="min-w-0">
                <p className="italic font-semibold break-words">"{tutor.selectedText}"</p>
                <span className="text-[10px] text-amber-700 font-bold mt-0.5 block">
                  📍 Berkas: {fileName} • Halaman {tutor.page || activePage}
                </span>
              </div>
            </div>

            {/* Riwayat Percakapan Sokrates Real-time Streaming */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tutor.msgs?.map((msg, i) =>
                msg.content || msg.role === 'assistant' ? (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-[#6B1224] text-white rounded-br-xs'
                          : 'bg-[#FAF7F2] text-[#1E1C1E] border border-[#EBE4D5] rounded-bl-xs'
                      }`}
                    >
                      {msg.content || (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 px-1 font-semibold">
                      {msg.role === 'user' ? 'Kamu' : 'Tutor Sokrates'}
                    </span>
                  </div>
                ) : null
              )}
              <div ref={endRef} />
            </div>

            {/* Pertanyaan Pemantik Cepat */}
            <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setInput('Apa kaitan konsep ini dengan topik materi pengadaan?')}
                className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap hover:bg-gray-100 cursor-pointer"
              >
                + Kaitan Konsep?
              </button>
              <button
                type="button"
                onClick={() => setInput('Bisakah berikan analogi atau contoh kasus nyata?')}
                className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap hover:bg-gray-100 cursor-pointer"
              >
                + Contoh Nyata?
              </button>
              <button
                type="button"
                onClick={() => setInput('Beri saya 1 pertanyaan studi kasus untuk menguji pemahaman saya!')}
                className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap hover:bg-gray-100 cursor-pointer"
              >
                + Uji Pemahaman!
              </button>
            </div>

            {/* Form Input Balasan Mahasiswa */}
            <form onSubmit={replyTutor} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tuliskan jawaban atau penalaranmu..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 outline-none focus:border-[#6B1224]"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#6B1224] hover:bg-[#80142A] transition disabled:opacity-40 cursor-pointer shadow-xs whitespace-nowrap"
              >
                Kirim
              </button>
            </form>
          </aside>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          6. MODAL UBAH CATATAN
         ═════════════════════════════════════════════════════════════════════ */}
      {editingHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <form
            onSubmit={saveEditedNote}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h4 className="text-sm font-black text-gray-900">Ubah Catatan Terhubung</h4>
            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
              <span className="font-bold block text-gray-800 mb-0.5">Kutipan:</span>
              "{editingHighlight.text}"
            </div>
            <textarea
              rows={4}
              value={customNoteInput}
              onChange={(e) => setCustomNoteInput(e.target.value)}
              placeholder="Tuliskan catatan pemahamanmu di sini..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#6B1224]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingHighlight(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6B1224] hover:bg-[#80142A] cursor-pointer shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
