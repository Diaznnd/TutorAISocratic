import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, streamTutor } from '../api';
import { useAuth } from '../auth.jsx';
import { markMaterialRead } from '../progress';

export default function Material() {
  const { id } = useParams();
  const { user } = useAuth();
  const [m, setM] = useState(null);
  const [err, setErr] = useState('');
  const [pick, setPick] = useState(null); // { paragraphId, text }
  const [tutor, setTutor] = useState(null); // { paragraphId, text, sessionId, hint, msgs }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    markMaterialRead(id); // catat progres baca untuk dashboard pelajar (localStorage)
    api(`/materials/${id}`).then(setM).catch((e) => setErr(e.message));
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutor?.msgs]);

  // Menangkap teks yang disorot dalam batas satu paragraf yang sama
  const onSelect = () => {
    if (user.role !== 'mahasiswa') return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text) return setPick(null);
    const anchorEl = (sel.anchorNode?.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode)?.closest('[data-pid]');
    const focusEl = (sel.focusNode?.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode)?.closest('[data-pid]');
    if (!anchorEl || !focusEl || anchorEl !== focusEl) return setPick(null);
    setPick({ paragraphId: Number(anchorEl.dataset.pid), text });
  };

  const send = async (payload) => {
    setBusy(true);
    try {
      await streamTutor(payload, (ev) => {
        if (ev.type === 'session') setTutor((t) => ({ ...t, sessionId: ev.sessionId, hint: ev.hintLevel }));
        if (ev.type === 'delta') {
          setTutor((t) => {
            const msgs = [...t.msgs];
            msgs[msgs.length - 1] = {
              ...msgs[msgs.length - 1],
              content: msgs[msgs.length - 1].content + ev.text,
            };
            return { ...t, msgs };
          });
        }
        if (ev.type === 'error') setErr(ev.error);
      });
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  const startTutor = async () => {
    const base = { paragraphId: pick.paragraphId, selectedText: pick.text };
    try {
      await api('/highlights', { method: 'POST', body: base });
    } catch (e) {
      return setErr(e.message);
    }
    setErr('');
    setTutor({ ...base, sessionId: null, hint: 1, msgs: [{ role: 'assistant', content: '' }] });
    setPick(null);
    send(base);
  };

  const reply = (e) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const message = input.trim();
    setInput('');
    setTutor((t) => ({
      ...t,
      msgs: [...t.msgs, { role: 'user', content: message }, { role: 'assistant', content: '' }],
    }));
    send({
      paragraphId: tutor.paragraphId,
      selectedText: tutor.text,
      sessionId: tutor.sessionId,
      message,
    });
  };

  /* ── Loading / Error ── */
  if (!m) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] py-16 px-4 flex justify-center items-center font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="bg-white p-6 rounded-2xl shadow-xs text-center max-w-sm">
          {err ? (
            <p className="text-red-700 text-sm m-0">{err}</p>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-[#6B1224] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#6B1224] animate-ping" />
              <span>Memuat modul bahan ajar...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const max = Math.max(1, ...m.paragraphs.map((p) => p.students || 0));

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 px-4 sm:px-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B1224] bg-[#F9E8EC] hover:bg-[#F4D4DC] px-3.5 py-1.5 rounded-full no-underline transition-colors shadow-2xs"
          >
            <span>← Kembali ke Daftar Kelas</span>
          </Link>
        </div>

        {/* Content Layout */}
        <div className={`grid grid-cols-1 ${tutor ? 'lg:grid-cols-12 gap-8' : 'max-w-3xl mx-auto'} items-start`}>
          {/* Reader Article Area */}
          <article
            onMouseUp={onSelect}
            onKeyUp={onSelect}
            className={`${tutor ? 'lg:col-span-7' : 'w-full'} bg-white rounded-3xl p-6 sm:p-10 border border-[#F9E8EC] shadow-sm relative`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D05A6E] bg-[#F9E8EC] px-3 py-1 rounded-full inline-block mb-3">
              Bahan Ajar Perkuliahan
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] mb-3 leading-tight">
              {m.title}
            </h1>

            {user.role === 'dosen' ? (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 mb-6 flex items-center gap-2">
                <span>🔥</span>
                <span>
                  <strong>Mode Heatmap Dosen:</strong> Warna kuning yang lebih pekat menandakan semakin banyak mahasiswa yang menyorot paragraf tersebut (100% anonim).
                </span>
              </div>
            ) : (
              <div className="bg-[#FBF7F4] border border-[#F9E8EC] p-3 rounded-xl text-xs text-[#6C6267] mb-6 flex items-center gap-2">
                <span>💡</span>
                <span>
                  <strong>Petunjuk Belajar:</strong> Sorot kata atau kalimat yang membingungkan, lalu tekan tombol "Saya belum paham" untuk berdialog dengan Tutor Sokrates.
                </span>
              </div>
            )}

            {err && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-4 border border-red-200">
                {err}
              </div>
            )}

            {/* Paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-[#1E1C1E] leading-relaxed font-serif">
              {m.paragraphs.map((p) => {
                const ratio = p.students ? p.students / max : 0;
                const bgStyle =
                  user.role === 'dosen' && p.students
                    ? { backgroundColor: `rgba(255, 214, 0, ${0.15 + 0.55 * ratio})` }
                    : undefined;

                return (
                  <p
                    key={p.id}
                    data-pid={p.id}
                    style={bgStyle}
                    className="p-3 rounded-xl cursor-text hover:bg-[#F9E8EC]/30 transition-colors m-0 relative"
                  >
                    {p.text}
                    {user.role === 'dosen' && p.students > 0 && (
                      <span className="inline-block ml-2 text-[10px] font-sans font-bold text-[#6B1224] bg-white border border-[#E5D5D8] px-2 py-0.5 rounded-full align-middle">
                        {p.students} mahasiswa menyorot
                      </span>
                    )}
                  </p>
                );
              })}
            </div>

            {/* Floating Highlight Button */}
            {pick && (
              <div className="sticky bottom-6 flex justify-center mt-6 z-20">
                <button
                  onClick={startTutor}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs sm:text-sm font-bold bg-[#6B1224] hover:bg-[#80142A] transition-all shadow-lg hover:scale-105 cursor-pointer animate-bounce"
                >
                  <span>💡 Saya belum paham bagian ini</span>
                </button>
              </div>
            )}
          </article>

          {/* Socratic Tutor Panel (Right Column) */}
          {tutor && (
            <aside className="lg:col-span-5 sticky top-20 bg-white rounded-3xl border-2 border-[#6B1224]/20 shadow-xl p-5 sm:p-6 flex flex-col h-[560px]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#F9E8EC]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#6B1224] text-white flex items-center justify-center font-bold text-xs">
                    SP
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] block">
                      Tutor AI Socratic
                    </span>
                    <span className="text-[10px] font-semibold text-[#D05A6E] block">
                      Tangga Petunjuk: {tutor.hint}/5
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setTutor(null)}
                  className="text-xs font-semibold px-3 py-1 rounded-full border border-[#E5D5D8] text-[#6C6267] hover:bg-[#F9E8EC] transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Selected quote reference */}
              <div className="text-xs italic bg-[#FBF7F4] border-l-3 border-[#6B1224] p-2.5 rounded-r-xl text-[#6C6267] mb-3 flex-shrink-0">
                "{tutor.text}"
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3 scrollbar-thin">
                {tutor.msgs.map((x, i) =>
                  x.content || x.role === 'assistant' ? (
                    <div
                      key={i}
                      className={`flex flex-col ${x.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          x.role === 'user'
                            ? 'bg-[#6B1224] text-white rounded-br-xs'
                            : 'bg-[#FBF7F4] text-[#1E1C1E] border border-[#F9E8EC] rounded-bl-xs'
                        }`}
                      >
                        {x.content || '...'}
                      </div>
                      <span className="text-[9px] text-[#6C6267] mt-0.5 px-1">
                        {x.role === 'user' ? 'Kamu' : 'Tutor'}
                      </span>
                    </div>
                  ) : null
                )}
                <div ref={endRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={reply} className="flex gap-2 pt-2 border-t border-[#F9E8EC] flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tuliskan jawaban atau penalaranmu..."
                  className="flex-1 px-3.5 py-2 rounded-full border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] transition-colors"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="px-4 py-2 rounded-full font-bold text-xs text-white bg-[#6B1224] hover:bg-[#80142A] transition-all disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Kirim
                </button>
              </form>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
