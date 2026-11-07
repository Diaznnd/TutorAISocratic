export function securityHeaders() {
  return (_req, res, next) => {
    // Hindari sniffing tipe MIME
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Mencegah clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Mematikan audit XSS browser lama yang problematik
    res.setHeader('X-XSS-Protection', '0');
    // HSTS (HTTP Strict Transport Security)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Batasi pengiriman referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Batasi fitur peramban yang tidak dibutuhkan
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  };
}

