export function securityHeaders() {
  return (_req, res, next) => {
    // Hindari sniffing tipe MIME
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Mencegah clickjacking pada domain lain, tetapi izinkan iframe pada domain yang sama (untuk PDF viewer)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Mematikan audit XSS browser lama yang problematik
    res.setHeader('X-XSS-Protection', '0');
    // HSTS (HTTP Strict Transport Security) — aktif setelah SSL terpasang
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Batasi pengiriman referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Batasi fitur peramban yang tidak dibutuhkan
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Content-Security-Policy — lapisan pertahanan XSS
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' dibutuhkan untuk inline style (heat map paragraf)
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",             // SSE tutor berjalan ke origin yang sama
        "frame-src 'self' blob: data:",   // Izinkan iframe menampilkan PDF dari origin sendiri
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
    next();
  };
}
