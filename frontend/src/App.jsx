import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import StudentHome from './pages/StudentHome.jsx';
import ClassDetail from './pages/ClassDetail.jsx';
import ClassManage from './pages/ClassManage.jsx';
import Material from './pages/Material.jsx';

/* ─── Top Navbar for Authenticated Pages (/app, /materi/:id) ─── */
function AppNav() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-[#F9E8EC] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#80142A] to-[#6B1224] text-white flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              SP
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#6B1224] font-['Plus_Jakarta_Sans',sans-serif]">
              SorotPaham
            </span>
          </Link>

          {/* Nav Pills */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-[#6C6267] hover:text-[#6B1224] hover:bg-[#F9E8EC] transition-colors no-underline"
            >
              Beranda
            </Link>
            <Link
              to="/app"
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-[#6B1224] bg-[#F9E8EC] no-underline"
            >
              Kelas Saya
            </Link>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#6B1224] bg-[#FBF7F4] border border-[#F9E8EC] px-3 py-1.5 rounded-full">
            {user.name} · {user.role === 'dosen' ? 'Guru/Dosen' : 'Pelajar/Mahasiswa'}
          </span>

          <button
            onClick={logout}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-[#E5D5D8] text-[#6B1224] hover:bg-[#F9E8EC] transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Protected Layout Wrapper ─── */
function ProtectedLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}

/* ─── Guard tanpa AppNav (untuk halaman yang punya layout sendiri) ─── */
function AppGuard({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ─── Halaman /app: pelajar memakai dashboard baru, dosen tetap halaman kelola ─── */
function AppHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'mahasiswa') return <StudentHome />;
  return <ProtectedLayout><Home /></ProtectedLayout>;
}

/* ─── Root Router ─── */
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 1. Landing Page as Root Route */}
      <Route path="/" element={<Landing />} />

      {/* 2. Login Page with Role Selection & Split Card */}
      <Route
        path="/login"
        element={user ? <Navigate to="/app" replace /> : <Login />}
      />

      {/* 3. Protected LMS Classes Dashboard */}
      <Route
        path="/app"
        element={<AppHome />}
      />

      {/* 4. Protected Interactive Reading Space */}
      <Route
        path="/materi/:id"
        element={
          <ProtectedLayout>
            <Material />
          </ProtectedLayout>
        }
      />

      {/* 5. Detail kelas mahasiswa */}
      <Route
        path="/kelas/:id"
        element={<AppGuard><ClassDetail /></AppGuard>}
      />

      {/* 6. Kelola kelas (dosen) */}
      <Route
        path="/kelola/:id"
        element={<AppGuard><ClassManage /></AppGuard>}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
