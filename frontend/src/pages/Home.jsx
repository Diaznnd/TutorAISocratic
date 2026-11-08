import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import { PlusIcon } from '../components/student/Icons.jsx';
import {
  CreateClassModal,
  CreatedSuccessModal,
  AnalyticsModal,
} from '../components/ClassModals.jsx';

/* ─── Komponen Utama Dashboard Dosen (Image 1) ─── */
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // State Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdClass, setCreatedClass] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Carousel scroll refs
  const kelasRef = useRef(null);
  const progresRef = useRef(null);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/classes');
      if (Array.isArray(data)) setClasses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const scrollCarousel = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter kelas berdasarkan input search topbar
  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        {/* Sidebar Dosen (Dropdown Kelas Saya, Laporan Analitik, + Gabung/Buat Kelas) */}
        <StudentSidebar
          activeSection="beranda"
          onJoin={() => setShowCreateModal(true)}
          onAnalytics={() => navigate('/analitik')}
        />

        {/* Kolom Konten Utama */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar dengan Search, Jam, Notifikasi, dan Avatar Profil */}
          <StudentTopbar query={query} onQueryChange={setQuery} />

          <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-7 space-y-8">
            {/* ── 1. Hero Card Sambutan Dosen (Image 1) ── */}
            <div className="relative overflow-hidden rounded-[26px] border border-[#F3E6EA] bg-gradient-to-r from-[#FAF6F7] via-[#FFFDFC] to-[#FAF2F4] p-6 sm:p-8 lg:p-9 shadow-xs">
              <div className="max-w-xl">
                {/* Tag Titik Pink */}
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-[#6B1224]">
                  <span className="h-2 w-2 rounded-full bg-[#E11D48] animate-pulse" />
                  <span>Kelas Interaktif Terjadwal</span>
                </div>

                {/* Judul & Sapaan */}
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#1E1C1E] sm:text-3xl lg:text-[32px]">
                  Halo, {user?.name || 'Alex Carter'}!
                </h1>

                {/* Subtitle */}
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6C6267]">
                  Senang melihatmu kembali! Lanjutkan progres materi desain &amp; pemrograman interaktifmu hari ini.
                </p>

                {/* Tombol Aksi & Target Progress */}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (classes.length > 0) {
                        navigate(`/kelas/${classes[0].id}`);
                      } else {
                        setShowCreateModal(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E5D5D8] bg-white px-5 py-2.5 text-xs font-bold text-[#6B1224] shadow-xs hover:bg-[#F9E8EC] transition cursor-pointer"
                  >
                    <span>{classes.length > 0 ? 'Lanjutkan Belajar →' : 'Buat Kelas Pertama →'}</span>
                  </button>

                  <span className="text-xs font-medium text-[#8B8391]">
                    Target harian: <span className="font-bold text-[#1E1C1E]">85% tercapai</span>
                  </span>
                </div>
              </div>

              {/* Ilustrasi 3D Isometrik & Badge Level Pro 4 di Sisi Kanan */}
              <div className="mt-6 sm:mt-0 sm:absolute sm:right-7 sm:top-1/2 sm:-translate-y-1/2 flex flex-col items-center">
                <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-2xl border border-white/80 bg-white/60 p-2 shadow-[0_18px_40px_-24px_rgba(107,18,36,0.3)] backdrop-blur-xs">
                  <img
                    src="/isometric-studio.png"
                    alt="Level Pro"
                    className="w-[85%] select-none mix-blend-multiply"
                    draggable="false"
                  />
                  <div className="absolute -bottom-3 rounded-full border border-[#F1EEF4] bg-white px-3 py-1 shadow-sm flex items-center gap-1.5 text-[11px] font-extrabold text-[#6B1224]">
                    <span>🪄</span>
                    <span>Level Pro 4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Bagian "Kelas Anda" (Image 1) ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-extrabold text-[#1E1C1E]">Kelas Anda</h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(kelasRef, -320)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E1EA] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer text-sm font-bold"
                    title="Sebelumnya"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(kelasRef, 320)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E1EA] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer text-sm font-bold"
                    title="Berikutnya"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Daftar Kartu Kelas */}
              {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-[#F1EEF4] p-12 text-xs text-[#A79FAB] animate-pulse">
                  Memuat data kelas...
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="rounded-3xl border border-[#F1EEF4] bg-[#FCFBFD] p-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9E8EC] text-xl text-[#6B1224]">
                    📚
                  </div>
                  <h3 className="text-sm font-bold text-[#1E1C1E]">
                    {query ? 'Tidak ada kelas yang cocok' : 'Belum Ada Kelas yang Dibuat'}
                  </h3>
                  <p className="mt-1 text-xs text-[#8B8391] max-w-sm mx-auto">
                    {query
                      ? `Tidak ditemukan kelas dengan kata kunci "${query}".`
                      : 'Buat kelas pertama Anda untuk mulai mengunggah materi, modul bacaan, dan tugas interaktif.'}
                  </p>
                  {!query && (
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6B1224] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#80142A] transition cursor-pointer"
                    >
                      <PlusIcon size={14} /> Buat Kelas Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div
                  ref={kelasRef}
                  className="flex gap-5 overflow-x-auto pb-2 scrollbar-none snap-x"
                >
                  {filteredClasses.map((cls) => {
                    const materiCount = cls.materials?.length || 0;
                    return (
                      <div
                        key={cls.id}
                        onClick={() => navigate(`/kelas/${cls.id}`)}
                        className="group flex flex-col justify-between rounded-2xl border border-[#F1EEF4] bg-white p-4 transition-all hover:border-[#6B1224]/30 hover:shadow-md cursor-pointer min-w-[290px] sm:min-w-[320px] max-w-[360px] flex-shrink-0 snap-start"
                      >
                        {/* Thumbnail Banner */}
                        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#F5F4F8] via-[#FAF7F9] to-[#F7EEF2] flex items-center justify-center">
                          <img
                            src="/isometric-studio.png"
                            alt={cls.name}
                            className="w-[58%] select-none mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Metadata Tag */}
                        <div className="mt-3.5 flex items-center justify-between text-[11px] font-semibold text-[#8B8391]">
                          <span className="flex items-center gap-1">
                            <span>🕒</span> 4 Bulan
                          </span>
                          <span className="flex items-center gap-1 text-[#6B1224] font-bold">
                            <span>📖</span> {materiCount} Materi
                          </span>
                        </div>

                        {/* Judul & Deskripsi */}
                        <div className="mt-2.5">
                          <h3 className="text-sm font-extrabold text-[#1E1C1E] group-hover:text-[#6B1224] transition-colors line-clamp-1">
                            {cls.name}
                          </h3>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#6C6267] line-clamp-2">
                            {cls.description || 'Kuasai kompetensi terstruktur, studi kasus, dan evaluasi berbasis Socratic AI.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── 3. Bagian "Progres Kelas Anda" (Image 1) ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-extrabold text-[#1E1C1E]">Progres Kelas Anda</h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(progresRef, -320)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E1EA] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer text-sm font-bold"
                    title="Sebelumnya"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(progresRef, 320)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E1EA] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer text-sm font-bold"
                    title="Berikutnya"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Kartu Progress Berdasarkan Kelas */}
              {classes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5D5D8] p-8 text-center text-xs text-[#8B8391]">
                  Progres belajar akan ditampilkan secara otomatis setelah Anda membuat kelas dan membagikan materi.
                </div>
              ) : (
                <div
                  ref={progresRef}
                  className="flex gap-5 overflow-x-auto pb-2 scrollbar-none snap-x"
                >
                  {classes.map((cls, idx) => {
                    // Warna progres bervariasi sesuai design Image 1: Purple, Green, Maroon
                    const progressVariants = [
                      {
                        percent: 70,
                        badge: 'Modul 08/12',
                        badgeCls: 'bg-[#1E1C1E] text-white',
                        barCls: 'bg-gradient-to-r from-indigo-500 to-purple-600',
                      },
                      {
                        percent: 100,
                        badge: '✓ Selesai',
                        badgeCls: 'bg-emerald-600 text-white',
                        barCls: 'bg-emerald-500',
                      },
                      {
                        percent: 20,
                        badge: 'Modul 02/10',
                        badgeCls: 'bg-[#1E1C1E] text-white',
                        barCls: 'bg-[#6B1224]',
                      },
                    ];
                    const variant = progressVariants[idx % progressVariants.length];

                    return (
                      <div
                        key={cls.id}
                        onClick={() => navigate(`/kelas/${cls.id}`)}
                        className="group flex flex-col justify-between rounded-2xl border border-[#F1EEF4] bg-white p-4 transition-all hover:border-[#6B1224]/30 hover:shadow-md cursor-pointer min-w-[270px] sm:min-w-[300px] max-w-[340px] flex-shrink-0 snap-start"
                      >
                        {/* Thumbnail dengan Badge di Sudut Kanan Bawah */}
                        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#F5F4F8] via-[#FAF7F9] to-[#F7EEF2] flex items-center justify-center">
                          <img
                            src="/isometric-studio.png"
                            alt={cls.name}
                            className="w-[50%] select-none mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                          />
                          <span
                            className={`absolute bottom-2 right-2 rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-xs ${variant.badgeCls}`}
                          >
                            {variant.badge}
                          </span>
                        </div>

                        {/* Judul Kelas */}
                        <div className="mt-3">
                          <h4 className="text-sm font-extrabold text-[#1E1C1E] group-hover:text-[#6B1224] transition-colors truncate">
                            {cls.name}
                          </h4>

                          {/* Baris Persentase */}
                          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-[#8B8391]">
                            <span>Progres Belajar</span>
                            <span className="font-extrabold text-[#1E1C1E]">{variant.percent}%</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#F1EEF4] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${variant.barCls}`}
                              style={{ width: `${variant.percent}%` }}
                            />
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
      </div>

      {/* ── Modal Buat Kelas Baru (Image 2) ── */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newCls) => {
          setShowCreateModal(false);
          setCreatedClass(newCls);
          loadClasses();
        }}
      />

      {/* ── Modal Kelas Berhasil Dibuat (Image 3) ── */}
      <CreatedSuccessModal
        createdClass={createdClass}
        onClose={() => setCreatedClass(null)}
        onOpenClass={(classId) => {
          setCreatedClass(null);
          navigate(`/kelas/${classId}`);
        }}
      />

      {/* ── Modal Laporan Analitik ── */}
      <AnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        classes={classes}
      />
    </div>
  );
}
