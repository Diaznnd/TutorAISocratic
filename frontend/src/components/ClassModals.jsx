import { useState } from 'react';
import { api } from '../api.js';
import { BookIcon } from './student/Icons.jsx';

/* ─── Modal "Buat Kelas Baru" (Image 2) ─── */
export function CreateClassModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kelas wajib diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const newClass = await api('/classes', {
        method: 'POST',
        body: { name: name.trim(), description: description.trim() },
      });
      setName('');
      setDescription('');
      onSuccess(newClass);
    } catch (err) {
      setError(err.message || 'Gagal membuat kelas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[480px] rounded-[28px] bg-[#6B1224] p-7 sm:p-9 text-white shadow-2xl border border-white/10">
        {/* Tombol Tutup Silang */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
          title="Tutup"
        >
          ✕
        </button>

        {/* Badge Ikon Buku */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-white">
          <BookIcon size={22} className="text-white" />
        </div>

        {/* Judul & Keterangan */}
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-white">
          Buat Kelas Baru
        </h2>
        <p className="mt-2 text-center text-xs leading-relaxed text-white/80">
          Masukkan detail kelas untuk mengundang mahasiswa dan membagikan materi terstruktur.
        </p>

        {/* Formulir */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-950/80 border border-red-400/40 p-3 text-xs text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-2">
              NAMA KELAS *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aljabar Linear"
              required
              autoFocus
              className="w-full rounded-xl bg-[#540E1C] border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-2">
              DESKRIPSI KELAS
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kelas Asik dan Interaktif"
              rows={3}
              className="w-full rounded-xl bg-[#540E1C] border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition resize-none"
            />
          </div>

          {/* Tombol Aksi Batal & Submit */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-white/80 hover:text-white transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-[#6B1224] shadow-md hover:bg-[#F9E8EC] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Buat Kelas Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal "Kelas Berhasil Dibuat!" (Image 3) ─── */
export function CreatedSuccessModal({ createdClass, onClose, onOpenClass }) {
  const [copied, setCopied] = useState(false);

  if (!createdClass) return null;

  const handleCopy = () => {
    if (createdClass.code) {
      navigator.clipboard?.writeText(createdClass.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[480px] rounded-[28px] bg-[#6B1224] p-7 sm:p-9 text-white shadow-2xl border border-white/10 text-center">
        {/* Tombol Tutup Silang */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
          title="Tutup"
        >
          ✕
        </button>

        {/* Badge Checkmark dengan Kilauan */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white">
          <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Judul & Subtitle */}
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Kelas Berhasil Dibuat!
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/80">
          Silahkan masukkan kode dibawah untuk bergabung
        </p>

        {/* Kotak Kode Kelas Otomatis */}
        <div className="mt-6 text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">
            KODE KELAS (OTOMATIS)
          </label>
          <div className="flex items-center justify-between rounded-xl bg-[#540E1C] border border-white/20 border-dashed px-5 py-3.5">
            <span className="font-mono text-lg sm:text-xl font-extrabold tracking-widest text-white">
              {createdClass.code}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer"
                title="Salin kode kelas"
              >
                {copied ? '✓ Tersalin' : 'Salin'}
              </button>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white/80 hover:text-white transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => onOpenClass(createdClass.id)}
            className="rounded-full bg-white px-7 py-2.5 text-xs font-bold text-[#6B1224] shadow-md hover:bg-[#F9E8EC] transition active:scale-95 cursor-pointer"
          >
            Buka Kelas
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal "Laporan Analitik" ─── */
export function AnalyticsModal({ isOpen, onClose, classes = [] }) {
  if (!isOpen) return null;

  const totalMaterials = classes.reduce((acc, c) => acc + (c.materials?.length || 0), 0);
  const totalAssignments = classes.reduce((acc, c) => acc + (c.assignments?.length || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[560px] rounded-[28px] bg-white p-7 sm:p-8 text-[#1E1C1E] shadow-2xl border border-[#F1EEF4]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F4F7] text-[#8B8391] hover:text-[#1E1C1E] transition cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224]">
            <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#1E1C1E]">Laporan Analitik Pengajaran</h2>
            <p className="text-xs text-[#8B8391]">Statistik aktivitas kelas, materi interaktif, dan keterlibatan mahasiswa</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A79FAB]">Total Kelas</p>
            <p className="mt-1 text-2xl font-extrabold text-[#6B1224]">{classes.length}</p>
          </div>
          <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A79FAB]">Total Modul</p>
            <p className="mt-1 text-2xl font-extrabold text-[#1E1C1E]">{totalMaterials}</p>
          </div>
          <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A79FAB]">Tugas Aktif</p>
            <p className="mt-1 text-2xl font-extrabold text-[#1E1C1E]">{totalAssignments}</p>
          </div>
          <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A79FAB]">AI Socratic</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-600">Aktif</p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <p className="text-xs font-bold text-[#1E1C1E]">Performa Keterlibatan Kelas</p>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {classes.length === 0 ? (
              <p className="text-xs text-[#8B8391] italic py-2 text-center">Belum ada kelas yang dibuat.</p>
            ) : (
              classes.map((cls, idx) => {
                const percent = idx === 0 ? 85 : idx === 1 ? 100 : 60;
                return (
                  <div key={cls.id} className="rounded-xl border border-[#F1EEF4] bg-[#FAF9FB] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1E1C1E]">{cls.name}</p>
                      <p className="text-[11px] text-[#8B8391]">{cls.materials?.length || 0} Materi dibagikan</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#6B1224]">{percent}%</span>
                      <p className="text-[10px] text-[#A79FAB]">Rasio Interaksi</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-[#F1EEF4] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#6B1224] px-5 py-2 text-xs font-bold text-white hover:bg-[#80142A] transition cursor-pointer"
          >
            Tutup Laporan
          </button>
        </div>
      </div>
    </div>
  );
}

