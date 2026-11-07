import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-[#F9E8EC] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#80142A] to-[#6B1224] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
            SP
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#6B1224] font-['Syne',sans-serif] leading-tight">
              SorotPaham
            </span>
            <span className="text-[10px] text-[#6C6267] font-semibold tracking-wider uppercase">
              Socratic AI Tutor
            </span>
          </div>
        </Link>

        {/* Navigation Links — Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FBF7F4] px-3 py-1.5 rounded-full border border-[#F9E8EC]">
          <a
            href="#perbandingan"
            className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors no-underline"
          >
            Sebelum vs Sesudah
          </a>
          <a
            href="#cara-kerja"
            className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors no-underline"
          >
            Cara Kerja
          </a>
          <a
            href="#simulasi"
            className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors no-underline"
          >
            Simulasi
          </a>
          <a
            href="#peran"
            className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors no-underline"
          >
            Untuk Siapa
          </a>
          <a
            href="#faq"
            className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors no-underline"
          >
            FAQ
          </a>
        </nav>

        {/* Actions Group */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/app"
                className="text-xs font-bold px-4 py-2 rounded-full text-white bg-[#6B1224] hover:bg-[#80142A] transition-all no-underline shadow-sm flex items-center gap-1.5"
              >
                <span>Kelas Saya ({user.name.split(' ')[0]})</span>
                <span>→</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold px-3 py-2 rounded-full border border-[#E5D5D8] text-[#6B1224] hover:bg-[#F9E8EC] transition-all cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Button Sign In di navbar */}
              <Link
                to="/login"
                className="text-xs font-bold px-4 py-2 rounded-full border border-[#6B1224]/30 text-[#6B1224] bg-white hover:bg-[#F9E8EC] transition-all no-underline inline-flex items-center shadow-xs"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="text-xs font-bold px-4 py-2 rounded-full text-white bg-[#6B1224] hover:bg-[#80142A] transition-all shadow-sm hover:shadow-md no-underline inline-flex items-center gap-1"
              >
                <span>Daftar Gratis</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

