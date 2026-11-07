/**
 * ClassManage.jsx — Halaman dosen untuk mengelola satu kelas:
 * - Tab "Materi": tambah materi teks
 * - Tab "Tugas": buat tugas (judul, deskripsi, deadline) + lihat & nilai submission mahasiswa
 * - Tab "Shared": tambah link file (PDF/PPT)
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

/* ─── Ikon ─── */
function Icon({ d, size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}
const BackIcon = (p) => <Icon {...p} d="M15 18 9 12l6-6" />;
const PlusIcon = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const TrashIcon = (p) => <Icon {...p} d={['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6']} />;
const EditIcon = (p) => <Icon {...p} d={['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z']} />;
const CheckIcon = (p) => <Icon {...p} d="m5 12.8 4.4 4.2L19 6.6" />;
const StarIcon = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />;
const FileIcon = (p) => <Icon {...p} d={['M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z', 'M13 2v7h7']} />;

/* ─── Format tanggal ─── */
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function fmtDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Tab bar ─── */
function TabBar({ active, onChange, tabs }) {
  return (
    <div className="flex items-center gap-1 border-b border-[#F1EEF4] pb-1 mb-6">
      {tabs.map((t) => (
        <button key={t.key} type="button" onClick={() => onChange(t.key)}
          className={['px-4 py-2 text-[13px] font-bold rounded-t-xl transition-colors cursor-pointer',
            active === t.key ? 'bg-[#6B1224] text-white' : 'text-[#8B8391] hover:text-[#6B1224] hover:bg-[#F9E8EC]'].join(' ')}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Badge status submission ─── */
function GradeBadge({ grade }) {
  if (grade == null) return <span className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-[11px] font-bold text-yellow-700">Belum dinilai</span>;
  const color = grade >= 75 ? 'green' : grade >= 50 ? 'yellow' : 'red';
  const cls = { green: 'bg-green-50 text-green-700', yellow: 'bg-yellow-50 text-yellow-700', red: 'bg-red-50 text-red-600' }[color];
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{grade}/100</span>;
}

/* ─── PDF Viewer modal ─── */
function PdfViewer({ url, name, onClose }) {
  const fileUrl = url?.startsWith('http') || url?.startsWith('/') ? url : `/${url}`;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1A1118]/85 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={name}>
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
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white cursor-pointer transition">
            ✕
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

/* ─── Halaman utama ─── */
export default function ClassManage() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('tugas');
  const [previewPdf, setPreviewPdf] = useState(null); // { url, name }

  /* Tugas state */
  const [assignments, setAssignments] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '' });
  const [taskPdfFile, setTaskPdfFile] = useState(null);
  const [taskPdfUploading, setTaskPdfUploading] = useState(false);
  const [taskBusy, setTaskBusy] = useState(false);
  const [taskErr, setTaskErr] = useState('');
  const [editingTask, setEditingTask] = useState(null); // assignment object

  /* Submission/penilaian state */
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [gradeForm, setGradeForm] = useState({}); // { subId: { grade, feedback } }
  const [gradeBusy, setGradeBusy] = useState({});

  /* Materi state */
  const [materials, setMaterials] = useState([]);
  const [matForm, setMatForm] = useState({ title: '', content: '' });
  const [matPdfFile, setMatPdfFile] = useState(null);
  const [matPdfUploading, setMatPdfUploading] = useState(false);
  const [matBusy, setMatBusy] = useState(false);
  const [matErr, setMatErr] = useState('');
  const [showMatForm, setShowMatForm] = useState(false);

  /* Shared state */
  const [shared, setShared] = useState([]);
  const [sharedForm, setSharedForm] = useState({ title: '', fileUrl: '', fileName: '', fileType: 'application/pdf' });
  const [sharedBusy, setSharedBusy] = useState(false);
  const [sharedErr, setSharedErr] = useState('');
  const [showSharedForm, setShowSharedForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api(`/classes/${classId}`);
      if (data.owner?.id !== user.id) { setErr('Akses ditolak: bukan kelas Anda'); return; }
      setCls(data);
      setAssignments(data.assignments || []);
      setMaterials(data.materials || []);
      setShared(data.sharedMaterials || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [classId, user.id]);

  useEffect(() => { load(); }, [load]);

  /* ── Tugas: create/update ── */
  const saveTask = async (e) => {
    e.preventDefault(); setTaskErr(''); setTaskBusy(true);
    try {
      let finalDescription = taskForm.description || '';
      if (taskPdfFile) {
        setTaskPdfUploading(true);
        const form = new FormData();
        form.append('file', taskPdfFile);
        const res = await fetch(`/api/classes/${classId}/materials/upload-pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: form,
        });
        const up = await res.json();
        if (!res.ok) throw new Error(up.error || 'Upload lampiran soal PDF gagal');
        finalDescription = (finalDescription ? finalDescription + '\n\n' : '') + `📄 [Lampiran PDF: ${up.name}](${up.url})`;
      }

      const payload = {
        title: taskForm.title,
        description: finalDescription,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
      };
      if (editingTask) {
        const updated = await api(`/classes/${classId}/assignments/${editingTask.id}`, { method: 'PATCH', body: payload });
        setAssignments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      } else {
        const created = await api(`/classes/${classId}/assignments`, { method: 'POST', body: payload });
        setAssignments((prev) => [created, ...prev]);
      }
      setShowNewTask(false); setEditingTask(null); setTaskForm({ title: '', description: '', dueDate: '' }); setTaskPdfFile(null);
    } catch (err) { setTaskErr(err.message); }
    finally { setTaskBusy(false); setTaskPdfUploading(false); }
  };

  const deleteTask = async (asgId) => {
    if (!window.confirm('Hapus tugas ini? Semua submission akan ikut terhapus.')) return;
    await api(`/classes/${classId}/assignments/${asgId}`, { method: 'DELETE' });
    setAssignments((prev) => prev.filter((a) => a.id !== asgId));
    if (selectedTask?.id === asgId) setSelectedTask(null);
  };

  const openEdit = (a) => {
    setEditingTask(a);
    setTaskForm({
      title: a.title,
      description: a.description || '',
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : '',
    });
    setTaskPdfFile(null);
    setShowNewTask(true);
  };

  /* ── Lihat submission ── */
  const viewSubmissions = async (a) => {
    setSelectedTask(a); setSubLoading(true);
    try {
      const data = await api(`/classes/${classId}/assignments/${a.id}/submissions`);
      setSubmissions(data);
      // Init form nilai
      const forms = {};
      data.forEach((s) => { forms[s.id] = { grade: s.grade ?? '', feedback: s.feedback ?? '' }; });
      setGradeForm(forms);
    } catch (err) { console.error(err); }
    finally { setSubLoading(false); }
  };

  const submitGrade = async (subId) => {
    setGradeBusy((b) => ({ ...b, [subId]: true }));
    const { grade, feedback } = gradeForm[subId] || {};
    try {
      const updated = await api(`/classes/${classId}/assignments/${selectedTask.id}/submissions/${subId}/grade`, {
        method: 'PATCH', body: { grade: Number(grade), feedback: feedback || '' },
      });
      setSubmissions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    } catch (err) { console.error(err); }
    finally { setGradeBusy((b) => ({ ...b, [subId]: false })); }
  };

  /* ── Materi: create ── */
  const saveMaterial = async (e) => {
    e.preventDefault(); setMatErr(''); setMatBusy(true);
    try {
      let pdfUrl = null;
      let pdfName = null;
      if (matPdfFile) {
        setMatPdfUploading(true);
        const form = new FormData();
        form.append('file', matPdfFile);
        const res = await fetch(`/api/classes/${classId}/materials/upload-pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: form,
        });
        const up = await res.json();
        if (!res.ok) throw new Error(up.error || 'Upload PDF materi gagal');
        pdfUrl = up.url;
        pdfName = up.name;
      }

      await api(`/classes/${classId}/materials`, {
        method: 'POST',
        body: {
          title: matForm.title.trim(),
          content: matForm.content.trim(),
          pdfUrl,
          pdfName,
        },
      });
      await load();
      setMatForm({ title: '', content: '' });
      setMatPdfFile(null);
      setShowMatForm(false);
    } catch (err) { setMatErr(err.message); }
    finally { setMatBusy(false); setMatPdfUploading(false); }
  };

  const deleteMaterial = async (matId) => {
    if (!window.confirm('Hapus materi ini? Paragraf dan sorotan mahasiswa akan ikut terhapus.')) return;
    try {
      await api(`/materials/${matId}`, { method: 'DELETE' });
      setMaterials((prev) => prev.filter((m) => m.id !== matId));
    } catch (e) {
      alert(e.message || 'Gagal menghapus materi');
    }
  };

  /* ── Shared ── */
  const saveShared = async (e) => {
    e.preventDefault(); setSharedErr(''); setSharedBusy(true);
    try {
      const created = await api(`/classes/${classId}/shared`, { method: 'POST', body: sharedForm });
      setShared((prev) => [created, ...prev]);
      setSharedForm({ title: '', fileUrl: '', fileName: '', fileType: 'application/pdf' });
      setShowSharedForm(false);
    } catch (err) { setSharedErr(err.message); }
    finally { setSharedBusy(false); }
  };

  const deleteShared = async (sid) => {
    if (!window.confirm('Hapus file ini?')) return;
    await api(`/classes/${classId}/shared/${sid}`, { method: 'DELETE' });
    setShared((prev) => prev.filter((s) => s.id !== sid));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F4F7] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B1224] border-t-transparent" />
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-[#F5F4F7] flex items-center justify-center px-4">
      <div className="rounded-2xl bg-[#FDF2F4] border border-[#F3D7DD] px-6 py-5 text-[#96263C] font-semibold text-sm">{err}</div>
    </div>
  );

  const tabs = [
    { key: 'tugas', label: `Tugas (${assignments.length})` },
    { key: 'materi', label: `Materi (${materials.length})` },
    { key: 'shared', label: `Shared (${shared.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F7] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1C1E]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button type="button" onClick={() => navigate('/app')}
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8B8391] hover:text-[#6B1224] cursor-pointer">
            <BackIcon size={14} /> Kembali ke Dashboard
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F9E8EC] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6B1224] mb-2">
                📋 Kelola Kelas
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1C1E] tracking-tight">{cls?.name}</h1>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-full border border-[#E5D5D8] bg-white px-3 py-0.5 font-mono text-[11px] font-bold text-[#6B1224]">
                  Kode: {cls?.code}
                </span>
                <span className="text-[11px] text-[#A79FAB]">{(cls?.enrollments?.length ?? 0)} mahasiswa terdaftar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar active={tab} onChange={setTab} tabs={tabs} />

        {/* ══ TAB TUGAS ══ */}
        {tab === 'tugas' && (
          <div>
            {/* Panel kiri: list tugas / kanan: panel submission */}
            <div className={`grid gap-6 ${selectedTask ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>

              {/* Kolom kiri — daftar tugas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">Daftar Tugas</h2>
                  <button type="button" onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '', dueDate: '' }); setShowNewTask((v) => !v); }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1224] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#80142A] cursor-pointer transition">
                    <PlusIcon size={13} /> Buat Tugas
                  </button>
                </div>

                {/* Form buat/edit tugas */}
                {showNewTask && (
                  <form onSubmit={saveTask} className="mb-5 rounded-[18px] border border-[#F1EEF4] bg-white p-5 space-y-4">
                    <h3 className="text-[13px] font-extrabold text-[#1E1C1E]">{editingTask ? 'Edit Tugas' : 'Buat Tugas Baru'}</h3>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Judul Tugas *</label>
                      <input type="text" required value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Contoh: Latihan Pertemuan 5"
                        className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Deskripsi Tugas</label>
                      <textarea rows={4} value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Jelaskan apa yang harus dikerjakan mahasiswa, referensi, dan kriteria penilaian..."
                        className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition resize-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Deadline</label>
                      <input type="datetime-local" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                        className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] text-[#1E1C1E] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                    </div>

                    {/* Lampiran PDF Soal / Panduan Tugas */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">
                        Lampiran File Soal / Panduan Tugas (PDF)
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[12px] font-bold text-[#6B1224] hover:bg-[#F9E8EC] cursor-pointer transition">
                          <FileIcon size={14} />
                          <span>Pilih Dokumen PDF</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => setTaskPdfFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        {taskPdfFile && (
                          <div className="flex items-center gap-2 rounded-xl bg-[#F9E8EC] px-3 py-1.5 text-[11px] font-bold text-[#6B1224]">
                            <span className="truncate max-w-[220px]">{taskPdfFile.name}</span>
                            <span className="text-[10px] text-[#8B8391]">({(taskPdfFile.size / 1024).toFixed(0)} KB)</span>
                            <button
                              type="button"
                              onClick={() => setTaskPdfFile(null)}
                              className="ml-1 text-red-600 hover:text-red-800 font-extrabold cursor-pointer"
                              title="Hapus file"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      {taskPdfUploading && (
                        <p className="mt-1.5 text-[11px] font-semibold text-[#6B1224] animate-pulse">
                          Mengunggah lampiran PDF...
                        </p>
                      )}
                    </div>
                    {taskErr && <p className="text-[11px] text-red-600 font-semibold">{taskErr}</p>}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={taskBusy}
                        className="flex-1 rounded-full bg-[#6B1224] py-2.5 text-[12px] font-bold text-white hover:bg-[#80142A] disabled:opacity-40 cursor-pointer transition">
                        {taskBusy ? 'Menyimpan...' : editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
                      </button>
                      <button type="button" onClick={() => { setShowNewTask(false); setEditingTask(null); }}
                        className="rounded-full border border-[#E7E1EA] px-5 py-2.5 text-[12px] font-bold text-[#8B8391] hover:bg-[#F5F4F7] cursor-pointer transition">
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* List tugas */}
                {assignments.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F9E8EC] text-[#6B1224] text-xl mb-3">📋</div>
                    <p className="text-sm font-bold text-[#1E1C1E]">Belum ada tugas</p>
                    <p className="text-xs text-[#8B8391] mt-1">Klik "Buat Tugas" untuk menambahkan tugas pertama.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((a) => {
                      const due = a.dueDate ? fmtDue(a.dueDate) : null;
                      const isSelected = selectedTask?.id === a.id;
                      return (
                        <div key={a.id} className={['rounded-[16px] border bg-white p-4 transition cursor-pointer hover:shadow-sm',
                          isSelected ? 'border-[#6B1224] ring-1 ring-[#6B1224]/20' : 'border-[#F1EEF4]'].join(' ')}
                          onClick={() => viewSubmissions(a)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-extrabold text-[#1E1C1E] truncate">{a.title}</p>
                              {due && <p className="text-[11px] text-[#A79FAB] mt-0.5">Deadline: {due}</p>}
                              {a.description && <p className="text-[12px] text-[#6C6267] mt-1 line-clamp-2">{a.description}</p>}
                              {(() => {
                                const pdf = extractPdfFromDesc(a.description);
                                if (!pdf) return null;
                                return (
                                  <div className="mt-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewPdf({ url: pdf.url, name: pdf.name });
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 cursor-pointer transition"
                                    >
                                      <FileIcon size={12} /> Lihat Lampiran PDF
                                    </button>
                                  </div>
                                );
                              })()}
                              <p className="text-[11px] text-[#A79FAB] mt-1.5">Dibuat: {fmtDate(a.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#A79FAB] hover:bg-[#F5F4F7] hover:text-[#6B1224] cursor-pointer transition" title="Edit">
                                <EditIcon size={14} />
                              </button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteTask(a.id); }}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#A79FAB] hover:bg-red-50 hover:text-red-600 cursor-pointer transition" title="Hapus">
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kolom kanan — panel penilaian submission */}
              {selectedTask && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">
                      Submission: {selectedTask.title}
                    </h2>
                    <button type="button" onClick={() => setSelectedTask(null)} className="text-[11px] text-[#A79FAB] hover:text-[#6B1224] cursor-pointer font-semibold">Tutup ✕</button>
                  </div>

                  {subLoading ? (
                    <div className="space-y-3">
                      {[0, 1, 2].map((k) => <div key={k} className="h-20 rounded-[16px] bg-[#F1EEF4] animate-pulse" />)}
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F9E8EC] text-[#6B1224] text-xl mb-3">📭</div>
                      <p className="text-sm font-bold text-[#1E1C1E]">Belum ada yang mengumpulkan</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      {submissions.map((s) => {
                        const gf = gradeForm[s.id] || { grade: s.grade ?? '', feedback: s.feedback ?? '' };
                        const busy = gradeBusy[s.id];
                        return (
                          <div key={s.id} className="rounded-[16px] border border-[#F1EEF4] bg-white p-5">
                            {/* Info mahasiswa */}
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-[13px] font-extrabold text-[#1E1C1E]">{s.user.name}</p>
                                <p className="text-[11px] text-[#A79FAB]">{s.user.email} · dikumpul {fmtDate(s.submittedAt)}</p>
                              </div>
                              <GradeBadge grade={s.grade} />
                            </div>

                            {/* Isi jawaban mahasiswa */}
                            <div className="rounded-xl bg-[#FCFBFD] border border-[#F1EEF4] px-4 py-3.5 mb-4 space-y-2.5">
                              {s.content ? (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#938B99] mb-1">Jawaban Teks</p>
                                  <p className="text-[12px] text-[#1E1C1E] leading-relaxed whitespace-pre-wrap">{s.content}</p>
                                </div>
                              ) : null}

                              {s.linkUrl && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#938B99] mb-1">Tautan Drive / Cloud</p>
                                  <a
                                    href={s.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition no-underline"
                                  >
                                    <span>🔗 {s.linkUrl}</span> ↗
                                  </a>
                                </div>
                              )}

                              {s.fileUrl && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#938B99] mb-1">File Dokumen yang Dikumpulkan</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPdf({ url: s.fileUrl, name: `${s.user.name} — ${s.fileName || 'Jawaban Tugas.pdf'}` })}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                                    >
                                      <FileIcon size={12} />
                                      <span>Lihat File PDF ({s.fileName || 'Dokumen'})</span>
                                    </button>
                                    <a
                                      href={s.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="inline-flex items-center gap-1 rounded-full border border-[#E7E1EA] bg-white px-3 py-1.5 text-[11px] font-bold text-[#6C6267] hover:border-[#6B1224] hover:text-[#6B1224] transition no-underline"
                                    >
                                      <span>Unduh File</span> ↗
                                    </a>
                                  </div>
                                </div>
                              )}

                              {!s.content && !s.linkUrl && !s.fileUrl && (
                                <p className="text-xs text-[#8B8391] italic">Tidak ada konten jawaban yang disertakan.</p>
                              )}
                            </div>

                            {/* Form penilaian */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-[#938B99] mb-1">
                                    Nilai (0–100)
                                  </label>
                                  <input type="number" min={0} max={100} value={gf.grade}
                                    onChange={(e) => setGradeForm((f) => ({ ...f, [s.id]: { ...gf, grade: e.target.value } }))}
                                    className="w-full rounded-xl border border-[#E7E1EA] bg-white px-3 py-2 text-[13px] font-bold text-[#1E1C1E] outline-none focus:border-[#6B1224] transition" />
                                </div>
                                <button type="button" onClick={() => submitGrade(s.id)}
                                  disabled={busy || gf.grade === '' || Number(gf.grade) < 0 || Number(gf.grade) > 100}
                                  className="mt-5 flex items-center gap-1.5 rounded-full bg-[#6B1224] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#80142A] disabled:opacity-40 cursor-pointer transition">
                                  {busy ? '...' : <><CheckIcon size={13} /> Simpan</>}
                                </button>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-[#938B99] mb-1">
                                  Komentar / Feedback
                                </label>
                                <textarea rows={2} value={gf.feedback}
                                  onChange={(e) => setGradeForm((f) => ({ ...f, [s.id]: { ...gf, feedback: e.target.value } }))}
                                  placeholder="Tambahkan komentar untuk mahasiswa..."
                                  className="w-full rounded-xl border border-[#E7E1EA] bg-white px-3 py-2 text-[12px] text-[#1E1C1E] outline-none focus:border-[#6B1224] transition resize-none" />
                              </div>
                              {s.gradedAt && <p className="text-[11px] text-[#A79FAB]">Terakhir dinilai: {fmtDate(s.gradedAt)}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB MATERI ══ */}
        {tab === 'materi' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">Materi Kelas</h2>
              <button type="button" onClick={() => setShowMatForm((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1224] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#80142A] cursor-pointer transition">
                <PlusIcon size={13} /> Tambah Materi
              </button>
            </div>

            {showMatForm && (
              <form onSubmit={saveMaterial} className="mb-5 rounded-[18px] border border-[#F1EEF4] bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-extrabold text-[#1E1C1E]">Materi Baru</h3>
                  {matPdfFile && (
                    <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                      Mode Lampiran PDF
                    </span>
                  )}
                </div>

                {/* Upload PDF Materi */}
                <div className="rounded-2xl border-2 border-dashed border-[#E7E1EA] bg-[#FCFBFD] p-4 text-center hover:border-[#6B1224] transition">
                  <label className="cursor-pointer block">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-2">
                      <FileIcon size={20} />
                    </div>
                    <p className="text-[12px] font-bold text-[#1E1C1E]">
                      {matPdfFile ? matPdfFile.name : 'Unggah File PDF Materi Pengajar'}
                    </p>
                    <p className="text-[11px] text-[#8B8391] mt-0.5">
                      {matPdfFile
                        ? `Ukuran: ${(matPdfFile.size / 1024).toFixed(0)} KB · Klik untuk mengganti`
                        : 'Pilih file PDF bahan ajar (slide, modul, handout, dll.) maks. 20 MB'}
                    </p>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setMatPdfFile(file);
                          if (!matForm.title.trim()) {
                            setMatForm((f) => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }));
                          }
                        }
                      }}
                    />
                  </label>
                  {matPdfFile && (
                    <button
                      type="button"
                      onClick={() => setMatPdfFile(null)}
                      className="mt-2 text-[11px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      ✕ Batalkan pilihan file PDF
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Judul Materi *</label>
                  <input type="text" required value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Contoh: Bab 1 — Pengantar Aljabar Linear"
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">
                    {matPdfFile ? 'Isi Teks / Penjelasan Tambahan (Opsional)' : 'Isi Teks Materi *'}
                    <span className="normal-case font-normal text-[#A79FAB]"> (pisahkan paragraf dengan baris kosong)</span>
                  </label>
                  <textarea rows={matPdfFile ? 4 : 8}
                    required={!matPdfFile}
                    value={matForm.content}
                    onChange={(e) => setMatForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder={matPdfFile ? 'Tulis catatan pengantar atau ringkasan modul jika ada (opsional)...' : 'Tempel isi teks materi di sini...'}
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition resize-none" />
                </div>

                {matPdfUploading && (
                  <p className="text-[11px] font-semibold text-[#6B1224] animate-pulse">
                    Sedang mengunggah dokumen PDF...
                  </p>
                )}
                {matErr && <p className="text-[11px] text-red-600 font-semibold">{matErr}</p>}

                <div className="flex gap-2">
                  <button type="submit" disabled={matBusy || matPdfUploading}
                    className="flex-1 rounded-full bg-[#6B1224] py-2.5 text-[12px] font-bold text-white hover:bg-[#80142A] disabled:opacity-40 cursor-pointer transition">
                    {matPdfUploading ? 'Mengunggah PDF...' : matBusy ? 'Menyimpan...' : 'Terbitkan Materi'}
                  </button>
                  <button type="button" onClick={() => { setShowMatForm(false); setMatPdfFile(null); }}
                    className="rounded-full border border-[#E7E1EA] px-5 py-2.5 text-[12px] font-bold text-[#8B8391] hover:bg-[#F5F4F7] cursor-pointer transition">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {materials.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F9E8EC] text-[#6B1224] text-xl mb-3">📄</div>
                <p className="text-sm font-bold text-[#1E1C1E]">Belum ada materi</p>
                <p className="text-xs text-[#8B8391] mt-1">Klik "Tambah Materi" untuk mengunggah PDF atau teks modul pembelajaran.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#F1EEF4] bg-white px-5 py-4 transition hover:shadow-xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${m.pdfUrl ? 'bg-red-500' : 'bg-[#4F46E5]'}`}>
                        <FileIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-bold text-[#1E1C1E] truncate">{m.title}</p>
                          {m.pdfUrl && (
                            <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                              PDF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#A79FAB]">
                          {m.pdfName ? `${m.pdfName} · ` : ''}{fmtDate(m.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {m.pdfUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewPdf({ url: m.pdfUrl, name: m.pdfName || m.title })}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                        >
                          <FileIcon size={12} /> Lihat PDF
                        </button>
                      )}
                      <Link to={`/materi/${m.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#1E1C1E] no-underline hover:border-[#6B1224] hover:text-[#6B1224] transition">
                        Ruang Baca
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteMaterial(m.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#A79FAB] hover:bg-red-50 hover:text-red-600 cursor-pointer transition"
                        title="Hapus Materi"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB SHARED ══ */}
        {tab === 'shared' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-[#1E1C1E]">File Dibagikan</h2>
              <button type="button" onClick={() => setShowSharedForm((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1224] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#80142A] cursor-pointer transition">
                <PlusIcon size={13} /> Tambah File
              </button>
            </div>

            {showSharedForm && (
              <form onSubmit={saveShared} className="mb-5 rounded-[18px] border border-[#F1EEF4] bg-white p-5 space-y-4">
                <h3 className="text-[13px] font-extrabold text-[#1E1C1E]">Bagikan File / Slide</h3>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Judul *</label>
                  <input type="text" required value={sharedForm.title} onChange={(e) => setSharedForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Contoh: Slide Pertemuan 3"
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">URL File *</label>
                  <input type="url" required value={sharedForm.fileUrl} onChange={(e) => setSharedForm((f) => ({ ...f, fileUrl: e.target.value }))}
                    placeholder="https://drive.google.com/file/..."
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                  <p className="mt-1 text-[11px] text-[#A79FAB]">Gunakan Google Drive, OneDrive, atau link publik lainnya.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Nama File *</label>
                    <input type="text" required value={sharedForm.fileName} onChange={(e) => setSharedForm((f) => ({ ...f, fileName: e.target.value }))}
                      placeholder="slide-pertemuan-3.pptx"
                      className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Tipe File</label>
                    <select value={sharedForm.fileType} onChange={(e) => setSharedForm((f) => ({ ...f, fileType: e.target.value }))}
                      className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition">
                      <option value="application/pdf">PDF</option>
                      <option value="application/vnd.ms-powerpoint">PPT</option>
                      <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">PPTX</option>
                      <option value="application/vnd.ms-excel">XLS</option>
                      <option value="application/msword">DOC</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                {sharedErr && <p className="text-[11px] text-red-600 font-semibold">{sharedErr}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={sharedBusy}
                    className="flex-1 rounded-full bg-[#6B1224] py-2.5 text-[12px] font-bold text-white hover:bg-[#80142A] disabled:opacity-40 cursor-pointer transition">
                    {sharedBusy ? 'Menyimpan...' : 'Bagikan File'}
                  </button>
                  <button type="button" onClick={() => setShowSharedForm(false)}
                    className="rounded-full border border-[#E7E1EA] px-5 py-2.5 text-[12px] font-bold text-[#8B8391] hover:bg-[#F5F4F7] cursor-pointer transition">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {shared.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[#E7E1EA] bg-[#FCFBFD] px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F9E8EC] text-[#6B1224] text-xl mb-3">📂</div>
                <p className="text-sm font-bold text-[#1E1C1E]">Belum ada file dibagikan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shared.map((s) => {
                  const ext = s.fileName.split('.').pop()?.toUpperCase() || 'FILE';
                  return (
                    <div key={s.id} className="flex items-center gap-4 rounded-[16px] border border-[#F1EEF4] bg-white px-5 py-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-extrabold ${s.fileType.includes('pdf') ? 'bg-red-500' : 'bg-orange-500'}`}>{ext.slice(0, 4)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-[#1E1C1E] truncate">{s.title}</p>
                        <p className="text-[11px] text-[#A79FAB]">{s.fileName} · {fmtDate(s.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#1E1C1E] no-underline hover:border-[#6B1224] hover:text-[#6B1224] transition">
                          Buka
                        </a>
                        <button type="button" onClick={() => deleteShared(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#A79FAB] hover:bg-red-50 hover:text-red-600 cursor-pointer transition">
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {previewPdf && (
        <PdfViewer
          url={previewPdf.url}
          name={previewPdf.name}
          onClose={() => setPreviewPdf(null)}
        />
      )}
    </div>
  );
}
