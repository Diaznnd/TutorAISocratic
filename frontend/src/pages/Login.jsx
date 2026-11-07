import { useState } from 'react';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'mahasiswa' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const email = f.email.trim().toLowerCase();
      if (mode === 'login') {
        await login(email, f.password);
      } else {
        if (f.password.length < 8) {
          setErr('Kata sandi minimal 8 karakter');
          return;
        }
        await register({ ...f, name: f.name.trim(), email });
      }
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <form className="login" onSubmit={submit}>
      <h1>Sorot<mark>Paham</mark></h1>
      <p className="muted">Sorot bagian yang belum kamu pahami. Tutor akan memandu, dosen tahu di mana kelas tersangkut.</p>
      {mode === 'register' && (
        <>
          <label>Nama<input value={f.name} onChange={set('name')} required maxLength={100} /></label>
          <label>Peran
            <select value={f.role} onChange={set('role')}>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
            </select>
          </label>
        </>
      )}
      <label>Email<input type="email" value={f.email} onChange={set('email')} required maxLength={100} /></label>
      <label>Kata sandi<input type="password" value={f.password} onChange={set('password')} required minLength={mode === 'register' ? 8 : 1} maxLength={100} /></label>
      {err && <p className="err">{err}</p>}
      <button type="submit">{mode === 'login' ? 'Masuk' : 'Daftar'}</button>
      <button type="button" className="ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </button>
    </form>
  );
}
