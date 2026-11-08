import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import {
  BookIcon,
  ChevronDownIcon,
  ClipboardIcon,
  GearIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
} from './Icons.jsx';

function ChartIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

/* Sidebar area aplikasi: navigasi utama, dropdown kelas saya, aksi gabung/buat kelas, dan panel akun. */
export default function StudentSidebar({ activeSection = 'beranda', onNavigate, onJoin, onAnalytics }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Deteksi kelas yang sedang dibuka dari URL /kelas/:classId
  const classMatch = location.pathname.match(/^\/kelas\/(\d+)/);
  const currentClassId = classMatch ? Number(classMatch[1]) : null;

  const [openAccount, setOpenAccount] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [openClasses, setOpenClasses] = useState(() => Boolean(currentClassId));

  // Ambil daftar kelas yang diikuti oleh siswa
  useEffect(() => {
    let mounted = true;
    setLoadingClasses(true);
    api('/classes')
      .then((data) => {
        if (mounted && Array.isArray(data)) setClasses(data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingClasses(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Jika URL mengarah ke kelas tertentu, pastikan dropdown kelas terbuka
  useEffect(() => {
    if (currentClassId) {
      setOpenClasses(true);
    }
  }, [currentClassId]);

  const handleNav = (key) => {
    if (key === 'analitik') {
      if (onAnalytics) {
        onAnalytics();
      } else {
        navigate('/analitik');
      }
      return;
    }
    if (key === 'tugas') {
      navigate('/tugas');
      return;
    }
    if (key === 'beranda') {
      navigate('/app');
      return;
    }
    if (key === 'kelas') {
      // Toggle dropdown kelas saat tombol Kelas Saya ditekan
      setOpenClasses((prev) => !prev);
      return;
    }
    onNavigate?.(key);
  };

  const isKelasActive = Boolean(currentClassId) || (activeSection === 'kelas' && !currentClassId);

  return (
    <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col justify-between border-r border-[#F1EEF4] bg-white px-5 py-7 lg:flex xl:w-[292px] xl:px-6 xl:py-8">
      {/* Brand */}
      <div>
        <div className="px-2">
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[19px] font-extrabold leading-none tracking-tight text-[#6B1224]">
            Sorot Paham
          </p>
          <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#A79FAB]">
            Learning Platform
          </p>
        </div>

        {/* Navigasi utama */}
        <nav className="mt-9 space-y-1.5">
          {/* Beranda */}
          <button
            type="button"
            onClick={() => handleNav('beranda')}
            aria-current={activeSection === 'beranda' && !currentClassId ? 'page' : undefined}
            className={[
              'flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] font-bold transition-colors cursor-pointer text-left',
              activeSection === 'beranda' && !currentClassId
                ? 'bg-[#6B1224] text-white shadow-[0_10px_22px_-14px_rgba(107,18,36,0.9)]'
                : 'text-[#8B8391] hover:bg-[#FBF7F4] hover:text-[#6B1224]',
            ].join(' ')}
          >
            <HomeIcon
              size={18}
              className={activeSection === 'beranda' && !currentClassId ? 'text-white' : 'text-[#B3ABB8]'}
            />
            <span>Beranda</span>
          </button>

          {/* Kelas Saya (Accordion Dropdown) */}
          <div>
            <button
              type="button"
              onClick={() => handleNav('kelas')}
              className={[
                'group flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-[13px] font-bold transition-colors cursor-pointer text-left',
                isKelasActive
                  ? currentClassId
                    ? 'bg-[#F9E8EC] text-[#6B1224]'
                    : 'bg-[#6B1224] text-white shadow-[0_10px_22px_-14px_rgba(107,18,36,0.9)]'
                  : 'text-[#8B8391] hover:bg-[#FBF7F4] hover:text-[#6B1224]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BookIcon
                  size={18}
                  className={
                    isKelasActive && !currentClassId
                      ? 'text-white'
                      : isKelasActive
                      ? 'text-[#6B1224]'
                      : 'text-[#B3ABB8]'
                  }
                />
                <span className="truncate">Kelas Saya</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {classes.length > 0 && (
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                      isKelasActive && !currentClassId
                        ? 'bg-white/20 text-white'
                        : isKelasActive
                        ? 'bg-[#6B1224] text-white'
                        : 'bg-[#F1EEF4] text-[#8B8391]',
                    ].join(' ')}
                  >
                    {classes.length}
                  </span>
                )}
                <ChevronDownIcon
                  size={14}
                  className={`transition-transform duration-200 ${openClasses ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Menu Dropdown Daftar Kelas */}
            {openClasses && (
              <div className="mt-1 space-y-1 pl-3 pr-1 py-1">
                {loadingClasses ? (
                  <div className="px-3 py-2 text-[11px] text-[#A79FAB] animate-pulse">
                    Memuat daftar kelas...
                  </div>
                ) : classes.length === 0 ? (
                  <div className="rounded-xl bg-[#FCFBFD] border border-[#F1EEF4] p-3 text-center">
                    <p className="text-[11px] text-[#8B8391]">
                      {user?.role === 'dosen' ? 'Belum ada kelas dibuat' : 'Belum mengikuti kelas'}
                    </p>
                    <button
                      type="button"
                      onClick={onJoin}
                      className="mt-1 text-[11px] font-bold text-[#6B1224] hover:underline cursor-pointer"
                    >
                      {user?.role === 'dosen' ? '+ Buat Kelas Baru' : '+ Gabung Kelas'}
                    </button>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {classes.map((cls) => {
                      const isSelected = currentClassId === cls.id;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            navigate(`/kelas/${cls.id}`);
                          }}
                          className={[
                            'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] transition-all cursor-pointer',
                            isSelected
                              ? 'bg-[#6B1224] text-white font-bold shadow-[0_4px_12px_-4px_rgba(107,18,36,0.7)]'
                              : 'text-[#6C6267] hover:bg-[#F9E8EC] hover:text-[#6B1224] font-medium',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'h-1.5 w-1.5 rounded-full shrink-0 transition-colors',
                              isSelected ? 'bg-white' : 'bg-[#D1C7D0] group-hover:bg-[#6B1224]',
                            ].join(' ')}
                          />
                          <span className="truncate flex-1">{cls.name}</span>
                          {cls.code && (
                            <span
                              className={[
                                'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider shrink-0',
                                isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F4F7] text-[#8B8391]',
                              ].join(' ')}
                            >
                              {cls.code}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu ketiga: Laporan Analitik (Dosen) atau Tugas Saya (Mahasiswa) */}
          {user?.role === 'dosen' ? (
            <button
              type="button"
              onClick={() => handleNav('analitik')}
              aria-current={activeSection === 'analitik' ? 'page' : undefined}
              className={[
                'flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] font-bold transition-colors cursor-pointer text-left',
                activeSection === 'analitik'
                  ? 'bg-[#6B1224] text-white shadow-[0_10px_22px_-14px_rgba(107,18,36,0.9)]'
                  : 'text-[#8B8391] hover:bg-[#FBF7F4] hover:text-[#6B1224]',
              ].join(' ')}
            >
              <ChartIcon
                size={18}
                className={activeSection === 'analitik' ? 'text-white' : 'text-[#B3ABB8]'}
              />
              <span>Laporan Analitik</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('tugas')}
              aria-current={activeSection === 'tugas' ? 'page' : undefined}
              className={[
                'flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] font-bold transition-colors cursor-pointer text-left',
                activeSection === 'tugas'
                  ? 'bg-[#6B1224] text-white shadow-[0_10px_22px_-14px_rgba(107,18,36,0.9)]'
                  : 'text-[#8B8391] hover:bg-[#FBF7F4] hover:text-[#6B1224]',
              ].join(' ')}
            >
              <ClipboardIcon
                size={18}
                className={activeSection === 'tugas' ? 'text-white' : 'text-[#B3ABB8]'}
              />
              <span>Tugas Saya</span>
            </button>
          )}
        </nav>
      </div>

      {/* Aksi & pengaturan */}
      <div className="mt-8">
        <button
          type="button"
          onClick={onJoin}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#6B1224] px-4 py-3.5 text-[13px] font-bold text-white shadow-[0_14px_26px_-16px_rgba(107,18,36,0.85)] transition hover:bg-[#80142A] active:translate-y-px cursor-pointer"
        >
          <PlusIcon size={17} />
          <span>Gabung / Buat Kelas</span>
        </button>

        <div className="mt-3 border-t border-[#F1EEF4] pt-3">
          <button
            type="button"
            onClick={() => setOpenAccount((v) => !v)}
            aria-expanded={openAccount}
            className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-[#8B8391] transition-colors hover:bg-[#FBF7F4] hover:text-[#6B1224] cursor-pointer"
          >
            <GearIcon size={18} className="text-[#B3ABB8]" />
            <span>Pengaturan</span>
          </button>

          {openAccount && (
            <div className="mt-2 rounded-2xl border border-[#F1EEF4] bg-[#FBF7F4] p-3.5">
              <p className="truncate text-xs font-bold text-[#1E1C1E]">{user?.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-[#8B8391]">{user?.email}</p>
              <p className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6B1224]">
                {user?.role === 'dosen' ? 'Dosen / Pengajar' : 'Pelajar / Mahasiswa'}
              </p>
              <button
                type="button"
                onClick={logout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5D5D8] bg-white px-3 py-2 text-[11px] font-bold text-[#6B1224] transition hover:bg-[#F9E8EC] cursor-pointer"
              >
                <LogOutIcon size={14} />
                <span>Keluar dari akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
