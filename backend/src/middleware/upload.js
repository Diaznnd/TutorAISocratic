import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const rand = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${rand}${ext}`);
  },
});

const PDF_MIME = ['application/pdf'];

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (PDF_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Hanya file PDF yang diizinkan'));
  },
}).single('file');

/** Express middleware — wrap multer agar error dihandle proper */
export function handleUpload(req, res, next) {
  uploadPdf(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload gagal' });
    next();
  });
}
