import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Material from './pages/Material.jsx';

export default function App() {
  const { user, logout } = useAuth();
  if (!user) return <Login />;
  return (
    <>
      <header className="bar">
        <Link to="/" className="brand">SorotPaham</Link>
        <span className="who">{user.name} ({user.role})</span>
        <button className="ghost" onClick={logout}>Keluar</button>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materi/:id" element={<Material />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
