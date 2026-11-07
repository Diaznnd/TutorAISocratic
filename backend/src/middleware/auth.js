import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Belum login' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, name }
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
}

export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ error: 'Akses ditolak' });
