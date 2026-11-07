import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Pastikan folder uploads tersedia
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.error('Gagal membuat folder uploads:', e);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const rand = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `${rand}${ext}`);
  },
});

const PDF_MIMES = [
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
  'application/octet-stream',
  'binary/octet-stream',
];

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Jika berekstensi .pdf atau MIME type bertipe PDF / binary stream, loloskan
    if (ext === '.pdf' || PDF_MIMES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Hanya file PDF yang diizinkan (ekstensi .pdf)'));
  },
}).single('file');

/** Express middleware — wrap multer agar error dihandle proper */
export function handleUpload(req, res, next) {
  uploadPdf(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload gagal' });
    next();
  });
}
