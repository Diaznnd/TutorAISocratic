import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StudentSidebar from '../components/student/StudentSidebar.jsx';
import StudentTopbar from '../components/student/StudentTopbar.jsx';
import {
  ArrowRightIcon, BookIcon, ChevronLeftIcon, LayersIcon,
  LinkIcon, UploadIcon, XIcon,
} from '../components/student/Icons.jsx';

/* ─── Ikon lokal ─── */
function DocIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}
function FileIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}
function EmojiIcon({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" />
      <circle cx="9.5" cy="10.5" r=".75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10.5" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}
function CheckCircleIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-5" />
    </svg>
  );
}
function SendIcon({ size = 15 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ─── Format tanggal ─── */
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function fmtDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const overdue = d < new Date();
  const label = 'Deadline: ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return { label, overdue };
}

/* ─── PDF Viewer modal ─── */
function PdfViewer({ url, name, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1A1118]/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={name}>
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1118] px-4 py-3">
        <p className="truncate text-[13px] font-bold text-white max-w-[calc(100%-3rem)]">{name}</p>
        <button type="button" onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white cursor-pointer transition">
          <XIcon size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`${url}#toolbar=1`}
          title={name}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ─── Hero banner kelas ─── */
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

/* ─── Tab bar ─── */
function TabBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {['Post', 'Shared'].map((t) => (
        <button key={t} type="button" onClick={() => onChange(t)}
          className={['rounded-full px-5 py-2 text-[13px] font-bold transition-colors cursor-pointer',
            active === t ? 'bg-[#6B1224] text-white shadow-[0_8px_18px_-10px_rgba(107,18,36,0.8)]'
              : 'text-[#8B8391] hover:bg-[#F5F4F7] hover:text-[#6B1224]'].join(' ')}>
          {t}
        </button>
      ))}
    </div>
  );
}

