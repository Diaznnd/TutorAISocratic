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
    try {
      await fn();
      await load();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const isDosen = user.role === 'dosen';

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10 px-4 sm:px-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{isDosen ? '📋' : '🎓'}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6B1224] font-['Syne',sans-serif] m-0">
              {isDosen ? 'Dashboard Kelas & Materi Dosen' : 'Kelas Pembelajaran Saya'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6C6267] m-0">
            {isDosen
              ? 'Kelola ruang kelas, unggah modul perkuliahan, dan evaluasi pemahaman mahasiswa.'
              : 'Gabung dengan kode kelas dari dosenmu dan mulai membaca materi interaktif.'}
          </p>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-4 rounded-2xl mb-6">
            {err}
          </div>
        )}

        {/* Action Form (Create Class or Join Class) */}
        <div className="bg-white rounded-3xl p-5 border border-[#F9E8EC] shadow-xs mb-8">
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={
              isDosen
                ? run(async () => {
                    await api('/classes', { method: 'POST', body: { name } });
                    setName('');
                  })
                : run(async () => {
                    await api('/classes/join', { method: 'POST', body: { code } });
                    setCode('');
                  })
            }
          >
            <input
              type="text"
              placeholder={isDosen ? 'Masukkan nama kelas baru (misal: Struktur Data A)...' : 'Masukkan kode kelas dari dosenmu...'}
              value={isDosen ? name : code}
              onChange={(e) => (isDosen ? setName(e.target.value) : setCode(e.target.value))}
              required
              className="flex-1 px-4 py-2.5 rounded-full border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-white text-xs sm:text-sm font-bold bg-[#6B1224] hover:bg-[#80142A] transition-all cursor-pointer shadow-xs whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <span>{isDosen ? '+ Buat Kelas' : 'Gabung Kelas'}</span>
            </button>
          </form>
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <div className="bg-white rounded-3xl p-10 border border-[#F9E8EC] text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#F9E8EC] text-[#6B1224] flex items-center justify-center text-2xl mx-auto mb-3">
              📚
            </div>
            <h3 className="font-bold text-base text-[#1E1C1E] font-['Syne',sans-serif] mb-1">
              Belum Ada Kelas Terdaftar
            </h3>
            <p className="text-xs sm:text-sm text-[#6C6267] max-w-sm mx-auto">
              {isDosen
                ? 'Buat kelas baru melalui formulir di atas untuk mulai membagikan materi bacaan.'
                : 'Minta kode kelas 6-karakter kepada dosenmu, lalu masukkan pada formulir di atas.'}
            </p>
          </div>
        )}

        {/* Classes List */}
        <div className="space-y-6">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-[#F9E8EC] shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-6 py-4.5 bg-[#FBF7F4] border-b border-[#F9E8EC] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F9E8EC] text-[#6B1224] flex items-center justify-center font-bold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[#1E1C1E] font-['Syne',sans-serif] m-0">
                      {c.name}
                    </h2>
                    {isDosen && (
                      <span className="text-[11px] font-mono font-bold text-[#6B1224] bg-white px-2 py-0.5 rounded border border-[#E5D5D8] inline-block mt-0.5">
                        Kode Gabung: {c.code}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#6C6267] bg-white px-3 py-1 rounded-full border border-[#E5D5D8]">
                  {c.materials.length} Bahan Ajar
                </span>
              </div>

              {/* Material Items */}
              <div className="p-6">
                {c.materials.length === 0 ? (
                  <p className="text-xs sm:text-sm text-[#6C6267] italic m-0">
                    Belum ada materi perkuliahan di kelas ini.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {c.materials.map((m) => (
                      <Link
                        key={m.id}
                        to={`/materi/${m.id}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FBF7F4] hover:bg-[#F9E8EC]/40 border border-[#F9E8EC] text-xs sm:text-sm font-semibold text-[#1E1C1E] hover:text-[#6B1224] transition-all no-underline group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base text-[#D05A6E]">📄</span>
                          <span>{m.title}</span>
                        </div>
                        <span className="text-xs text-[#D05A6E] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          Buka Ruang Baca →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Add Material (Dosen Only) */}
                {isDosen && (
                  <div className="mt-5 pt-4 border-t border-[#F9E8EC]">
                    {mat.classId === c.id ? (
                      <form
                        className="space-y-3 bg-[#FBF7F4] p-4.5 rounded-2xl border border-[#F9E8EC]"
                        onSubmit={run(async () => {
                          await api(`/classes/${c.id}/materials`, {
                            method: 'POST',
                            body: { title: mat.title, content: mat.content },
                          });
                          setMat({ classId: null, title: '', content: '' });
                        })}
                      >
                        <input
                          type="text"
                          placeholder="Judul modul / bab materi..."
                          value={mat.title}
                          onChange={(e) => setMat({ ...mat, title: e.target.value })}
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] bg-white transition-colors"
                        />
                        <textarea
                          rows={6}
                          placeholder="Tempelkan isi modul bacaan di sini. Pisahkan tiap paragraf dengan satu baris kosong..."
                          value={mat.content}
                          onChange={(e) => setMat({ ...mat, content: e.target.value })}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] bg-white transition-colors"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2 rounded-full font-bold text-xs sm:text-sm text-white bg-[#6B1224] hover:bg-[#80142A] transition-all cursor-pointer shadow-xs"
                          >
                            Simpan & Terbitkan Materi
                          </button>
                          <button
                            type="button"
                            onClick={() => setMat({ classId: null, title: '', content: '' })}
                            className="px-4 py-2 rounded-full font-semibold text-xs sm:text-sm bg-white border border-[#E5D5D8] text-[#6C6267] hover:bg-neutral-50 cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setMat({ classId: c.id, title: '', content: '' })}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-[#F9E8EC] text-[#6B1224] hover:bg-[#F4D4DC] transition-colors cursor-pointer"
                      >
                        <span>+ Tambah Materi Ajar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
