export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Dosen Unggah Materi',
      desc: 'Dosen membuat kelas dan menempel materi kuliah, artikel, atau modul praktikum ke dalam sistem.',
      icon: '📄',
    },
    {
      num: '02',
      title: 'Mahasiswa Sorot Teks',
      desc: 'Saat membaca modul dan menemukan konsep sulit, mahasiswa cukup menyeleksi kata atau kalimat tersebut.',
      icon: '🖍️',
    },
    {
      num: '03',
      title: 'Tutor Sokrates Berdialog',
      desc: 'AI Tutor membuka ruang tanya jawab adaptif dengan tangga petunjuk (Hint Ladder) hingga mahasiswa menemukan logikanya sendiri.',
      icon: '💬',
    },
    {
      num: '04',
      title: 'Heatmap Kesulitan Muncul',
      desc: 'Dosen memantau dashboard visual untuk melihat bagian mana yang paling banyak disorot demi mengoptimalkan pengajaran di kelas.',
      icon: '🔥',
    },
  ];

  return (
    <section id="cara-kerja" className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05A6E] bg-[#F9E8EC] px-3 py-1 rounded-full">
            Alur Pembelajaran
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] font-['Syne',sans-serif] mt-3 mb-3">
            Hanya 4 Langkah Sederhana
          </h2>
          <p className="text-sm sm:text-base text-[#6C6267]">
            Integrasi pedagogi Sokrates dan analitik dosen yang berjalan mulus dalam satu alur terpadu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-[#F9E8EC] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl p-2 rounded-xl bg-[#FBF7F4]">{s.icon}</span>
                  <span className="text-xs font-extrabold text-[#D05A6E] font-mono tracking-wider">
                    STEP {s.num}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#1E1C1E] mb-2 font-['Syne',sans-serif]">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6C6267] leading-relaxed m-0">
                  {s.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F9E8EC] text-[11px] font-semibold text-[#6B1224] flex items-center gap-1">
                <span>Pelajari lebih lanjut</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

