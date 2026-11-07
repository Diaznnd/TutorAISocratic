/* Ilustrasi dashboard pelajar.
   Memakai aset /isometric-studio.png milik proyek, ditemani latar bertinta lembut
   supaya thumbnail tetap terlihat rapi di semua ukuran kartu. */

const TINTS = [
  { bg: 'from-[#F1F0F9] via-[#F6F4FB] to-[#FBEDF2]', glow: 'bg-[#DCD7F2]' },
  { bg: 'from-[#F3F1F7] via-[#F7F5FA] to-[#F9EDF3]', glow: 'bg-[#E7D9EA]' },
  { bg: 'from-[#F0F2F8] via-[#F5F5FA] to-[#FBEFF1]', glow: 'bg-[#DCE2F1]' },
];

export function CourseThumb({ variant = 0, className = '', imgClass = 'w-[58%]' }) {
  const tint = TINTS[variant % TINTS.length];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${tint.bg} ${className}`}
    >
      {/* pola titik halus */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(#C9C3D6 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
        }}
      />
      <div className={`pointer-events-none absolute h-[62%] w-[62%] rounded-full blur-2xl opacity-60 ${tint.glow}`} />
      <img
        src="/isometric-studio.png"
        alt=""
        loading="lazy"
        className={`relative z-10 ${imgClass} select-none opacity-95 mix-blend-multiply`}
        draggable="false"
      />
    </div>
  );
}

export function HeroArt({ className = '' }) {
  return (
    <div className={`relative hidden items-center justify-center sm:flex ${className}`}>
      <div className="pointer-events-none absolute h-[78%] w-[78%] rounded-full bg-[#F3E4EA] blur-2xl" />
      <div className="pointer-events-none absolute h-[92%] w-[92%] rounded-full border border-white/70" />
      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[22px] border border-white/80 bg-white/55 p-4 shadow-[0_18px_40px_-28px_rgba(107,18,36,0.45)] backdrop-blur-[2px]">
        <img
          src="/isometric-studio.png"
          alt="Ilustrasi suasana belajar isometrik"
          className="w-full max-w-[210px] select-none mix-blend-multiply"
          draggable="false"
        />
      </div>
    </div>
  );
}
