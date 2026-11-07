import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { BellIcon, ChevronDownIcon, ClockIcon, LogOutIcon, SearchIcon, XIcon } from './Icons.jsx';

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function fmtAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

/* Topbar area pelajar: pencarian, riwayat, notifikasi, dan menu profil. */
export default function StudentTopbar({ query = '', onQueryChange }) {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem('lastSeenNotif') || 0));
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Hitung jumlah notifikasi yang belum dibaca (berdasarkan lastSeenNotif di state & localStorage)
  const unreadCount = notifs.filter((n) => new Date(n.createdAt).getTime() > lastSeen).length;

  const markAllRead = () => {
    const now = Date.now();
    localStorage.setItem('lastSeenNotif', String(now));
    setLastSeen(now);
  };

  const fetchNotifs = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await api('/classes/mine/notifications');
      setNotifs(Array.isArray(data) ? data : []);
    } catch {
      // silent fail
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const toggleNotif = () => {
    if (!openNotif) {
      fetchNotifs();
      setOpenNotif(true);
      // Ketika notifikasi dibuka untuk dilihat, langsung tandai sudah dibaca dan hilangkan dot merah
      markAllRead();
    } else {
      setOpenNotif(false);
    }
  };

  // Click outside untuk menutup dropdown profil dan notif
  useEffect(() => {
    if (!openMenu && !openNotif) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        markAllRead();
        setOpenNotif(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpenMenu(false); setOpenNotif(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu, openNotif]);

  // Fetch notifikasi saat mount untuk hitung badge
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

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

          {/* ── Notifikasi ── */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={toggleNotif}
              aria-expanded={openNotif}
              aria-label="Notifikasi"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#8B8391] transition hover:bg-[#FBF7F4] hover:text-[#6B1224] cursor-pointer"
            >
              <BellIcon size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D05A6E] text-[9px] font-extrabold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div
                role="dialog"
                aria-label="Panel notifikasi"
                className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[#F1EEF4] bg-white shadow-[0_24px_48px_-28px_rgba(30,28,30,0.45)] overflow-hidden"
              >
                {/* Header notifikasi */}
                <div className="flex items-center justify-between border-b border-[#F5F4F7] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-extrabold text-[#1E1C1E]">Notifikasi</p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#D05A6E] px-2 py-0.5 text-[9px] font-extrabold text-white">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-[#6B1224] hover:underline cursor-pointer"
                    >
                      Tandai dibaca
                    </button>
                    <button
                      type="button"
                      onClick={() => { markAllRead(); setOpenNotif(false); }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#A79FAB] hover:bg-[#F5F4F7] hover:text-[#6B1224] cursor-pointer transition"
                      aria-label="Tutup"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>

                {/* Isi */}
                <div className="max-h-[320px] overflow-y-auto">
                  {notifLoading ? (
                    <div className="space-y-2 p-3">
                      {[0, 1, 2].map((k) => (
                        <div key={k} className="h-14 animate-pulse rounded-xl bg-[#F5F4F7]" />
                      ))}
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-[13px] font-bold text-[#1E1C1E]">Tidak ada notifikasi</p>
                      <p className="mt-1 text-[11px] text-[#A79FAB]">Semua tugas dan materi terbaru akan muncul di sini.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#F5F4F7]">
                      {notifs.map((n, i) => {
                        const isNew = new Date(n.createdAt).getTime() > lastSeen;
                        return (
                          <li key={i}>
                            <Link
                              to={n.assignmentId ? `/kelas/${n.classId}/tugas/${n.assignmentId}` : `/kelas/${n.classId}`}
                              onClick={() => { markAllRead(); setOpenNotif(false); }}
                              className={[
                                'flex items-start gap-3 px-4 py-3 no-underline transition hover:bg-[#FBF7F4]',
                                isNew ? 'bg-[#FDF2F4]' : '',
                              ].join(' ')}
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9E8EC] text-[14px]">
                                📋
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-bold text-[#1E1C1E] leading-tight">{n.title}</p>
                                <p className="mt-0.5 text-[11px] text-[#6C6267] leading-tight truncate">{n.body}</p>
                                <p className="mt-1 text-[10px] font-semibold text-[#A79FAB]">{fmtAgo(n.createdAt)}</p>
                              </div>
                              {isNew && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D05A6E]" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-[#F5F4F7] px-4 py-2.5">
                  <Link
                    to="/tugas"
                    onClick={() => setOpenNotif(false)}
                    className="block text-center text-[11px] font-bold text-[#6B1224] hover:underline no-underline"
                  >
                    Lihat semua tugas →
                  </Link>
                </div>
              </div>
            )}
          </div>

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
