import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'mahasiswa' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const email = f.email.trim().toLowerCase();
      if (mode === 'login') {
        await login(email, f.password);
      } else {
        if (f.password.length < 8) {
          setErr('Kata sandi minimal 8 karakter');
          setLoading(false);
          return;
        }
        await register({ ...f, name: f.name.trim(), email });
      }
      navigate('/app');
    } catch (e2) {
      setErr(e2.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top minimalistic nav */}
      <nav className="site-nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand-group">
            <div className="brand-icon-clay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <span className="brand-title">Sorot Paham</span>
          </Link>
          <Link to="/" className="btn-ghost">
            ← Kembali ke Beranda
          </Link>
        </div>
      </nav>

      <div className="login-page-wrap">
        <div className="login-clay-card">
          <div className="login-brand-header">
            <div className="brand-icon-clay" style={{ margin: '0 auto 12px', width: '48px', height: '48px', borderRadius: '14px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <h1 className="login-brand-title">Sorot<span style={{ color: 'var(--highlight)' }}>Paham</span></h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              {mode === 'login'
                ? 'Masuk untuk mengakses materi dan berdialog dengan Tutor Sokrates.'
                : 'Daftar akun baru untuk mulai belajar secara taktil dan reflektif.'}
            </p>
          </div>

          {err && <div className="error-banner" style={{ marginBottom: '16px' }}>{err}</div>}

          <form className="login-form-group" onSubmit={submit}>
            {mode === 'register' && (
              <>
                <label className="form-label">
                  Nama Lengkap
                  <input
                    className="form-input"
                    value={f.name}
                    onChange={set('name')}
                    placeholder="Nama mahasiswa atau dosen"
                    required
                    maxLength={100}
                  />
                </label>
                <label className="form-label">
                  Peran Akademik
                  <select className="form-select" value={f.role} onChange={set('role')}>
                    <option value="mahasiswa">Mahasiswa (Pelajar Taktil)</option>
                    <option value="dosen">Dosen (Pengajar / Kurator Kelas)</option>
                  </select>
                </label>
              </>
            )}

            <label className="form-label">
              Alamat Email
              <input
                type="email"
                className="form-input"
                value={f.email}
                onChange={set('email')}
                placeholder="nama@kampus.ac.id"
                required
                maxLength={100}
              />
            </label>

            <label className="form-label">
              Kata Sandi
              <input
                type="password"
                className="form-input"
                value={f.password}
                onChange={set('password')}
                placeholder="Minimal 8 karakter"
                required
                minLength={mode === 'register' ? 8 : 1}
                maxLength={100}
              />
            </label>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                setErr('');
                setMode(mode === 'login' ? 'register' : 'login');
              }}
            >
              {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
