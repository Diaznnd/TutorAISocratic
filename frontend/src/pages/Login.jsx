import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

/* ─── Wordmark lockup (sama seperti pada referensi desain) ─── */
function Wordmark() {
  return (
    <span className="text-[13px] font-bold tracking-[0.09em] text-[#6B1224] whitespace-nowrap">
      Sorot Paham
    </span>
  );
}

/* ─── Google "G" mark ─── */
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

/* ─── Eye icon untuk toggle kata sandi ─── */
function EyeIcon({ open }) {
  return open ? (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ─── Panel kiri: aset taktil 3D SorotPaham ─── */
const HERO_SOURCES = ['/login-hero.png', '/login-hero.jpg', '/tactile-art.png'];
const ART_ALT = 'Ilustrasi taktil SorotPaham: gumpalan maroon licin, kubus stiker, dan pom-pom';

function ArtworkPanel() {
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = HERO_SOURCES[sourceIndex];
  // Aset utama (portrait) mengisi panel; aset cadangan tampil sebagai komposisi lembut.
  const isFallback = sourceIndex === HERO_SOURCES.length - 1;

  return (
    <div className="relative h-full min-h-[560px] w-full overflow-hidden rounded-[22px] bg-[#EDE8E9] animate-[authArtIn_0.6s_ease-out_both]">
      {isFallback ? (
        <>
          <img
            src={source}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
            draggable="false"
          />
          <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
            <img
              src={source}
              alt={ART_ALT}
              className="w-full rounded-2xl shadow-[0_22px_50px_-22px_rgba(107,18,36,0.55)]"
              draggable="false"
            />
          </div>
        </>
      ) : (
        <img
          src={source}
          alt={ART_ALT}
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          draggable="false"
          decoding="async"
          onError={() => setSourceIndex((i) => (i < HERO_SOURCES.length - 1 ? i + 1 : i))}
        />
      )}
      {/* Ring tipis agar foto menyatu dengan kartu */}
      <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-[#6B1224]/8" />
    </div>
  );
}

/* ─── Header kecil: link kembali + wordmark terpusat ─── */
function AuthTopBar({ to = '/', label = 'Beranda', backSlot }) {
  return (
    <div className="relative mb-8 flex items-center justify-center">
      {backSlot ?? (
        <Link
          to={to}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#A2969A] no-underline transition-colors hover:text-[#6B1224]"
        >
          ← {label}
        </Link>
      )}
      <Wordmark />
    </div>
  );
}

/* ─── Field bergaya garis bawah (underline) sesuai referensi ─── */
function Field({ id, label, trailing, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12.5px] font-medium text-[#7C6B70]">
        {label}
      </label>
      <div className="relative mt-1.5 flex items-center border-b border-[#D8CFD2] transition-colors focus-within:border-[#6B1224]">
        <input
          id={id}
          {...inputProps}
          className="w-full bg-transparent pb-2.5 pr-8 text-[14.5px] text-[#1E1C1E] outline-none placeholder:text-[#B4A8AC]"
        />
        {trailing ? (
          <div className="absolute bottom-2.5 right-0 flex items-center">{trailing}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Screen 1: Pilih peran ─── */
function RoleSelect({ onSelect }) {
  const roles = [
    {
      key: 'mahasiswa',
      emoji: '🎓',
      title: 'Pelajar / Mahasiswa',
      desc: 'Sorot teks materi yang membingungkan, lalu dapatkan bimbingan Sokrates tanpa jawaban instan.',
      badge: 'Akses Siswa',
    },
    {
      key: 'dosen',
      emoji: '📋',
      title: 'Guru / Dosen',
      desc: 'Buat kelas, unggah bahan ajar, dan baca heatmap materi yang paling menyulitkan siswa.',
      badge: 'Akses Pendidik',
    },
  ];

  return (
    <div className="flex w-full flex-col animate-[authIn_0.45s_ease-out_both]">
      <AuthTopBar />

      <div className="text-center">
        <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-[29px] font-extrabold leading-[1.15] tracking-tight text-[#6B1224]">
          Pilih Peranmu
        </h1>
        <p className="mx-auto mt-2 max-w-[275px] text-[12.5px] leading-relaxed text-[#8A7C81]">
          Satu akun, dua pengalaman. Tentukan dulu kamu masuk sebagai siapa.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {roles.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onSelect(r.key)}
            className="group flex w-full items-center gap-3.5 rounded-2xl border border-[#EDE6E8] bg-[#FBF8F9] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#6B1224]/30 hover:bg-white hover:shadow-[0_16px_34px_-24px_rgba(107,18,36,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1224] cursor-pointer"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[19px] shadow-[0_2px_6px_rgba(107,18,36,0.08)]">
              {r.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 flex items-center gap-2">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[13.5px] font-extrabold text-[#6B1224]">
                  {r.title}
                </span>
                <span className="rounded-full bg-[#F9E8EC] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6B1224]">
                  {r.badge}
                </span>
              </span>
              <span className="block text-[11.5px] leading-relaxed text-[#8A7C81]">{r.desc}</span>
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-[#6B1224] opacity-30 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-[11.5px] leading-relaxed text-[#A2969A]">
        Belum punya akun? Pilih peran di atas untuk langsung mendaftar.
      </p>
    </div>
  );
}


/* ─── Screen 2: Form login / daftar ─── */
function AuthForm({ role, onBack }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState(() => ({
    name: '',
    email: localStorage.getItem('rememberedEmail') || '',
    password: '',
  }));

  const isStudent = role === 'mahasiswa';
  const roleLabel = isStudent ? 'Pelajar / Mahasiswa' : 'Guru / Dosen';
  const roleEmoji = isStudent ? '🎓' : '📋';

  const setVal = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      if (mode === 'login') {
        await login(email, form.password);
        if (remember) localStorage.setItem('rememberedEmail', email);
        else localStorage.removeItem('rememberedEmail');
      } else {
        if (form.password.length < 8) {
          setErr('Kata sandi minimal 8 karakter');
          setLoading(false);
          return;
        }
        if (!form.name.trim()) {
          setErr('Nama lengkap tidak boleh kosong');
          setLoading(false);
          return;
        }
        await register({ name: form.name.trim(), email, password: form.password, role });
      }
      navigate('/app');
    } catch (e2) {
      setErr(e2.message || 'Gagal masuk. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    if (isStudent) {
      setForm({ name: 'Mahasiswa Demo', email: 'mahasiswa@sorotpaham.id', password: 'password123' });
    } else {
      setForm({ name: 'Dosen Demo', email: 'dosen@sorotpaham.id', password: 'password123' });
    }
    setErr('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErr('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col animate-[authIn_0.45s_ease-out_both]">
      <AuthTopBar
        backSlot={
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-1 text-[11px] font-medium text-[#A2969A] transition-colors hover:text-[#6B1224]"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Ganti peran
          </button>
        }
      />

      {/* Judul */}
      <div className="text-center">
        <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] font-extrabold leading-[1.12] tracking-tight text-[#6B1224]">
          {mode === 'login' ? 'Welcome Back!' : 'Buat Akun Baru'}
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[#8A7C81]">
          {mode === 'login' ? 'Enter Your Details Below' : 'Isi detail dirimu untuk mulai belajar'}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F7EFF1] px-3 py-1 text-[11px] font-semibold text-[#6B1224]">
          <span aria-hidden="true">{roleEmoji}</span>
          {roleLabel}
        </span>
      </div>

      {/* Pesan galat */}
      {err && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-[#F3D3D8] bg-[#FDF2F4] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#9B1B32]"
        >
          {err}
        </div>
      )}

      {/* Field */}
      <div className="mt-6 flex flex-col gap-4">
        {mode === 'register' && (
          <Field
            id="name"
            label="Nama Lengkap"
            type="text"
            value={form.name}
            onChange={setVal('name')}
            placeholder="Alex Wicaksono"
            autoComplete="name"
            required
            maxLength={100}
          />
        )}

        <Field
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={setVal('email')}
          placeholder="hello.alex@gmail.com"
          autoComplete="email"
          required
          maxLength={100}
        />

        <Field
          id="password"
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={setVal('password')}
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'register' ? 8 : 1}
          maxLength={100}
          trailing={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="cursor-pointer text-[#A2969A] transition-colors hover:text-[#6B1224]"
            >
              <EyeIcon open={showPw} />
            </button>
          }
        />
      </div>

      {/* Remember me & lupa sandi */}
      {mode === 'login' && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2">
            <span className="relative grid h-[15px] w-[15px] place-items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[4px] border border-[#C9BFC2] bg-white transition-colors checked:border-[#6B1224] checked:bg-[#6B1224]"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none relative h-[9px] w-[9px] text-white opacity-0 transition-opacity peer-checked:opacity-100"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-[12px] text-[#7C6B70]">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => alert('Fitur reset sandi: silakan hubungi admin pengajar kelas Anda.')}
            className="cursor-pointer text-[12px] text-[#A2969A] transition-colors hover:text-[#6B1224]"
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Tombol aksi */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full cursor-pointer rounded-full bg-[#6B1224] text-[13.5px] font-semibold text-white transition-all hover:bg-[#80142A] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Memproses...' : mode === 'login' ? 'Log in' : 'Buat Akun'}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={autofillDemo}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#F4F0F1] text-[13px] font-semibold text-[#2B2427] transition-colors hover:bg-[#EDE7E9]"
          >
            <GoogleMark />
            <span>Log in with Google</span>
            <span className="text-[10px] font-medium text-[#A2969A]">demo</span>
          </button>
        )}
      </div>

      {/* Ganti mode */}
      <p className="mt-6 text-center text-[12px] text-[#8A7C81]">
        {mode === 'login' ? "Don't have an account? " : 'Sudah punya akun? '}
        <button
          type="button"
          onClick={switchMode}
          className="cursor-pointer font-bold text-[#6B1224] hover:underline"
        >
          {mode === 'login' ? 'Sign Up' : 'Log in'}
        </button>
      </p>
    </form>
  );
}

/* ─── Halaman utama login: kartu terbelah (artwork + form) ─── */
export default function Login() {
  const [role, setRole] = useState(null);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F4F1F2] p-3 font-['Plus_Jakarta_Sans',sans-serif] sm:p-6 lg:p-8">
      <div className="flex w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-[#EAE3E5] bg-[#FDFCFC] shadow-[0_30px_80px_-48px_rgba(107,18,36,0.55)]">
        {/* Kiri: aset taktil (desktop saja) */}
        <div className="hidden w-[44%] shrink-0 p-3 md:block">
          <ArtworkPanel />
        </div>

        {/* Kanan: pilih peran / form */}
        <div className="flex min-w-0 flex-1 items-center justify-center px-6 py-12 sm:px-10 md:py-16 lg:px-16">
          <div key={role ?? 'role'} className="w-full max-w-[360px]">
            {role === null ? (
              <RoleSelect onSelect={setRole} />
            ) : (
              <AuthForm role={role} onBack={() => setRole(null)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

