import Anthropic from '@anthropic-ai/sdk';

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

// Generator yang menghasilkan potongan teks. Ganti isi fungsi ini untuk memakai penyedia LLM lain.
export async function* streamChat({ system, messages }) {
  if (!client) {
    yield 'Mode demo (ANTHROPIC_API_KEY belum diisi). Menurutmu, kata atau istilah mana di bagian ini yang pertama kali terasa asing?';
    return;
  }
  const stream = client.messages.stream({
    model: process.env.LLM_MODEL || 'claude-sonnet-5-5',
    max_tokens: 500,
    system,
    messages,
  });
  for await (const ev of stream) {
    if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') yield ev.delta.text;
  }
}
