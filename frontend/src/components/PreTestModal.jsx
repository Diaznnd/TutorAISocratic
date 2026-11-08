import { useState, useEffect, useRef } from 'react';
import { XIcon } from './student/Icons.jsx';

function CheckCircleIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-5" />
    </svg>
  );
}

function XCircleIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function BookIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ClockIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SendIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') +
    ' WIB'
  );
}

export function PreTestModal({ isOpen, onClose, classId, materials = [] }) {
  const [view, setView] = useState('menu'); // 'menu' | 'history' | 'select-material' | 'chat' | 'review'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pretestId, setPretestId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ totalQA: 0, correctQA: 0, score: 0 });
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  
  // State untuk review card & catatan permanen
  const [reviewData, setReviewData] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewTab, setReviewTab] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [savingNotes, setSavingNotes] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Reset saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setView('menu');
      setPretestId(null);
      setMessages([]);
      setInput('');
      setStats({ totalQA: 0, correctQA: 0, score: 0 });
      setReviewData(null);
      setReviewNotes({});
      setToastMsg('');
    }
  }, [isOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingHistory(false);
        return;
      }
      const res = await fetch(`/api/pretest/history/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load history error:', e);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startPreTest = async (materialId = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Anda belum login');
        return;
      }
      const res = await fetch('/api/pretest/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ classId, materialId }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      
      setPretestId(data.pretestId);
      const materialTitle = materialId && materials ? materials.find(m => m.id === materialId)?.title : null;
      setMessages([
        { 
          role: 'assistant', 
          content: `✨ ${data.message}\n\n${materialTitle ? `📖 Materi: ${materialTitle}` : '📚 Pre-Test Umum untuk Kelas'}\n\nSaya akan mengajukan beberapa pertanyaan untuk mengevaluasi pemahaman Anda. Jawablah dengan jujur sesuai pemahaman Anda. Anda dapat mengklik tombol "Selesaikan Pre-Test" kapan saja untuk melihat rangkuman evaluasi.`
        }
      ]);
      setView('chat');
      setStats({ totalQA: 0, correctQA: 0, score: 0 });
    } catch (e) {
      console.error('Start pre-test error:', e);
      alert('Gagal memulai pre-test: ' + e.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !pretestId) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      abortRef.current = new AbortController();
      
      const res = await fetch('/api/pretest/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pretestId, message: userMsg }),
        signal: abortRef.current.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentMsg = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const msg = JSON.parse(jsonStr);
            
            if (msg.type === 'delta') {
              currentMsg += msg.text;
              setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[newMsgs.length - 1]?.role === 'assistant' && newMsgs[newMsgs.length - 1]?.streaming) {
                  newMsgs[newMsgs.length - 1].content = currentMsg;
                } else {
                  newMsgs.push({ role: 'assistant', content: currentMsg, streaming: true });
                }
                return newMsgs;
              });
            } else if (msg.type === 'evaluation') {
              setStats({
                totalQA: msg.totalQA || 0,
                correctQA: msg.correctQA || 0,
                score: msg.score || 0,
              });
              setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[newMsgs.length - 1]?.role === 'assistant') {
                  newMsgs[newMsgs.length - 1].isCorrect = msg.isCorrect;
                  delete newMsgs[newMsgs.length - 1].streaming;
                }
                return newMsgs;
              });
            } else if (msg.type === 'done') {
              setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[newMsgs.length - 1]?.streaming) {
                  delete newMsgs[newMsgs.length - 1].streaming;
                }
                return newMsgs;
              });
            }
          } catch (e) {
            console.error('Parse SSE error:', e);
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Send message error:', e);
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ Terjadi kesalahan. Silakan coba lagi.' }]);
      }
    } finally {
      setSending(false);
    }
  };

  // Buka Rangkuman Materi Pre-Test
  const openReview = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pretest/${id}/review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setReviewData(data);
      setReviewNotes(data.savedNotes || {});
      setReviewTab('all');
      setView('review');
    } catch (e) {
      console.error('Load review error:', e);
      alert('Gagal memuat rangkuman materi: ' + e.message);
    }
  };

  // Selesaikan Pre-Test dan simpan status completed
  const handleCompletePreTest = async (idToComplete = pretestId) => {
    if (!idToComplete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pretest/${idToComplete}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await openReview(idToComplete);
      } else {
        throw new Error('Gagal menyelesaikan pre-test');
      }
    } catch (e) {
      console.error('Complete pretest error:', e);
      alert(e.message);
    }
  };

  // Lanjutkan sesi pre-test yang masih ongoing
  const handleResumePreTest = async (testId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pretest/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat sesi');
      const data = await res.json();
      setPretestId(data.id);
      
      const cleanMsgs = Array.isArray(data.messages)
        ? data.messages.filter(m => m._type !== 'pretest_meta')
        : [];
      
      setMessages(cleanMsgs);
      setStats({
        totalQA: data.totalQA || 0,
        correctQA: data.correctQA || 0,
        score: data.score || 0,
      });
      setView('chat');
    } catch (e) {
      alert('Gagal melanjutkan pre-test: ' + e.message);
    }
  };

  // Simpan Catatan Pribadi Mahasiswa ke Database
  const handleSaveNotes = async () => {
    if (!reviewData?.pretestId) return;
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pretest/${reviewData.pretestId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan catatan');
      showToast('Catatan berhasil tersimpan permanen!');
    } catch (e) {
      alert('Gagal menyimpan catatan: ' + e.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleClose = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    onClose();
  };

  if (!isOpen) return null;

  // Filter daftar soal di halaman review sesuai tab aktif
  const filteredQA = reviewData
    ? reviewTab === 'wrong'
      ? reviewData.wrongAnswers || []
      : reviewTab === 'correct'
      ? reviewData.correctAnswers || []
      : reviewData.allQA || []
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header Modal */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#6B1224] to-[#80142A] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Pre-Test Interaktif</h2>
              <p className="text-xs opacity-90">Evaluasi Pemahaman & Rangkuman Pembelajaran AI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* VIEW 1: MENU UTAMA */}
          {view === 'menu' && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <h3 className="text-xl font-black text-gray-900 mb-2">Pilih Opsi Pre-Test</h3>
                <p className="text-sm text-gray-600">
                  Pre-Test membantu Anda mengevaluasi pemahaman konsep materi perkuliahan secara interaktif bersama AI Sokrates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setView('history');
                    loadHistory();
                  }}
                  className="group rounded-2xl border-2 border-gray-200 bg-gray-50/70 p-6 text-left hover:border-[#6B1224] hover:bg-white transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-[#6B1224] group-hover:bg-[#6B1224] group-hover:text-white transition">
                      <ClockIcon size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-gray-900">Riwayat Pre-Test</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Lihat hasil evaluasi, skor pemahaman, dan rangkuman materi dari sesi sebelumnya.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setView('select-material')}
                  className="group rounded-2xl border-2 border-[#6B1224] bg-gradient-to-br from-[#6B1224] to-[#80142A] p-6 text-left hover:shadow-lg transition cursor-pointer text-white"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                      <BookIcon size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-white">Mulai Pre-Test Baru</h4>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Pilih materi kuliah untuk memulai evaluasi konsep atau ikuti pre-test umum kelas.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: RIWAYAT PRE-TEST */}
          {view === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="text-lg font-black text-gray-900">Riwayat Pre-Test Anda</h3>
                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="text-xs font-bold text-[#6B1224] hover:underline cursor-pointer"
                >
                  ← Kembali ke Menu
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-12 text-sm text-gray-500 animate-pulse">
                  Memuat riwayat pre-test...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm font-bold text-gray-900">Belum Ada Riwayat Pre-Test</p>
                  <p className="text-xs text-gray-500 mt-1">Mulai pre-test pertama Anda sekarang untuk menguji pemahaman.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {history.map((h) => {
                    const isOngoing = h.status !== 'completed';
                    return (
                      <div
                        key={h.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition ${
                          isOngoing
                            ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400'
                            : 'border-gray-200 bg-white hover:border-[#6B1224]/40'
                        }`}
                      >
                        {/* Status Bar */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">{fmtDate(h.createdAt)}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold border ${
                              isOngoing
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isOngoing ? '⏳ Sedang Berjalan' : '✓ Selesai'}
                          </span>
                        </div>

                        {/* Judul Materi */}
                        <h4 className="text-sm sm:text-[15px] font-extrabold text-gray-900">
                          {h.materialId ? `Pre-Test Materi #${h.materialId}` : 'Pre-Test Evaluasi Kelas'}
                        </h4>

                        {/* Jika Sedang Berjalan */}
                        {isOngoing ? (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-100">
                            <p className="text-xs text-amber-900">
                              {h.totalQA > 0 ? (
                                <>Pertanyaan terjawab: <strong className="text-[#1E1C1E]">{h.totalQA}</strong> • Skor sementara: <strong className="text-amber-800">{h.score?.toFixed(0)}%</strong></>
                              ) : (
                                <span>Sesi masih berlangsung • Belum diselesaikan</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleResumePreTest(h.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#6B1224] text-white text-xs font-bold hover:bg-[#80142A] transition cursor-pointer shadow-xs"
                              >
                                ▶ Lanjutkan Tes
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCompletePreTest(h.id)}
                                className="px-3.5 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-900 text-xs font-bold hover:bg-amber-50 transition cursor-pointer shadow-xs"
                              >
                                ✓ Selesaikan
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Jika Selesai: Tampilkan Skor & Tombol Rangkuman Materi */
                          <div className="mt-3 space-y-3 pt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>
                                Skor Akhir: <strong className="text-emerald-700 text-sm">{h.score?.toFixed(0)}%</strong> • Benar: {h.correctQA}/{h.totalQA} Soal
                              </span>
                              {h.completedAt && (
                                <span className="text-[11px] text-gray-400">Selesai: {fmtDate(h.completedAt)}</span>
                              )}
                            </div>

                            {/* Card Rangkuman Materi Bersahabat (Bukan peringatan salah) */}
                            <div className="p-3.5 rounded-xl bg-[#FCFBFD] border border-[#E7E1EA] flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#6B1224] flex items-center justify-center font-bold text-sm shrink-0">
                                  📖
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-[#1E1C1E] truncate">
                                    Rangkuman Materi &amp; Evaluasi Pembelajaran
                                  </p>
                                  <p className="text-[11px] text-[#8B8391] mt-0.5">
                                    Rangkuman materi komprehensif dari semua jawaban dan konsep yang diuji
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => openReview(h.id)}
                                className="shrink-0 px-4 py-1.5 rounded-lg bg-[#6B1224] text-white text-xs font-bold hover:bg-[#80142A] transition cursor-pointer shadow-xs"
                              >
                                Buka Rangkuman Materi ↗
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: PILIH MATERI */}
          {view === 'select-material' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="text-lg font-black text-gray-900">Pilih Materi Pre-Test</h3>
                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="text-xs font-bold text-[#6B1224] hover:underline cursor-pointer"
                >
                  ← Kembali
                </button>
              </div>

              <button
                type="button"
                onClick={() => startPreTest(null)}
                className="w-full rounded-2xl border-2 border-[#6B1224] bg-gradient-to-r from-[#6B1224] to-[#80142A] p-5 text-left hover:shadow-lg transition cursor-pointer text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌟</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold">Pre-Test Umum (Semua Materi Kelas)</h4>
                    <p className="text-xs opacity-90 mt-0.5">Evaluasi pemahaman konsep umum untuk kelas ini</p>
                  </div>
                </div>
              </button>

              <div className="space-y-2 mt-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Atau Pilih Berdasarkan Modul:</h4>
                {!materials || materials.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">Belum ada materi perkuliahan yang tersedia</p>
                  </div>
                ) : (
                  materials.map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => startPreTest(mat.id)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-4 text-left hover:border-[#6B1224] hover:bg-white transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-[#6B1224]">
                          <BookIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-gray-900 truncate">{mat.title}</h5>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {mat.paragraphs?.length || 0} Paragraf Pembahasan
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: RUANG CHAT PRE-TEST */}
          {view === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Bar Status & Tombol Selesaikan */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-purple-200 bg-purple-50/70 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <span>🎯 Pre-Test Berjalan:</span>
                  <span className="text-purple-700">{stats.correctQA} Benar / {stats.totalQA} Soal</span>
                  {stats.totalQA > 0 && (
                    <span className="rounded-full bg-purple-200/80 px-2 py-0.5 text-[11px] font-black text-purple-800">
                      Skor {stats.score.toFixed(0)}%
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCompletePreTest(pretestId)}
                  className="rounded-xl bg-[#6B1224] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#80142A] transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>✓</span> Selesaikan &amp; Buka Rangkuman
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-96 pr-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-[#6B1224] text-white'
                          : msg.isCorrect === true
                          ? 'border-2 border-emerald-200 bg-emerald-50 text-gray-900'
                          : msg.isCorrect === false
                          ? 'border-2 border-amber-200 bg-amber-50/70 text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.role === 'assistant' && msg.isCorrect !== undefined && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/10">
                          {msg.isCorrect ? (
                            <CheckCircleIcon size={16} className="text-emerald-600" />
                          ) : (
                            <XCircleIcon size={16} className="text-amber-600" />
                          )}
                          <span
                            className={`text-xs font-black ${
                              msg.isCorrect ? 'text-emerald-700' : 'text-amber-800'
                            }`}
                          >
                            {msg.isCorrect ? 'PEMAHAMAN TEPAT' : 'PERLU DIPERKUAT'}
                          </span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Balasan */}
              <div className="flex items-center gap-2 border-t pt-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ketik jawaban Anda..."
                  disabled={sending}
                  className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-[#6B1224] focus:bg-white transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6B1224] text-white hover:bg-[#80142A] transition disabled:opacity-50 cursor-pointer"
                >
                  <SendIcon size={18} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => handleCompletePreTest(pretestId)}
                  className="font-bold text-[#6B1224] hover:underline"
                >
                  ✓ Akhiri Pre-Test Sekarang
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="font-semibold hover:text-gray-900"
                >
                  Tutup Sementara
                </button>
              </div>
            </div>
          )}

          {/* VIEW 5: DASHBOARD RANGKUMAN MATERI PRE-TEST */}
          {view === 'review' && reviewData && (
            <div className="space-y-5">
              {/* Header Rangkuman */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📖</span>
                    <h3 className="text-lg font-black text-gray-900">
                      Rangkuman Materi &amp; Evaluasi Pembelajaran
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Materi: <strong className="text-gray-800">{reviewData.materialTitle}</strong> • Tanggal: {fmtDate(reviewData.completedAt || reviewData.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setView('history');
                    loadHistory();
                  }}
                  className="self-start sm:self-auto rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 hover:border-[#6B1224] hover:text-[#6B1224] transition cursor-pointer shadow-2xs"
                >
                  ← Kembali ke Riwayat
                </button>
              </div>

              {/* Kartu Ringkasan Hasil Belajar (Executive Summary) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Skor Pemahaman</p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">{reviewData.score}%</p>
                  <p className="mt-0.5 text-[11px] text-emerald-600">Tingkat akurasi konsep</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-center">
                  <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Konsep Dikuasai</p>
                  <p className="mt-1 text-2xl font-black text-blue-700">{reviewData.correctQA} Soal</p>
                  <p className="mt-0.5 text-[11px] text-blue-600">Telah dipahami dengan baik</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Perlu Diperkuat</p>
                  <p className="mt-1 text-2xl font-black text-amber-700">{reviewData.wrongQA} Soal</p>
                  <p className="mt-0.5 text-[11px] text-amber-600">Pelajari rangkuman di bawah</p>
                </div>
              </div>

              {/* Tab Filter Pembahasan */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => setReviewTab('all')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    reviewTab === 'all'
                      ? 'bg-[#6B1224] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semua Pembahasan ({reviewData.allQA?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewTab('wrong')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    reviewTab === 'wrong'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Perlu Diperkuat ({reviewData.wrongAnswers?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewTab('correct')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    reviewTab === 'correct'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sudah Dikuasai ({reviewData.correctAnswers?.length || 0})
                </button>
              </div>

              {/* Daftar Soal, Jawaban & Rangkuman Penjelasan AI */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {filteredQA.length === 0 ? (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">Tidak ada butir pertanyaan dalam kategori ini.</p>
                  </div>
                ) : (
                  filteredQA.map((item, idx) => {
                    const qIdx = item.questionIndex !== undefined ? item.questionIndex : idx;
                    return (
                      <div
                        key={qIdx}
                        className={`rounded-2xl border p-5 space-y-3.5 transition ${
                          item.isCorrect
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-amber-200 bg-amber-50/20'
                        }`}
                      >
                        {/* Header Soal */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                                item.isCorrect ? 'bg-emerald-600' : 'bg-amber-600'
                              }`}
                            >
                              {item.questionNumber || idx + 1}
                            </span>
                            <span className="text-xs font-extrabold text-gray-900">
                              Pertanyaan Konsep #{item.questionNumber || idx + 1}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-3 py-0.5 text-[11px] font-black border ${
                              item.isCorrect
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {item.isCorrect ? '✓ Pemahaman Tepat' : '💡 Konsep Perlu Diingat'}
                          </span>
                        </div>

                        {/* Pertanyaan */}
                        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                          <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Pertanyaan Konsep:
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {item.question}
                          </p>
                        </div>

                        {/* Jawaban Mahasiswa */}
                        <div
                          className={`rounded-xl border p-3.5 ${
                            item.isCorrect
                              ? 'border-emerald-200 bg-emerald-50/50'
                              : 'border-amber-200 bg-amber-50/50'
                          }`}
                        >
                          <p
                            className={`text-[10.5px] font-bold uppercase tracking-wider mb-1 ${
                              item.isCorrect ? 'text-emerald-800' : 'text-amber-800'
                            }`}
                          >
                            Jawaban Anda:
                          </p>
                          <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">
                            {item.userAnswer || '(Tidak ada jawaban terekam)'}
                          </p>
                        </div>

                        {/* Rangkuman Penjelasan AI */}
                        <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-3.5">
                          <p className="text-[10.5px] font-bold uppercase tracking-wider text-purple-900 mb-1 flex items-center gap-1.5">
                            <span>📖</span> Rangkuman Penjelasan Materi:
                          </p>
                          <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>

                        {/* Catatan Pribadi Mahasiswa (Permanen Tersimpan ke Akun) */}
                        <div className="rounded-xl border border-yellow-300 bg-yellow-50/60 p-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-extrabold text-yellow-900 flex items-center gap-1">
                              <span>📝</span> Catatan Pribadi Anda:
                            </label>
                            <span className="text-[10.5px] text-yellow-700 italic">
                              Tersimpan otomatis ke database
                            </span>
                          </div>
                          <textarea
                            value={reviewNotes[qIdx] !== undefined ? reviewNotes[qIdx] : (item.note || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReviewNotes((prev) => ({ ...prev, [qIdx]: val }));
                            }}
                            placeholder="Tulis catatan atau poin penting yang ingin Anda ingat dari konsep ini..."
                            className="w-full rounded-lg border border-yellow-400 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-400 transition resize-none leading-relaxed"
                            rows={2}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bar Tombol Simpan Catatan & Kembali */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="rounded-xl bg-[#6B1224] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#80142A] transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <span>💾</span>
                  <span>{savingNotes ? 'Menyimpan Catatan...' : 'Simpan Semua Catatan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('history');
                    loadHistory();
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900"
                >
                  Tutup Rangkuman &amp; Kembali ke Riwayat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notifikasi Sukses */}
        {toastMsg && (
          <div className="absolute bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#1E1C1E] px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-fade-in">
            <span>✓</span> {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
