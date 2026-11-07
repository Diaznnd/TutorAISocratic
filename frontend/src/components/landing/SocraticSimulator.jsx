import { useState } from 'react';

export default function SocraticSimulator() {
  const snippets = [
    {
      label: '1. Base Case Rekursi',
      text: 'base case yang valid',
      level: 2,
      initMsg: 'Kamu menyorot "base case yang valid". Bayangkan sebuah tumpukan piring: jika kamu terus menumpuk piring baru tanpa pernah mengambilnya, apa yang akan terjadi?',
    },
    {
      label: '2. Kompleksitas O(n log n)',
      text: 'kompleksitas waktu O(n log n)',
      level: 3,
      initMsg: 'Kamu menyorot "O(n log n)". Jika membelah masalah jadi dua menghasilkan faktor log n, dan memeriksa setiap elemen butuh n langkah, bagaimana keduanya berpadu?',
    },
    {
      label: '3. Polymorphism OOP',
      text: 'polimorfisme dinamis pada runtime',
      level: 1,
      initMsg: 'Kamu menyorot "polimorfisme". Apa yang terlintas di pikiranmu saat mendengar kata "poli" (banyak) dan "morf" (bentuk) dalam kehidupan sehari-hari?',
    },
  ];

  const [activeSnippet, setActiveSnippet] = useState(snippets[0]);
  const [messages, setMessages] = useState([
    { sender: 'tutor', text: snippets[0].initMsg, level: snippets[0].level },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectSnippet = (s) => {
    setActiveSnippet(s);
    setMessages([{ sender: 'tutor', text: s.initMsg, level: s.level }]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userText = inputVal.trim();
    setInputVal('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();
      if (lower.includes('jawab') || lower.includes('langsung') || lower.includes('kasih tahu') || lower.includes('solusi')) {
        reply = 'Saya tidak boleh langsung membocorkan jawaban 😊. Mari kita runtut bersama: jika memori tumpukan penuh, sistem akan berhenti atau crash? Apa nama error tersebut?';
      } else {
        reply = 'Penalaran yang tepat! Nah, sekarang coba simpulkan: mengapa syarat berhenti (base case) mutlak diperlukan sebelum memanggil fungsi lagi?';
      }
      setMessages((prev) => [...prev, { sender: 'tutor', text: reply, level: activeSnippet.level }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <section id="simulasi" className="py-16 px-4 sm:px-6 bg-[#FBF7F4] border-y border-[#F9E8EC]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05A6E] bg-[#F9E8EC] px-3 py-1 rounded-full">
            Playground Langsung
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1C1E] font-['Plus_Jakarta_Sans',sans-serif] mt-3 mb-3">
            Uji Coba Dialog Bimbingan Sokrates
          </h2>
          <p className="text-sm sm:text-base text-[#6C6267]">
            Pilih salah satu potongan teks di bawah untuk merasakan bagaimana Tutor AI menuntunmu berpikir analitis.
          </p>
        </div>

        {/* Snippet Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {snippets.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSnippet(s)}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                activeSnippet.text === s.text
                  ? 'bg-[#6B1224] text-white border-[#6B1224] shadow-sm'
                  : 'bg-white text-[#6C6267] border-[#E5D5D8] hover:border-[#6B1224] hover:text-[#6B1224]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Chat Simulator Box */}
        <div className="bg-white rounded-3xl border border-[#F9E8EC] shadow-md overflow-hidden max-w-3xl mx-auto flex flex-col h-[480px]">
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#FBF7F4] border-b border-[#F9E8EC] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#6B1224] text-white flex items-center justify-center font-bold text-xs">
                SP
              </div>
              <div>
                <span className="font-bold text-xs text-[#1E1C1E] block font-['Plus_Jakarta_Sans',sans-serif]">
                  Tutor AI Socratic
                </span>
                <span className="text-[10px] text-[#6C6267] block">
                  Konteks: "{activeSnippet.text}"
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1224] bg-[#F9E8EC] px-3 py-1 rounded-full">
              <span>Tangga {activeSnippet.level}/5: Analogi & Refleksi</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#FBF7F4]/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#6B1224] text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-[#1E1C1E] border border-[#F9E8EC] rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[#6C6267] mt-1 px-1">
                  {m.sender === 'user' ? 'Jawabanmu' : 'Tutor AI Sokrates'}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-[#6B1224] italic bg-white p-2.5 rounded-2xl w-fit border border-[#F9E8EC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B1224] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B1224] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B1224] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Tutor sedang merumuskan pertanyaan bimbingan...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#F9E8EC] flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tuliskan pemikiranmu atau tanyakan..."
              className="flex-1 px-4 py-2.5 rounded-full border border-[#E5D5D8] text-xs sm:text-sm text-[#1E1C1E] outline-none focus:border-[#6B1224] transition-colors"
            />
            <button
              type="submit"
              disabled={isTyping || !inputVal.trim()}
              className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-[#6B1224] hover:bg-[#80142A] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Kirim
            </button>
          </form>
        </div>

        {/* Hint Ladder explanation bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#6C6267]">
          <span className="font-bold text-[#6B1224]">5 Tangga Bimbingan:</span>
          <span className="bg-white px-2.5 py-1 rounded-full border border-[#F9E8EC]">1. Refleksi Awal</span>
          <span className="bg-white px-2.5 py-1 rounded-full border border-[#F9E8EC]">2. Analogi Nyata</span>
          <span className="bg-white px-2.5 py-1 rounded-full border border-[#F9E8EC]">3. Petunjuk Konsep</span>
          <span className="bg-white px-2.5 py-1 rounded-full border border-[#F9E8EC]">4. Contoh Serupa</span>
          <span className="bg-white px-2.5 py-1 rounded-full border border-[#F9E8EC]">5. Langkah Pertama</span>
        </div>
      </div>
    </section>
  );
}

