import { Link } from 'react-router-dom';

export default function CtaBanner() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#80142A] via-[#6B1224] to-[#4A0A18] text-white p-8 sm:p-14 text-center shadow-xl relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#D05A6E]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F9E8EC] bg-white/10 px-3.5 py-1.5 rounded-full inline-block mb-4">
            Mulai Belajar Cerdas
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif] mb-4 leading-tight">
            Ubah Cara Belajarmu dari Sekadar Menghafal Menjadi Memahami
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8">
            Daftarkan kelasmu sekarang atau coba materi demo langsung untuk merasakan pengalaman bimbingan Sokrates yang sesungguhnya.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-full bg-white text-[#6B1224] hover:bg-[#F9E8EC] transition-all no-underline shadow-md"
            >
              <span>Daftar / Sign In Sekarang</span>
              <span>→</span>
            </Link>
            <a
              href="#simulasi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-full text-white border border-white/20 hover:bg-white/10 transition-all no-underline"
            >
              <span>Uji Coba Simulasi</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

