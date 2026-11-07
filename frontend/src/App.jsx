import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Material from './pages/Material.jsx';

function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="site-nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand-group">
            <div className="brand-icon-clay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <div>
              <span className="brand-title">Sorot Paham</span>
            </div>
            <span className="brand-system-tag">Ruang Kelas</span>
          </Link>

          <div className="nav-links">
            <Link to="/" className="nav-pill">
              Design & Overview
            </Link>
            <Link to="/app" className="nav-pill active">
              Daftar Kelas
            </Link>
          </div>

          <div className="nav-actions">
            {user && (
              <>
                <span className="who" style={{ background: 'var(--tint-fill)', color: 'var(--primary)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
                  {user.name} ({user.role})
                </span>
                <button className="btn-ghost" onClick={logout} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="app-container">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Auth Page */}
      <Route path="/login" element={<Login />} />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/materi/:id"
        element={
          <ProtectedRoute>
            <Material />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
