import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth.jsx';

export default function Home() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mat, setMat] = useState({ classId: null, title: '', content: '' });
  const [err, setErr] = useState('');

  const load = () => api('/classes').then(setClasses).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const run = (fn) => async (e) => {
    e.preventDefault();
    setErr('');
    try { await fn(); await load(); } catch (e2) { setErr(e2.message); }
  };

  return (
    <>
      <h2>Kelas</h2>
      {err && <p className="err">{err}</p>}

      {user.role === 'dosen' ? (
        <form className="row" onSubmit={run(async () => { await api('/classes', { method: 'POST', body: { name } }); setName(''); })}>
          <input placeholder="Nama kelas baru" value={name} onChange={(e) => setName(e.target.value)} required />
          <button>Buat kelas</button>
        </form>
      ) : (
        <form className="row" onSubmit={run(async () => { await api('/classes/join', { method: 'POST', body: { code } }); setCode(''); })}>
          <input placeholder="Kode kelas" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button>Gabung</button>
        </form>
      )}

      {classes.length === 0 && <p className="muted">Belum ada kelas. {user.role === 'dosen' ? 'Buat kelas pertamamu di atas.' : 'Masukkan kode kelas dari dosenmu.'}</p>}

      {classes.map((c) => (
        <section key={c.id} className="card">
          <h3>{c.name} {user.role === 'dosen' && <span className="code">kode: {c.code}</span>}</h3>
          <ul>
            {c.materials.map((m) => <li key={m.id}><Link to={`/materi/${m.id}`}>{m.title}</Link></li>)}
            {c.materials.length === 0 && <li className="muted">Belum ada materi.</li>}
          </ul>
          {user.role === 'dosen' && (mat.classId === c.id ? (
            <form className="col" onSubmit={run(async () => { await api(`/classes/${c.id}/materials`, { method: 'POST', body: { title: mat.title, content: mat.content } }); setMat({ classId: null, title: '', content: '' }); })}>
              <input placeholder="Judul materi" value={mat.title} onChange={(e) => setMat({ ...mat, title: e.target.value })} required />
              <textarea rows={8} placeholder="Tempel isi materi. Pisahkan paragraf dengan baris kosong." value={mat.content} onChange={(e) => setMat({ ...mat, content: e.target.value })} required />
              <button>Simpan materi</button>
            </form>
          ) : (
            <button className="ghost" onClick={() => setMat({ classId: c.id, title: '', content: '' })}>Tambah materi</button>
          ))}
        </section>
      ))}
    </>
  );
}
