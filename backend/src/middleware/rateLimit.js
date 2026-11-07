/**
 * In-memory rate limiter middleware tanpa dependensi eksternal.
 * Menyimpan hit per IP/kunci dalam rentang window waktu tertentu.
 */
export function rateLimit({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Terlalu banyak permintaan, silakan coba lagi nanti.',
  keyGenerator = (req) => req.ip || req.socket.remoteAddress || 'unknown',
} = {}) {
  const store = new Map();

  // Bersihkan data lama secara berkala setiap 5 menit
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({ error: message, retryAfterSec });
    }

    next();
  };
}

