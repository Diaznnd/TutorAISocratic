import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, streamTutor } from '../api';
import { useAuth } from '../auth.jsx';

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

  useEffect(() => { api(`/materials/${id}`).then(setM).catch((e) => setErr(e.message)); }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [tutor?.msgs]);

  // Menangkap teks yang disorot, dan memastikan seleksi hanya berada dalam satu paragraf yang sama.
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

  const send = async (payload, base) => {
    setBusy(true);
    try {
      await streamTutor(payload, (ev) => {
        if (ev.type === 'session') setTutor((t) => ({ ...t, sessionId: ev.sessionId, hint: ev.hintLevel }));
        if (ev.type === 'delta') setTutor((t) => {
          const msgs = [...t.msgs];
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: msgs[msgs.length - 1].content + ev.text };
          return { ...t, msgs };
        });
        if (ev.type === 'error') setErr(ev.error);
      });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const startTutor = async () => {
    const base = { paragraphId: pick.paragraphId, selectedText: pick.text };
    try { await api('/highlights', { method: 'POST', body: base }); } catch (e) { return setErr(e.message); }
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
    setTutor((t) => ({ ...t, msgs: [...t.msgs, { role: 'user', content: message }, { role: 'assistant', content: '' }] }));
    send({ paragraphId: tutor.paragraphId, selectedText: tutor.text, sessionId: tutor.sessionId, message });
  };

  if (!m) return <p>{err || 'Memuat materi...'}</p>;
  const max = Math.max(1, ...m.paragraphs.map((p) => p.students || 0));

  return (
    <div className={tutor ? 'split' : ''}>
      <article onMouseUp={onSelect} onKeyUp={onSelect}>
        <h2>{m.title}</h2>
        {user.role === 'dosen'
          ? <p className="muted">Warna lebih pekat berarti lebih banyak mahasiswa yang menyorot paragraf itu. Nama mahasiswa tidak ditampilkan.</p>
          : <p className="muted">Sorot kata atau kalimat yang belum kamu pahami.</p>}
        {err && <p className="err">{err}</p>}
        {m.paragraphs.map((p) => (
          <p key={p.id} data-pid={p.id} className="para"
             style={user.role === 'dosen' && p.students ? { background: `rgba(255,214,0,${0.15 + 0.6 * (p.students / max)})` } : undefined}>
            {p.text}
            {user.role === 'dosen' && p.students > 0 && <span className="count">{p.students} mahasiswa menyorot</span>}
          </p>
        ))}
        {pick && <button className="floating" onClick={startTutor}>Saya belum paham bagian ini</button>}
      </article>

      {tutor && (
        <aside className="tutor">
          <div className="tutor-head">
            <strong>Tutor</strong>
            <span className="muted">Tingkat petunjuk {tutor.hint}/5</span>
            <button className="ghost" onClick={() => setTutor(null)}>Tutup</button>
          </div>
          <blockquote>{tutor.text}</blockquote>
          <div className="msgs">
            {tutor.msgs.map((x, i) => x.content || x.role === 'assistant'
              ? <p key={i} className={x.role}>{x.content || '...'}</p> : null)}
            <div ref={endRef} />
          </div>
          <form className="row" onSubmit={reply}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis jawabanmu" />
            <button disabled={busy}>Kirim</button>
          </form>
        </aside>
      )}
    </div>
  );
}
