import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth.jsx';
import { BellIcon, ChevronDownIcon, ClockIcon, LogOutIcon, SearchIcon } from './Icons.jsx';

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* Topbar area pelajar: pencarian, riwayat, notifikasi, dan menu profil. */
export default function StudentTopbar({ query = '', onQueryChange }) {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#F1EEF4] bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Pencarian */}
        <label className="relative flex min-w-0 flex-1 items-center">
          <SearchIcon size={17} className="pointer-events-none absolute left-4 text-[#A79FAB]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Cari kursus, materi, atau tugas..."
            className="w-full rounded-full border border-transparent bg-[#F5F4F7] py-2.5 pl-11 pr-4 text-[13px] font-medium text-[#1E1C1E] placeholder:font-normal placeholder:text-[#A79FAB] outline-none transition focus:border-[#E7D8DD] focus:bg-white focus:ring-4 focus:ring-[#6B1224]/8"
          />
        </label>

        {/* Aksi kanan */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            title="Riwayat belajar"
            aria-label="Riwayat belajar"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#8B8391] transition hover:bg-[#FBF7F4] hover:text-[#6B1224] sm:flex cursor-pointer"
          >
            <ClockIcon size={18} />
          </button>

          <button
            type="button"
            title="Notifikasi"
            aria-label="Notifikasi"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#8B8391] transition hover:bg-[#FBF7F4] hover:text-[#6B1224] cursor-pointer"
          >
            <BellIcon size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D05A6E] ring-2 ring-white" />
          </button>

          {/* Profil */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              aria-expanded={openMenu}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1.5 transition hover:bg-[#FBF7F4] sm:pr-2 cursor-pointer"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE7EA] text-[11px] font-extrabold tracking-wide text-[#6B1224] ring-1 ring-white">
                {initials(user?.name)}
              </span>
              <span className="hidden max-w-[130px] truncate text-[13px] font-bold text-[#1E1C1E] sm:block">
                {user?.name}
              </span>
              <ChevronDownIcon
                size={15}
                className={`hidden text-[#A79FAB] transition-transform sm:block ${openMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {openMenu && (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-[#F1EEF4] bg-white p-2 shadow-[0_24px_48px_-28px_rgba(30,28,30,0.45)]"
              >
                <div className="rounded-xl bg-[#FBF7F4] px-3 py-2.5">
                  <p className="truncate text-xs font-bold text-[#1E1C1E]">{user?.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#8B8391]">{user?.email}</p>
                  <p className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6B1224]">
                    Pelajar / Mahasiswa
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold text-[#6B1224] transition hover:bg-[#F9E8EC] cursor-pointer"
                >
                  <LogOutIcon size={15} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
