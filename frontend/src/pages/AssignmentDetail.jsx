import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import {
  ChevronLeftIcon,
  LinkIcon,
  UploadIcon,
  XIcon,
} from '../components/student/Icons.jsx';

/* ─── Ikon Lokal ─── */
function VolumeIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SplitBookIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CalendarIcon({ size = 14, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SyncIcon({ size = 14, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function StarIcon({ size = 13, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function InfoCircleIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function RedFileIcon({ size = 22, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#D05A6E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function MoreVerticalIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none" className={className}>
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

function LockIcon({ size = 14, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function HelpCircleIcon({ size = 14, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* ─── Format Tanggal Sesuai Image 2 ─── */
function fmtDateWIB(iso) {
  if (!iso) return '17 Maret 2026, 12:30 WIB';
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  return `${dateStr}, ${timeStr} WIB`;
}

function fmtDateShortWIB(iso) {
  if (!iso) return '17 Mar 2026, 10:09 WIB';
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  return `${dateStr}, ${timeStr} WIB`;
}

function fmtDateSimple(iso) {
  if (!iso) return '17 Maret 2026, 10:00 WIB';
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  return `${dateStr}, ${timeStr} WIB`;
}

function extractPdfFromDesc(text) {
  if (!text) return null;
  const m =
    text.match(/\[(?:Lampiran PDF:\s*)?([^\]]+)\]\(([^)]+\.pdf[^)]*)\)/i) ||
    text.match(/(https?:\/\/[^\s]+\.pdf|\/uploads\/[^\s]+\.pdf)/i);
  if (!m) return null;
  if (m[2]) return { name: m[1], url: m[2] };
  const rawUrl = m[1] || m[0];
  const name = rawUrl.split('/').pop() || 'Dokumen.pdf';
  return { name, url: rawUrl };
}

/* ─── Modal PDF Viewer ─── */
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white cursor-pointer transition"
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-[#2A2329]">
        <iframe src={`${fileUrl}#toolbar=1`} title={name} className="h-full w-full border-0" loading="lazy" />
      </div>
    </div>
  );
}

export default function AssignmentDetail() {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDosen = user?.role === 'dosen';

  const [assignment, setAssignment] = useState(null);
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Modal PDF
  const [activePdf, setActivePdf] = useState(null);

  // Status submission mahasiswa
  const [submission, setSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Status submission dosen (daftar semua mahasiswa yang submit)
  const [dosenSubmissions, setDosenSubmissions] = useState([]);
  const [gradeForm, setGradeForm] = useState({}); // { [subId]: { grade: '', feedback: '' } }
  const [gradeBusy, setGradeBusy] = useState({});

  // Form pengumpulan tugas
  const [mode, setMode] = useState('text'); // 'text' | 'link' | 'pdf'
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErr('');
      let assignData = null;
      try {
        assignData = await api(`/classes/${classId}/assignments/${assignmentId}`);
      } catch {
        const classData = await api(`/classes/${classId}`);
        setCls(classData);
        assignData = (classData.assignments || []).find((a) => String(a.id) === String(assignmentId));
      }

      if (!assignData) throw new Error('Tugas tidak ditemukan.');
      setAssignment(assignData);

      if (assignData.class) {
        setCls(assignData.class);
      }

      if (isDosen) {
        // Jika dosen, ambil seluruh submission mahasiswa
        const subs = Array.isArray(assignData.submissions) ? assignData.submissions : [];
        setDosenSubmissions(subs);
        const forms = {};
        subs.forEach((s) => {
          forms[s.id] = { grade: s.grade ?? '', feedback: s.feedback ?? '' };
        });
        setGradeForm(forms);
      } else {
        // Jika mahasiswa, ambil submission miliknya
        const existingSub = assignData.submissions?.[0] || null;
        setSubmission(existingSub);
        if (existingSub) {
          setContent(existingSub.content || '');
          setLinkUrl(existingSub.linkUrl || '');
          if (existingSub.fileUrl) setMode('pdf');
          else if (existingSub.linkUrl) setMode('link');
          else setMode('text');
        }
      }
    } catch (e) {
      setErr(e.message || 'Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  }, [classId, assignmentId, isDosen]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler simpan nilai oleh dosen
  const handleSaveGrade = async (subId) => {
    setGradeBusy((b) => ({ ...b, [subId]: true }));
    const { grade, feedback } = gradeForm[subId] || {};
    try {
      const numGrade = Number(grade);
      if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
        showToast('Nilai harus berupa angka antara 0 - 100');
        return;
      }
      const updated = await api(`/classes/${classId}/assignments/${assignmentId}/submissions/${subId}/grade`, {
        method: 'PATCH',
        body: { grade: numGrade, feedback: feedback || '' },
      });
      setDosenSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast('Nilai dan umpan balik berhasil disimpan!');
    } catch (err) {
      showToast(`Gagal menyimpan nilai: ${err.message}`);
    } finally {
      setGradeBusy((b) => ({ ...b, [subId]: false }));
    }
  };

  // Audio Text-to-Speech untuk instruksi
  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${assignment?.title}. ${assignment?.description || 'Silakan lengkapi tugas ini.'}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
      showToast('Membacakan instruksi tugas...');
    } else {
      showToast('Fitur suara tidak didukung peramban ini.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitBusy(true);
    setSubmitErr('');

    try {
      let fileUrl = null;
      let fileName = null;

      if (mode === 'pdf' && pdfFile) {
        if (pdfFile.size > 25 * 1024 * 1024) {
          throw new Error('Ukuran file PDF melebihi batas maksimal (25 MB)');
        }
        setPdfUploading(true);
        const form = new FormData();
        form.append('file', pdfFile);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/classes/${classId}/assignments/${assignmentId}/upload-pdf`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });
        const uploadRes = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(uploadRes.error || `Upload PDF gagal (Status ${res.status})`);
        fileUrl = uploadRes.url;
        fileName = uploadRes.name;
        setPdfUploading(false);
      }

      const body = {
        content: mode === 'text' ? content.trim() : '',
        linkUrl: mode === 'link' ? linkUrl.trim() : null,
        fileUrl: mode === 'pdf' ? fileUrl || submission?.fileUrl : null,
        fileName: mode === 'pdf' ? fileName || submission?.fileName : null,
      };

      const result = await api(`/classes/${classId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body,
      });

      setSubmission(result);
      setIsEditing(false);
      setPdfFile(null);
      showToast('Tugas berhasil dikumpulkan!');
    } catch (err) {
      setSubmitErr(err.message || 'Gagal mengirim tugas');
    } finally {
      setSubmitBusy(false);
      setPdfUploading(false);
    }
  };

  const isCompleted = !!submission;
  const isOverdue = assignment?.dueDate && new Date(assignment.dueDate) < new Date();
  const taskPdf = assignment?.description ? extractPdfFromDesc(assignment.description) : null;
  const cleanDescription = assignment?.description
    ? assignment.description.replace(/\[(?:Lampiran PDF:\s*)?([^\]]+)\]\(([^)]+\.pdf[^)]*)\)/gi, '').trim()
    : '';

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        <StudentSidebar
          activeSection="kelas"
          onJoin={() => navigate('/app')}
          onNavigate={(key) => {
            if (key === 'beranda') navigate('/app');
            if (key === 'tugas') navigate('/tugas');
            if (key === 'analitik') navigate('/app');
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopbar />

          <main className="flex-1 px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pt-7">
            {/* 1. Bar Navigasi Atas & Status Pengumpulan Persis Image 2 */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/kelas/${classId}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1E1C1E] hover:border-[#6B1224] hover:text-[#6B1224] transition cursor-pointer shadow-2xs"
                >
                  <ChevronLeftIcon size={14} />
                  <span>Kembali</span>
                </button>
                <span className="text-[#D1C7D0]">|</span>
                <p className="text-xs font-semibold text-[#8B8391]">
                  Kelas Saya <span className="text-[#A79FAB]">/</span>{' '}
                  <span className="font-bold text-[#1E1C1E]">{cls?.name || 'Mata Kuliah'}</span>
                </p>
              </div>

              {/* Ikon Suara, Split View & Status Badge */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E1EA] bg-white text-[#8B8391] hover:text-[#6B1224] hover:border-[#6B1224] transition cursor-pointer shadow-2xs"
                  title="Bacakan Instruksi"
                >
                  <VolumeIcon size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (cls?.materials?.[0]?.id) {
                      navigate(`/materi/${cls.materials[0].id}`);
                    } else {
                      navigate('/materi/1');
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E1EA] bg-white text-[#8B8391] hover:text-[#6B1224] hover:border-[#6B1224] transition cursor-pointer shadow-2xs"
                  title="Buka Ruang Baca Materi & Stabilo"
                >
                  <SplitBookIcon size={15} />
                </button>

                {/* Status Badge */}
                {isDosen ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-[#F5F4F7] px-4 py-1.5 text-xs font-bold text-[#6B1224] shadow-2xs">
                    <span>👥</span> {dosenSubmissions.length} Mahasiswa Mengumpulkan
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C6E7D0] bg-[#EAF5ED] px-4 py-1.5 text-xs font-bold text-[#1E7E34] shadow-2xs">
                    <span>✓</span> Dikumpulkan {fmtDateShortWIB(submission.submittedAt)}
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700">
                    Terlambat
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
                    Ditugaskan
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-44 rounded-[22px] bg-[#F1EEF4]" />
                <div className="h-40 rounded-[22px] bg-[#F1EEF4]" />
                <div className="h-40 rounded-[22px] bg-[#F1EEF4]" />
              </div>
            ) : err ? (
              <div
                role="alert"
                className="rounded-2xl border border-[#F3D7DD] bg-[#FDF2F4] px-6 py-5 text-sm font-semibold text-[#96263C]"
              >
                {err}
              </div>
            ) : (
              <div className="space-y-6">
                {/* 2. Hero Card Tugas Kuliah Persis Image 2 */}
                <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      {/* Pill Tag */}
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FDF2F4] px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider text-[#6B1224]">
                        📋 TUGAS KULIAH
                      </span>

                      {/* Judul Tugas */}
                      <h1 className="mt-3 text-[24px] sm:text-[30px] font-black tracking-tight text-[#1E1C1E]">
                        {assignment.title}
                      </h1>

                      {/* Badges Baris */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-xs font-bold text-[#5B525C]">
                          <CalendarIcon size={13} className="text-[#8B8391]" />
                          <span>Tenggat: {fmtDateWIB(assignment.dueDate)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-xs font-bold text-[#5B525C]">
                          <SyncIcon size={13} className="text-[#8B8391]" />
                          <span>1 kali pengumpulan diperbolehkan</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FED7D7] bg-[#FFF5F5] px-3.5 py-1.5 text-xs font-bold text-[#C53030]">
                          <CalendarIcon size={13} />
                          <span>Ditutup {fmtDateShortWIB(assignment.dueDate)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Nilai Maksimal Box di Kanan Atas */}
                    <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-4 text-center shrink-0 min-w-[140px]">
                      <p className="flex items-center justify-center gap-1 text-[10.5px] font-black uppercase tracking-wider text-[#938B99]">
                        <StarIcon size={12} className="text-[#E6B800]" />
                        <span>{!isDosen && submission?.grade != null ? 'NILAI ANDA' : 'NILAI MAKSIMAL'}</span>
                      </p>
                      <p className="mt-1 text-[24px] sm:text-[26px] font-black text-[#1E1C1E] leading-none">
                        {!isDosen && submission?.grade != null ? (
                          <span className="text-[#1E7E34]">{submission.grade} Poin</span>
                        ) : (
                          '100 Poin'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Modul Terkait di Bawah */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#F5F4F7] pt-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#938B99]">
                      MODUL TERKAIT
                    </span>
                    <Link
                      to={`/kelas/${classId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-xs font-bold text-[#6B1224] hover:bg-[#F9E8EC] transition no-underline"
                    >
                      <span>📁 {cls?.name || 'Mata Kuliah'}</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>

                {/* 3. Card Instruksi Pengerjaan (Instructions) Persis Image 2 */}
                <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF2F4] text-[#6B1224]">
                      <InfoCircleIcon size={17} />
                    </div>
                    <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">
                      Instruksi Pengerjaan (Instructions)
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-5 sm:p-6 space-y-3.5">
                    <p className="text-[13px] leading-relaxed text-[#4A424D] whitespace-pre-wrap">
                      {cleanDescription ||
                        `Silakan isi dan lengkapi kuis evaluasi materi ${cls?.name || 'perkuliahan'} pada formulir digital yang telah disediakan. Pastikan seluruh butir pertanyaan pemahaman konsep telah dijawab dengan teliti sebelum mengirimkan formulir tanggapan.`}
                    </p>
                    <p className="text-[11.5px] italic text-[#8B8391] border-t border-[#F1EEF4] pt-3">
                      Catatan: Pengumpulan hanya dibuka satu kali per mahasiswa. Berkas tanggapan yang diserahkan otomatis terekam ke sistem penilaian instruktur.
                    </p>
                  </div>
                </div>

                {/* 4. Card Materi Pendukung / Referensi Persis Image 2 */}
                <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FDF2F4] text-[#6B1224]">
                      <RedFileIcon size={17} />
                    </div>
                    <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">
                      Materi Pendukung / Referensi
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E7E1EA] shadow-2xs">
                        <RedFileIcon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs sm:text-[13.5px] font-extrabold text-[#1E1C1E]">
                          {taskPdf?.name || `Soal Quiz Review Materi ${cls?.name || 'Perkuliahan'}`}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-[#8B8391]">
                          Formulir Respons Kuliah • Terisi Lengkap • Diunggah {fmtDateShortWIB(assignment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cls?.materials?.[0]?.id && (
                        <Link
                          to={`/materi/${cls.materials[0].id}`}
                          className="rounded-full bg-[#6B1224] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#80142A] transition cursor-pointer shadow-2xs no-underline flex items-center gap-1.5"
                        >
                          <span>Ruang Baca &amp; Stabilo</span> ↗
                        </Link>
                      )}
                      {taskPdf && (
                        <button
                          type="button"
                          onClick={() => setActivePdf(taskPdf)}
                          className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                        >
                          Lihat PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (taskPdf) setActivePdf(taskPdf);
                          else showToast('Materi referensi resmi');
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B8391] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                        title="Opsi Berkas"
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Bagian Penilaian Tugas Mahasiswa (Untuk Dosen) atau Pekerjaan Saya (Untuk Mahasiswa) */}
                {isDosen ? (
                  <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F4F7] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FDF2F4] text-[#6B1224]">
                          <RedFileIcon size={18} />
                        </div>
                        <div>
                          <h2 className="text-[16px] font-extrabold text-[#1E1C1E]">
                            Pengumpulan Mahasiswa ({dosenSubmissions.length})
                          </h2>
                          <p className="text-xs text-[#8B8391]">
                            Evaluasi berkas tugas, berikan nilai angka 0–100, dan umpan balik personal.
                          </p>
                        </div>
                      </div>

                      {/* Statistik Pengumpulan */}
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                          ✓ {dosenSubmissions.filter((s) => s.grade != null).length} Dinilai
                        </span>
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                          ⏳ {dosenSubmissions.filter((s) => s.grade == null).length} Menunggu
                        </span>
                      </div>
                    </div>

                    {dosenSubmissions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#E7E1EA] bg-[#FCFBFD] p-8 text-center">
                        <p className="text-sm font-bold text-[#1E1C1E]">Belum Ada Mahasiswa Mengumpulkan</p>
                        <p className="mt-1 text-xs text-[#8B8391]">
                          Pengumpulan tugas oleh mahasiswa yang terdaftar akan otomatis tampil di sini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dosenSubmissions.map((s) => {
                          const studentName = s.user?.name || 'Mahasiswa';
                          const studentEmail = s.user?.email || '';
                          const initials = studentName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                          const gf = gradeForm[s.id] || { grade: s.grade ?? '', feedback: s.feedback ?? '' };
                          const isBusy = gradeBusy[s.id];

                          return (
                            <div
                              key={s.id}
                              className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-5 space-y-4 hover:border-[#6B1224]/30 transition"
                            >
                              {/* Info Mahasiswa & Status Nilai */}
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B1224] text-xs font-extrabold text-white">
                                    {initials}
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-extrabold text-[#1E1C1E]">{studentName}</h3>
                                    <p className="text-xs text-[#8B8391]">{studentEmail} · Dikumpulkan {fmtDateShortWIB(s.submittedAt)}</p>
                                  </div>
                                </div>

                                <div>
                                  {s.grade != null ? (
                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700">
                                      Nilai: {s.grade}/100
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                                      Belum Dinilai
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Berkas / Lampiran Mahasiswa */}
                              <div className="rounded-xl border border-[#E7E1EA] bg-white p-3.5 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <RedFileIcon size={18} />
                                  <span className="text-xs font-bold text-[#1E1C1E] truncate max-w-xs sm:max-w-md">
                                    {s.fileName || s.linkUrl || 'Jawaban Tugas'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {s.fileUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setActivePdf({ url: s.fileUrl, name: s.fileName || 'Jawaban Mahasiswa.pdf' })}
                                      className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                                    >
                                      Buka &amp; Koreksi PDF ↗
                                    </button>
                                  )}
                                  {s.linkUrl && (
                                    <a
                                      href={s.linkUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-xs font-bold text-[#6B1224] hover:bg-[#F9E8EC] transition cursor-pointer no-underline"
                                    >
                                      Buka Tautan Tugas ↗
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Teks Jawaban Mahasiswa Jika Ada */}
                              {s.content && (
                                <div className="rounded-xl border border-[#E7E1EA] bg-white p-3.5 text-xs text-[#1E1C1E] whitespace-pre-wrap leading-relaxed">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#938B99] mb-1">
                                    Catatan / Jawaban Teks Mahasiswa:
                                  </p>
                                  {s.content}
                                </div>
                              )}

                              {/* Form Input Nilai & Feedback untuk Dosen */}
                              <div className="pt-2 border-t border-[#F1EEF4]">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                  <div className="sm:col-span-1">
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8B8391] mb-1.5">
                                      Nilai (0–100) *
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={gf.grade}
                                      onChange={(e) =>
                                        setGradeForm((prev) => ({
                                          ...prev,
                                          [s.id]: { ...gf, grade: e.target.value },
                                        }))
                                      }
                                      placeholder="Contoh: 85"
                                      className="w-full rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs font-bold text-[#1E1C1E] outline-none focus:border-[#6B1224] transition"
                                    />
                                  </div>

                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8B8391] mb-1.5">
                                      Catatan Evaluasi / Umpan Balik (Feedback)
                                    </label>
                                    <input
                                      type="text"
                                      value={gf.feedback}
                                      onChange={(e) =>
                                        setGradeForm((prev) => ({
                                          ...prev,
                                          [s.id]: { ...gf, feedback: e.target.value },
                                        }))
                                      }
                                      placeholder="Kerja bagus, pemahaman konsep sangat kuat..."
                                      className="w-full rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs text-[#1E1C1E] outline-none focus:border-[#6B1224] transition"
                                    />
                                  </div>

                                  <div className="sm:col-span-1">
                                    <button
                                      type="button"
                                      disabled={isBusy || gf.grade === ''}
                                      onClick={() => handleSaveGrade(s.id)}
                                      className="w-full rounded-xl bg-[#6B1224] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#80142A] transition disabled:opacity-40 cursor-pointer"
                                    >
                                      {isBusy ? 'Menyimpan...' : 'Simpan Nilai'}
                                    </button>
                                  </div>
                                </div>
                                {s.gradedAt && (
                                  <p className="mt-2 text-[10.5px] text-[#A79FAB]">
                                    Terakhir dinilai: {fmtDateWIB(s.gradedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 5. Card Pekerjaan Saya (My Work) untuk Mahasiswa (Persis Image 2) */
                  <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs">
                    <div className="flex items-center justify-between pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FDF2F4] text-[#6B1224]">
                          <RedFileIcon size={17} />
                        </div>
                        <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">
                          Pekerjaan Saya (My Work)
                        </h2>
                      </div>

                      {/* Badge Berkas Diserahkan */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          isCompleted
                            ? 'border border-[#C6E7D0] bg-[#EAF5ED] text-[#1E7E34]'
                            : 'border border-[#E7E1EA] bg-[#FCFBFD] text-[#8B8391]'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-[#1E7E34]' : 'bg-[#A79FAB]'}`} />
                        <span>{isCompleted ? '1 Berkas Diserahkan' : 'Belum Ada Berkas'}</span>
                      </span>
                    </div>

                    {/* Kotak Hasil Penilaian & Feedback Dosen Jika Sudah Dinilai */}
                    {submission?.grade != null && (
                      <div className="mb-5 rounded-2xl border border-emerald-200 bg-[#EAF5ED] p-4 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StarIcon size={15} className="text-[#1E7E34]" />
                            <span className="font-black text-[#1E7E34] text-sm">
                              Nilai Anda: {submission.grade}/100
                            </span>
                          </div>
                          {submission.gradedAt && (
                            <span className="text-[11px] text-[#1E7E34]/80">
                              Dinilai pada {fmtDateShortWIB(submission.gradedAt)}
                            </span>
                          )}
                        </div>
                        {submission.feedback && (
                          <div className="mt-2.5 bg-white/80 rounded-xl p-3 border border-emerald-100 text-[#1E7E34] leading-relaxed">
                            <span className="font-extrabold block text-[11px] mb-0.5">Catatan Dosen Pengampu:</span>
                            "{submission.feedback}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Jika Sudah Dikumpulkan dan Tidak Sedang Edit */}
                    {isCompleted && !isEditing ? (
                      <div className="space-y-4">
                        {/* Box File Jawaban */}
                        <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-4 sm:p-5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E7E1EA] shadow-2xs">
                              <RedFileIcon size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-xs sm:text-[13.5px] font-extrabold text-[#1E1C1E]">
                                {submission.fileName ||
                                  (submission.linkUrl ? submission.linkUrl : `Quiz Review Materi ${cls?.name}`)}
                              </h3>
                              <p className="mt-0.5 text-[11px] text-[#8B8391]">
                                Formulir Respons Kuliah • Terisi Lengkap • Diunggah {fmtDateShortWIB(submission.submittedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {submission.fileUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setActivePdf({
                                    url: submission.fileUrl,
                                    name: submission.fileName || 'Jawaban Tugas.pdf',
                                  })
                                }
                                className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                              >
                                Lihat File PDF
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (submission.fileUrl) {
                                  setActivePdf({ url: submission.fileUrl, name: submission.fileName || 'Jawaban.pdf' });
                                } else {
                                  showToast('Jawaban tugas tersimpan');
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B8391] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                              title="Opsi Jawaban"
                            >
                              <MoreVerticalIcon size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Jawaban Teks Jika Ada */}
                        {submission.content && (
                          <div className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-4 text-xs text-[#1E1C1E] whitespace-pre-wrap leading-relaxed">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#938B99] mb-1">
                              Jawaban Teks:
                            </p>
                            {submission.content}
                          </div>
                        )}

                        {/* Baris Status Kunci & Tombol Batalkan Pengumpulan Persis Image 2 */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-2 text-xs text-[#8B8391]">
                            <LockIcon size={14} className="text-[#8B8391]" />
                            <span>
                              {isOverdue
                                ? `Tenggat waktu telah berakhir pada ${fmtDateSimple(assignment.dueDate)}.`
                                : `Pengumpulan berhasil terekam pada ${fmtDateSimple(submission.submittedAt)}.`}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="rounded-full border border-[#E7E1EA] bg-white px-5 py-2 text-xs font-bold text-[#5B525C] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer shadow-2xs"
                          >
                            Batalkan Pengumpulan
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Form Pengumpulan Tugas (Jika belum submit atau setelah klik Batalkan Pengumpulan) */
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Pilihan Format */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#938B99] mb-2">
                            Pilih Format Pengumpulan
                          </label>
                          <div className="flex gap-2">
                            {[
                              ['text', '✍️ Teks / Uraian'],
                              ['link', '🔗 Link Drive'],
                              ['pdf', '📄 Upload PDF'],
                            ].map(([m, label]) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={[
                                  'flex-1 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer text-center',
                                  mode === m
                                    ? 'bg-[#6B1224] text-white shadow-2xs'
                                    : 'bg-[#F5F4F7] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224]',
                                ].join(' ')}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {mode === 'text' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#938B99] mb-1.5">
                              Isi Jawaban Tugas
                            </label>
                            <textarea
                              rows={5}
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              placeholder="Tuliskan jawaban atau tanggapan tugasmu di sini..."
                              className="w-full rounded-2xl border border-[#E7E1EA] bg-[#FCFBFD] p-4 text-xs text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition resize-none leading-relaxed"
                            />
                          </div>
                        )}

                        {mode === 'link' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#938B99] mb-1.5">
                              Tautan Google Drive / Cloud
                            </label>
                            <div className="relative">
                              <LinkIcon
                                size={16}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A79FAB]"
                              />
                              <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full rounded-2xl border border-[#E7E1EA] bg-[#FCFBFD] py-3 pl-10 pr-4 text-xs text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition"
                              />
                            </div>
                          </div>
                        )}

                        {mode === 'pdf' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#938B99] mb-1.5">
                              Unggah Dokumen PDF (Maks. 20 MB)
                            </label>
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E7E1EA] bg-[#FCFBFD] py-8 px-4 text-center transition hover:border-[#6B1224] hover:bg-[#FDF2F4]"
                            >
                              <UploadIcon size={26} className="text-[#A79FAB]" />
                              <p className="text-xs font-bold text-[#1E1C1E]">
                                {pdfFile ? pdfFile.name : submission?.fileName || 'Klik untuk memilih file PDF'}
                              </p>
                              <p className="text-[11px] text-[#8B8391]">
                                Pilih berkas tanggapan tugas dari perangkat Anda
                              </p>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="application/pdf,.pdf"
                              className="hidden"
                              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                            />
                            {pdfUploading && (
                              <p className="mt-1 text-[11px] text-[#6B1224] font-semibold animate-pulse">
                                Mengunggah file PDF...
                              </p>
                            )}
                          </div>
                        )}

                        {submitErr && (
                          <p className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-100">
                            {submitErr}
                          </p>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={
                              submitBusy ||
                              (mode === 'text' && !content.trim()) ||
                              (mode === 'link' && !linkUrl.trim()) ||
                              (mode === 'pdf' && !pdfFile && !submission?.fileUrl)
                            }
                            className="flex-1 rounded-full bg-[#6B1224] py-3 text-xs font-bold text-white transition hover:bg-[#80142A] disabled:opacity-40 cursor-pointer shadow-md"
                          >
                            {submitBusy ? 'Mengirimkan...' : 'Kumpulkan Tugas'}
                          </button>
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="rounded-full border border-[#E7E1EA] px-5 py-3 text-xs font-bold text-[#8B8391] hover:bg-[#F5F4F7] cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* 6. Footer Bantuan & ID Tugas Persis Image 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-[#8B8391] border-t border-[#F1EEF4] pt-5">
                  <div className="flex items-center gap-2">
                    <HelpCircleIcon size={15} className="text-[#A79FAB]" />
                    <span>Butuh bantuan pengumpulan? Hubungi dosen pengampu atau admin kelas.</span>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[#A79FAB]">
                    ID Tugas : SP-2026-{cls?.code || 'PRM'}-{String(assignment.id).padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal PDF Viewer */}
      {activePdf && (
        <PdfViewer
          url={activePdf.url}
          name={activePdf.name}
          onClose={() => setActivePdf(null)}
        />
      )}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#1E1C1E] px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in">
          <span>✓ {toastMsg}</span>
        </div>
      )}
    </div>
  );
}
