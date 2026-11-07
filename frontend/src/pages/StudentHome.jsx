import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { readMaterialIds } from '../progress';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import { CourseThumb, HeroArt } from '../components/student/StudentArt.jsx';
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayersIcon,
  SparkleIcon,
} from '../components/student/Icons.jsx';

/* Warna batang progres: ungu, hijau, maroon — bergantian seperti referensi. */
const PROGRESS_COLORS = ['#4F46E5', '#16A34A', '#6B1224'];

/* Dashboard pelajar: sapaan, kelas yang baru diikuti, dan kelas aktif. */
export default function StudentHome() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('beranda');
  const [readIds, setReadIds] = useState(() => readMaterialIds());
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinErr, setJoinErr] = useState('');

  const load = useCallback(
    () =>
      api('/classes')
        .then((rows) => {
          setClasses(Array.isArray(rows) ? rows : []);
          setErr('');
        })
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    load();
    setReadIds(readMaterialIds());
  }, [load]);

  /* Kelas + hitungan progres baca modul */
  const courses = useMemo(
    () =>
      classes.map((c) => {
        const materials = c.materials || [];
        const total = materials.length;
        const read = materials.filter((m) => readIds.has(String(m.id))).length;
        return { ...c, materials, total, read, pct: total === 0 ? 0 : Math.round((read / total) * 100) };
      }),
    [classes, readIds]
  );

  const newest = useMemo(() => [...courses].sort((a, b) => b.id - a.id), [courses]);
  const active = useMemo(
    () => [...courses].sort((a, b) => b.pct - a.pct || b.total - a.total || b.id - a.id),
    [courses]
  );
  const maxTotal = Math.max(0, ...courses.map((c) => c.total));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.materials.some((m) => (m.title || '').toLowerCase().includes(q))
    );
  }, [courses, query]);

  /* Modul berikutnya yang belum dibuka, untuk tombol "Lanjutkan Belajar" */
  const continueTo = useMemo(() => {
    for (const c of active) {
      const next = c.materials.find((m) => !readIds.has(String(m.id)));
      if (next) return next;
    }
    for (const c of courses) {
      if (c.materials[0]) return c.materials[0];
    }
    return null;
  }, [active, courses, readIds]);

  const totalRead = courses.reduce((n, c) => n + c.read, 0);
  const totalModules = courses.reduce((n, c) => n + c.total, 0);

  const goTo = (key) => {
    setSection(key);
    const target = key === 'kelas' ? 'kelas-aktif' : 'dashboard-atas';
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openJoin = () => {
    setJoinErr('');
    setJoinOpen(true);
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    setJoinBusy(true);
    setJoinErr('');
    try {
      await api('/classes/join', { method: 'POST', body: { code } });
      setJoinCode('');
      setJoinOpen(false);
      setLoading(true);
      await load();
    } catch (e2) {
      setJoinErr(e2.message);
    } finally {
      setJoinBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        <StudentSidebar activeSection={section} onNavigate={goTo} onJoin={openJoin} />

        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopbar query={query} onQueryChange={setQuery} />

          {/* Navigasi ringkas untuk layar kecil */}
          <div className="flex items-center gap-2 border-b border-[#F1EEF4] px-4 py-3 lg:hidden">
            <div className="flex items-center gap-1 rounded-full bg-[#F5F4F7] p-1">
              {[
                { key: 'beranda', label: 'Beranda' },
                { key: 'kelas', label: 'Kelas Saya' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => goTo(t.key)}
                  className={[
                    'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer',
                    section === t.key ? 'bg-[#6B1224] text-white' : 'text-[#8B8391]',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openJoin}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#6B1224] px-3.5 py-2 text-[11px] font-bold text-white cursor-pointer"
            >
              <span className="text-sm leading-none">+</span> Gabung Kelas
            </button>
          </div>

          <main id="dashboard-atas" className="flex-1 px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pt-7">
            {err && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-[#F3D7DD] bg-[#FDF2F4] px-4 py-3 text-xs font-semibold text-[#96263C]"
              >
                {err}
              </div>
            )}

            <HeroBlock
              user={user}
              continueTo={continueTo}
              totalRead={totalRead}
              totalModules={totalModules}
              onJoin={openJoin}
            />

            {loading ? (
              <LoadingBlock />
            ) : filtered ? (
              <SearchResults items={filtered} query={query} />
            ) : courses.length === 0 ? (
              <EmptyState onJoin={openJoin} />
            ) : (
              <>
                <CarouselSection
                  id="kelas-baru"
                  title="Kelas yang baru diikuti"
                  count={`${newest.length} kelas`}
                >
                  {newest.map((c, i) => (
                    <CourseCard
                      key={c.id}
                      course={c}
                      index={i}
                      highlight={maxTotal > 0 && c.total === maxTotal}
                    />
                  ))}
                </CarouselSection>

                <CarouselSection
                  id="kelas-aktif"
                  title="Kelas Aktif Kamu"
                  count={`${totalRead}/${totalModules} modul dibaca`}
                  className="mt-9"
                >
                  {active.map((c, i) => (
                    <ActiveCard key={c.id} course={c} index={i} />
                  ))}
                </CarouselSection>
              </>
            )}
          </main>
        </div>
      </div>

      {joinOpen && (
        <JoinDialog
          code={joinCode}
          onCodeChange={setJoinCode}
          onSubmit={submitJoin}
          onClose={() => setJoinOpen(false)}
          busy={joinBusy}
          error={joinErr}
        />
      )}
    </div>
  );
}

/* ─── Hero sapaan ─── */
function HeroBlock({ user, continueTo, totalRead, totalModules, onJoin }) {
  const cta =
    'group mt-6 inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-[13px] font-bold text-[#6B1224] shadow-[0_16px_30px_-20px_rgba(107,18,36,0.6)] ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_34px_-20px_rgba(107,18,36,0.65)] cursor-pointer';

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#F0E7EE] bg-[linear-gradient(112deg,#F3F2FA_0%,#F7F4F9_44%,#FBEBF1_100%)] px-6 py-8 animate-[authIn_0.45s_ease-out_both] sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
      <div className="relative z-10 flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B7E88]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D05A6E]" />
            Selamat datang kembali
          </span>
          <h1 className="mt-3 text-[24px] font-extrabold leading-[1.15] tracking-tight text-[#6B1224] sm:text-[31px]">
            Halo, {user?.name}!
          </h1>
          <p className="mt-2.5 max-w-[350px] text-[13px] leading-relaxed text-[#5B525C] sm:text-sm">
            Senang melihatmu kembali. Lanjutkan progres materi desain &amp; pemrograman interaktifmu hari ini.
          </p>

          {continueTo ? (
            <Link to={`/materi/${continueTo.id}`} className={cta}>
              <span>Lanjutkan Belajar</span>
              <ArrowRightIcon size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <button type="button" onClick={onJoin} className={cta}>
              <span>Gabung Kelas</span>
              <ArrowRightIcon size={17} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          {totalModules > 0 && (
            <p className="mt-3 text-[11px] font-semibold text-[#8B7E88]">
              {totalRead} dari {totalModules} modul sudah kamu baca
            </p>
          )}
        </div>

        <div className="relative hidden w-[235px] shrink-0 sm:block xl:w-[275px]">
          <HeroArt className="h-[165px] w-full xl:h-[185px]" />
          <span className="absolute -bottom-2 left-1 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#6B1224] shadow-[0_10px_22px_-14px_rgba(30,28,30,0.5)]">
            <SparkleIcon size={13} className="text-[#D05A6E]" />
            Level Pro 4
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── Bagian carousel dengan tombol panah ─── */
function CarouselSection({ id, title, count, className = '', children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-[#EDE9F0] bg-white text-[#8B8391] transition hover:border-[#E5D5D8] hover:text-[#6B1224] cursor-pointer';

  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-tight text-[#1E1C1E] sm:text-[19px]">{title}</h2>
          {count && <p className="mt-0.5 text-[11px] font-semibold text-[#A79FAB]">{count}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label="Geser ke kiri" className={btn}>
            <ChevronLeftIcon size={16} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Geser ke kanan" className={btn}>
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <div ref={ref} className="sp-no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}

/* ─── Kartu kelas (bagian "Kelas yang baru diikuti") ─── */
function CourseCard({ course, index, highlight }) {
  const first = course.materials[0];
  const description =
    course.materials
      .slice(0, 2)
      .map((m) => m.title)
      .join(' · ') || 'Modul akan tampil di sini setelah dosen menerbitkan materi pertama.';

  return (
    <article className="group relative flex shrink-0 basis-[290px] snap-start flex-col overflow-hidden rounded-[22px] border border-[#F0EDF2] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_42px_-32px_rgba(30,28,30,0.55)] sm:basis-[340px] xl:basis-[calc((100%-1rem)/2)]">
      <div className="relative m-3 mb-0">
        <CourseThumb variant={index} className="h-[150px] rounded-2xl" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wide text-[#3A3340] shadow-sm">
          {highlight ? 'Terpopuler' : 'Kelas Baru'}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#938B99]">
          <span className="inline-flex items-center gap-1.5">
            <LayersIcon size={13} /> Kode {course.code}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#6B1224]">
            <BookIcon size={13} /> {course.total} Materi
          </span>
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-[15px] font-extrabold tracking-tight text-[#1E1C1E]">
          {course.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#8B8391]">{description}</p>

        <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6B1224]">
          {first ? 'Buka kelas' : 'Menunggu materi dosen'}
          {first && <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />}
        </span>
      </div>

      {first && (
        <Link
          to={`/kelas/${course.id}`}
          className="absolute inset-0 z-10 rounded-[22px]"
          aria-label={`Buka kelas ${course.name}`}
        />
      )}
    </article>
  );
}

/* ─── Kartu kelas aktif dengan progres baca ─── */
function ActiveCard({ course, index }) {
  const color = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
  const done = course.total > 0 && course.read === course.total;

  return (
    <article className="group relative flex shrink-0 basis-[275px] snap-start flex-col overflow-hidden rounded-[22px] border border-[#F0EDF2] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_42px_-32px_rgba(30,28,30,0.55)] sm:basis-[310px] lg:basis-[calc((100%-2rem)/3)]">
      <div className="relative m-3 mb-0">
        <CourseThumb variant={index + 1} className="h-[128px] rounded-2xl" imgClass="w-[54%]" />
        <span
          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: done ? '#16A34A' : 'rgba(30,28,30,0.82)' }}
        >
          {done ? (
            <>
              <CheckIcon size={11} /> Selesai
            </>
          ) : course.total === 0 ? (
            'Menunggu modul'
          ) : (
            `Modul ${String(course.read).padStart(2, '0')}/${String(course.total).padStart(2, '0')}`
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3.5">
        <h3 className="line-clamp-1 text-[14px] font-extrabold tracking-tight text-[#1E1C1E]">
          {course.name}
        </h3>

        <div className="mt-auto pt-3.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-[#A79FAB]">Progres Belajar</span>
            <span style={{ color }}>{course.pct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EFECF2]">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${course.pct}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>

      {course.materials[0] && (
        <Link
          to={`/kelas/${course.id}`}
          className="absolute inset-0 z-10 rounded-[22px]"
          aria-label={`Lanjutkan kelas ${course.name}`}
        />
      )}
    </article>
  );
}

/* ─── Hasil pencarian ─── */
function SearchResults({ items, query }) {
  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-[22px] border border-[#F0EDF2] bg-white px-6 py-12 text-center">
        <p className="text-sm font-bold text-[#1E1C1E]">Tidak ada hasil untuk “{query}”</p>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[#8B8391]">
          Coba kata kunci lain, atau periksa ejaan nama kelas dan judul materinya.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-7">
      <h2 className="mb-4 text-[17px] font-extrabold tracking-tight text-[#1E1C1E] sm:text-[19px]">
        Hasil pencarian “{query}”
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => (
          <ActiveCard key={c.id} course={c} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ─── Kondisi memuat ─── */
function LoadingBlock() {
  return (
    <div className="mt-7 space-y-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 animate-pulse rounded-full bg-[#F1EEF3]" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-[#F1EEF3]" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[0, 1].map((k) => (
          <div
            key={k}
            className="h-[268px] flex-1 animate-pulse rounded-[22px] border border-[#F0EDF2] bg-[#FAF9FB]"
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Belum punya kelas ─── */
function EmptyState({ onJoin }) {
  return (
    <div className="mt-7 rounded-[26px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224]">
        <BookIcon size={24} />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-[#1E1C1E]">Belum ada kelas yang kamu ikuti</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[#8B8391]">
        Minta kode kelas 6 karakter kepada dosenmu, lalu gabung untuk mulai membaca materi interaktif.
      </p>
      <button
        type="button"
        onClick={onJoin}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#6B1224] px-5 py-3 text-[13px] font-bold text-white shadow-[0_16px_30px_-20px_rgba(107,18,36,0.8)] transition hover:bg-[#80142A] cursor-pointer"
      >
        <span className="text-base leading-none">+</span> Gabung Kelas
      </button>
    </div>
  );
}

/* ─── Dialog gabung kelas ─── */
function JoinDialog({ code, onCodeChange, onSubmit, onClose, busy, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E1C1E]/40 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-title"
        className="w-full max-w-md rounded-[24px] border border-[#F0EDF2] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(30,28,30,0.6)] animate-[authIn_0.25s_ease-out_both]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="join-title" className="text-[17px] font-extrabold tracking-tight text-[#1E1C1E]">
              Gabung ke kelas
            </h2>
            <p className="mt-1 text-xs text-[#8B8391]">Masukkan kode kelas yang diberikan dosenmu.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#A79FAB] transition hover:bg-[#F5F4F7] hover:text-[#6B1224] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5">
          <label htmlFor="join-code" className="text-[11px] font-bold uppercase tracking-wide text-[#938B99]">
            Kode kelas
          </label>
          <input
            id="join-code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={12}
            autoFocus
            placeholder="Contoh: A1B2C3"
            className="mt-2 w-full rounded-2xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-3 text-center font-mono text-base font-bold tracking-[0.3em] text-[#6B1224] uppercase outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-[#B3ABB8] focus:border-[#6B1224] focus:bg-white"
          />

          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-[#FDF2F4] px-3 py-2 text-[11px] font-semibold text-[#96263C]">
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={busy || code.trim().length < 4}
              className="flex-1 rounded-2xl bg-[#6B1224] px-4 py-3 text-[13px] font-bold text-white transition hover:bg-[#80142A] disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
            >
              {busy ? 'Menghubungkan...' : 'Gabung Kelas'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[#E7E1EA] px-4 py-3 text-[13px] font-bold text-[#8B8391] transition hover:bg-[#FBF7F4] cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

