import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Persona Tab Switcher (Mahasiswa vs Dosen)
  const [activePersona, setActivePersona] = useState('mahasiswa');

  // 2. Interactive Selection State (Real Text Highlight Simulation)
  const [selectedQuote, setSelectedQuote] = useState('base case yang valid');
  const [selectedHintLevel, setSelectedHintLevel] = useState(2);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'tutor',
      text: 'Kamu menyorot "base case yang valid". Bayangkan sebuah tumpukan piring: jika kamu terus menumpuk piring baru tanpa pernah mengambilnya, apa yang akan terjadi?',
      level: 2,
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // 3. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // 4. Quick Hint Level Demo Stepper
  const hintLevels = [
    {
      level: 1,
      name: 'Refleksi Awal',
      prompt: 'Apa yang sudah kamu pahami dari istilah ini?',
      response: 'Coba sebutkan satu kata kunci yang kamu ingat dari penjelasan sebelumnya.',
    },
    {
      level: 2,
      name: 'Analogi Nyata',
      prompt: 'Bayangkan tumpukan piring (call stack)...',
      response: 'Setiap fungsi baru memakan memori di atas tumpukan. Kapan tumpukan itu berhenti?',
    },
    {
      level: 3,
      name: 'Petunjuk Konsep',
      prompt: 'Kondisi terminasi fungsi rekursif.',
      response: 'Base case adalah syarat IF yang mengembalikan nilai langsung tanpa memanggil fungsi lagi.',
    },
    {
      level: 4,
      name: 'Contoh Serupa',
      prompt: 'Analogi hitung mundur roket: 3, 2, 1, Meluncur!',
      response: 'Angka 0 adalah base case agar hitungan berhenti meluncur.',
    },
    {
      level: 5,
      name: 'Langkah Awal',
      prompt: 'if (n <= 0) return 1; ...',
      response: 'Sekarang giliranmu: apa nilai yang dikembalikan jika n > 0?',
    },
  ];

  // Handle user sending message in simulator
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isAiTyping) return;

    const userMsg = inputVal.trim();
    setInputVal('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);

    setIsAiTyping(true);
    setTimeout(() => {
      let reply = '';
      if (userMsg.toLowerCase().includes('jawab') || userMsg.toLowerCase().includes('langsung') || userMsg.toLowerCase().includes('apa')) {
        reply = 'Saya tidak bisa langsung memberikan jawaban jadi 😊. Mari kita runtut bersama: jika memori komputer penuh karena fungsi tak berhenti, pesan error apa yang muncul?';
      } else {
        reply = 'Penalaran yang cerdas! Sekarang, bisakah kamu menyimpulkan apa peran utama base case dalam kalimatmu sendiri?';
      }
      setChatHistory((prev) => [...prev, { sender: 'tutor', text: reply, level: selectedHintLevel }]);
      setIsAiTyping(false);
    }, 600);
  };

  const handleSelectSnippet = (text, level, initialPrompt) => {
    setSelectedQuote(text);
    setSelectedHintLevel(level);
    setChatHistory([
      {
        sender: 'tutor',
        text: initialPrompt,
        level: level,
      },
    ]);
  };

  const faqs = [
    {
      q: 'Apakah teman sekelas atau dosen bisa melihat nama saya saat saya menyorot bagian yang sulit?',
      a: 'Tidak. Seluruh sorotan ditampilkan secara agregat dan 100% anonim di dashboard dosen. Dosen hanya melihat bahwa "24 mahasiswa kesulitan di paragraf ini", tanpa mengetahui siapa saja mereka. Anda bebas bertanya dan belajar tanpa rasa malu.',
    },
    {
      q: 'Apakah interaksi saya dengan Tutor AI mempengaruhi nilai ujian atau IPK?',
      a: 'Sama sekali tidak. SorotPaham dirancang murni sebagai ruang bimbingan formatif (belajar mandiri), bukan alat evaluasi atau penilaian. Tidak ada poin yang dikurangi jika Anda meminta banyak petunjuk.',
    },
    {
      q: 'Bagaimana jika mahasiswa memaksa meminta jawaban langsung kepada AI?',
      a: 'Tutor AI diprogram dengan aturan pedagogis ketat (Socratic Protocol). Jika mahasiswa memancing jawaban jadi, AI akan menolak dengan sopan dan memberikan pertanyaan pemandu atau analogi yang lebih terjangkau.',
    },
    {
      q: 'Bagaimana cara dosen menyiapkan materi untuk kelas?',
      a: 'Sangat mudah. Dosen cukup menyalin teks silabus/materi ajar atau mengunggah dokumen. Sistem secara otomatis memecah materi menjadi paragraf bernomor dengan penanda tetap, siap untuk dibaca dan disorot oleh kelas.',
    },
    {
      q: 'Apakah saya perlu mengunduh aplikasi khusus?',
      a: 'Tidak perlu. SorotPaham berbasis web modern yang ringan dan responsif, dapat diakses langsung melalui browser di laptop, tablet, maupun ponsel pintar.',
    },
  ];

  return (
    <div className="min-h-screen text-[#1E1C1E] bg-[#f5f5f5]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ─────────────────────────────────────────────────────────────
          1. STICKY TOP NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#f5f5f5]/85 backdrop-blur-md border-b border-[#6B1224]/10 transition-all">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-sm transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #80142A 0%, #6B1224 100%)' }}>
              SP
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-[#6B1224] leading-tight">SorotPaham</span>
              <span className="text-[10px] text-[#6C6267] font-semibold tracking-wider uppercase -mt-0.5">Socratic Tutor LMS</span>
            </div>
          </Link>

          {/* Navigation Links — Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-black/5 shadow-xs">
            <a href="#perbandingan" className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors">
              Sebelum vs Sesudah
            </a>
            <a href="#cara-kerja" className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors">
              Cara Kerja
            </a>
            <a href="#simulasi" className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors">
              Simulasi Tutor
            </a>
            <a href="#peran" className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors">
              Untuk Siapa
            </a>
            <a href="#faq" className="text-xs font-semibold px-3 py-1 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors">
              FAQ
            </a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <Link to="/app"
                className="text-xs font-bold px-4 py-2 rounded-full text-white no-underline transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                style={{ background: '#6B1224' }}>
                <span>Ke Kelas ({user.name.split(' ')[0]})</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-[#6B1224]/20 text-[#6B1224] bg-white hover:bg-[#F9E8EC] transition-all no-underline hidden sm:inline-flex shadow-2xs">
                  Masuk
                </Link>
                <Link to="/login"
                  className="text-xs font-bold px-4 py-2 rounded-full text-white transition-all shadow-sm hover:shadow-md no-underline flex items-center gap-1"
                  style={{ background: '#6B1224' }}>
                  <span>Daftar Gratis</span>
                  <span>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION: VALUE PROPOSITION & LIVE INTERACTIVE GLANCE
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-16 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Trust Banner Tag */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-[#6B1224]/15 bg-[#F9E8EC] text-[#6B1224] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#6B1224] animate-pulse"></span>
              FIRETECH 2026 · Solusi Ketergantungan AI Instan
            </div>
          </div>

          {/* Headline & Empathetic Narrative */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.18] text-[#1E1C1E] mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Bukan memberi jawaban jadi.<br />
              <span className="text-[#6B1224] underline decoration-[#D05A6E]/40 decoration-wavy decoration-2">
                Menuntunmu hingga benar-benar paham.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#6C6267] leading-relaxed max-w-2xl mx-auto">
              Mahasiswa sering menyalin jawaban ChatGPT tanpa mengerti konsepnya, sementara dosen baru tahu kelas tersangkut setelah nilai ujian keluar. 
              <strong> SorotPaham</strong> menjembatani keduanya: baca materi, sorot kalimat yang membingungkan, dan dipandu berpikir kritis tanpa rasa takut dinilai salah.
            </p>
          </div>

          {/* Dual Primary CTA with Subtext */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-7 py-3 rounded-full text-white no-underline text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: '#6B1224' }}>
              <span>Coba Kelas Pertama (Gratis)</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>

            <a href="#simulasi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full text-sm border border-[#6B1224]/20 text-[#6B1224] bg-white hover:bg-[#F9E8EC] transition-all no-underline shadow-2xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              <span>Uji Simulasi Langsung di Bawah</span>
            </a>
          </div>

          <div className="text-center text-xs text-[#978B91] mb-12">
            ✓ Tanpa perlu kartu kredit &bull; ✓ Akses instan dengan kode kelas &bull; ✓ 100% data sorotan anonim
          </div>

          {/* ── Visual Showcase Card: Clean Reader & Tutor Interface ── */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Window Topbar */}
            <div className="bg-[#FAF7F5] border-b border-black/5 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E57373]"></span>
                <span className="w-3 h-3 rounded-full bg-[#FFB74D]"></span>
                <span className="w-3 h-3 rounded-full bg-[#81C784]"></span>
                <span className="text-xs text-[#978B91] ml-2 font-mono hidden sm:inline">sorotpaham.app/kelas/struktur-data-01</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1224] bg-[#F9E8EC] px-3 py-1 rounded-full">
                <span>Modul Aktif: Rekursi & Base Case</span>
              </div>
            </div>

            {/* Main Interactive Reader & Panel Preview */}
            <div className="grid md:grid-cols-12 min-h-[300px]">

              {/* Left Column: Reader Content with Real Highlights (7 Cols) */}
              <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-black/6 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#D05A6E] uppercase tracking-wider mb-3">
                    <span>Paragraf 02 · Inti Materi</span>
                    <span className="bg-[#F9E8EC] text-[#6B1224] px-2 py-0.5 rounded-full text-[11px] font-bold">24 Mahasiswa Menyorot</span>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-[#1E1C1E]">
                    Fungsi rekursif bekerja dengan memanggil dirinya sendiri. Namun tanpa adanya{' '}
                    <mark className="bg-[#FFE27A] text-[#451000] px-1.5 py-0.5 rounded font-semibold cursor-pointer border-b-2 border-[#E0A800]"
                      title="Klik untuk melihat dialog tutor">
                      base case yang valid dan terjangkau
                    </mark>
                    {', '}pemanggilan fungsi akan terus bertumpuk di memori hingga memicu{' '}
                    <mark className="bg-[#F9E8EC] text-[#6B1224] px-1 py-0.5 rounded font-medium border-b border-[#D05A6E]/40">
                      stack overflow exception
                    </mark>
                    .
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-[#FBF7F4] border border-[#6B1224]/10 text-xs text-[#6C6267] flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>
                      <strong>Prinsip Sokrates:</strong> Mahasiswa tidak langsung diberi tahu jawaban kode, melainkan dituntun memahami peran base case lewat analogi bertingkat.
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#978B91]">
                  <span>Status: Tersinkronisasi ke Dosen (Anonim)</span>
                  <span className="text-[#1E7E52] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E7E52]"></span>
                    Tutor Siaga
                  </span>
                </div>
              </div>

              {/* Right Column: Socratic Dialogue Preview (5 Cols) */}
              <div className="md:col-span-5 p-5 bg-[#FBF7F4] flex flex-col justify-between">
                <div>
                  {/* Tutor Header */}
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#6B1224] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        Σ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E1C1E]">Tutor AI Sokrates</div>
                        <div className="text-[10px] text-[#978B91]">Bimbingan Berdasarkan Sorotan</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F9E8EC] text-[#6B1224]">
                      Level 2/5
                    </span>
                  </div>

                  {/* Active Selected Quote */}
                  <div className="text-xs text-[#6B1224] bg-[#F9E8EC] p-2.5 rounded-lg border-l-3 border-[#6B1224] mb-3 italic">
                    "base case yang valid dan terjangkau"
                  </div>

                  {/* Tutor Question */}
                  <div className="text-xs sm:text-[13px] text-[#1E1C1E] font-medium leading-relaxed mb-3">
                    💬 <em>"Bayangkan kamu sedang menumpuk piring makan di atas meja. Jika kamu terus menaruh piring tanpa pernah menyetopnya, apa yang akan terjadi pada meja dan tumpukan itu?"</em>
                  </div>

                  {/* Student Answer */}
                  <div className="text-xs text-[#6B1224] bg-white p-2.5 rounded-lg border border-black/5 text-right font-medium mb-2 shadow-2xs">
                    "Mejanya akan keberatan dan piringnya ambruk ke lantai."
                  </div>

                  {/* Tutor Positive Feedback */}
                  <div className="text-xs text-[#1E7E52] bg-[#EEF7F2] p-2 rounded-lg border border-[#B8E2CD] font-semibold">
                    ✓ Tepat sekali! 'Piring ambruk' itulah stack overflow. Sekarang, apa fungsi 'kondisi berhenti'?
                  </div>
                </div>

                {/* Quick Hint Meter */}
                <div className="mt-4 pt-2.5 border-t border-black/5">
                  <div className="flex justify-between text-[11px] font-semibold text-[#6C6267] mb-1">
                    <span>Tangga Petunjuk Mandiri</span>
                    <span className="text-[#6B1224]">2 dari 5 Langkah</span>
                  </div>
                  <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#6B1224] h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SEBELUM VS SESUDAH (CLEAR PAIN VS SOLUTION VALUE)
      ───────────────────────────────────────────────────────────── */}
      <section id="perbandingan" className="py-16 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#D05A6E] block mb-2">Mengapa Perlu Berubah?</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] tracking-tight mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Perbedaan Cara Belajar Konvensional vs SorotPaham
            </h2>
            <p className="text-sm sm:text-base text-[#6C6267]">
              Ketergantungan pada jawaban chatbot instan menciptakan ilusi bahwa mahasiswa sudah paham. Lihat bagaimana SorotPaham mengubah dinamika tersebut:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Sisi Kiri: Cara Lama / Chatbot Instan */}
            <div className="p-6 rounded-2xl bg-[#FFF8F8] border border-red-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 text-red-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</span>
                  <span>Cara Lama: Chatbot Pemberi Jawaban Jadi</span>
                </div>

                <ul className="space-y-3.5 text-sm text-[#6C6267]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Mahasiswa copy-paste soal, AI memberikan jawaban 100% jadi. Tugas selesai dalam 5 menit, pemahaman nol.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Saat ujian tatap muka tiba, mahasiswa panik karena tidak terlatih merumuskan alur berpikir sendiri.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Dosen tidak punya data sama sekali tentang bagian materi mana yang sebenarnya belum dipahami kelas.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-red-100 text-xs text-red-600 font-semibold italic">
                Hasil: Nilai tugas tinggi semu, namun gagal di ujian dan kehilangan nalar kritis.
              </div>
            </div>

            {/* Sisi Kanan: Cara SorotPaham */}
            <div className="p-6 rounded-2xl bg-[#F9E8EC]/40 border border-[#6B1224]/20 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 text-[#6B1224] font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#F9E8EC] flex items-center justify-center text-xs text-[#6B1224]">✓</span>
                  <span>Cara SorotPaham: Pendampingan Sokrates Taktil</span>
                </div>

                <ul className="space-y-3.5 text-sm text-[#1E1C1E]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#6B1224] font-bold mt-0.5">✓</span>
                    <span>Cukup sorot kalimat yang macet. AI memandu dengan pertanyaan bertingkat sampai kamu bisa parafrase sendiri.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#6B1224] font-bold mt-0.5">✓</span>
                    <span>Ruang privat tanpa takut dinilai: interaksi tidak mempengaruhi IPK, menumbuhkan rasa percaya diri bertanya.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#6B1224] font-bold mt-0.5">✓</span>
                    <span>Dosen otomatis menerima Heatmap anonim: tahu pasti paragraf mana yang harus diulas di kelas tatap muka.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#6B1224]/15 text-xs text-[#6B1224] font-bold">
                Hasil: Pemahaman konseptual mendalam, dosen mengajar tepat sasaran.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CARA KERJA (4 LANGKAH SEDERHANA)
      ───────────────────────────────────────────────────────────── */}
      <section id="cara-kerja" className="py-16 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#D05A6E] block mb-2">Alur Pembelajaran</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] tracking-tight mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Empat Langkah, Siklus Belajar yang Utuh
            </h2>
            <p className="text-sm sm:text-base text-[#6C6267]">
              Dari materi yang diunggah hingga kelas tatap muka yang lebih berdaya:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {[
              {
                step: '01',
                title: 'Unggah Materi',
                actor: 'Dosen',
                desc: 'Materi teks atau PDF otomatis dipecah menjadi paragraf bernomor dengan posisi tetap.',
                icon: '📄',
              },
              {
                step: '02',
                title: 'Sorot yang Sulit',
                actor: 'Mahasiswa',
                desc: 'Tandai kalimat atau istilah yang membingungkan tanpa perlu menyusun pertanyaan panjang.',
                icon: '✏️',
              },
              {
                step: '03',
                title: 'Bimbingan Sokrates',
                actor: 'AI Tutor',
                desc: 'Tutor menuntun dengan pertanyaan pemandu hingga mahasiswa mampu menjelaskan ulang.',
                icon: '💡',
              },
              {
                step: '04',
                title: 'Heatmap Kelas',
                actor: 'Dosen & Siswa',
                desc: 'Peta panas menunjukkan titik macet kelas, dosen mengulas materi dengan sasaran presisi.',
                icon: '📊',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-black/6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#F9E8EC] text-[#6B1224]">
                      Langkah {item.step}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#978B91]">
                      {item.actor}
                    </span>
                  </div>

                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-extrabold text-base text-[#1E1C1E] mb-2">{item.title}</h3>
                  <p className="text-xs text-[#6C6267] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SIMULATOR INTERAKTIF: COBA SENDIRI PENYOROTAN & TUTOR SOKRATES
      ───────────────────────────────────────────────────────────── */}
      <section id="simulasi" className="py-16 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-5xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#D05A6E] block mb-2">Laboratorium Pengalaman</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] tracking-tight mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Uji Coba Langsung: Cara Kerja Tutor Sokrates
            </h2>
            <p className="text-sm text-[#6C6267]">
              Pilih salah satu cuplikan materi di bawah atau ketik tanggapanmu untuk merasakan bagaimana AI menuntun tanpa membocorkan jawaban.
            </p>
          </div>

          {/* Interactive Playground Container */}
          <div className="rounded-2xl border border-[#6B1224]/15 shadow-md overflow-hidden bg-[#FAF7F5]">

            {/* Stepper Pill Quick Select */}
            <div className="p-3.5 bg-white border-b border-black/5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#6B1224]">Pilih Contoh Sorotan Teks:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: 'base case yang valid', level: 2, prompt: 'Kamu menyorot "base case yang valid". Bayangkan piring makan: apa akibatnya jika ditumpuk tanpa batas?' },
                  { text: 'stack overflow exception', level: 3, prompt: 'Mengapa memori komputer bisa habis saat fungsi memanggil dirinya sendiri terus-menerus?' },
                  { text: 'overhead memori call stack', level: 1, prompt: 'Apa yang sudah kamu ketahui tentang perbedaan konsumsi memori perulangan biasa vs rekursi?' },
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSnippet(chip.text, chip.level, chip.prompt)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                      selectedQuote === chip.text
                        ? 'bg-[#6B1224] text-white shadow-xs'
                        : 'bg-[#F9E8EC] text-[#6B1224] hover:bg-[#F9E8EC]/80'
                    }`}>
                    "{chip.text}"
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Chat Window */}
            <div className="p-5 sm:p-6 grid md:grid-cols-12 gap-5">

              {/* Left Context Snippet */}
              <div className="md:col-span-4 bg-white p-4 rounded-xl border border-black/5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] font-bold uppercase text-[#D05A6E] mb-2 tracking-wider">Konteks Paragraf</div>
                  <p className="text-xs sm:text-sm text-[#1E1C1E] leading-relaxed mb-3">
                    "Tanpa adanya{' '}
                    <span className="bg-[#FFE27A] text-[#451000] px-1 py-0.5 rounded font-semibold">
                      {selectedQuote}
                    </span>
                    {', '}rekursi akan terus berjalan hingga memicu kehabisan memori pada sistem komputer."
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 text-[11px] text-[#978B91]">
                  💡 <em>Tutor selalu membaca konteks paragraf lengkap agar bimbingannya akurat.</em>
                </div>
              </div>

              {/* Right Chat Dialogue Simulator */}
              <div className="md:col-span-8 flex flex-col bg-white rounded-xl border border-black/5 p-4 shadow-2xs min-h-[260px] justify-between">

                {/* Messages Feed */}
                <div className="space-y-3 mb-4 overflow-y-auto max-h-[220px] pr-1">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'tutor' && (
                        <div className="w-6 h-6 rounded-md bg-[#6B1224] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          Σ
                        </div>
                      )}
                      <div
                        className={`text-xs sm:text-sm p-3 rounded-xl max-w-[85%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#6B1224] text-white rounded-br-none shadow-xs'
                            : 'bg-[#F9E8EC] text-[#1E1C1E] rounded-bl-none border border-[#6B1224]/10'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isAiTyping && (
                    <div className="flex gap-2 items-center text-xs text-[#978B91] italic">
                      <span className="w-5 h-5 rounded-md bg-[#6B1224]/20 flex items-center justify-center text-[10px]">Σ</span>
                      Tutor sedang memikirkan pertanyaan berikutnya...
                    </div>
                  )}
                </div>

                {/* Input Prompt Box */}
                <form onSubmit={handleSendMessage} className="pt-2 border-t border-black/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Coba ketik refleksimu (atau pancing: 'apa jawabannya?')..."
                      className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-black/15 bg-[#FAF7F5] focus:bg-white focus:outline-none focus:border-[#6B1224] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputVal.trim() || isAiTyping}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all disabled:opacity-40 cursor-pointer"
                      style={{ background: '#6B1224' }}>
                      Kirim
                    </button>
                  </div>
                </form>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SEGMENTED PERSONA: UNTUK MAHASISWA VS UNTUK DOSEN
      ───────────────────────────────────────────────────────────── */}
      <section id="peran" className="py-16 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-[#D05A6E] block mb-2">Dirancang Berdasarkan Kebutuhan</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] tracking-tight mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Satu Platform, Dua Pengalaman yang Presisi
            </h2>
          </div>

          {/* Persona Switcher Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white p-1 rounded-full border border-black/8 shadow-2xs">
              <button
                onClick={() => setActivePersona('mahasiswa')}
                className={`text-xs sm:text-sm font-bold px-6 py-2 rounded-full transition-all cursor-pointer ${
                  activePersona === 'mahasiswa'
                    ? 'bg-[#6B1224] text-white shadow-xs'
                    : 'text-[#6C6267] hover:text-[#1E1C1E]'
                }`}>
                🎓 Pengalaman Mahasiswa
              </button>
              <button
                onClick={() => setActivePersona('dosen')}
                className={`text-xs sm:text-sm font-bold px-6 py-2 rounded-full transition-all cursor-pointer ${
                  activePersona === 'dosen'
                    ? 'bg-[#6B1224] text-white shadow-xs'
                    : 'text-[#6C6267] hover:text-[#1E1C1E]'
                }`}>
                👩‍🏫 Pengalaman Dosen
              </button>
            </div>
          </div>

          {/* Persona Active Card */}
          <div className="bg-white rounded-2xl border border-black/8 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
            {activePersona === 'mahasiswa' ? (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold text-[#D05A6E] uppercase tracking-wider block mb-1">Fokus: Kenyamanan Belajar</span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E1C1E] mb-3 leading-snug">
                    Tanya Kapan Saja Tanpa Rasa Takut Dianggap Tertinggal
                  </h3>
                  <p className="text-sm text-[#6C6267] leading-relaxed mb-4">
                    Di ruang kelas besar, seringkali kita enggan mengangkat tangan karena malu atau takut salah. Dengan SorotPaham, setiap keraguan dijawab secara privat, sabar, dan bertahap.
                  </p>

                  <div className="space-y-2.5 text-xs sm:text-sm font-medium text-[#1E1C1E]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1E7E52] font-bold">✓</span>
                      <span>Tidak ada nilai yang dikurangi karena menyorot kalimat sulit.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1E7E52] font-bold">✓</span>
                      <span>AI tidak menghakimi, melainkan melatih logika hingga tuntas.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1E7E52] font-bold">✓</span>
                      <span>Riwayat belajar tersimpan rapi untuk persiapan ujian mandiri.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF7F5] p-5 rounded-xl border border-black/5">
                  <div className="text-xs font-bold text-[#6B1224] mb-2">Simulasi Tampilan Mahasiswa:</div>
                  <div className="bg-white p-3 rounded-lg border border-black/5 text-xs text-[#6C6267] mb-2.5 shadow-2xs">
                    "Kamu sudah menuntun logika hingga tingkat 4. Sekarang saatnya parafrase dengan kata-katamu sendiri!"
                  </div>
                  <div className="w-full bg-[#E0D8D4] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1E7E52] h-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="text-[11px] text-[#978B91] mt-1.5 flex justify-between">
                    <span>Kemajuan Pemahaman Konsep</span>
                    <span className="font-bold text-[#1E7E52]">85% Siap Ujian</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold text-[#6B1224] uppercase tracking-wider block mb-1">Fokus: Visibilitas & Efektivitas Pengajaran</span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E1C1E] mb-3 leading-snug">
                    Tahu Pasti Paragraf Mana yang Harus Dijelaskan Ulang
                  </h3>
                  <p className="text-sm text-[#6C6267] leading-relaxed mb-4">
                    Jangan biarkan dosen mengajar dalam kegelapan. Dashboard Heatmap menyajikan laporan agregat anonim mengenai bagian materi yang paling membingungkan kelas.
                  </p>

                  <div className="space-y-2.5 text-xs sm:text-sm font-medium text-[#1E1C1E]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B1224] font-bold">✓</span>
                      <span>Peta panas instan per paragraf: intensitas merah = hotspot masalah.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B1224] font-bold">✓</span>
                      <span>Dosen tetap pemegang kendali (Human-in-the-Loop); AI hanya memberi radar.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B1224] font-bold">✓</span>
                      <span>Tandai paragraf tertentu untuk dibahas khusus pada sesi tatap muka.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF7F5] p-5 rounded-xl border border-black/5">
                  <div className="text-xs font-bold text-[#6B1224] mb-2">Simulasi Heatmap Kelas:</div>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-white border border-black/5 text-xs flex justify-between items-center">
                      <span>Paragraf 01: Definisi</span>
                      <span className="text-[10px] font-bold text-[#1E7E52]">3 sorotan (Aman)</span>
                    </div>
                    <div className="p-2 rounded bg-[#F9E8EC] border border-[#6B1224]/30 text-xs flex justify-between items-center">
                      <span className="font-bold text-[#6B1224]">Paragraf 02: Base Case</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6B1224] text-white">24 sorotan (Hotspot)</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-black/5 text-xs flex justify-between items-center">
                      <span>Paragraf 03: Kompleksitas</span>
                      <span className="text-[10px] font-bold text-[#D05A6E]">7 sorotan (Sedang)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ ACCORDION (MENENANGKAN KERAGUAN PENGGUNA)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#D05A6E] block mb-2">Transparansi & Kepercayaan</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1C1E] tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-[#6C6267]">
              Semua yang perlu kamu ketahui tentang privasi, cara kerja, dan jaminan etika di SorotPaham.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-black/8 rounded-xl overflow-hidden transition-all bg-[#FAF7F5]">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-[#1E1C1E] flex items-center justify-between gap-3 cursor-pointer">
                  <span>{faq.q}</span>
                  <span className="text-base text-[#6B1224] font-black">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>

                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#6C6267] leading-relaxed border-t border-black/5 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER CALL-TO-ACTION BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-6 bg-[#6B1224] text-white">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/10 text-[#F9E8EC] mb-5 border border-white/20">
            <span>●</span> Mulai Transformasi Ruang Kelas Hari Ini
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Siap Belajar Tanpa Ragu,<br /> Mengajar Berbasis Sinyal Nyata?
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Bergabunglah bersama mahasiswa dan dosen yang mengedepankan nalar kritis. Buat kelas atau masuk dengan kode dalam hitungan detik.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login"
              className="w-full sm:w-auto font-bold px-7 py-3 rounded-full bg-white text-[#6B1224] hover:bg-[#F9E8EC] transition-all no-underline text-sm shadow-md hover:shadow-lg">
              Daftar Sekarang — Gratis →
            </Link>
            <a href="#simulasi"
              className="w-full sm:w-auto font-semibold px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all no-underline text-sm">
              Coba Simulasi Lagi
            </a>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. CLEAN FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-5 sm:px-6 bg-[#FAF7F5] border-t border-black/5 text-xs text-[#6C6267]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-[#6B1224]">
            <div className="w-5 h-5 rounded bg-[#6B1224] text-white flex items-center justify-center text-[10px] font-black">SP</div>
            <span>SorotPaham</span>
            <span className="text-[#978B91] font-normal">· Socratic Tutor Platform</span>
          </div>

          <p className="text-center sm:text-left text-[#978B91]">
            Dibuat untuk Hackathon FIRETECH 2026 · Sub-tema Pendidikan dan Literasi Digital
          </p>

          <div className="flex items-center gap-4 text-[#6B1224] font-semibold">
            <Link to="/login" className="no-underline hover:underline">Masuk</Link>
            <Link to="/login" className="no-underline hover:underline">Daftar</Link>
            <a href="#hero" className="no-underline hover:underline">Kembali ke Atas ↑</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
