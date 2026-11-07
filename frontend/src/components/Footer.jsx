import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#F9E8EC] bg-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#6B1224] text-white flex items-center justify-center font-bold text-xs">
            SP
          </div>
          <div>
            <span className="font-bold text-sm text-[#6B1224] font-['Syne',sans-serif]">
              SorotPaham
            </span>
            <p className="text-xs text-[#6C6267] m-0">
              Tutor AI Socratic Adaptif dengan Highlight Materi & Heatmap Kelas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#6C6267]">
          <a href="#perbandingan" className="hover:text-[#6B1224] no-underline">Sebelum vs Sesudah</a>
          <a href="#cara-kerja" className="hover:text-[#6B1224] no-underline">Cara Kerja</a>
          <a href="#simulasi" className="hover:text-[#6B1224] no-underline">Simulasi Tutor</a>
          <a href="#faq" className="hover:text-[#6B1224] no-underline">FAQ</a>
          <Link to="/login" className="font-semibold text-[#6B1224] no-underline">Sign In / Masuk</Link>
        </div>

        <div className="text-xs text-[#6C6267]">
          FIRETECH 2026 · Sub-tema Pendidikan & Literasi Digital
        </div>
      </div>
    </footer>
  );
}