/* ─── Kartu materi (Post tab) ─── */
function MaterialCard({ material }) {
  const [showPdf, setShowPdf] = useState(false);
  return (
    <>
      <div className="rounded-[20px] border border-[#F1EEF4] bg-white">
        <div className="flex items-center gap-3 border-b border-[#F5F4F7] px-5 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] text-white"><DocIcon size={17} /></div>
          <span className="text-[13px] font-bold text-[#1E1C1E]">Materi</span>
          <span className="ml-1 text-[11px] text-[#A79FAB]">{fmtDate(material.createdAt)}</span>
        </div>
        <div className="px-5 py-5">
          <div className="rounded-[14px] border border-[#F1EEF4] bg-[#FCFBFD] px-5 py-4">
            <p className="text-[14px] font-extrabold text-[#1E1C1E]">{material.title}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/materi/${material.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#E7E1EA] bg-white px-4 py-2 text-[12px] font-bold text-[#1E1C1E] transition hover:border-[#6B1224] hover:text-[#6B1224] no-underline">
                Buka Ruang Baca <ArrowRightIcon size={13} />
              </Link>
              {material.pdfUrl && (
                <button type="button" onClick={() => setShowPdf(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-red-600 cursor-pointer">
                  <FileIcon size={13} /> Lihat PDF
                </button>
              )}
            </div>
          </div>
          <button type="button" className="mt-3.5 flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[#A79FAB] transition hover:bg-[#F5F4F7] hover:text-[#6B1224] cursor-pointer">
            <EmojiIcon />
          </button>
        </div>
      </div>
      {showPdf && <PdfViewer url={material.pdfUrl} name={material.pdfName || material.title + '.pdf'} onClose={() => setShowPdf(false)} />}
    </>
  );
}

/* ─── Kartu tugas/assignment (Post tab) ─── */
function AssignmentCard({ assignment, classId }) {
  const [open, setOpen] = useState(false);
  // submitted diinisialisasi dari API (persistent setelah refresh)
  const [submitted, setSubmitted] = useState(
    assignment.submissions?.length > 0 ? assignment.submissions[0] : null
  );

  // Form submission
  const [mode, setMode] = useState('text'); // 'text' | 'link' | 'pdf'
  const [content, setContent] = useState(submitted?.content || '');
  const [linkUrl, setLinkUrl] = useState(submitted?.linkUrl || '');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const fileRef = useRef(null);

  // Buka form: isi ulang dari data submitted
  const handleOpenForm = () => {
    if (submitted) {
      setContent(submitted.content || '');
      setLinkUrl(submitted.linkUrl || '');
      if (submitted.linkUrl) setMode('link');
      else if (submitted.fileUrl) setMode('pdf');
      else setMode('text');
    }
    setOpen(true);
  };

  const due = assignment.dueDate ? fmtDue(assignment.dueDate) : null;
  const isOverdue = due?.overdue && !submitted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setSubmitErr('');
    try {
      let fileUrl = null, fileName = null;
      // Upload PDF dulu jika mode pdf dan ada file baru
      if (mode === 'pdf' && pdfFile) {
        setPdfUploading(true);
        const form = new FormData();
        form.append('file', pdfFile);
        const res = await fetch(`/api/classes/${classId}/assignments/${assignment.id}/upload-pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload gagal');
        fileUrl = data.url;
        fileName = data.name;
        setPdfUploading(false);
      }

      const body = {
        content: mode === 'text' ? content : '',
        linkUrl: mode === 'link' ? linkUrl : null,
        fileUrl: mode === 'pdf' ? (fileUrl || submitted?.fileUrl) : null,
        fileName: mode === 'pdf' ? (fileName || submitted?.fileName) : null,
      };

      const result = await api(`/classes/${classId}/assignments/${assignment.id}/submit`, {
        method: 'POST', body,
      });
      setSubmitted(result);
      setOpen(false);
    } catch (err) {
      setSubmitErr(err.message);
    } finally {
      setBusy(false); setPdfUploading(false);
    }
  };

  return (
    <div className="rounded-[20px] border border-[#F1EEF4] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#F5F4F7] px-5 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D05A6E] text-white"><DocIcon size={17} /></div>
        <span className="text-[13px] font-bold text-[#1E1C1E]">Tugas</span>
        <span className="ml-1 text-[11px] text-[#A79FAB]">{fmtDate(assignment.createdAt)}</span>
        {submitted && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
            <CheckCircleIcon size={13} /> Dikumpulkan
          </span>
        )}
      </div>

      {/* Konten */}
      <div className="px-5 py-5">
        <div className="rounded-[14px] border border-[#F1EEF4] bg-[#FCFBFD] px-5 py-4">
          <p className="text-[14px] font-extrabold text-[#1E1C1E]">{assignment.title}</p>
          {due && (
            <p className={['mt-1 text-[12px] font-semibold', isOverdue ? 'text-red-500' : 'text-[#8B8391]'].join(' ')}>
              {due.label}{isOverdue && ' · Terlambat'}
            </p>
          )}
          {assignment.description && (
            <p className="mt-2 text-[12px] leading-relaxed text-[#5B525C] whitespace-pre-wrap">{assignment.description}</p>
          )}

          {/* Preview apa yang sudah dikumpulkan */}
          {submitted && (
            <div className="mt-3 rounded-xl bg-green-50 border border-green-100 px-3 py-2.5 space-y-1">
              {submitted.content && <p className="text-[12px] text-[#1E1C1E] line-clamp-2">{submitted.content}</p>}
              {submitted.linkUrl && (
                <a href={submitted.linkUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline no-underline">
                  <LinkIcon size={12} /> {submitted.linkUrl}
                </a>
              )}
              {submitted.fileUrl && (
                <a href={submitted.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:underline no-underline">
                  <FileIcon size={12} /> {submitted.fileName || 'File PDF'}
                </a>
              )}
              {submitted.grade != null && (
                <p className="text-[11px] font-bold text-[#6B1224]">
                  Nilai: {submitted.grade}/100 {submitted.feedback && `· ${submitted.feedback}`}
                </p>
              )}
            </div>
          )}

          {/* Tombol aksi */}
          {!submitted ? (
            <button type="button" onClick={() => { setOpen(true); }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6B1224] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#80142A] cursor-pointer">
              <SendIcon size={13} /> Kumpulkan Tugas
            </button>
          ) : (
            <button type="button" onClick={handleOpenForm}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E7E1EA] bg-white px-4 py-2 text-[12px] font-bold text-[#1E1C1E] transition hover:border-[#6B1224] hover:text-[#6B1224] cursor-pointer">
              Edit Jawaban
            </button>
          )}
        </div>

        {/* Form submit */}
        {open && (
          <form onSubmit={handleSubmit} className="mt-4 rounded-[14px] border border-[#E7E1EA] bg-white p-4 space-y-3">
            {/* Pilih mode */}
            <div className="flex gap-1.5">
              {[['text', '✍️ Teks'], ['link', '🔗 Link Drive'], ['pdf', '📄 Upload PDF']].map(([m, label]) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={['rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer',
                    mode === m ? 'bg-[#6B1224] text-white' : 'bg-[#F5F4F7] text-[#8B8391] hover:bg-[#F9E8EC] hover:text-[#6B1224]'].join(' ')}>
                  {label}
                </button>
              ))}
            </div>

            {/* Input sesuai mode */}
            {mode === 'text' && (
              <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis jawaban atau penjelasanmu di sini..."
                className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-3 text-[13px] text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition resize-none" />
            )}

            {mode === 'link' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">
                  Link Google Drive / OneDrive
                </label>
                <div className="relative">
                  <LinkIcon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A79FAB]" />
                  <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] py-2.5 pl-10 pr-4 text-[13px] text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                </div>
                <p className="mt-1 text-[11px] text-[#A79FAB]">Pastikan link dapat diakses oleh siapa saja (public/anyone with link).</p>
              </div>
            )}

            {mode === 'pdf' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">
                  Upload File PDF (maks. 20 MB)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E7E1EA] bg-[#FCFBFD] py-8 transition hover:border-[#6B1224] hover:bg-[#FDF2F4]">
                  <UploadIcon size={24} className="text-[#A79FAB]" />
                  <p className="text-[12px] font-semibold text-[#6C6267]">
                    {pdfFile ? pdfFile.name : (submitted?.fileName || 'Klik untuk memilih file PDF')}
                  </p>
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                {pdfUploading && <p className="mt-1 text-[11px] text-[#6B1224] font-semibold animate-pulse">Mengupload...</p>}
              </div>
            )}

            {submitErr && <p className="text-[11px] text-red-600 font-semibold">{submitErr}</p>}

            <div className="flex gap-2">
              <button type="submit"
                disabled={busy || (mode === 'text' && !content.trim()) || (mode === 'link' && !linkUrl.trim()) || (mode === 'pdf' && !pdfFile && !submitted?.fileUrl)}
                className="flex-1 rounded-full bg-[#6B1224] py-2.5 text-[12px] font-bold text-white transition hover:bg-[#80142A] disabled:opacity-40 cursor-pointer">
                {busy ? 'Mengirim...' : submitted ? 'Perbarui Jawaban' : 'Kumpulkan'}
              </button>
              <button type="button" onClick={() => setOpen(false)}
                className="rounded-full border border-[#E7E1EA] px-4 py-2.5 text-[12px] font-bold text-[#8B8391] hover:bg-[#F5F4F7] cursor-pointer">
                Batal
              </button>
            </div>
          </form>
        )}

        <button type="button" className="mt-3.5 flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[#A79FAB] transition hover:bg-[#F5F4F7] hover:text-[#6B1224] cursor-pointer">
          <EmojiIcon />
        </button>
      </div>
    </div>
  );
}

/* ─── Tab Shared: daftar file/PPT ─── */
function SharedCard({ item }) {
  const [showPdf, setShowPdf] = useState(false);
  const ext = item.fileName.split('.').pop()?.toUpperCase() || 'FILE';
  const isPdf = item.fileType.includes('pdf');
  const color = isPdf ? 'bg-red-500' : 'bg-orange-500';

  return (
    <>
      <div className="flex items-center gap-4 rounded-[16px] border border-[#F1EEF4] bg-white px-5 py-4 transition hover:shadow-sm">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-[11px] font-extrabold ${color}`}>
          {ext.slice(0, 4)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-[#1E1C1E]">{item.title}</p>
          <p className="mt-0.5 truncate text-[11px] text-[#A79FAB]">{item.fileName} · {fmtDate(item.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPdf && (
            <button type="button" onClick={() => setShowPdf(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3.5 py-2 text-[12px] font-bold text-white no-underline transition hover:bg-red-600 cursor-pointer">
              Preview
            </button>
          )}
          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-2 text-[12px] font-bold text-[#1E1C1E] no-underline transition hover:border-[#6B1224] hover:text-[#6B1224]">
            <FileIcon size={13} /> Buka
          </a>
        </div>
      </div>
      {showPdf && <PdfViewer url={item.fileUrl} name={item.fileName} onClose={() => setShowPdf(false)} />}
    </>
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

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('Post');
  const [query, setQuery] = useState('');

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

  const sharedItems = cls?.sharedMaterials || [];
  const filteredShared = query.trim()
    ? sharedItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
    : sharedItems;

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white lg:shadow-[0_0_0_1px_rgba(30,28,30,0.05)]">
        <StudentSidebar activeSection="kelas" onNavigate={goTo} />
        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopbar query={query} onQueryChange={setQuery} />
          <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-7">
            <button type="button" onClick={() => navigate(-1)}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#8B8391] transition hover:bg-[#F5F4F7] hover:text-[#6B1224] cursor-pointer">
              <ChevronLeftIcon size={15} /> Kembali
            </button>

            {loading ? <Skeleton /> : err ? (
              <div role="alert" className="rounded-2xl border border-[#F3D7DD] bg-[#FDF2F4] px-5 py-4 text-sm font-semibold text-[#96263C]">{err}</div>
            ) : (
              <div className="space-y-5">
                <ClassHero cls={cls} />
                <TabBar active={tab} onChange={setTab} />

                {tab === 'Post' && (
                  filteredPost.length === 0
                    ? <Empty icon="📋" title="Belum ada postingan" desc="Dosen belum memposting materi atau tugas untuk kelas ini." />
                    : <div className="space-y-4">
                        {filteredPost.map((item) =>
                          item._type === 'material'
                            ? <MaterialCard key={`m-${item.id}`} material={item} />
                            : <AssignmentCard key={`a-${item.id}`} assignment={item} classId={id} />
                        )}
                      </div>
                )}

                {tab === 'Shared' && (
                  filteredShared.length === 0
                    ? <Empty icon="📂" title="Belum ada file dibagikan" desc="Dosen belum membagikan slide atau file materi untuk kelas ini." />
                    : <div className="space-y-3">
                        {filteredShared.map((item) => <SharedCard key={item.id} item={item} />)}
                      </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
