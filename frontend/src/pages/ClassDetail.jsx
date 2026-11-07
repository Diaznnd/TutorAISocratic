import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  LayersIcon,
  LinkIcon,
  UploadIcon,
  XIcon,
} from '../components/student/Icons.jsx';
import {
  CreateClassModal,
  CreatedSuccessModal,
  AnalyticsModal,
} from '../components/ClassModals.jsx';

/* ─── Ikon Lokal & Pembantu ─── */
function DocIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function FileIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function FolderIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#F59E0B" stroke="#D97706" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function VideoIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
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

function CloudIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function ShareIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function DownloadIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function TableIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function SyncIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ListIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function GridIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function InfoIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function StarDocIcon({ size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <polygon points="12 12 13 14 15 14.3 13.5 15.7 14 18 12 16.7 10 18 10.5 15.7 9 14.3 11 14 12 12" />
    </svg>
  );
}

function UploadBoxIcon({ size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function GraduationCapIcon({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function CheckCircleIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-5" />
    </svg>
  );
}

function SearchIcon({ size = 15, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ─── Format tanggal ─── */
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

function fmtDateSimple(iso) {
  if (!iso) return '18 Nov 2025';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const overdue = d < new Date();
  const label =
    'Deadline: ' +
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return { label, overdue };
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

/* ─── PDF Viewer Modal ─── */
function PdfViewer({ url, name, readUrl, onClose, onOpenTutor }) {
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
          {onOpenTutor && (
            <button
              type="button"
              onClick={onOpenTutor}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#6B1224] to-[#80142A] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:scale-105 transition cursor-pointer"
            >
              <span>💡 Tanya Tutor AI (Socratic)</span>
            </button>
          )}
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

/* ─── Hero Banner Kelas untuk Post Tab ─── */
function ClassHero({ cls }) {
  const ownerName = cls.owner?.name || 'Dosen';
  const initials = ownerName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[#1A1118] px-7 py-8 sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#6B1224] opacity-80 sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute -bottom-16 -right-4 h-48 w-48 rounded-full bg-[#80142A] opacity-50" />
      <div className="relative z-10">
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
          Silabus Unggulan
        </span>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[34px]">{cls.name}</h1>
          <div className="flex items-center gap-2.5 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6B800] text-[11px] font-extrabold text-[#1A1118]">{initials}</span>
            <div>
              <p className="text-[12px] font-bold leading-tight text-white">{ownerName}</p>
              <p className="text-[10px] text-white/60">{cls.owner?.email || 'Dosen'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
            <LayersIcon size={12} /> Kode: {cls.code}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
            📄 {cls.materials?.length || 0} Materi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
            📋 {cls.assignments?.length || 0} Tugas
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Kartu Materi (Post tab) ─── */
function MaterialCard({ material, onPreviewPdf }) {
  return (
    <div className="rounded-[20px] border border-[#F1EEF4] bg-white">
      <div className="flex items-center gap-3 border-b border-[#F5F4F7] px-5 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] text-white">
          <DocIcon size={17} />
        </div>
        <span className="text-[13px] font-bold text-[#1E1C1E]">Materi Pembelajaran</span>
        <span className="ml-1 text-[11px] text-[#A79FAB]">{fmtDate(material.createdAt)}</span>
      </div>
      <div className="px-5 py-5">
        <div className="rounded-[14px] border border-[#F1EEF4] bg-[#FCFBFD] px-5 py-4">
          <p className="text-[14px] font-extrabold text-[#1E1C1E]">{material.title}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/materi/${material.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#E7E1EA] bg-white px-4 py-2 text-[12px] font-bold text-[#1E1C1E] transition hover:border-[#6B1224] hover:text-[#6B1224] no-underline"
            >
              Buka Ruang Baca <ArrowRightIcon size={13} />
            </Link>
            {material.pdfUrl && (
              <Link
                to={`/materi/${material.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-red-700 cursor-pointer shadow-2xs no-underline"
              >
                <FileIcon size={13} /> Buka PDF di Ruang Baca
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Kartu Tugas (Post tab) ─── */
function AssignmentCard({ assignment, classId }) {
  const navigate = useNavigate();
  const submitted = assignment.submissions?.length > 0 ? assignment.submissions[0] : null;
  const due = assignment.dueDate ? fmtDue(assignment.dueDate) : null;
  const isOverdue = due?.overdue && !submitted;
  const taskPdf = extractPdfFromDesc(assignment.description);

  return (
    <div
      onClick={() => navigate(`/kelas/${classId}/tugas/${assignment.id}`)}
      className="group rounded-[20px] border border-[#F1EEF4] bg-white transition hover:border-[#6B1224]/30 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center gap-3 border-b border-[#F5F4F7] px-5 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6B1224] text-white">
          <DocIcon size={17} />
        </div>
        <span className="text-[13px] font-bold text-[#1E1C1E]">Tugas Kelas</span>
        <span className="ml-1 text-[11px] text-[#A79FAB]">{fmtDate(assignment.createdAt)}</span>
        {submitted ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
            <CheckCircleIcon size={13} /> Dikumpulkan
            {submitted.grade != null && ` · Nilai: ${submitted.grade}/100`}
          </span>
        ) : isOverdue ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
            Terlambat
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
            Ditugaskan
          </span>
        )}
      </div>

      <div className="px-5 py-5">
        <div className="rounded-[14px] border border-[#F1EEF4] bg-[#FCFBFD] px-5 py-4 group-hover:bg-[#FFFDFC] transition">
          <p className="text-[14px] font-extrabold text-[#1E1C1E] group-hover:text-[#6B1224] transition">
            {assignment.title}
          </p>
          {due && (
            <p className={['mt-1 text-[12px] font-semibold', isOverdue ? 'text-red-500' : 'text-[#8B8391]'].join(' ')}>
              {due.label}{isOverdue && ' · Terlambat'}
            </p>
          )}
          {assignment.description && (
            <p className="mt-2 text-[12px] leading-relaxed text-[#5B525C] line-clamp-2">
              {assignment.description}
            </p>
          )}

          {taskPdf && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-red-600">
              <FileIcon size={13} />
              <span>Lampiran Soal PDF: {taskPdf.name}</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span
              className={[
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition shadow-2xs',
                submitted
                  ? 'border border-[#E7E1EA] bg-white text-[#1E1C1E] group-hover:border-[#6B1224] group-hover:text-[#6B1224]'
                  : 'bg-[#6B1224] text-white hover:bg-[#80142A]',
              ].join(' ')}
            >
              <span>{submitted ? 'Lihat Detail & Jawaban' : 'Buka Detail & Kerjakan Tugas'}</span>
              <ArrowRightIcon size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Empty({ icon, title, desc }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9E8EC] text-[#6B1224] text-2xl">{icon}</div>
      <h3 className="mt-4 text-sm font-extrabold text-[#1E1C1E]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-[#8B8391]">{desc}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-[220px] rounded-[20px] bg-[#F1EEF4]" />
      <div className="h-10 w-36 rounded-full bg-[#F1EEF4]" />
      {[0, 1].map((k) => <div key={k} className="h-[140px] rounded-[20px] bg-[#F1EEF4]" />)}
    </div>
  );
}

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('Shared'); // Default ke Shared seperti Image 1
  const [query, setQuery] = useState('');
  const [previewPdf, setPreviewPdf] = useState(null); // { url, name }
  const [fileSearch, setFileSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sharedSubTab, setSharedSubTab] = useState('all'); // 'all' | 'messages'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // State Modal Buat Kelas & Analitik untuk Dosen
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdClass, setCreatedClass] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleQuickUploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadMenu(false);
    showToast('Mengunggah materi PDF...');
    setUploadingPdf(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/classes/${id}/materials/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');

      const title = file.name.replace(/\.pdf$/i, '');
      await api(`/classes/${id}/materials`, {
        method: 'POST',
        body: {
          title,
          content: `Materi perkuliahan berdasarkan dokumen PDF: ${file.name}`,
          pdfUrl: data.url,
          pdfName: data.name,
        },
      });
      showToast('Materi PDF berhasil ditambahkan ke kelas!');
      load();
    } catch (err) {
      showToast(`Gagal mengunggah PDF: ${err.message}`);
    } finally {
      setUploadingPdf(false);
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api(`/classes/${id}`);
      setCls(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const goTo = (key) => { if (key === 'beranda') navigate('/app'); };

  const postItems = cls
    ? [
        ...(cls.materials || []).map((m) => ({ ...m, _type: 'material' })),
        ...(cls.assignments || []).map((a) => ({ ...a, _type: 'assignment' })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const filteredPost = query.trim()
    ? postItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
    : postItems;

  /* ─── Daftar Berkas & Folder untuk Halaman Shared (Sesuai Image 1) ─── */
  const sharedTableItems = useMemo(() => {
    if (!cls) return [];
    const lecturerName = cls.owner?.name || 'Afriyanti Dwi Kartika';
    const lecturerInitials = lecturerName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    // 1. Folder default perkuliahan seperti pada Image 1
    const defaultFolders = [
      {
        id: 'f-1',
        name: '1. KALENDER & JADWAL PERKULIAHAN',
        type: 'folder',
        updatedAt: '16 Agu 2025',
        author: lecturerName,
        authorInitials: lecturerInitials,
      },
      {
        id: 'f-2',
        name: '2. KURIKULUM & SILABUS RPS',
        type: 'folder',
        updatedAt: '14 Agu 2025',
        author: lecturerName,
        authorInitials: lecturerInitials,
      },
      {
        id: 'f-3',
        name: '3. REKAMAN PERKULIAHAN (RECORDINGS)',
        type: 'stream',
        badge: 'Stream',
        updatedAt: '26 Mar 2025',
        author: 'Tim Asisten Dosen',
        authorInitials: 'TA',
      },
    ];

    // 2. Berkas dari Database (materials, sharedMaterials, assignments)
    const dbFiles = [];

    (cls.materials || []).forEach((m) => {
      dbFiles.push({
        id: `mat-${m.id}`,
        name: m.pdfName || `${m.title}.pdf`,
        displayName: m.title,
        type: m.pdfUrl ? 'pdf' : 'doc',
        badge: m.pdfUrl ? 'PDF • 3.4 MB' : 'Modul Ruang Baca',
        updatedAt: fmtDateSimple(m.createdAt),
        author: lecturerName,
        authorInitials: lecturerInitials,
        pdfUrl: m.pdfUrl,
        readUrl: `/materi/${m.id}`,
      });
    });

    (cls.sharedMaterials || []).forEach((s) => {
      const isPdf = s.fileType?.includes('pdf') || s.fileUrl?.endsWith('.pdf');
      dbFiles.push({
        id: `sh-${s.id}`,
        name: s.fileName || `${s.title}.pdf`,
        displayName: s.title,
        type: isPdf ? 'pdf' : 'file',
        badge: isPdf ? 'PDF • 2.1 MB' : 'Berkas • Lampiran',
        updatedAt: fmtDateSimple(s.createdAt),
        author: lecturerName,
        authorInitials: lecturerInitials,
        pdfUrl: isPdf ? s.fileUrl : null,
        fileUrl: s.fileUrl,
      });
    });

    (cls.assignments || []).forEach((a) => {
      const taskPdf = extractPdfFromDesc(a.description);
      if (taskPdf) {
        dbFiles.push({
          id: `asg-${a.id}`,
          name: taskPdf.name,
          displayName: `${a.title} (Soal & Panduan)`,
          type: 'pdf',
          badge: 'PDF • Panduan Soal',
          updatedAt: fmtDateSimple(a.createdAt),
          author: lecturerName,
          authorInitials: lecturerInitials,
          pdfUrl: taskPdf.url,
          taskUrl: `/kelas/${cls.id}/tugas/${a.id}`,
        });
      }
    });

    // Jika database belum banyak file, tambahkan contoh file sesuai Image 1
    if (dbFiles.length === 0) {
      dbFiles.push(
        {
          id: 'demo-1',
          name: 'Materi Tambahan Aljabar Matriks.pdf',
          displayName: 'Materi Tambahan Aljabar Matriks.pdf',
          type: 'pdf',
          badge: 'PDF • 3.4 MB',
          updatedAt: '31 Okt 2025',
          author: lecturerName,
          authorInitials: lecturerInitials,
        },
        {
          id: 'demo-2',
          name: 'Modul Praktikum & Panduan Tugas.pdf',
          displayName: 'Modul Praktikum & Panduan Tugas.pdf',
          type: 'pdf',
          badge: 'PDF • 2.1 MB',
          updatedAt: '18 Nov 2025',
          author: 'Nisa Dwi Angresti',
          authorInitials: 'ND',
        }
      );
    }

    return [...defaultFolders, ...dbFiles];
  }, [cls]);

  // Filter pencarian tabel
  const filteredTableItems = useMemo(() => {
    let list = sharedTableItems;
    if (sharedSubTab === 'messages') {
      list = list.filter((i) => i.type === 'stream' || i.type === 'pdf');
    }
    const q = fileSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.displayName && item.displayName.toLowerCase().includes(q)) ||
        item.author.toLowerCase().includes(q)
    );
  }, [sharedTableItems, sharedSubTab, fileSearch]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTableItems.map((i) => i.id)));
    }
  };

  const toggleSelect = (itemId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Tautan kelas berhasil disalin ke papan klip!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: cls?.name, url: window.location.href }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadAll = () => {
    showToast('Memulai pengunduhan seluruh arsip kelas...');
  };

  const handleExportExcel = () => {
    showToast('Daftar berkas berhasil diekspor ke Excel / CSV!');
  };

  const handleSync = () => {
    setSyncing(true);
    load().finally(() => {
      setTimeout(() => {
        setSyncing(false);
        showToast('Sinkronisasi berkas terbaru berhasil!');
      }, 500);
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        <StudentSidebar
          activeSection="kelas"
          onNavigate={goTo}
          onJoin={() => setShowCreateModal(true)}
          onAnalytics={() => setShowAnalytics(true)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopbar query={query} onQueryChange={setQuery} />

          <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-7">
            {/* Tab Bar Post / Shared di paling atas halaman seperti Image 1 */}
            <div className="mb-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('Post')}
                className={[
                  'rounded-full px-5 py-2 text-[13px] font-bold transition-all cursor-pointer',
                  tab === 'Post'
                    ? 'bg-[#6B1224] text-white shadow-[0_8px_18px_-10px_rgba(107,18,36,0.8)]'
                    : 'text-[#8B8391] hover:bg-[#F5F4F7] hover:text-[#6B1224]',
                ].join(' ')}
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setTab('Shared')}
                className={[
                  'rounded-full px-5 py-2 text-[13px] font-bold transition-all cursor-pointer',
                  tab === 'Shared'
                    ? 'bg-[#6B1224] text-white shadow-[0_8px_18px_-10px_rgba(107,18,36,0.8)]'
                    : 'text-[#8B8391] hover:bg-[#F5F4F7] hover:text-[#6B1224]',
                ].join(' ')}
              >
                Shared
              </button>
            </div>

            {loading ? (
              <Skeleton />
            ) : err ? (
              <div
                role="alert"
                className="rounded-2xl border border-[#F3D7DD] bg-[#FDF2F4] px-5 py-4 text-sm font-semibold text-[#96263C]"
              >
                {err}
              </div>
            ) : tab === 'Post' ? (
              /* ─── TAMPILAN TAB POST ─── */
              <div className="space-y-5">
                <ClassHero cls={cls} />
                {filteredPost.length === 0 ? (
                  <Empty
                    icon="📋"
                    title="Belum ada postingan"
                    desc="Dosen belum memposting materi atau tugas untuk kelas ini."
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredPost.map((item) =>
                      item._type === 'material' ? (
                        <MaterialCard
                          key={`m-${item.id}`}
                          material={item}
                          onPreviewPdf={(pdf) => setPreviewPdf(pdf)}
                        />
                      ) : (
                        <AssignmentCard key={`a-${item.id}`} assignment={item} classId={id} />
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ─── TAMPILAN TAB SHARED PERSIS SEPERTI IMAGE 1 ─── */
              <div className="space-y-6">
                {/* 1. Header Judul Kelas (Card Putih Rounded) */}
                <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#F5F4F7] px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-[#6B1224]">
                      {cls?.code ? cls.code.slice(0, 2) : 'AL'}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8B8391]">
                      {cls?.name?.toUpperCase() || 'MATA KULIAH'} • SEMESTER GENAP
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <h1 className="text-[22px] sm:text-[28px] font-black tracking-tight text-[#1E1C1E]">
                      {cls?.name}
                    </h1>
                    <span className="rounded-full border border-[#E7E1EA] bg-[#F5F4F7] px-3 py-0.5 text-xs font-bold text-[#6C6267]">
                      Kelas {cls?.code || 'A'}
                    </span>
                  </div>
                </div>

                {/* 2. Dokumen Kelas & Action Toolbar Box (Card Putih Rounded) */}
                <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 sm:p-6 shadow-xs space-y-5">
                  {/* Baris Atas: Breadcrumb Folder & Cloud Storage Quota */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F4F7] pb-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#1E1C1E]">
                      <span className="flex items-center gap-1.5 text-[#6B1224]">
                        <GraduationCapIcon size={16} /> Dokumen Kelas
                      </span>
                      <span className="text-[#A79FAB]">&gt;</span>
                      <div className="flex items-center gap-1 rounded-lg bg-[#F5F4F7] px-2.5 py-1 text-xs font-bold text-[#1E1C1E]">
                        <span>📁 General</span>
                        <ChevronDownIcon size={12} />
                      </div>
                      <span className="rounded-full bg-[#F5F4F7] px-2.5 py-0.5 text-[10px] font-semibold text-[#8B8391]">
                        {sharedTableItems.length} item arsip aktif
                      </span>
                    </div>

                    {/* Kuota Cloud */}
                    <div className="flex items-center gap-3 rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] px-4 py-2 text-xs">
                      <CloudIcon size={18} className="text-[#6B1224]" />
                      <div>
                        <p className="text-[11px] font-bold text-[#1E1C1E]">
                          2.4 GB <span className="font-normal text-[#8B8391]">/ 10 GB Kuota</span>
                        </p>
                        <div className="mt-1 h-1.5 w-24 rounded-full bg-[#F1EEF4] overflow-hidden">
                          <div className="h-full bg-[#6B1224] rounded-full" style={{ width: '24%' }} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Kuota akun kampus Anda aktif hingga 10 GB.')}
                        className="ml-2 text-[11px] font-bold text-[#6B1224] hover:underline cursor-pointer"
                      >
                        Upgrade ↗
                      </button>
                    </div>
                  </div>

                  {/* Baris Bawah: Deretan Tombol Aksi */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (user?.role === 'dosen') {
                              setShowUploadMenu((v) => !v);
                            } else {
                              showToast('Akses upload hanya untuk Dosen pengampu');
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#6B1224] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#80142A] transition cursor-pointer"
                        >
                          <span>{uploadingPdf ? 'Mengunggah...' : '+ Unggah / Buat Baru'}</span>
                          <ChevronDownIcon size={12} className={`transition-transform duration-200 ${showUploadMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showUploadMenu && user?.role === 'dosen' && (
                          <div className="absolute left-0 top-full mt-1.5 z-40 w-60 rounded-2xl border border-[#F1EEF4] bg-white p-2 shadow-xl animate-in fade-in">
                            <label className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#1E1C1E] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer">
                              <DocIcon size={16} className="text-[#6B1224]" />
                              <span>Unggah Modul / Materi PDF</span>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleQuickUploadPdf}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowUploadMenu(false);
                                navigate(`/kelola/${id}`);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#1E1C1E] hover:bg-[#F9E8EC] hover:text-[#6B1224] transition cursor-pointer"
                            >
                              <LayersIcon size={16} className="text-[#6B1224]" />
                              <span>Kelola Kelas &amp; Tugas</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs font-bold text-[#5B525C] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                      >
                        <ShareIcon size={14} />
                        <span>Bagikan</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs font-bold text-[#5B525C] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                      >
                        <LinkIcon size={14} />
                        <span>Salin Tautan</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadAll}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs font-bold text-[#5B525C] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                      >
                        <DownloadIcon size={14} />
                        <span>Unduh Semua</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs font-bold text-[#5B525C] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                      >
                        <TableIcon size={14} />
                        <span>Ekspor ke Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSync}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E1EA] bg-white px-3.5 py-2 text-xs font-bold text-[#5B525C] hover:bg-[#F5F4F7] hover:text-[#1E1C1E] transition cursor-pointer"
                      >
                        <SyncIcon size={14} className={syncing ? 'animate-spin' : ''} />
                        <span>Sinkronisasi</span>
                      </button>
                    </div>

                    {/* Mode Tampilan List / Grid & Info */}
                    <div className="flex items-center gap-1 rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] p-1">
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          viewMode === 'list'
                            ? 'bg-white shadow-2xs text-[#6B1224]'
                            : 'text-[#8B8391] hover:text-[#1E1C1E]'
                        }`}
                        title="Tampilan List"
                      >
                        <ListIcon size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          viewMode === 'grid'
                            ? 'bg-white shadow-2xs text-[#6B1224]'
                            : 'text-[#8B8391] hover:text-[#1E1C1E]'
                        }`}
                        title="Tampilan Grid"
                      >
                        <GridIcon size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Menampilkan arsip berkas kelas ${cls?.name}. Total ${sharedTableItems.length} dokumen aktif.`
                          )
                        }
                        className="p-1.5 rounded-lg text-[#8B8391] hover:text-[#1E1C1E] transition cursor-pointer"
                        title="Informasi Berkas"
                      >
                        <InfoIcon size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Kotak Tabel Berkas & Folder Lengkap (Card Putih Rounded) */}
                <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 sm:p-6 shadow-xs">
                  {/* Filter Sub-Tab & Search Bar di Atas Tabel */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F4F7] pb-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSharedSubTab('all')}
                        className={[
                          'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer',
                          sharedSubTab === 'all'
                            ? 'bg-[#6B1224] text-white shadow-xs'
                            : 'bg-transparent text-[#8B8391] hover:text-[#6B1224]',
                        ].join(' ')}
                      >
                        <DocIcon size={14} />
                        <span>Semua Berkas</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                            sharedSubTab === 'all' ? 'bg-white/20 text-white' : 'bg-[#F1EEF4] text-[#8B8391]'
                          }`}
                        >
                          {sharedTableItems.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSharedSubTab('messages')}
                        className={[
                          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer',
                          sharedSubTab === 'messages'
                            ? 'bg-[#6B1224] text-white shadow-xs'
                            : 'bg-transparent text-[#8B8391] hover:text-[#6B1224]',
                        ].join(' ')}
                      >
                        <span>💬 Dalam Pesan (In Messages)</span>
                      </button>
                    </div>

                    <div className="relative">
                      <SearchIcon
                        size={14}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A79FAB]"
                      />
                      <input
                        type="text"
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        placeholder="Cari berkas atau folder..."
                        className="w-full sm:w-64 rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] py-2 pl-9 pr-3 text-xs text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Tabel Berkas & Folder */}
                  {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#F5F4F7] text-[11px] font-extrabold uppercase tracking-wider text-[#938B99]">
                            <th className="py-3.5 px-3 w-10">
                              <input
                                type="checkbox"
                                checked={
                                  filteredTableItems.length > 0 &&
                                  selectedIds.size === filteredTableItems.length
                                }
                                onChange={toggleSelectAll}
                                className="rounded border-[#E7E1EA] text-[#6B1224] focus:ring-[#6B1224] cursor-pointer"
                              />
                            </th>
                            <th className="py-3.5 px-3">
                              <span className="flex items-center gap-1 cursor-pointer hover:text-[#1E1C1E]">
                                NAMA BERKAS &amp; FOLDER <span>↑</span>
                              </span>
                            </th>
                            <th className="py-3.5 px-3 whitespace-nowrap">
                              <span className="flex items-center gap-1 cursor-pointer hover:text-[#1E1C1E]">
                                TERAKHIR DIUBAH <span>☰</span>
                              </span>
                            </th>
                            <th className="py-3.5 px-3">DIUBAH OLEH</th>
                            <th className="py-3.5 px-3 text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F4F7]">
                          {filteredTableItems.map((item) => {
                            const isSelected = selectedIds.has(item.id);
                            return (
                              <tr
                                key={item.id}
                                className={`group transition hover:bg-[#FDF9FA] ${
                                  isSelected ? 'bg-[#FBF2F4]' : ''
                                }`}
                              >
                                {/* Checkbox */}
                                <td className="py-3 px-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item.id)}
                                    className="rounded border-[#E7E1EA] text-[#6B1224] focus:ring-[#6B1224] cursor-pointer"
                                  />
                                </td>

                                {/* Nama Berkas / Folder */}
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {item.type === 'folder' ? (
                                      <FolderIcon size={20} className="shrink-0" />
                                    ) : item.type === 'stream' ? (
                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6B1224] text-white">
                                        <VideoIcon size={14} />
                                      </div>
                                    ) : (
                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white font-black text-[9px]">
                                        PDF
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (item.readUrl) {
                                            navigate(item.readUrl);
                                          } else if (item.pdfUrl) {
                                            setPreviewPdf({ url: item.pdfUrl, name: item.name });
                                          } else if (item.taskUrl) {
                                            navigate(item.taskUrl);
                                          } else {
                                            showToast(`Membuka folder: ${item.name}`);
                                          }
                                        }}
                                        className="truncate font-extrabold text-[#1E1C1E] hover:text-[#6B1224] text-left cursor-pointer transition text-xs sm:text-[13px]"
                                      >
                                        {item.name}
                                      </button>

                                      {item.badge && (
                                        <span
                                          className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                                            item.type === 'stream'
                                              ? 'bg-purple-100 text-purple-700'
                                              : 'bg-red-50 text-red-600'
                                          }`}
                                        >
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Terakhir Diubah */}
                                <td className="py-3 px-3 text-[#6C6267] whitespace-nowrap text-[11.5px]">
                                  {item.updatedAt}
                                </td>

                                {/* Diubah Oleh */}
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F9E8EC] text-[10px] font-extrabold text-[#6B1224]">
                                      {item.authorInitials || 'AK'}
                                    </div>
                                    <span className="truncate text-[#1E1C1E] text-xs font-semibold">
                                      {item.author}
                                    </span>
                                  </div>
                                </td>

                                {/* Aksi */}
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-2">
                                    {/* Download icon jika file */}
                                    {item.type !== 'folder' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (item.pdfUrl || item.fileUrl) {
                                            window.open(item.pdfUrl || item.fileUrl, '_blank');
                                          } else {
                                            showToast(`Mengunduh ${item.name}...`);
                                          }
                                        }}
                                        className="p-1 rounded-lg text-[#8B8391] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition cursor-pointer"
                                        title="Unduh Berkas"
                                      >
                                        <DownloadIcon size={14} />
                                      </button>
                                    )}

                                    {/* Menu titik tiga */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.pdfUrl) {
                                          setPreviewPdf({ url: item.pdfUrl, name: item.name });
                                        } else if (item.readUrl) {
                                          navigate(item.readUrl);
                                        } else {
                                          showToast(`Opsi berkas: ${item.name}`);
                                        }
                                      }}
                                      className="p-1 rounded-lg text-[#8B8391] hover:text-[#1E1C1E] hover:bg-[#F5F4F7] transition cursor-pointer"
                                      title="Pilihan Lainnya"
                                    >
                                      <MoreVerticalIcon size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {filteredTableItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[#F1EEF4] bg-[#FCFBFD] p-4 hover:border-[#6B1224]/30 hover:bg-white transition shadow-2xs space-y-3 cursor-pointer"
                          onClick={() => {
                            if (item.pdfUrl) setPreviewPdf({ url: item.pdfUrl, name: item.name });
                            else if (item.readUrl) navigate(item.readUrl);
                            else if (item.taskUrl) navigate(item.taskUrl);
                            else showToast(`Membuka folder: ${item.name}`);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            {item.type === 'folder' ? (
                              <FolderIcon size={26} />
                            ) : item.type === 'stream' ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6B1224] text-white">
                                <VideoIcon size={16} />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-black text-[10px]">
                                PDF
                              </div>
                            )}
                            <span className="text-[10px] text-[#A79FAB] font-semibold">{item.updatedAt}</span>
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-[#1E1C1E] line-clamp-1">{item.name}</p>
                            <p className="text-[11px] text-[#8B8391] mt-0.5">{item.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer Tabel */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F5F4F7] pt-4 text-xs font-medium text-[#8B8391]">
                    <p>
                      Menampilkan {filteredTableItems.length} berkas dan folder (Total:{' '}
                      {sharedTableItems.length} Item)
                    </p>
                    <div className="flex items-center gap-3">
                      <span>Total: ~4.6 MB</span>
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="font-bold text-[#6B1224] hover:underline cursor-pointer"
                      >
                        {selectedIds.size === filteredTableItems.length ? 'Batal Pilih' : 'Pilih Semua'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Tiga Kotak Fitur / Kebijakan di Bagian Bawah Persis Image 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1 */}
                  <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 sm:p-6 shadow-xs flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDF2F4] text-[#6B1224]">
                      <StarDocIcon size={22} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-[#1E1C1E]">
                        Panduan Penggunaan Berkas
                      </h4>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-[#8B8391]">
                        Semua dokumen bertanda SOP dan Panduan telah disahkan oleh Dekanat per Semester Gasal
                        2025/2026.
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 sm:p-6 shadow-xs flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDF2F4] text-[#6B1224]">
                      <UploadBoxIcon size={22} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-[#1E1C1E]">
                        Kebijakan Unggah Mahasiswa
                      </h4>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-[#8B8391]">
                        Mahasiswa dapat mengunggah berkas penugasan pada folder sub-bagian Kerja Praktik dan
                        Tugas Akhir.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-[22px] border border-[#F1EEF4] bg-white p-5 sm:p-6 shadow-xs flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDF2F4] text-[#6B1224]">
                      <ShieldCheckIcon size={22} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-[#1E1C1E]">
                        Izin &amp; Enkripsi Akses
                      </h4>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-[#8B8391]">
                        Semua anggota Departemen Sistem Informasi memiliki hak baca dan salin tautan
                        terenkripsi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal PDF Viewer */}
      {previewPdf && (
        <PdfViewer
          url={previewPdf.url}
          name={previewPdf.name}
          onClose={() => setPreviewPdf(null)}
        />
      )}

      {/* Modal Buat Kelas Baru (Image 2) */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newCls) => {
          setShowCreateModal(false);
          setCreatedClass(newCls);
        }}
      />

      {/* Modal Kelas Berhasil Dibuat (Image 3) */}
      <CreatedSuccessModal
        createdClass={createdClass}
        onClose={() => setCreatedClass(null)}
        onOpenClass={(classId) => {
          setCreatedClass(null);
          navigate(`/kelas/${classId}`);
        }}
      />

      {/* Modal Laporan Analitik */}
      <AnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        classes={cls ? [cls] : []}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#1E1C1E] px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in">
          <span>✓ {toastMsg}</span>
        </div>
      )}
    </div>
  );
}
