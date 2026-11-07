import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Badge Tag */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-[#6B1224]/15 bg-[#F9E8EC] text-[#6B1224] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#6B1224] animate-pulse"></span>
            FIRETECH 2026 · Mengatasi Ketergantungan Jawaban AI Instan
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.18] text-[#1E1C1E] font-['Syne',sans-serif] mb-5">
            Bukan memberi jawaban jadi.<br />
            <span className="text-[#6B1224] underline decoration-[#D05A6E]/40 decoration-wavy decoration-2">
              Menuntunmu hingga benar-benar paham.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6C6267] leading-relaxed max-w-2xl mx-auto">
            Banyak mahasiswa menyalin jawaban ChatGPT tanpa mengerti konsepnya, sementara dosen baru tahu kelas tersangkut setelah ujian selesai.
            <strong className="text-[#1E1C1E]"> SorotPaham</strong> menjembatani keduanya: baca materi kuliah, sorot kalimat yang membingungkan, dan dipandu berpikir kritis dengan metode Sokrates — 100% anonim dan tanpa rasa takut dinilai salah.
          </p>
        </div>

        {/* Dual Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-full text-white text-sm bg-[#6B1224] hover:bg-[#80142A] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 no-underline"
          >
            <span>Coba Kelas Pertama (Gratis)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="#simulasi"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-full text-sm border border-[#6B1224]/20 text-[#6B1224] bg-white hover:bg-[#F9E8EC] transition-all no-underline shadow-xs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            <span>Uji Coba Simulasi Interaktif</span>
          </a>
        </div>

        {/* Live Interactive Mockup Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-[#F9E8EC] p-4 sm:p-7 shadow-xl relative overflow-hidden">
          {/* Mockup Window Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F9E8EC]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E5D5D8]" />
              <span className="w-3 h-3 rounded-full bg-[#F4D4DC]" />
              <span className="w-3 h-3 rounded-full bg-[#D05A6E]/50" />
              <span className="text-xs font-semibold text-[#6C6267] ml-2">
                Struktur Data & Algoritma · Rekursi & Call Stack
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#6B1224] bg-[#F9E8EC] px-3 py-1 rounded-full">
              <span>● Mode Belajar Aktif</span>
            </div>
          </div>

          {/* Split: Reading Article on Left, Tutor Bubble on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Article Reading Area */}
            <div className="md:col-span-7 bg-[#FBF7F4] rounded-2xl p-5 border border-[#F9E8EC]/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D05A6E]">
                Paragraf 3 dari 8
              </span>
              <h3 className="font-bold text-base text-[#1E1C1E] mt-1 mb-3 font-['Syne',sans-serif]">
                Prinsip Terminasi pada Fungsi Rekursif
              </h3>
              <p className="text-xs sm:text-sm text-[#1E1C1E]/85 leading-relaxed mb-3">
                Setiap pemanggilan fungsi rekursif akan dialokasikan pada memori call stack. Apabila eksekusi tidak memiliki batasan penghenti atau{' '}
                <mark className="bg-[#FFE14D] text-[#1E1C1E] px-1.5 py-0.5 rounded font-medium border-b-2 border-[#D05A6E] shadow-2xs">
                  base case yang valid
                </mark>
                , program akan terus memanggil dirinya sendiri sampai memori habis dialokasikan.
              </p>

              {/* Floating Highlight Action Pill */}
              <div className="inline-flex items-center gap-2 bg-[#6B1224] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="text-sm">💡</span>
                <span>Saya belum paham bagian ini</span>
              </div>
            </div>

            {/* Socratic Tutor Card on Right */}
            <div className="md:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#6B1224]/15 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F9E8EC]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#6B1224] text-white flex items-center justify-center text-[10px] font-bold">
                    AI
                  </div>
                  <span className="font-bold text-xs text-[#6B1224]">Tutor Sokrates</span>
                </div>
                <span className="text-[11px] font-semibold text-[#D05A6E] bg-[#F9E8EC] px-2 py-0.5 rounded-full">
                  Tangga 2/5: Analogi
                </span>
              </div>

              {/* Quote bubble */}
              <div className="text-xs italic bg-[#FBF7F4] border-l-2 border-[#6B1224] p-2.5 rounded-r-lg text-[#6C6267] mb-3">
                "base case yang valid"
              </div>

              {/* Tutor response */}
              <div className="text-xs sm:text-sm text-[#1E1C1E] bg-[#F9E8EC]/40 p-3 rounded-xl border border-[#F9E8EC] leading-relaxed mb-3">
                Bayangkan sebuah <strong>tumpukan piring kotor</strong>. Jika kamu terus menaruh piring baru tanpa pernah mencucinya, apa yang akhirnya terjadi pada tumpukan itu?
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#6C6267]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Anti-jawaban instan: Memandu pemikiran analitis</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Trust Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F9E8EC] shadow-xs">
            <div className="text-2xl font-extrabold text-[#6B1224] font-['Syne',sans-serif]">83%</div>
            <div className="text-xs text-[#6C6267] font-medium mt-0.5">Mahasiswa Mengaku Paham Lebih Mendalam</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F9E8EC] shadow-xs">
            <div className="text-2xl font-extrabold text-[#6B1224] font-['Syne',sans-serif]">5 Tangga</div>
            <div className="text-xs text-[#6C6267] font-medium mt-0.5">Tingkatan Petunjuk Bimbingan Berjenjang</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F9E8EC] shadow-xs">
            <div className="text-2xl font-extrabold text-[#6B1224] font-['Syne',sans-serif]">100% Privasi</div>
            <div className="text-xs text-[#6C6267] font-medium mt-0.5">Data Sorotan Agregat & Anonim Bagi Dosen</div>
          </div>
        </div>

      </div>
    </section>
  );
}

