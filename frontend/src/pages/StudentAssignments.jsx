import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClipboardIcon,
  LayersIcon,
  LinkIcon,
  SparkleIcon,
  UploadIcon,
  XIcon,
} from '../components/student/Icons.jsx';

function FileIcon({ size = 16, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function CalendarIcon({ size = 15, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

function fmtDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const overdue = d < new Date();
  const label =
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return { label, overdue };
}

function extractPdfFromDesc(text) {
  if (!text) return null;
  const m = text.match(/\[(?:Lampiran PDF:\s*)?([^\]]+)\]\(([^)]+\.pdf[^)]*)\)/i) ||
            text.match(/(https?:\/\/[^\s]+\.pdf|\/uploads\/[^\s]+\.pdf)/i);
  if (!m) return null;
  if (m[2]) return { name: m[1], url: m[2] };
  const rawUrl = m[1] || m[0];
  const name = rawUrl.split('/').pop() || 'Dokumen.pdf';
  return { name, url: rawUrl };
}

/* ─── PDF Viewer modal ─── */
function PdfViewer({ url, name, onClose }) {
  const fileUrl = url?.startsWith('http') || url?.startsWith('/') ? url : `/${url}`;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#1A1118]/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1118] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white shrink-0">
            PDF
          </span>
          <p className="truncate text-xs sm:text-[13px] font-bold text-white max-w-xs sm:max-w-md">{name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer no-underline"
          >
            <span>Buka / Unduh</span> ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white cursor-pointer transition"
            aria-label="Tutup"
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-[#2A2329]">
        <iframe
          src={`${fileUrl}#toolbar=1`}
          title={name}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState('pending'); // 'pending' | 'completed' | 'all'
  const [previewPdf, setPreviewPdf] = useState(null); // { url, name }
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinErr, setJoinErr] = useState('');

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api('/classes/student/assignments');
      setAssignments(Array.isArray(data) ? data : []);
      setErr('');
    } catch (e) {
      setErr(e.message || 'Gagal memuat daftar tugas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const submitJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    setJoinBusy(true);
    setJoinErr('');
    try {
      await api('/classes/join', { method: 'POST', body: { code } });
      setJoinCode('');
      setJoinOpen(false);
      await loadAssignments();
    } catch (e2) {
      setJoinErr(e2.message);
    } finally {
      setJoinBusy(false);
    }
  };

  /* Pembagian tugas: pending vs completed */
  const { pendingList, completedList } = useMemo(() => {
    const pending = [];
    const completed = [];
    for (const a of assignments) {
      if (a.submissions && a.submissions.length > 0) {
        completed.push(a);
      } else {
        pending.push(a);
      }
    }
    return { pendingList: pending, completedList: completed };
  }, [assignments]);

  /* Filter berdasarkan tab dan search query */
  const filteredList = useMemo(() => {
    let list = assignments;
    if (filterTab === 'pending') list = pendingList;
    else if (filterTab === 'completed') list = completedList;

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.class?.name || '').toLowerCase().includes(q)
    );
  }, [assignments, pendingList, completedList, filterTab, query]);

  // Statistik nilai
  const gradedSubmissions = completedList
    .map((a) => a.submissions?.[0]?.grade)
    .filter((g) => g != null && !isNaN(g));
  const avgGrade =
    gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((acc, v) => acc + v, 0) / gradedSubmissions.length)
      : null;

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        <StudentSidebar activeSection="tugas" onJoin={() => setJoinOpen(true)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopbar query={query} onQueryChange={setQuery} />

          {/* Quick nav mobile */}
          <div className="flex items-center gap-2 border-b border-[#F1EEF4] px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-[#8B8391] hover:text-[#6B1224]"
            >
              ← Kembali ke Beranda
            </button>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#6B1224] px-3.5 py-2 text-[11px] font-bold text-white cursor-pointer"
            >
              + Gabung Kelas
            </button>
          </div>

          <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-7">
            {err && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-[#F3D7DD] bg-[#FDF2F4] px-4 py-3 text-xs font-semibold text-[#96263C]"
              >
                {err}
              </div>
            )}

            {/* Header Hero */}
            <div className="relative overflow-hidden rounded-[24px] border border-[#F0E7EE] bg-[linear-gradient(112deg,#F7F4F9_0%,#FBEBF1_100%)] p-6 sm:p-8">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6B1224] shadow-xs">
                    <ClipboardIcon size={13} /> Tugas &amp; Evaluasi Pembelajaran
                  </span>
                  <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1E1C1E] sm:text-3xl">
                    Tugas Saya
                  </h1>
                  <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[#5B525C] sm:text-sm">
                    Pantau tenggat waktu, serahkan tugas kuliah, dan lihat evaluasi atau nilai dari dosen pengampu secara terorganisir.
                  </p>
                </div>

                {/* Stat cards mini */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
                  <div className="rounded-2xl border border-white/60 bg-white/90 p-3 sm:p-4 text-center shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#8B8391]">Belum Selesai</p>
                    <p className="mt-1 text-xl font-extrabold text-[#D05A6E]">{pendingList.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/90 p-3 sm:p-4 text-center shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#8B8391]">Selesai</p>
                    <p className="mt-1 text-xl font-extrabold text-[#16A34A]">{completedList.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/90 p-3 sm:p-4 text-center shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#8B8391]">Rata-rata</p>
                    <p className="mt-1 text-xl font-extrabold text-[#6B1224]">
                      {avgGrade != null ? avgGrade : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#F1EEF4] pb-4">
              <div className="flex items-center gap-2">
                {[
                  { key: 'pending', label: 'Belum Selesai', count: pendingList.length },
                  { key: 'completed', label: 'Selesai', count: completedList.length },
                  { key: 'all', label: 'Semua Tugas', count: assignments.length },
                ].map((t) => {
                  const isActive = filterTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setFilterTab(t.key)}
                      className={[
                        'flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-all cursor-pointer',
                        isActive
                          ? 'bg-[#6B1224] text-white shadow-[0_8px_16px_-8px_rgba(107,18,36,0.8)]'
                          : 'bg-[#F5F4F7] text-[#8B8391] hover:bg-[#F0EDF2] hover:text-[#1E1C1E]',
                      ].join(' ')}
                    >
                      <span>{t.label}</span>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-[#6B1224]',
                        ].join(' ')}
                      >
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {query && (
                <p className="text-xs text-[#8B8391]">
                  Menampilkan hasil untuk “<span className="font-bold text-[#1E1C1E]">{query}</span>”
                </p>
              )}
            </div>

            {/* Content List */}
            <div className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 rounded-[20px] border border-[#F1EEF4] bg-white p-6 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredList.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9E8EC] text-2xl text-[#6B1224]">
                    {filterTab === 'pending' ? '🎉' : '📋'}
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-[#1E1C1E]">
                    {filterTab === 'pending'
                      ? 'Luar biasa! Tidak ada tugas yang tertunda'
                      : filterTab === 'completed'
                      ? 'Belum ada tugas yang dikumpulkan'
                      : 'Belum ada tugas yang tersedia'}
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#8B8391]">
                    {filterTab === 'pending'
                      ? 'Semua tugas dari kelas yang kamu ikuti telah dikerjakan dan dikumpulkan dengan baik.'
                      : 'Tugas-tugas baru yang diterbitkan dosen akan otomatis muncul di halaman ini.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredList.map((assignment) => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                      onPreviewPdf={(pdf) => setPreviewPdf(pdf)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {previewPdf && (
        <PdfViewer
          url={previewPdf.url}
          name={previewPdf.name}
          onClose={() => setPreviewPdf(null)}
        />
      )}

      {/* Join dialog modal */}
      {joinOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[24px] border border-[#F1EEF4] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1EEF4]">
              <h2 className="text-base font-extrabold text-[#1E1C1E]">Gabung Kelas Baru</h2>
              <button
                type="button"
                onClick={() => setJoinOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#A79FAB] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] cursor-pointer"
              >
                <XIcon size={16} />
              </button>
            </div>
            <form onSubmit={submitJoin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8B8391] mb-1.5 uppercase tracking-wide">
                  Kode Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A1B2C3"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 font-mono text-sm tracking-wider uppercase text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white"
                />
                <p className="mt-1 text-[11px] text-[#A79FAB]">
                  Dapatkan 6 karakter kode kelas dari guru atau dosen pengampu.
                </p>
              </div>
              {joinErr && <p className="text-xs font-semibold text-red-600">{joinErr}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={joinBusy || !joinCode.trim()}
                  className="flex-1 rounded-full bg-[#6B1224] py-2.5 text-xs font-bold text-white transition hover:bg-[#80142A] disabled:opacity-40 cursor-pointer"
                >
                  {joinBusy ? 'Memproses...' : 'Gabung Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setJoinOpen(false)}
                  className="rounded-full border border-[#E7E1EA] px-5 py-2.5 text-xs font-bold text-[#8B8391] hover:bg-[#F5F4F7] cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Komponen Kartu Baris Tugas ─── */
function AssignmentRow({ assignment, onPreviewPdf }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const submission = assignment.submissions?.[0] || null;
  const isCompleted = !!submission;
  const due = assignment.dueDate ? fmtDue(assignment.dueDate) : null;
  const isOverdue = due?.overdue && !isCompleted;
  const taskPdf = extractPdfFromDesc(assignment.description);

  return (
    <article
      className={[
        'rounded-[20px] border bg-white p-5 sm:p-6 transition hover:shadow-md',
        isCompleted
          ? 'border-[#EAF5ED] bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FCFA_100%)]'
          : isOverdue
          ? 'border-[#F9E8EC] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF8FA_100%)]'
          : 'border-[#F1EEF4]',
      ].join(' ')}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Konten Kiri */}
        <div className="min-w-0 flex-1">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F4F7] px-3 py-1 text-[11px] font-bold text-[#6B1224]">
              <LayersIcon size={12} /> {assignment.class?.name || 'Kelas'}
            </span>
            {assignment.class?.code && (
              <span className="rounded-full border border-[#E7E1EA] bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#8B8391]">
                Kode: {assignment.class.code}
              </span>
            )}
            {due && (
              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                  isCompleted
                    ? 'bg-[#F5F4F7] text-[#8B8391]'
                    : isOverdue
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-700',
                ].join(' ')}
              >
                <CalendarIcon size={12} />
                {isOverdue && !isCompleted ? 'Terlambat · ' : ''}
                {due.label}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-extrabold text-green-800">
                <CheckIcon size={11} /> Sudah Dikumpulkan
              </span>
            )}
          </div>

          {/* Judul Tugas */}
          <h2 className="mt-2.5 text-[16px] font-extrabold tracking-tight text-[#1E1C1E]">
            {assignment.title}
          </h2>

          {/* Deskripsi & Soal */}
          {assignment.description && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#6C6267] line-clamp-3 whitespace-pre-wrap">
              {assignment.description}
            </p>
          )}

          {/* Lampiran Soal PDF dari Dosen jika ada */}
          {taskPdf && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => onPreviewPdf(taskPdf)}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition cursor-pointer shadow-2xs"
              >
                <FileIcon size={12} />
                <span>Lihat Soal / Panduan PDF Tugas</span>
              </button>
            </div>
          )}

          {/* Hasil Tugas yang Dikumpulkan Mahasiswa */}
          {submission && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50/70 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-[11px] font-bold">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-green-950">Jawaban / Berkas yang Kamu Kumpulkan</p>
                    <p className="text-[10px] text-green-700 font-medium">Diserahkan pada {fmtDate(submission.submittedAt)}</p>
                  </div>
                </div>

                {submission.grade != null ? (
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white shadow-2xs">
                    Nilai: {submission.grade}/100
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    Menunggu Penilaian Dosen
                  </span>
                )}
              </div>

              {/* Catatan / Feedback Dosen */}
              {submission.feedback && (
                <div className="rounded-xl bg-white/80 border border-green-200 p-2.5 text-xs text-green-950">
                  <span className="font-bold">Feedback Dosen:</span> <span className="italic">{submission.feedback}</span>
                </div>
              )}

              {/* Isi Jawaban Teks Mahasiswa */}
              {submission.content && (
                <div className="rounded-xl bg-white/90 border border-green-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-green-800">Jawaban Teks</p>
                    {submission.content.length > 150 && (
                      <button
                        type="button"
                        onClick={() => setShowFullContent((v) => !v)}
                        className="text-[10px] font-bold text-[#6B1224] hover:underline cursor-pointer"
                      >
                        {showFullContent ? 'Ciutkan' : 'Lihat Selengkapnya'}
                      </button>
                    )}
                  </div>
                  <p className={`text-[12px] text-[#1E1C1E] leading-relaxed whitespace-pre-wrap ${!showFullContent && submission.content.length > 150 ? 'line-clamp-3' : ''}`}>
                    {submission.content}
                  </p>
                </div>
              )}

              {/* Tautan Link Drive Mahasiswa */}
              {submission.linkUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={submission.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition no-underline"
                  >
                    <LinkIcon size={12} />
                    <span>Tautan: {submission.linkUrl}</span> ↗
                  </a>
                </div>
              )}

              {/* File PDF Mahasiswa */}
              {submission.fileUrl && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onPreviewPdf({ url: submission.fileUrl, name: submission.fileName || 'Jawaban Tugas Mahasiswa.pdf' })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                  >
                    <FileIcon size={12} />
                    <span>Lihat File PDF Tugas ({submission.fileName || 'Dokumen'})</span>
                  </button>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6C6267] hover:text-[#6B1224] hover:underline"
                  >
                    <span>Unduh File</span> ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0">
          <Link
            to={`/kelas/${assignment.classId}/tugas/${assignment.id}`}
            className={[
              'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all no-underline shadow-xs',
              isCompleted
                ? 'border border-[#E5D5D8] bg-white text-[#6B1224] hover:bg-[#F9E8EC]'
                : 'bg-[#6B1224] text-white hover:bg-[#80142A] hover:shadow-[0_10px_20px_-10px_rgba(107,18,36,0.8)]',
            ].join(' ')}
          >
            <span>{isCompleted ? 'Lihat Detail & Jawaban' : 'Kerjakan Tugas'}</span>
            <ArrowRightIcon size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

