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

/* ─── Halaman utama ─── */
export default function ClassManage() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('tugas');

  /* Tugas state */
  const [assignments, setAssignments] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '' });
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
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
      };
      if (editingTask) {
        const updated = await api(`/classes/${classId}/assignments/${editingTask.id}`, { method: 'PATCH', body: payload });
        setAssignments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      } else {
        const created = await api(`/classes/${classId}/assignments`, { method: 'POST', body: payload });
        setAssignments((prev) => [created, ...prev]);
      }
      setShowNewTask(false); setEditingTask(null); setTaskForm({ title: '', description: '', dueDate: '' });
    } catch (err) { setTaskErr(err.message); }
    finally { setTaskBusy(false); }
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

  /* ── Materi ── */
  const saveMaterial = async (e) => {
    e.preventDefault(); setMatErr(''); setMatBusy(true);
    try {
      await api(`/classes/${classId}/materials`, { method: 'POST', body: { title: matForm.title, content: matForm.content } });
      await load();
      setMatForm({ title: '', content: '' }); setShowMatForm(false);
    } catch (err) { setMatErr(err.message); }
    finally { setMatBusy(false); }
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

                            {/* Isi jawaban */}
                            <div className="rounded-xl bg-[#FCFBFD] border border-[#F1EEF4] px-4 py-3 mb-4">
                              <p className="text-[12px] text-[#5B525C] leading-relaxed whitespace-pre-wrap">{s.content}</p>
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
                <h3 className="text-[13px] font-extrabold text-[#1E1C1E]">Materi Baru</h3>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Judul Materi *</label>
                  <input type="text" required value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Contoh: Bab 1 — Pengantar Aljabar Linear"
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#938B99] mb-1.5">Isi Materi * <span className="normal-case font-normal text-[#A79FAB]">(pisahkan paragraf dengan baris kosong)</span></label>
                  <textarea rows={8} required value={matForm.content} onChange={(e) => setMatForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Tempel isi materi di sini..."
                    className="w-full rounded-xl border border-[#E7E1EA] bg-[#FCFBFD] px-4 py-2.5 text-[13px] outline-none focus:border-[#6B1224] focus:bg-white transition resize-none" />
                </div>
                {matErr && <p className="text-[11px] text-red-600 font-semibold">{matErr}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={matBusy}
                    className="flex-1 rounded-full bg-[#6B1224] py-2.5 text-[12px] font-bold text-white hover:bg-[#80142A] disabled:opacity-40 cursor-pointer transition">
                    {matBusy ? 'Menyimpan...' : 'Terbitkan Materi'}
                  </button>
                  <button type="button" onClick={() => setShowMatForm(false)}
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
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 rounded-[16px] border border-[#F1EEF4] bg-white px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] text-white"><FileIcon size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#1E1C1E] truncate">{m.title}</p>
                      <p className="text-[11px] text-[#A79FAB]">{fmtDate(m.createdAt)}</p>
                    </div>
                    <Link to={`/materi/${m.id}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#E7E1EA] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#1E1C1E] no-underline hover:border-[#6B1224] hover:text-[#6B1224] transition">
                      Buka
                    </Link>
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
    </div>
  );
}
