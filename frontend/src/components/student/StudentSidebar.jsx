import { useState } from 'react';
import { useAuth } from '../../auth.jsx';
import { BookIcon, GearIcon, HomeIcon, LogOutIcon, PlusIcon } from './Icons.jsx';

/* Sidebar khusus area pelajar: navigasi utama, aksi gabung kelas, dan panel akun. */
export default function StudentSidebar({ activeSection = 'beranda', onNavigate, onJoin }) {
  const { user, logout } = useAuth();
  const [openAccount, setOpenAccount] = useState(false);

  const items = [
    { key: 'beranda', label: 'Beranda', Icon: HomeIcon },
    { key: 'kelas', label: 'Kelas Saya', Icon: BookIcon },
  ];

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
          {items.map(({ key, label, Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate?.(key)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] font-bold transition-colors cursor-pointer text-left',
                  active
                    ? 'bg-[#6B1224] text-white shadow-[0_10px_22px_-14px_rgba(107,18,36,0.9)]'
                    : 'text-[#8B8391] hover:bg-[#FBF7F4] hover:text-[#6B1224]',
                ].join(' ')}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-[#B3ABB8]'} />
                <span>{label}</span>
              </button>
            );
          })}
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
                Pelajar / Mahasiswa
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
