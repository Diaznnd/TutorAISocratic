/**
 * LLM client via 9router (OpenAI-compatible gateway).
 * 9router berjalan di VPS TencentCloud dan meneruskan request ke
 * Gemini, Meta Muse, GLM, atau provider lain sesuai routing rules-nya.
 *
 * Konfigurasi di .env:
 *   NINEROUTER_BASE_URL  = http://<IP_PUBLIC>:<PORT>/v1
 *   NINEROUTER_API_KEY   = <api-key-dari-dashboard-9router>
 *   LLM_MODEL            = nama model atau "auto" (9router yang decide)
 */

const NINEROUTER_BASE_URL = process.env.NINEROUTER_BASE_URL;
const NINEROUTER_API_KEY = process.env.NINEROUTER_API_KEY || 'dummy';
const LLM_MODEL = process.env.LLM_MODEL || 'auto';

const isConfigured = Boolean(NINEROUTER_BASE_URL);

/**
 * Async generator yang menghasilkan potongan teks dari LLM via 9router.
 * Menggunakan OpenAI streaming API format (text/event-stream + SSE delta).
 *
 * @param {{ system: string, messages: Array<{role: string, content: string}> }} param
 */
export async function* streamChat({ system, messages }) {
  if (!isConfigured) {
    yield 'Mode demo (NINEROUTER_BASE_URL belum diisi). Menurutmu, kata atau istilah mana di bagian ini yang pertama kali terasa asing?';
    return;
  }

  const body = JSON.stringify({
    model: LLM_MODEL,
    max_tokens: 500,
    stream: true,
    messages: [
      { role: 'system', content: system },
      ...messages,
    ],
  });

  const res = await fetch(`${NINEROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NINEROUTER_API_KEY}`,
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`9router error ${res.status}: ${errText}`);
  }

  // Baca SSE stream dari response body
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop(); // simpan baris terakhir yang mungkin belum lengkap

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // abaikan baris SSE yang tidak valid
      }
    }
  }
}

/**
 * Non-streaming completion call to 9router.
 * Digunakan untuk analisis analitik pedagogis, rekomendasi AI, dan evaluasi terstruktur.
 */
export async function generateChat({ system, messages, maxTokens = 1200 }) {
  if (!isConfigured) {
    return null;
  }

  try {
    const body = JSON.stringify({
      model: LLM_MODEL,
      max_tokens: maxTokens,
      stream: false,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    });

    const res = await fetch(`${NINEROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NINEROUTER_API_KEY}`,
      },
      body,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      console.warn(`9router error ${res.status}: ${errText}`);
      return null;
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('generateChat failed:', err.message);
    return null;
  }
}
