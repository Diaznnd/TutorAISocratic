import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import { CreateClassModal, CreatedSuccessModal } from '../components/ClassModals.jsx';

/* ─── Ikon Pembantu SVG Khusus Dashboard Analitik ─── */
function LightningIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function DownloadIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function GraduationCapIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function AlertCircleIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function PenToolIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function MessageSquareIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ─── Halaman Utama Laporan Analitik Dosen (Image Desain Baru) ─── */
export default function LecturerAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    summary: {
      totalClasses: 0,
      totalStudents: 0,
      avgIndex: 0,
      avgTrend: '+3.2%',
      totalHighlights: 0,
      totalQuestions: 0,
      criticalCount: 0,
    },
    classes: [],
  });

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'critical' | 'good'
  const [sortBy, setSortBy] = useState('critical'); // 'critical' | 'highest' | 'lowest' | 'students'
  const [exportToast, setExportToast] = useState(false);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdClass, setCreatedClass] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/classes/dosen/analytics');
      if (res && res.classes) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load lecturer analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Filter & Search logic
  const filteredAndSortedClasses = useMemo(() => {
    let list = [...data.classes];

    // Filter tab
    if (filterTab === 'critical') {
      list = list.filter((c) => c.statusType === 'danger');
    } else if (filterTab === 'good') {
      list = list.filter((c) => c.statusType === 'success' || c.statusType === 'info');
    }

    // Search query
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.bottleneck?.text.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'critical') {
        const order = { danger: 0, warning: 1, info: 2, purple: 3, success: 4 };
        return (order[a.statusType] ?? 99) - (order[b.statusType] ?? 99);
      }
      if (sortBy === 'highest') {
        return b.understandingIndex - a.understandingIndex;
      }
      if (sortBy === 'lowest') {
        return a.understandingIndex - b.understandingIndex;
      }
      if (sortBy === 'students') {
        return b.studentCount - a.studentCount;
      }
      if (sortBy === 'questions') {
        return b.tutorQuestionCount - a.tutorQuestionCount;
      }
      return 0;
    });

    return list;
  }, [data.classes, filterTab, query, sortBy]);

  const criticalCount = data.classes.filter((c) => c.statusType === 'danger').length;
  const goodCount = data.classes.filter((c) => c.statusType === 'success' || c.statusType === 'info').length;

  const handleExport = () => {
    // Generate CSV data from classes
    const headers = ['Kode Kelas', 'Nama Kelas', 'Jumlah Mahasiswa', 'Modul', 'Sorotan', 'Tanya AI', 'Indeks Pemahaman', 'Gaya Belajar'];
    const rows = data.classes.map((c) => [
      c.code,
      `"${c.name}"`,
      c.studentCount,
      c.materialCount,
      c.highlightCount,
      c.tutorQuestionCount,
      `${c.understandingIndex}%`,
      `"${c.learningStyle}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Analitik_Dosen_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        {/* Sidebar Navigasi Dosen */}
        <StudentSidebar
          activeSection="analitik"
          onJoin={() => setShowCreateModal(true)}
        />

        {/* Kolom Konten Utama */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <StudentTopbar query={query} onQueryChange={setQuery} />

          <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-7 space-y-6">
            {/* Toast feedback ekspor */}
            {exportToast && (
              <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2.5">
                <ShieldCheckIcon size={18} />
                <span>Ringkasan analitik berhasil diekspor ke format CSV!</span>
              </div>
            )}

            {/* ── 1. Hero Card: Gerbang Analitik Pengajaran Sokratik ── */}
            <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#7E152C] via-[#6B1224] to-[#4A0A16] p-6 sm:p-8 lg:p-9 text-white shadow-[0_12px_32px_-12px_rgba(107,18,36,0.6)] border border-white/10">
              {/* Radial glow background accents */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div className="max-w-2xl">
                  {/* Badge Gerbang Sokratik */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-rose-200 border border-white/15 backdrop-blur-md">
                    <LightningIcon size={13} className="text-amber-300 animate-pulse" />
                    <span>GERBANG ANALITIK PENGAJARAN SOKRATIK</span>
                  </div>

                  {/* Heading */}
                  <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-[32px] leading-tight">
                    Laporan Analitik Kelas &amp; Pola Belajar Mahasiswa
                  </h1>

                  {/* Deskripsi */}
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/80 font-normal">
                    Pilih kelas yang diampu untuk melihat laporan analitik komprehensif, peta panas pemahaman materi,
                    klaster sorotan stabilo, dan rekomendasi pedagogis berbasis AI Sokratik.
                  </p>
                </div>

                {/* Tombol Ekspor */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black text-[#6B1224] shadow-md hover:bg-[#F9E8EC] transition active:scale-95 cursor-pointer"
                  >
                    <DownloadIcon size={14} className="text-[#6B1224]" />
                    <span>Ekspor Ringkasan Semua Kelas</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row of Hero Banner */}
              <div className="relative z-10 mt-7 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 border border-white/10">
                    <span>📅</span>
                    <span>Semester Ganjil 2025/2026</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-white/70 text-[11.5px]">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Sinkronisasi otomatis setiap 15 menit</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">URUTKAN:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl bg-black/30 border border-white/20 px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer hover:bg-black/40 transition"
                  >
                    <option value="critical" className="bg-[#6B1224] text-white">Bottleneck Terkritis</option>
                    <option value="highest" className="bg-[#6B1224] text-white">Indeks Pemahaman Tertinggi</option>
                    <option value="lowest" className="bg-[#6B1224] text-white">Indeks Pemahaman Terendah</option>
                    <option value="students" className="bg-[#6B1224] text-white">Jumlah Mahasiswa</option>
                    <option value="questions" className="bg-[#6B1224] text-white">Aktivitas Tanya AI</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── 2. 4 Top Metric Cards (KPI Summary) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {/* KPI 1: KELAS AKTIF DIAMPU */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#8B8391]">
                      KELAS AKTIF DIAMPU
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224]">
                      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#1E1C1E]">{data.summary.totalClasses}</span>
                    <span className="text-sm font-bold text-[#8B8391]">Kelas</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4]">
                  <span className="inline-block rounded-xl bg-[#FCFBFD] border border-[#F1EEF4] px-3 py-1 text-[11px] font-bold text-[#6C6267]">
                    {data.summary.totalStudents} Total Mahasiswa Terdaftar
                  </span>
                </div>
              </div>

              {/* KPI 2: RATA-RATA INDEKS */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#8B8391] flex items-center gap-1">
                      RATA-RATA INDEKS ⓘ
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M23 6l-9.5 9.5-5-5L1 18" />
                        <path d="M17 6h6v6" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1E1C1E]">{data.summary.avgIndex}%</span>
                    <span className="inline-flex items-center text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5">
                      {data.summary.avgTrend}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4]">
                  <div className="flex justify-between text-[10.5px] font-semibold text-[#8B8391] mb-1.5">
                    <span>Standar Mutu: 70%</span>
                    <span>Optimal: &gt;85%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EFECEF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, data.summary.avgIndex))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* KPI 3: TITIK SOROT STABILO */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#8B8391]">
                      TITIK SOROT STABILO
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <PenToolIcon size={20} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#1E1C1E]">
                      {data.summary.totalHighlights > 0 ? `${data.summary.totalHighlights.toLocaleString('id-ID')}+` : '0'}
                    </span>
                    <span className="text-sm font-bold text-[#8B8391]">Titik</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4]">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6C6267]">
                    <span className="text-amber-600">📍</span>
                    <span>{data.summary.totalQuestions.toLocaleString('id-ID')} Pertanyaan Sokratik diajukan</span>
                  </span>
                </div>
              </div>

              {/* KPI 4: PERLU INTERVENSI SEGERA */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-700">
                      PERLU INTERVENSI SEGERA
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <AlertCircleIcon size={20} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-rose-600">{data.summary.criticalCount}</span>
                    <span className="text-sm font-bold text-rose-600">Kelas</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4]">
                  <span className="inline-block rounded-xl bg-rose-50 border border-rose-200/60 px-3 py-1 text-[11px] font-bold text-rose-700">
                    {data.summary.criticalCount} Topik Bottleneck Kritis (&gt;65% bingung)
                  </span>
                </div>
              </div>
            </div>

            {/* ── 3. Filter Tabs & Search Row ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-extrabold transition-all cursor-pointer',
                    filterTab === 'all'
                      ? 'bg-[#6B1224] text-white shadow-sm'
                      : 'bg-white border border-[#F1EEF4] text-[#6C6267] hover:bg-[#FBF7F4]',
                  ].join(' ')}
                >
                  Semua Kelas ({data.classes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('critical')}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5',
                    filterTab === 'critical'
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'bg-white border border-[#F1EEF4] text-[#6C6267] hover:bg-rose-50 hover:text-rose-700',
                  ].join(' ')}
                >
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Perlu Tindak Lanjut ({criticalCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('good')}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5',
                    filterTab === 'good'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white border border-[#F1EEF4] text-[#6C6267] hover:bg-emerald-50 hover:text-emerald-700',
                  ].join(' ')}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Pemahaman Baik ({goodCount})</span>
                </button>
              </div>

              {/* Input Pencarian Khusus */}
              <div className="relative w-full sm:w-72 lg:w-80">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama kelas atau topik materi..."
                  className="w-full rounded-full border border-[#F1EEF4] bg-white px-4 py-2 pl-9 text-xs text-[#1E1C1E] placeholder:text-[#A79FAB] outline-none focus:border-[#6B1224] focus:ring-2 focus:ring-[#6B1224]/10 transition shadow-xs"
                />
                <span className="absolute left-3 top-2.5 text-[#A79FAB]">🔍</span>
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-[#A79FAB] hover:text-[#1E1C1E]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* ── 4. Grid Kartu Kelas Analitik ── */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 py-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-[24px] border border-[#F1EEF4] bg-white p-6 space-y-4 animate-pulse">
                    <div className="h-5 bg-gray-100 rounded-full w-2/3" />
                    <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                    <div className="h-24 bg-gray-100 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-gray-100 rounded-xl" />
                      <div className="h-10 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedClasses.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-[#E5E0EA] bg-[#FCFBFD] p-12 text-center my-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224]">
                  <GraduationCapIcon size={28} />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-[#1E1C1E]">
                  {query ? 'Tidak ada kelas yang cocok dengan pencarian' : 'Belum Ada Kelas yang Diampu'}
                </h3>
                <p className="mt-1 text-xs text-[#8B8391] max-w-sm mx-auto">
                  {query
                    ? 'Coba gunakan kata kunci lain untuk mencari nama kelas atau topik materi.'
                    : 'Buat kelas pertama Anda untuk mulai membagikan materi dan menganalisis pola pemahaman mahasiswa.'}
                </p>
                {!query && (
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#6B1224] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#80142A] transition active:scale-95 cursor-pointer"
                  >
                    <span>+ Buat Kelas Sekarang</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredAndSortedClasses.map((cls) => {
                  // Badge styling status tag
                  let statusBadgeClass = 'bg-sky-50 text-sky-700 border-sky-200/60';
                  if (cls.statusType === 'danger') {
                    statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200/60';
                  } else if (cls.statusType === 'success') {
                    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
                  } else if (cls.statusType === 'warning') {
                    statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200/60';
                  } else if (cls.statusType === 'purple') {
                    statusBadgeClass = 'bg-purple-50 text-purple-700 border-purple-200/60';
                  }

                  // Icon badge style inside understanding index box
                  let iconBadgeClass = 'bg-sky-100 text-sky-700';
                  let iconElement = 'Σ';
                  if (cls.statusType === 'danger') {
                    iconBadgeClass = 'bg-rose-100 text-rose-600';
                    iconElement = '!';
                  } else if (cls.statusType === 'success') {
                    iconBadgeClass = 'bg-emerald-100 text-emerald-700';
                    iconElement = '🛡️';
                  } else if (cls.statusType === 'warning') {
                    iconBadgeClass = 'bg-amber-100 text-amber-700';
                    iconElement = '🔥';
                  } else if (cls.statusType === 'purple') {
                    iconBadgeClass = 'bg-purple-100 text-purple-700';
                    iconElement = '📖';
                  }

                  return (
                    <div
                      key={cls.id}
                      className="rounded-[24px] border border-[#F1EEF4] bg-white p-5 sm:p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Status Tag & Class Code Row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold border ${statusBadgeClass}`}>
                            {cls.statusTag}
                          </span>
                          <span className="rounded-lg bg-[#F5F4F7] px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#6C6267]">
                            {cls.code}
                          </span>
                        </div>

                        {/* Nama Kelas & Info Jadwal */}
                        <h2 className="mt-3 text-base sm:text-[17px] font-black text-[#1E1C1E] tracking-tight line-clamp-1">
                          {cls.name}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[#8B8391] line-clamp-1">
                          {cls.semester}
                        </p>

                        {/* Indeks Pemahaman Box */}
                        <div className="mt-4 rounded-2xl border border-[#F1EEF4] bg-[#FAF9FB] p-3.5 flex items-center justify-between">
                          <div>
                            <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-[#A79FAB]">
                              INDEKS PEMAHAMAN
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="text-2xl font-black text-[#1E1C1E]">
                                {cls.understandingIndex}%
                              </span>
                              <span
                                className={[
                                  'inline-flex items-center text-[10.5px] font-bold rounded-full px-2 py-0.2',
                                  cls.trend.includes('-')
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200/50'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
                                ].join(' ')}
                              >
                                {cls.trend}
                              </span>
                            </div>
                          </div>
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-base ${iconBadgeClass}`}>
                            {iconElement}
                          </div>
                        </div>

                        {/* 4-Metric Grid (Mahasiswa, Modul, Sorotan, Tanya AI) */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] p-2.5">
                            <span className="text-sm">👥</span>
                            <div>
                              <p className="font-extrabold text-[#1E1C1E]">{cls.studentCount}</p>
                              <p className="text-[10px] text-[#8B8391]">Mahasiswa</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] p-2.5">
                            <span className="text-sm">📖</span>
                            <div>
                              <p className="font-extrabold text-[#1E1C1E]">{cls.materialCount}</p>
                              <p className="text-[10px] text-[#8B8391]">Modul</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] p-2.5">
                            <span className="text-sm">✏️</span>
                            <div>
                              <p className="font-extrabold text-[#1E1C1E]">{cls.highlightCount.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-[#8B8391]">Sorotan</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] p-2.5">
                            <span className="text-sm">💬</span>
                            <div>
                              <p className="font-extrabold text-[#1E1C1E]">{cls.tutorQuestionCount.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-[#8B8391]">Tanya AI</p>
                            </div>
                          </div>
                        </div>

                        {/* Bottleneck / Topik Utama Box */}
                        {cls.bottleneck && (
                          <div
                            className={[
                              'mt-3 rounded-xl p-3 text-xs',
                              cls.bottleneck.type === 'danger'
                                ? 'bg-rose-50/80 border border-rose-200/80 text-rose-900'
                                : 'bg-[#FAF9FB] border border-[#F1EEF4] text-[#1E1C1E]',
                            ].join(' ')}
                          >
                            <p
                              className={[
                                'text-[10.5px] font-extrabold uppercase tracking-wide',
                                cls.bottleneck.type === 'danger' ? 'text-rose-700' : 'text-[#8B8391]',
                              ].join(' ')}
                            >
                              {cls.bottleneck.label}
                            </p>
                            <p className="mt-0.5 font-bold leading-snug line-clamp-2">
                              {cls.bottleneck.text}
                            </p>
                          </div>
                        )}

                        {/* Gaya Belajar Dominan */}
                        <div className="mt-3 flex items-center justify-between text-[11px] pt-1">
                          <span className="text-[#8B8391]">Gaya Belajar Dominan:</span>
                          <span className="font-extrabold text-[#1E1C1E]">{cls.learningStyle}</span>
                        </div>
                      </div>

                      {/* Tombol Aksi Bawah */}
                      <div className="mt-5 pt-3 border-t border-[#F1EEF4] flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/analitik/${cls.id}`)}
                          className="flex-1 rounded-xl bg-[#6B1224] py-2.5 px-3 text-xs font-black text-white hover:bg-[#80142A] transition shadow-xs active:scale-98 cursor-pointer text-center"
                        >
                          Lihat Laporan Lengkap →
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/kelas/${cls.id}`)}
                          title="Buka Ruang Belajar & Diskusi Kelas"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F1EEF4] bg-[#FAF9FB] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition active:scale-95 cursor-pointer"
                        >
                          <GraduationCapIcon size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Buat Kelas Baru */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newCls) => {
          setShowCreateModal(false);
          setCreatedClass(newCls);
          fetchAnalytics();
        }}
      />

      {/* Modal Berhasil Buat Kelas */}
      <CreatedSuccessModal
        isOpen={Boolean(createdClass)}
        onClose={() => setCreatedClass(null)}
        createdClass={createdClass}
        onOpenClass={(id) => {
          setCreatedClass(null);
          navigate(`/kelas/${id}`);
        }}
      />
    </div>
  );
}

