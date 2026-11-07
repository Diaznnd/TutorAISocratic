import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

/* ─── 3D Tactile Illustration Panel (Pure SVG & Tailwind) ─── */
function TactileArt() {
  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#FBF7F4] via-[#F4D4DC] to-[#DDA8B8] flex items-center justify-center select-none">
      {/* Center Deep Maroon Liquid Splash */}
      <svg
        className="absolute w-[56%] top-[16%] left-[22%] filter drop-shadow-[0_20px_35px_rgba(107,18,36,0.38)]"
        viewBox="0 0 200 230"
      >
        <defs>
          <radialGradient id="splashGrad" cx="38%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#A01830" />
            <stop offset="60%" stopColor="#6B1224" />
            <stop offset="100%" stopColor="#3D0912" />
          </radialGradient>
        </defs>
        <path
          d="M100 18C142 18,172 50,167 88C163 110,148 116,156 136C167 163,151 198,119 203C93 208,67 191,56 169C43 143,51 116,37 97C22 76,30 42,62 27C76 21,89 18,100 18Z"
          fill="url(#splashGrad)"
        />
      </svg>

      {/* Floating 3D Cubes */}
      <div className="absolute top-[9%] left-[7%] w-14 h-14 rounded-xl bg-gradient-to-br from-[#F4A5B8] to-[#D05A6E] flex items-center justify-center text-xl text-white font-extrabold -rotate-12 shadow-[4px_8px_20px_rgba(208,90,110,0.4)]">
        @
      </div>

      <div className="absolute top-[48%] left-[7%] w-13 h-13 rounded-xl bg-gradient-to-br from-[#D9C090] to-[#B8945A] flex items-center justify-center text-xl rotate-12 shadow-[4px_6px_18px_rgba(184,148,90,0.4)]">
        🌐
      </div>

      <div className="absolute bottom-[18%] left-[11%] w-14 h-14 rounded-xl bg-gradient-to-br from-[#80142A] to-[#3D0912] flex items-center justify-center text-[#F9E8EC] font-bold text-xs tracking-wider -rotate-6 shadow-[4px_8px_20px_rgba(107,18,36,0.5)]">
        play
      </div>

      <div className="absolute bottom-[9%] left-[2%] w-10 h-10 rounded-lg bg-gradient-to-br from-[#FACDD8] to-[#F0A0B8] flex items-center justify-center text-sm font-bold text-[#6B1224] rotate-12 shadow-sm">
        %
      </div>

      <div className="absolute top-[7%] right-[9%] w-11 h-11 rounded-xl bg-gradient-to-br from-[#FACDD8] to-[#E890A8] flex items-center justify-center text-base font-bold text-[#6B1224] rotate-12 shadow-sm">
        @
      </div>

      {/* Pom-pom balls */}
      <div className="absolute w-18 h-18 bottom-[22%] right-[6%] rounded-full bg-[radial-gradient(circle_at_32%_30%,#8B2040,#3A0912)] opacity-95 shadow-[inset_-6px_-6px_14px_rgba(0,0,0,0.35)]" />
      <div className="absolute w-13 h-13 bottom-[10%] right-[20%] rounded-full bg-[radial-gradient(circle_at_32%_30%,#8B2040,#3A0912)] opacity-80 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.35)]" />

      {/* Cone */}
      <svg className="absolute bottom-[10%] left-[38%] filter drop-shadow-[2px_4px_6px_rgba(0,0,0,0.25)]" width="28" height="36" viewBox="0 0 28 36">
        <defs>
          <linearGradient id="coneG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D05A6E" />
            <stop offset="100%" stopColor="#6B1224" />
          </linearGradient>
        </defs>
        <polygon points="14,0 28,36 0,36" fill="url(#coneG)" />
      </svg>

      {/* Smiley cube */}
      <div className="absolute bottom-[18%] left-[34%] w-11 h-11 rounded-xl bg-gradient-to-br from-[#80142A] to-[#55101E] flex items-center justify-center text-lg -rotate-8 shadow-[3px_6px_16px_rgba(107,18,36,0.45)]">
        🙂
      </div>

      {/* Watermark */}
      <div className="absolute bottom-3 inset-x-0 text-center text-[10px] font-extrabold text-[#6B1224]/40 tracking-widest">
        SOROT PAHAM
      </div>
    </div>
  );
}

