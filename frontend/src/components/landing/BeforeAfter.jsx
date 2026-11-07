export default function BeforeAfter() {
  return (
    <section id="perbandingan" className="py-16 px-4 sm:px-6 bg-[#FBF7F4] border-y border-[#F9E8EC]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05A6E] bg-[#F9E8EC] px-3 py-1 rounded-full">
            Dilema AI Saat Ini
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] font-['Syne',sans-serif] mt-3 mb-3">
            Mengapa Chatbot Konvensional Justru Melemahkan Pemahaman?
          </h2>
          <p className="text-sm sm:text-base text-[#6C6267] leading-relaxed">
            Generatif AI seperti ChatGPT seringkali memberi solusi instan tanpa proses berpikir. Inilah alasan mengapa SorotPaham dirancang berbeda secara pedagogis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Sisi Kiri: Chatbot Konvensional */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                ✕
              </span>
              <h3 className="text-base sm:text-lg font-bold text-red-950 font-['Syne',sans-serif] m-0">
                Cara Lama (Chatbot Konvensional)
              </h3>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-[#6C6267] pl-0 list-none">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">−</span>
                <span><strong>Jawaban Instan:</strong> Mahasiswa langsung menyalin teks/kode tanpa menyadari bagaimana logika tersebut terbentuk.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">−</span>
                <span><strong>Ilusi Pemahaman:</strong> Merasa paham saat membaca jawaban AI, namun langsung buntu saat menghadapi ujian tertulis mandiri.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">−</span>
                <span><strong>Dosen Buta Titik Sulit:</strong> Dosen tidak memiliki data analitik mengenai bagian modul apa yang sebenarnya membingungkan mahasiswa.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">−</span>
                <span><strong>Rasa Malu Bertanya:</strong> Mahasiswa sungkan bertanya di kelas besar karena khawatir dianggap tertinggal oleh teman sekelas.</span>
              </li>
            </ul>
          </div>

          {/* Sisi Kanan: Dengan SorotPaham */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#6B1224] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#6B1224] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
              Standar FIRETECH
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-[#F9E8EC] text-[#6B1224] flex items-center justify-center font-bold text-sm">
                ✓
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#6B1224] font-['Syne',sans-serif] m-0">
                Dengan SorotPaham (Socratic Tutor)
              </h3>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-[#1E1C1E] pl-0 list-none">
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B1224] font-bold">✓</span>
                <span><strong>Bimbingan Bertahap (Hint Ladder):</strong> AI menolak memberi jawaban jadi; AI membimbing dengan pertanyaan reflektif dan analogi nyata.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B1224] font-bold">✓</span>
                <span><strong>Highlight Berbasis Konteks:</strong> Pertanyaan terikat langsung pada kalimat buku atau modul ajar yang sedang dibaca.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B1224] font-bold">✓</span>
                <span><strong>Heatmap Kelas Anonim:</strong> Dosen bisa melihat peta panas paragraf mana yang paling banyak disorot sebelum jam perkuliahan berikutnya.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B1224] font-bold">✓</span>
                <span><strong>Bebas Stigma:</strong> Mahasiswa dapat mengeksplorasi ketidakpahaman secara privat, aman, dan tanpa intimidasi nilai.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

