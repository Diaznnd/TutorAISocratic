/* Progres belajar pelajar — disimpan di localStorage (frontend saja).
   Satu materi dianggap "selesai dibaca" ketika pelajar membuka halaman materinya. */

const KEY = 'sp_read_materials';

function readSet() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markMaterialRead(materialId) {
  if (!materialId) return;
  try {
    const set = readSet();
    set.add(String(materialId));
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* localStorage penuh / diblokir — abaikan, progres hanya pelengkap UI */
  }
}

export function readMaterialIds() {
  return readSet();
}
