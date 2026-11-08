import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';

/* ─── Ikon SVG Pembantu ─── */
function LightningIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function DownloadIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PenIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function MessageIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChartBarIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

function SparklesIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function RefreshIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ClipboardCopyIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckCircleIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/* ─── Komponen Halaman Analitik Lengkap Satu Kelas (Image 2) ─── */
export default function LecturerClassDetailedAnalytics() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [clusterFilter, setClusterFilter] = useState('all'); // 'all' | 'conceptual' | 'technical'
  const [query, setQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // State Rekomendasi Pengajaran AI Sokratik On-Demand
  const [recLoading, setRecLoading] = useState(false);
  const [recData, setRecData] = useState(null);
  const [recError, setRecError] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleGenerateRecommendation = async () => {
    setRecLoading(true);
    setRecError('');
    try {
      const res = await api(`/classes/${classId}/analytics/recommendation`, {
        method: 'POST',
      });
      setRecData(res);
      showToast('Rekomendasi pengajaran AI berhasil dirumuskan!');
    } catch (err) {
      console.error('Failed to get AI recommendation:', err);
      setRecError(err.message || 'Gagal memuat rekomendasi pengajaran');
      showToast('Gagal memuat rekomendasi pengajaran.');
    } finally {
      setRecLoading(false);
    }
  };

  const handleCopyRecommendation = () => {
    if (!recData || !data) return;
    const lines = [
      `=== REKOMENDASI PENGAJARAN AI SOKRATIK ===`,
      `Mata Kuliah: ${data.classInfo.name} (${data.classInfo.code})`,
      `Waktu Analisis: ${new Date(recData.generatedAt || Date.now()).toLocaleString('id-ID')}`,
      '',
      `1. RINGKASAN KONDISI KELAS:`,
      recData.summary || '-',
      '',
      `2. IDENTIFIKASI KENDALA & MISKONSEPSI MAHASISWA:`,
      ...(recData.challenges || []).map((c, i) => `   ${i + 1}. ${c}`),
      '',
      `3. SARAN STRATEGI PENGAJARAN DI KELAS:`,
      ...(recData.teachingSuggestions || []).map((s, i) => `   ${i + 1}. ${s}`),
      '',
      `4. REKOMENDASI TINDAK LANJUT MANDIRI:`,
      ...(recData.followUpActions || []).map((a, i) => `   ${i + 1}. ${a}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Rekomendasi berhasil disalin ke papan klip!');
  };

  const fetchDetailedAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(`/classes/${classId}/analytics/detailed`);
      setData(res);
    } catch (err) {
      console.error('Failed to load detailed class analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchDetailedAnalytics();
  }, [fetchDetailedAnalytics]);

  // Filter klaster frasa
  const filteredClusters = useMemo(() => {
    if (!data?.clusters) return [];
    if (clusterFilter === 'all') return data.clusters;
    return data.clusters.filter((c) => c.category === clusterFilter);
  }, [data?.clusters, clusterFilter]);

  const handleExport = () => {
    if (!data) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Laporan Analitik Kelas', data.classInfo.name, data.classInfo.code],
        ['Indeks Pemahaman', `${data.kpis.understandingIndex}%`],
        ['Total Titik Sorotan Stabilo', data.kpis.highlightTotal],
        ['Total Tanya Jawab Tutor AI', data.kpis.tutorQuestionsTotal],
        ['Topik Kritis', data.heatmap?.criticalModule?.title || ''],
        [],
        ['MODUL', 'KEPADATAN', 'KEBINGUNGAN', 'WAKTU BACA', 'KEMANDIRIAN'],
        ...data.heatmap.modules.map((m) => [
          m.title,
          m.density,
          m.frFlags,
          m.readingTime,
          m.socraticIndependence,
        ]),
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Analitik_${data.classInfo.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan analitik lengkap kelas berhasil diunduh (CSV/Excel)!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6B1224] border-t-transparent" />
          <p className="text-xs font-bold text-[#8B8391] animate-pulse">
            Menganalisis respon &amp; sorotan mahasiswa dengan AI Sokratik...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center p-4">
        <div className="rounded-[24px] bg-white p-8 text-center max-w-md shadow-sm border border-[#F1EEF4]">
          <p className="text-sm font-bold text-red-600">Gagal memuat data analitik kelas.</p>
          <button
            type="button"
            onClick={() => navigate('/analitik')}
            className="mt-4 rounded-full bg-[#6B1224] px-5 py-2 text-xs font-bold text-white hover:bg-[#80142A]"
          >
            Kembali ke Daftar Analitik
          </button>
        </div>
      </div>
    );
  }

  const { classInfo, kpis, heatmap, clusters, learningPattern } = data;

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        {/* Sidebar Navigasi */}
        <StudentSidebar activeSection="analitik" />

        {/* Kolom Konten Utama */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <StudentTopbar query={query} onQueryChange={setQuery} />

          <main className="flex-1 px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pt-7 space-y-6">
            {/* Toast Feedback */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#6B1224] px-5 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2.5 border border-white/20">
                <SparklesIcon size={16} className="text-amber-300" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* ── 1. Header Card Analitik Pemahaman & Pola Belajar ── */}
            <div className="rounded-[26px] border border-[#F1EEF4] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="max-w-2xl">
                  {/* Badge Baris Atas */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F9E8EC] px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-[#6B1224] border border-[#F3D7DD]">
                      <LightningIcon size={13} className="text-[#6B1224]" />
                      <span>SOFTPHAM INTELLIGENCE ENGINE</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F4F7] px-2.5 py-1 text-[10px] font-bold text-[#6C6267]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>LIVE DATA SYNC</span>
                    </span>
                  </div>

                  {/* Judul & Deskripsi */}
                  <h1 className="mt-3 text-2xl font-black tracking-tight text-[#1E1C1E] sm:text-3xl lg:text-[29px] leading-tight">
                    Laporan Analitik Pemahaman &amp; Pola Belajar Mahasiswa
                  </h1>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-[#6C6267]">
                    Analisa agregat berbasis interaksi sorotan (stabilo), sesi tanya jawab tutor AI Sokratik, dan daya serap materi secara holistik.
                  </p>
                </div>

                {/* Kanan Atas: Badge Kelas & Tombol Aksi */}
                <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                  <div className="rounded-xl bg-[#F9E8EC] border border-[#F3D7DD] px-3.5 py-1.5 text-xs font-black text-[#6B1224]">
                    {classInfo.name} ({classInfo.semester})
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] px-3 py-1.5 font-bold text-[#6C6267] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer"
                    >
                      <span>📅</span>
                      <span>30 Hari Terakhir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] px-3 py-1.5 font-bold text-[#6C6267] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer"
                    >
                      <DownloadIcon size={13} />
                      <span>Ekspor (PDF/XLS)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/kelola/${classId}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#F1EEF4] bg-[#FCFBFD] px-3 py-1.5 font-bold text-[#6C6267] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer"
                    >
                      <span>⚙️</span>
                      <span>Mode Dosen</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Baris Bawah Header */}
              <div className="mt-6 pt-4 border-t border-[#F1EEF4] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#8B8391]">
                <div className="flex flex-wrap items-center gap-5">
                  <span className="flex items-center gap-1.5 text-[#1E1C1E] font-bold">
                    <span>👥</span>
                    <span>{classInfo.studentCount} Mahasiswa Aktif</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#1E1C1E] font-bold">
                    <span>📖</span>
                    <span>{classInfo.materialCount} Modul Kuliah</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#8B8391]">
                    <span>🕒</span>
                    <span>Pembaruan Terakhir: {classInfo.lastUpdated}</span>
                  </span>
                </div>

                <Link
                  to="/analitik"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6B1224] hover:underline"
                >
                  ← Kembali ke Ringkasan Semua Kelas
                </Link>
              </div>
            </div>

            {/* ── 2. 4 Top KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Rata-Rata Indeks Pemahaman */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B8391]">
                      Rata-Rata Indeks Pemahaman
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224]">
                      <ChartBarIcon size={16} />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-black text-[#1E1C1E]">
                    {kpis.understandingIndex}%
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4] flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {kpis.understandingTrend}
                  </span>
                  <span className="text-[#8B8391]">Status: <strong className="text-[#1E1C1E]">{kpis.understandingStatus}</strong></span>
                </div>
              </div>

              {/* Card 2: Titik Sorotan Stabilo */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B8391]">
                      Titik Sorotan Stabilo
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <PenIcon size={16} />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-black text-[#1E1C1E]">
                    {kpis.highlightTotal.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4] space-y-1.5">
                  <div className="h-2 w-full rounded-full overflow-hidden flex bg-[#FAF9FB]">
                    <div className="h-full bg-amber-400" style={{ width: '45%' }} title="45% Kuning (Konseptual)" />
                    <div className="h-full bg-emerald-500" style={{ width: '35%' }} title="35% Hijau (Teknikal)" />
                    <div className="h-full bg-orange-500" style={{ width: '20%' }} title="20% Oranye (Kritis)" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#8B8391]">
                    45% Kuning · 35% Hijau · 20% Oranye
                  </p>
                </div>
              </div>

              {/* Card 3: Tanya Jawab Tutor AI */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B8391]">
                      Tanya Jawab Tutor AI
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#6B1224] text-white">
                      <MessageIcon size={16} />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-black text-[#1E1C1E]">
                    {kpis.tutorQuestionsTotal.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4] flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#8B8391]">{kpis.tutorAvgPerStudent}</span>
                  <span className="text-[#6B1224] bg-[#F9E8EC] px-2 py-0.5 rounded-full">
                    {kpis.tutorSelfResolved}
                  </span>
                </div>
              </div>

              {/* Card 4: Bottleneck Konsep Kritis */}
              <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                      Bottleneck Konsep Kritis
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <AlertTriangleIcon size={16} />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-black text-rose-600">
                    {kpis.bottleneckCount} Topik
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1EEF4]">
                  <a
                    href="#rekomendasi-ai"
                    className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 hover:underline"
                  >
                    <span>{kpis.bottleneckNote}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ── 3. Section Heat Map Pemahaman per Modul & Slide ── */}
            <div className="rounded-[26px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#1E1C1E] flex items-center gap-2">
                    <span>▦</span>
                    <span>Peta Panas (Heat Map) Pemahaman per Modul &amp; Slide</span>
                  </h2>
                  <p className="text-xs text-[#8B8391] mt-0.5">
                    Melihat tingkat kesulitan berdasarkan intensitas penandaan stabilo, frekuensi evaluasi AI, dan waktu retensi baca.
                  </p>
                </div>

                {/* Legend Heatmap */}
                <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#8B8391] shrink-0">
                  <span>Mudah / Paham</span>
                  <div className="flex items-center gap-1">
                    <span className="h-3.5 w-3.5 rounded bg-[#FDE8ED]" />
                    <span className="h-3.5 w-3.5 rounded bg-[#F8BDCC]" />
                    <span className="h-3.5 w-3.5 rounded bg-[#E65C7B]" />
                    <span className="h-3.5 w-3.5 rounded bg-[#6B1224]" />
                  </div>
                  <span>Sulit / Bingung</span>
                </div>
              </div>

              {/* Tabel Heatmap Responsif atau Empty State jika belum ada materi */}
              {heatmap.modules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5E0EA] bg-[#FAF9FB] p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224] text-xl mb-3">
                    📖
                  </div>
                  <h3 className="text-sm font-black text-[#1E1C1E]">Belum Ada Modul Materi di Kelas Ini</h3>
                  <p className="text-xs text-[#8B8391] mt-1 max-w-md mx-auto">
                    Unggah modul materi PDF atau materi teks pertama melalui menu Kelola Kelas. Peta panas pemahaman mahasiswa akan otomatis terbangun saat mahasiswa mulai membaca dan menyoroti materi.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/kelola/${classId}`)}
                    className="mt-4 rounded-full bg-[#6B1224] px-5 py-2 text-xs font-black text-white hover:bg-[#80142A] transition cursor-pointer"
                  >
                    + Unggah Modul Sekarang
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto pb-2">
                    <table className="w-full min-w-[760px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#F1EEF4] text-[11px] font-extrabold text-[#8B8391]">
                          <th className="py-3 px-3 w-48">Indikator Pemahaman</th>
                          {heatmap.modules.map((m) => (
                            <th key={m.id} className="py-3 px-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[#1E1C1E] font-black">Modul {m.index}</span>
                                {m.isCritical && (
                                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" title="Topik Kritis" />
                                )}
                              </div>
                              <p className="text-[10px] text-[#A79FAB] font-normal truncate max-w-[110px] mx-auto">
                                {m.title}
                              </p>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold divide-y divide-[#F9F7FA]">
                        {/* Row 1: Kepadatan Sorotan */}
                        <tr>
                          <td className="py-3 px-3 text-[#1E1C1E] font-semibold text-[11.5px] flex items-center gap-2">
                            <span>✏️</span>
                            <span>Kepadatan Sorotan (Highlight Density)</span>
                          </td>
                          {heatmap.modules.map((m) => {
                            const isHigh = m.isCritical;
                            return (
                              <td key={m.id} className="py-2.5 px-2 text-center">
                                <div
                                  className={[
                                    'rounded-xl py-2 px-2 text-[11.5px] font-black transition',
                                    isHigh
                                      ? 'bg-[#6B1224] text-white shadow-xs'
                                      : m.densityVal > 300
                                      ? 'bg-[#C53556] text-white'
                                      : m.densityVal > 220
                                      ? 'bg-[#F9D0DA] text-[#6B1224]'
                                      : 'bg-[#FDF0F3] text-[#80142A]',
                                  ].join(' ')}
                                >
                                  {m.density}
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row 2: Tingkat Kebingungan (FR Flags) */}
                        <tr>
                          <td className="py-3 px-3 text-[#1E1C1E] font-semibold text-[11.5px] flex items-center gap-2">
                            <span>🚩</span>
                            <span>Tingkat Kebingungan (FR Flags)</span>
                          </td>
                          {heatmap.modules.map((m) => {
                            const isHigh = m.isCritical;
                            return (
                              <td key={m.id} className="py-2.5 px-2 text-center">
                                <div
                                  className={[
                                    'rounded-xl py-2 px-2 text-[11.5px] font-black transition',
                                    isHigh
                                      ? 'bg-[#6B1224] text-white shadow-xs'
                                      : m.frFlagsVal > 40
                                      ? 'bg-[#96263C] text-white'
                                      : m.frFlagsVal > 20
                                      ? 'bg-[#F9D0DA] text-[#6B1224]'
                                      : 'bg-[#FDF0F3] text-[#80142A]',
                                  ].join(' ')}
                                >
                                  {m.frFlags}
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row 3: Waktu Retensi Baca Rata-rata */}
                        <tr>
                          <td className="py-3 px-3 text-[#1E1C1E] font-semibold text-[11.5px] flex items-center gap-2">
                            <span>⏱</span>
                            <span>Waktu Retensi Baca Rata-rata</span>
                          </td>
                          {heatmap.modules.map((m) => {
                            const isHigh = m.isCritical;
                            return (
                              <td key={m.id} className="py-2.5 px-2 text-center">
                                <div
                                  className={[
                                    'rounded-xl py-2 px-2 text-[11px] font-black transition',
                                    isHigh
                                      ? 'bg-[#6B1224] text-white shadow-xs'
                                      : 'bg-[#F8F6F9] text-[#6C6267]',
                                  ].join(' ')}
                                >
                                  {m.readingTime}
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row 4: Kemandirian Refleksi Sokratik */}
                        <tr>
                          <td className="py-3 px-3 text-[#1E1C1E] font-semibold text-[11.5px] flex items-center gap-2">
                            <span>💡</span>
                            <span>Kemandirian Refleksi Sokratik</span>
                          </td>
                          {heatmap.modules.map((m) => {
                            const isHigh = m.isCritical;
                            return (
                              <td key={m.id} className="py-2.5 px-2 text-center">
                                <div
                                  className={[
                                    'rounded-xl py-2 px-2 text-[11.5px] font-black transition',
                                    isHigh
                                      ? 'bg-[#6B1224] text-white shadow-xs'
                                      : 'bg-[#FDF0F3] text-[#6B1224]',
                                  ].join(' ')}
                                >
                                  {m.socraticIndependence}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Callout Catatan Kritis Sokratik */}
                  {heatmap.criticalModule && (
                    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white font-black text-sm">
                          💬
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-rose-950">
                            Catatan Kritis Sokratik: {heatmap.criticalModule.title} ({heatmap.criticalModule.slide})
                          </h3>
                          <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                            {heatmap.criticalModule.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('klaster-konsep');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="rounded-full bg-[#6B1224] px-4 py-2 text-xs font-black text-white hover:bg-[#80142A] transition shadow-xs cursor-pointer shrink-0"
                      >
                        Lihat Detail Analitik →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── 4. Dua Kolom: Klaster Frasa & Distribusi Pola Belajar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="klaster-konsep">
              {/* Kolom Kiri (7/12): Klaster Frasa & Konsep Krusial */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-[26px] border border-[#F1EEF4] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base sm:text-[17px] font-black text-[#1E1C1E] flex items-center gap-2">
                        <span>✏️</span>
                        <span>Klaster Frasa &amp; Konsep Krusial</span>
                      </h2>
                      <p className="text-xs text-[#8B8391] mt-0.5">
                        Paling sering disorot berdasarkan intensitas warna stabilo mahasiswa
                      </p>
                    </div>
                    <span className="rounded-xl bg-[#FAF9FB] border border-[#F1EEF4] px-2.5 py-1 text-[10.5px] font-extrabold text-[#6C6267] self-start sm:self-auto">
                      117 Teks Teridentifikasi
                    </span>
                  </div>

                  {/* Filter Tabs Klaster */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setClusterFilter('all')}
                      className={[
                        'rounded-full px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer',
                        clusterFilter === 'all'
                          ? 'bg-[#6B1224] text-white shadow-xs'
                          : 'bg-[#FCFBFD] border border-[#F1EEF4] text-[#6C6267] hover:bg-[#F9E8EC]',
                      ].join(' ')}
                    >
                      Semua Klaster ({clusters.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setClusterFilter('conceptual')}
                      className={[
                        'rounded-full px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5',
                        clusterFilter === 'conceptual'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-[#FCFBFD] border border-[#F1EEF4] text-[#6C6267] hover:bg-amber-50 hover:text-amber-800',
                      ].join(' ')}
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>Stabilo Kuning (Konseptual)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClusterFilter('technical')}
                      className={[
                        'rounded-full px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5',
                        clusterFilter === 'technical'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-[#FCFBFD] border border-[#F1EEF4] text-[#6C6267] hover:bg-emerald-50 hover:text-emerald-800',
                      ].join(' ')}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Hijau Neon (Teknikal)</span>
                    </button>
                  </div>

                  {/* List Kartu Klaster */}
                  <div className="space-y-3.5 pt-2">
                    {filteredClusters.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#E5E0EA] bg-[#FAF9FB] p-8 text-center">
                        <p className="text-xs font-bold text-[#1E1C1E]">Belum Ada Sorotan Stabilo Mahasiswa</p>
                        <p className="text-[11px] text-[#8B8391] mt-1">
                          Ketika mahasiswa membaca materi dan menandai teks dengan stabilo, klaster konsep krusial akan otomatis diidentifikasi di sini.
                        </p>
                      </div>
                    ) : (
                      filteredClusters.map((c) => {
                        let priorityClass = 'bg-rose-50 text-rose-700 border-rose-200/60';
                        if (c.priorityType === 'warning') {
                          priorityClass = 'bg-amber-50 text-amber-700 border-amber-200/60';
                        } else if (c.priorityType === 'success') {
                          priorityClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
                        }

                        return (
                          <div
                            key={c.id}
                            className="rounded-2xl border border-[#F1EEF4] bg-[#FAF9FB] p-4 sm:p-5 transition hover:shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                                  <h3 className="text-sm font-black text-[#1E1C1E]">
                                    &ldquo;{c.title}&rdquo;
                                  </h3>
                                  <span className="text-sm font-black text-[#6B1224]">{c.percentage}</span>
                                </div>
                                <p className="mt-1 text-[11px] font-semibold text-[#8B8391]">
                                  {c.subtitle}
                                </p>
                              </div>
                              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide border shrink-0 ${priorityClass}`}>
                                {c.priority}
                              </span>
                            </div>

                            {/* Tag Metrics */}
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#6C6267]">
                              {c.stats.map((s, idx) => (
                                <span key={idx} className="rounded-lg bg-white border border-[#F1EEF4] px-2.5 py-1">
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Kotak Catatan Mahasiswa */}
                            <div className="mt-3.5 rounded-xl border border-white/80 bg-white p-3 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold text-[#1E1C1E] italic">
                                {c.quote}
                              </p>
                              <span className="shrink-0 rounded-lg bg-[#FAF9FB] border border-[#F1EEF4] px-2.5 py-1 text-[10.5px] font-extrabold text-[#6B1224]">
                                Bukti {c.proofCount} Mhs ↗
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan (5/12): Distribusi Pola Belajar & Sampel Preview */}
              <div className="lg:col-span-5 space-y-4">
                {/* Kartu Distribusi Pola Belajar */}
                <div className="rounded-[26px] border border-[#F1EEF4] bg-white p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-[#1E1C1E] flex items-center gap-2">
                      <span>🍩</span>
                      <span>Distribusi Pola Belajar</span>
                    </h2>
                    <span className="rounded-xl bg-[#FAF9FB] border border-[#F1EEF4] px-2.5 py-1 text-[10.5px] font-extrabold text-[#6C6267]">
                      3 Kategori Utama
                    </span>
                  </div>

                  {/* Donut Chart Visual SVG & Legend */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* SVG Donut */}
                    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        {/* Circle background */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F1EEF4" strokeWidth="4.5" />
                        {/* Segment 1: Reflektif (44%) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#6B1224"
                          strokeWidth="4.5"
                          strokeDasharray="38.7 88"
                          strokeDashoffset="0"
                        />
                        {/* Segment 2: Prosedural (32%) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#1E7E34"
                          strokeWidth="4.5"
                          strokeDasharray="28.1 88"
                          strokeDashoffset="-38.7"
                        />
                        {/* Segment 3: Eksploratif (24%) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#D97706"
                          strokeWidth="4.5"
                          strokeDasharray="21.1 88"
                          strokeDashoffset="-66.8"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="block text-xl font-black text-[#1E1C1E] leading-none">
                          {learningPattern.totalStudents}
                        </span>
                        <span className="text-[10px] font-bold text-[#8B8391]">Mahasiswa</span>
                      </div>
                    </div>

                    {/* Legend Detail */}
                    <div className="flex-1 space-y-2.5 text-xs">
                      {learningPattern.categories.map((cat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span
                            className="h-3 w-3 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div>
                            <p className="font-extrabold text-[#1E1C1E]">
                              {cat.name} <span className="text-[#6B1224]">({cat.percentage}%)</span>
                            </p>
                            <p className="text-[10.5px] text-[#8B8391] leading-tight">
                              {cat.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Waktu Belajar Puncak Banner */}
                  <div className="space-y-2.5 pt-2 border-t border-[#F1EEF4]">
                    <div className="rounded-xl bg-[#FAF9FB] border border-[#F1EEF4] p-3">
                      <p className="text-[11.5px] font-black text-[#1E1C1E] flex items-center gap-1.5">
                        <span>⏰</span>
                        <span>Waktu Belajar Puncak (Peak Hours): {learningPattern.peakHours}</span>
                      </p>
                      <p className="text-[11px] text-[#6C6267] mt-1 leading-snug">
                        {learningPattern.peakHoursNote}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50/80 border border-amber-200/60 p-3">
                      <p className="text-[11.5px] font-black text-amber-900 flex items-center gap-1.5">
                        <span>💡</span>
                        <span>{learningPattern.evaluationRecommendation}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kartu Sampel Materi & Catatan Preview */}
                <div className="rounded-[26px] border border-[#F1EEF4] bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-[#1E1C1E] flex items-center gap-1.5">
                      <span>📖</span>
                      <span>Sampel Materi &amp; Catatan Real-time</span>
                    </span>
                    <Link
                      to={`/kelas/${classId}`}
                      className="text-[#6B1224] hover:underline font-extrabold text-[11px]"
                    >
                      Buka Materi ↗
                    </Link>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-[#F1EEF4] bg-gradient-to-br from-[#7D152C] via-[#6B1224] to-[#4F0D1A] p-4 text-white">
                    <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-wider">
                      DOKUMEN KULIAH AKTIF
                    </p>
                    <p className="text-sm font-extrabold text-white mt-1">
                      {classInfo.name} · Modul Interaktif
                    </p>
                    {classInfo.materialCount === 0 ? (
                      <div className="mt-3 rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/15 text-[11px] space-y-1">
                        <p className="font-semibold text-white/90">Belum Ada Materi Diunggah</p>
                        <p className="text-white/70 text-[10px]">
                          Unggah materi di menu Kelola Kelas agar mahasiswa dapat membaca dan menyoroti materi.
                        </p>
                      </div>
                    ) : clusters.length > 0 ? (
                      <div className="mt-3 rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/15 text-[11px] space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="font-semibold text-white/90">{clusters[0].title}</span>
                        </div>
                        <p className="text-white/70 text-[10px]">
                          {clusters[0].stats[0]} · {clusters[0].quote}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/15 text-[11px] space-y-1">
                        <p className="font-semibold text-white/90">Menunggu Sorotan Mahasiswa</p>
                        <p className="text-white/70 text-[10px]">
                          Materi telah tersedia. Kutipan paragraf paling aktif akan tampil otomatis saat mahasiswa menyoroti teks.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. Rekomendasi & Saran Pengajaran AI Sokratik (On-Demand AI Engine Berdasarkan DB) ── */}
            <div
              id="rekomendasi-ai"
              className="rounded-[26px] border border-[#F1EEF4] bg-white p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Header Rekomendasi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6B1224] text-white shadow-xs">
                    <SparklesIcon size={20} className="text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#1E1C1E]">
                      Saran & Rekomendasi Pengajaran AI Sokratik
                    </h2>
                    <p className="text-xs text-[#6C6267] mt-1 leading-relaxed max-w-2xl">
                      Hasilkan analisis pedagogis terarah berdasarkan respon pertanyaan dan sorotan mahasiswa di database mata kuliah ini.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {recData ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyRecommendation}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#E5E0EA] bg-white px-3.5 py-2 text-xs font-bold text-[#1E1C1E] hover:bg-[#FAF9FB] transition cursor-pointer"
                        title="Salin rekomendasi ke papan klip"
                      >
                        <ClipboardCopyIcon size={14} className="text-[#6C6267]" />
                        <span>Salin Teks</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateRecommendation}
                        disabled={recLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#F3D7DD] bg-[#F9E8EC] px-3.5 py-2 text-xs font-black text-[#6B1224] hover:bg-[#F3D7DD] transition disabled:opacity-50 cursor-pointer"
                        title="Analisis ulang berdasarkan data terbaru"
                      >
                        <RefreshIcon size={14} className={recLoading ? 'animate-spin' : ''} />
                        <span>{recLoading ? 'Menganalisis...' : 'Analisis Ulang'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateRecommendation}
                      disabled={recLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#6B1224] px-5 py-2.5 text-xs font-black text-white hover:bg-[#80142A] transition shadow-xs active:scale-98 disabled:opacity-60 cursor-pointer"
                    >
                      {recLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Menganalisis Data Belajar Mahasiswa...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon size={16} className="text-amber-300" />
                          <span>Buat Rekomendasi Pengajaran AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* State 1: Error Notification */}
              {recError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangleIcon size={16} className="text-rose-600 shrink-0" />
                    <span>{recError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateRecommendation}
                    className="shrink-0 rounded-lg bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* State 2: Loading State */}
              {recLoading && (
                <div className="rounded-2xl border border-[#F1EEF4] bg-[#FAF9FB] p-8 text-center space-y-3">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-[#6B1224] border-t-transparent" />
                  <p className="text-xs font-extrabold text-[#1E1C1E]">
                    Sedang Menganalisis Data Belajar Mahasiswa...
                  </p>
                  <p className="text-[11px] text-[#8B8391] max-w-md mx-auto">
                    AI Sokratik sedang menelaah catatan materi, sorotan stabilo, pertanyaan tutor AI, dan tingkat pemahaman kelas {classInfo.name}.
                  </p>
                </div>
              )}

              {/* State 3: Belum Digenerate (Initial State) */}
              {!recLoading && !recData && (
                <div className="rounded-2xl border border-dashed border-[#DDD7E3] bg-[#FCFBFD] p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224]">
                    <SparklesIcon size={24} className="text-[#6B1224]" />
                  </div>
                  <div className="max-w-xl space-y-1.5">
                    <h3 className="text-sm font-black text-[#1E1C1E]">
                      Belum Ada Rekomendasi yang Dibuat
                    </h3>
                    <p className="text-xs text-[#6C6267] leading-relaxed">
                      Klik tombol di atas untuk memerintahkan AI menganalisis data riil aktivitas belajar pada kelas{' '}
                      <span className="font-bold text-[#1E1C1E]">{classInfo.name}</span>. AI akan mengidentifikasi konsep yang membingungkan mahasiswa serta memberikan panduan strategi tatap muka sesi berikutnya.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-bold text-[#8B8391]">
                    <span className="rounded-lg bg-white border border-[#F1EEF4] px-3 py-1">
                      📚 {classInfo.materialCount} Materi Kuliah
                    </span>
                    <span className="rounded-lg bg-white border border-[#F1EEF4] px-3 py-1">
                      👥 {classInfo.studentCount} Mahasiswa Terdaftar
                    </span>
                    <span className="rounded-lg bg-white border border-[#F1EEF4] px-3 py-1">
                      ✏️ {kpis.highlightTotal} Sorotan Stabilo
                    </span>
                    <span className="rounded-lg bg-white border border-[#F1EEF4] px-3 py-1">
                      💬 {kpis.tutorQuestionsTotal} Pertanyaan AI
                    </span>
                  </div>
                </div>
              )}

              {/* State 4: Hasil Rekomendasi Terstruktur dari DB & AI */}
              {!recLoading && recData && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Block 1: Ringkasan Kondisi Kelas */}
                  <div className="rounded-2xl border-l-4 border-l-[#6B1224] border border-[#F1EEF4] bg-[#FAF9FB] p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#6B1224]">
                        Ringkasan Evaluasi Belajar Kelas
                      </span>
                      {recData.generatedAt && (
                        <span className="text-[10px] font-bold text-[#8B8391]">
                          Dianalisis: {new Date(recData.generatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#1E1C1E] font-medium leading-relaxed">
                      {recData.summary}
                    </p>
                  </div>

                  {/* Block 2 & 3: Dua Kolom (Kendala & Saran Pengajaran) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Kolom Kiri: Identifikasi Kendala */}
                    <div className="rounded-2xl border border-[#F1EEF4] bg-white p-5 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#F1EEF4]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-700 text-xs font-black">
                          ⚠️
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1E1C1E]">
                          Identifikasi Kendala &amp; Miskonsepsi
                        </h4>
                      </div>
                      <ul className="space-y-2.5">
                        {(recData.challenges || []).map((ch, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#4A454E] leading-relaxed">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{ch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Kolom Kanan: Saran Strategi Pengajaran di Kelas */}
                    <div className="rounded-2xl border border-[#F1EEF4] bg-white p-5 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#F1EEF4]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F9E8EC] text-[#6B1224] text-xs font-black">
                          💡
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1E1C1E]">
                          Saran Strategi Pengajaran di Kelas
                        </h4>
                      </div>
                      <ul className="space-y-2.5">
                        {(recData.teachingSuggestions || []).map((sg, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#4A454E] leading-relaxed">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F9E8EC] text-[10px] font-black text-[#6B1224]">
                              {idx + 1}
                            </span>
                            <span>{sg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Block 4: Rekomendasi Tindak Lanjut Mandiri */}
                  <div className="rounded-2xl border border-[#F1EEF4] bg-[#FAF9FB] p-5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#ECE7EF]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">
                        ✓
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#1E1C1E]">
                        Rekomendasi Tindak Lanjut Mandiri Mahasiswa
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(recData.followUpActions || []).map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-[#ECE7EF] bg-white p-3 text-xs text-[#4A454E] leading-relaxed"
                        >
                          <CheckCircleIcon size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

