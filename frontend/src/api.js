const token = () => localStorage.getItem('token');

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

// Membaca balasan tutor (Server-Sent Events) lewat fetch.
export async function streamTutor(payload, onEvent) {
  const res = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Tutor tidak dapat dihubungi');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop();
    for (const p of parts) if (p.startsWith('data: ')) onEvent(JSON.parse(p.slice(6)));
  }
}
