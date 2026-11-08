import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { securityHeaders } from './middleware/securityHeaders.js';
import { rateLimit } from './middleware/rateLimit.js';
import auth from './routes/auth.js';
import classes from './routes/classes.js';
import materials from './routes/materials.js';
import highlights from './routes/highlights.js';
import tutor from './routes/tutor.js';
import pretest from './routes/pretest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET belum diisi atau terlalu pendek (minimal 16 karakter). Salin .env.example menjadi .env lalu isi.');
  process.exit(1);
}

const app = express();

// Keamanan: Hapus header x-powered-by dan terapkan security headers
app.disable('x-powered-by');
app.use(securityHeaders());

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// Debug middleware - log semua request
app.use((req, res, next) => {
  if (req.url.includes('/pretest')) {
    console.log('📥 Incoming request:', {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      headers: req.headers,
    });
  }
  next();
});

// Rate limit global untuk seluruh endpoint API (120 req / menit per IP)
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/classes', classes);
app.use('/api', materials);
app.use('/api/highlights', highlights);
app.use('/api/tutor', tutor);

console.log('Registering /api/pretest routes...');
app.use('/api/pretest', pretest);
console.log('Pretest routes registered!');

// Sajikan file upload sebagai static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend berjalan di http://localhost:${port}`));