/* ─── Eye Icon for Password ─── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ─── Screen 1: Role Selection ─── */
function RoleSelect({ onSelect }) {
  const roles = [
    {
      key: 'mahasiswa',
      title: 'Sign In sebagai Pelajar / Mahasiswa',
      emoji: '🎓',
      desc: 'Sorot teks materi yang membingungkan dan dapatkan bimbingan Sokrates adaptif tanpa jawaban langsung.',
      badge: 'Akses Siswa',
    },
    {
      key: 'dosen',
      title: 'Sign In sebagai Guru / Dosen',
      emoji: '📋',
      desc: 'Buat kelas, unggah bahan ajar, dan pantau heatmap materi untuk melihat bagian mana yang menyulitkan siswa.',
      badge: 'Akses Pendidik',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-[#6B1224] text-white flex items-center justify-center font-extrabold text-xs">
            SP
          </div>
          <span className="font-extrabold text-base text-[#6B1224] font-['Syne',sans-serif]">
            SorotPaham
          </span>
        </Link>
        <Link to="/" className="text-xs font-semibold text-[#6B1224]/70 hover:text-[#6B1224] no-underline flex items-center gap-1">
          ← Kembali ke Beranda
        </Link>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#6B1224] font-['Syne',sans-serif] mb-1">
          Sign In ke Akunmu
        </h2>
        <p className="text-xs sm:text-sm text-[#6C6267]">
          Pilih salah satu peran di bawah untuk melanjutkan:
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => onSelect(r.key)}
            className="flex items-center gap-4 w-full text-left p-4.5 rounded-2xl bg-[#FBF7F4] border-2 border-transparent hover:border-[#6B1224] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-xl bg-white flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
              {r.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm sm:text-base text-[#6B1224] font-['Syne',sans-serif]">
                  {r.title}
                </span>
                <span className="text-[10px] font-bold bg-[#F9E8EC] text-[#6B1224] px-2 py-0.5 rounded-full">
                  {r.badge}
                </span>
              </div>
              <p className="text-xs text-[#6C6267] leading-relaxed m-0">
                {r.desc}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B1224] opacity-50 group-hover:opacity-100 flex-shrink-0 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-[#6C6267] mt-6 mb-0">
        Belum punya akun? Pilih salah satu peran di atas untuk langsung mendaftar.
      </p>
    </div>
  );
}

/* ─── Screen 2: Sign In / Sign Up Form ─── */
function AuthForm({ role, onBack }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6B1224] text-white flex items-center justify-center font-bold text-xs">
            SP
          </div>
          <span className="font-extrabold text-sm text-[#6B1224] font-['Syne',sans-serif]">
            SorotPaham
          </span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#6B1224]/70 hover:text-[#6B1224] flex items-center gap-1 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ganti Peran
        </button>
      </div>

      {/* Role Pill */}
      <div className="inline-flex items-center gap-1.5 bg-[#F9E8EC] text-[#6B1224] px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">
        <span>{roleEmoji}</span>
        <span>Masuk sebagai: {roleLabel}</span>
      </div>

      {/* Headings */}
      <div className="mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#6B1224] font-['Syne',sans-serif] mb-1">
          {mode === 'login' ? 'Welcome Back!' : 'Buat Akun Baru'}
        </h2>
        <p className="text-xs sm:text-sm text-[#6C6267] m-0">
          {mode === 'login' ? 'Enter Your Details Below' : 'Isi formulir untuk mulai menggunakan sistem'}
        </p>
      </div>

      {/* Name Input (Register Only) */}
      {mode === 'register' && (
        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-[#6B1224] mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={form.name}
            onChange={setVal('name')}
            placeholder="Alex Wicaksono"
            required
            maxLength={100}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] bg-white transition-colors"
          />
        </div>
      )}

      {/* Email */}
      <div className="mb-3.5">
        <label className="block text-xs font-semibold text-[#6B1224] mb-1">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={setVal('email')}
          placeholder="hello.alex@gmail.com"
          required
          maxLength={100}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] bg-white transition-colors"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#6B1224] mb-1">
          Kata Sandi
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={setVal('password')}
            placeholder="••••••••"
            required
            minLength={mode === 'register' ? 8 : 1}
            maxLength={100}
            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] bg-white transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6267] hover:text-[#6B1224] cursor-pointer"
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
      </div>

      {/* Remember me & Forgot Password */}
      {mode === 'login' && (
        <div className="flex items-center justify-between text-xs text-[#6C6267] mb-5">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-[#6B1224] rounded cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => alert('Fitur reset sandi: silakan hubungi admin pengajar kelas Anda.')}
            className="text-xs text-[#6C6267] hover:text-[#6B1224] cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Error Banner */}
      {err && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-4 border border-red-200">
          {err}
        </div>
      )}

      {/* Primary Log in Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full text-white text-sm font-bold bg-[#6B1224] hover:bg-[#80142A] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer mb-2.5"
      >
        {loading ? 'Memproses...' : mode === 'login' ? 'Log in' : 'Daftar Akun'}
      </button>

      {/* Google Login Demo Auto-fill */}
      {mode === 'login' && (
        <button
          type="button"
          onClick={() => {
            if (role === 'mahasiswa') {
              setForm({ name: 'Mahasiswa Demo', email: 'mahasiswa@sorotpaham.id', password: 'password123' });
            } else {
              setForm({ name: 'Dosen Demo', email: 'dosen@sorotpaham.id', password: 'password123' });
            }
          }}
          className="w-full py-2.5 rounded-full border border-[#E5D5D8] bg-[#FBF7F4] hover:bg-[#F9E8EC] text-xs font-semibold text-[#1E1C1E] flex items-center justify-center gap-2 cursor-pointer transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Log in with Google (Auto-fill Demo)</span>
        </button>
      )}

      {/* Switch Mode */}
      <div className="text-center text-xs text-[#6C6267]">
        <span>{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}</span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setErr('');
          }}
          className="font-bold text-[#6B1224] hover:underline cursor-pointer ml-1"
        >
          {mode === 'login' ? 'Sign Up' : 'Log in'}
        </button>
      </div>
    </form>
  );
}

/* ─── Main Login Page Component ─── */
export default function Login() {
  const [role, setRole] = useState(null);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Split Card */}
      <div className="flex flex-row w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-[#F9E8EC] overflow-hidden min-h-[560px]">
        {/* Left Side: 3D Art (Desktop only) */}
        <div className="hidden md:block w-[44%] p-4 flex-shrink-0">
          <TactileArt />
        </div>

        {/* Right Side: Form / Role Selector */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 min-w-0">
          {role === null ? (
            <RoleSelect onSelect={setRole} />
          ) : (
            <AuthForm role={role} onBack={() => setRole(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
