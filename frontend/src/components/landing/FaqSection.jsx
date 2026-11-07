import { useState } from 'react';

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'Apakah teman sekelas atau dosen bisa melihat identitas saya saat menyorot bagian yang sulit?',
      a: 'Sama sekali tidak. Seluruh data sorotan teks ditampilkan secara agregat dan 100% anonim di dashboard dosen. Dosen hanya melihat bahwa misalnya "18 mahasiswa kesulitan di paragraf ini", tanpa mengetahui siapa saja mereka. Anda bebas bertanya tanpa rasa malu atau khawatir akan dinilai buruk.',
    },
    {
      q: 'Mengapa Tutor AI tidak langsung memberikan kunci jawaban atau kode jadi?',
      a: 'Tujuan utama SorotPaham adalah membangun literasi kognitif dan pemahaman konsep yang kokoh. Jika AI memberi jawaban instan, mahasiswa cenderung menyalin tanpa paham logikanya. Tutor menggunakan metode Sokrates dengan tangga petunjuk (Hint Ladder) berjenjang agar mahasiswa menemukan "Aha!" moment-nya sendiri.',
    },
    {
      q: 'Bagaimana cara dosen membuat kelas dan membagikan materi?',
      a: 'Dosen cukup Sign In sebagai Guru/Dosen, membuat nama kelas untuk mendapatkan kode unik kelas, lalu menempelkan teks materi atau modul perkuliahan. Mahasiswa dapat bergabung dengan memasukkan kode tersebut tanpa perlu instalasi perangkat lunak tambahan.',
    },
    {
      q: 'Apakah sistem ini terintegrasi dengan browser atau memerlukan aplikasi khusus?',
      a: 'SorotPaham adalah web-app modern yang responsif dan berjalan langsung di browser ponsel, tablet, maupun laptop tanpa instalasi plugin atau aplikasi apapun.',
    },
    {
      q: 'Bagaimana jika mahasiswa sudah sampai pada petunjuk ke-5 namun masih belum paham?',
      a: 'Tingkat petunjuk ke-5 akan memberikan langkah awal perhitungan atau pseudo-code konkret. Selain itu, karena bagian tersebut disorot oleh mahasiswa, dosen akan melihatnya di peta heatmap kelas dan dapat mengulasnya secara mendalam saat sesi tatap muka (Human-in-the-loop).',
    },
  ];

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 bg-[#FBF7F4] border-t border-[#F9E8EC]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05A6E] bg-[#F9E8EC] px-3 py-1 rounded-full">
            Tanya Jawab
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] mt-3 mb-3">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm sm:text-base text-[#6C6267]">
            Segala hal yang perlu kamu ketahui tentang privasi, pedagogi, dan cara kerja SorotPaham.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#F9E8EC] shadow-2xs overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9E8EC]/20 transition-colors"
              >
                <span className="font-bold text-sm sm:text-base text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif]">
                  {f.q}
                </span>
                <span className="text-lg font-bold text-[#6B1224] flex-shrink-0">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>

              {openFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#6C6267] leading-relaxed border-t border-[#F9E8EC]/40">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

