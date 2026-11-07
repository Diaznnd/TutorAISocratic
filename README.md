# SorotPaham (kerangka awal)

Backend: Node.js + Express + Prisma (SQLite) + JWT. Frontend: React + Vite.

## Menjalankan

```bash
# Terminal 1: backend
cd backend
cp .env.example .env        # isi JWT_SECRET (dan ANTHROPIC_API_KEY bila ada)
npm install
npm run db:push             # membuat database SQLite
npm run dev                 # http://localhost:4000

# Terminal 2: frontend
cd frontend
npm install
npm run dev                 # http://localhost:5173 (meneruskan /api ke backend)
```

Tanpa ANTHROPIC_API_KEY, tutor memakai balasan demo tetap, jadi alur sorot-lalu-tutor tetap bisa dicoba.

## Alur uji cepat
1. Daftar sebagai dosen, buat kelas, catat kode kelas, tambah materi (pisahkan paragraf dengan baris kosong).
2. Daftar sebagai mahasiswa (jendela penyamaran), gabung dengan kode kelas, buka materi, sorot teks, klik "Saya belum paham bagian ini".
3. Masuk lagi sebagai dosen, buka materi yang sama: paragraf yang disorot berwarna.

## Sudah ada
Login dan peran, kelas dan kode kelas, materi per paragraf, sorotan, tutor Socratic dengan streaming (tingkat petunjuk 1-5 diatur server), peta panas agregat untuk dosen.

## Belum ada (kerjakan sesuai prioritas)
- Ringkasan sesi dengan keluaran JSON terstruktur (kolom `summary` sudah disiapkan)
- Pola belajar per mahasiswa dan penyesuaian level awal petunjuk
- Pemeriksaan agar balasan tutor tidak memuat jawaban akhir
- Unggah PDF (sekarang materi ditempel sebagai teks)
- Docker, CI/CD, dan batas laju (rate limit)

## Catatan
- Nama model di `LLM_MODEL` perlu dicek ulang dengan dokumentasi penyedia.
- Ganti SQLite ke PostgreSQL bila perlu: ubah `provider` dan `DATABASE_URL` di `prisma/schema.prisma`.
- Pastikan kerangka ini hanya setup awal; aturan lomba melarang memakai kode utuh yang pernah dibuat atau dilombakan.
