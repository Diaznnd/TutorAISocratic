import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PersonaTabs() {
  const [activeTab, setActiveTab] = useState('mahasiswa');

  return (
    <section id="peran" className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05A6E] bg-[#F9E8EC] px-3 py-1 rounded-full">
            Dua Perspektif
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] mt-3 mb-3">
            Dirancang untuk Mahasiswa & Pendidik
          </h2>
          <p className="text-sm sm:text-base text-[#6C6267]">
            SorotPaham memberikan manfaat berbeda yang saling melengkapi bagi kedua belah pihak di ekosistem perkuliahan.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-full bg-[#FBF7F4] border border-[#F9E8EC] shadow-2xs">
            <button
              onClick={() => setActiveTab('mahasiswa')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'mahasiswa'
                  ? 'bg-[#6B1224] text-white shadow-xs'
                  : 'text-[#6C6267] hover:text-[#6B1224]'
              }`}
            >
              <span>🎓</span>
              <span>Untuk Pelajar & Mahasiswa</span>
            </button>
            <button
              onClick={() => setActiveTab('dosen')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dosen'
                  ? 'bg-[#6B1224] text-white shadow-xs'
                  : 'text-[#6C6267] hover:text-[#6B1224]'
              }`}
            >
              <span>📋</span>
              <span>Untuk Guru & Dosen</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'mahasiswa' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F9E8EC] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-[#D05A6E] tracking-wider uppercase">
                Pengalaman Belajar Mahasiswa
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] mt-1 mb-4">
                Belajar Kapan Saja Tanpa Rasa Takut Dinilai
              </h3>
              <p className="text-xs sm:text-sm text-[#6C6267] leading-relaxed mb-6">
                Tidak ada pertanyaan konyol. Kamu bebas menyorot bagian manapun yang belum dipahami pada materi dosen. AI akan membimbingmu dengan analogi dan tangga petunjuk langkah demi langkah.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-[#1E1C1E]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#6B1224] font-bold">✓</span>
                  <span>100% Anonim: Dosen tidak tahu siapa yang menyorot</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#6B1224] font-bold">✓</span>
                  <span>Bimbingan adaptif sesuai kecepatan belajarmu sendiri</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#6B1224] font-bold">✓</span>
                  <span>Membentuk daya nalar kritis untuk persiapan ujian & skripsi</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-full text-white text-xs sm:text-sm bg-[#6B1224] hover:bg-[#80142A] transition-all no-underline shadow-xs"
                >
                  <span>Sign In sebagai Mahasiswa</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Persona Visual Preview */}
            <div className="bg-[#FBF7F4] rounded-2xl p-6 border border-[#F9E8EC] flex flex-col gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#F9E8EC] shadow-2xs">
                <span className="text-[10px] font-bold text-[#D05A6E] uppercase">Highlight Teks</span>
                <p className="text-xs text-[#1E1C1E] mt-1 m-0 font-medium italic">
                  "...kompleksitas algoritma rekursif ditentukan oleh kedalaman pohon rekursi..."
                </p>
              </div>
              <div className="bg-[#F9E8EC] p-3.5 rounded-xl border border-[#6B1224]/10 shadow-2xs">
                <span className="text-[10px] font-bold text-[#6B1224] uppercase">Tutor Sokrates</span>
                <p className="text-xs text-[#6B1224] mt-1 m-0 font-medium">
                  "Jika setiap cabang pohon membelah jadi 2 anak di tiap tingkat, berapa total daun setelah 3 tingkat?"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F9E8EC] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-[#D05A6E] tracking-wider uppercase">
                Alat Bantu Dosen & Instruktur
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] mt-1 mb-4">
                Peta Visual Titik Bingung Kelas secara Real-time
              </h3>
              <p className="text-xs sm:text-sm text-[#6C6267] leading-relaxed mb-6">
                Tidak perlu lagi menebak apakah materi kuliah sudah dipahami. Dosen langsung melihat heatmap agregat dari paragraf materi yang paling banyak disorot oleh para mahasiswa.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-[#1E1C1E]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#6B1224] font-bold">✓</span>
                  <span>Heatmap warna kuning otomatis merefleksikan intensitas kesulitan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#6B1224] font-bold">✓</span>
                  <span>Mengetahui titik evaluasi sebelum masuk ruang perkuliahan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#6B1224] font-bold">✓</span>
                  <span>Pengunggahan modul kuliah cepat dan pembagian kode kelas instan</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-full text-white text-xs sm:text-sm bg-[#6B1224] hover:bg-[#80142A] transition-all no-underline shadow-xs"
                >
                  <span>Sign In sebagai Guru/Dosen</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Dosen Heatmap Preview */}
            <div className="bg-[#FBF7F4] rounded-2xl p-6 border border-[#F9E8EC] flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F9E8EC]">
                <span className="text-xs font-bold text-[#1E1C1E]">Heatmap Kesulitan Kelas</span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  24 Siswa Menyorot
                </span>
              </div>
              <div className="bg-amber-100/80 p-3.5 rounded-xl border border-amber-300 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-900 uppercase">Paragraf 4 (Tinggi)</span>
                <p className="text-xs text-amber-950 mt-1 m-0">
                  "Pernyataan pengembalian rekursif `return n * f(n-1)` menyebabkan frame stack baru dialokasikan..."
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#F9E8EC] text-[11px] text-[#6C6267]">
                💡 Saran Ajar: Bahas alokasi memori stack secara visual di awal pertemuan kuliah berikutnya.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

