import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import Terms from './pages/Terms';
import Blog from './pages/Blog';
import Tournament from './pages/Tournament';
import Earning from './pages/Earning';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import WhatsAppButton from './components/layout/WhatsAppButton';
import LoadingScreen from './components/ui/LoadingScreen';
import AdBlockDetector from './components/ui/AdBlockDetector';
import ProtectedRoute from './components/layout/ProtectedRoute';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      <AdBlockDetector />
      <AnnouncementBar />
      <Navbar user={user} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user!} /></ProtectedRoute>} />
          <Route path="/earning" element={<ProtectedRoute><Earning user={user!} /></ProtectedRoute>} />
          
          {/* Public Routes */}
          <Route path="/store" element={<Store user={user} />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/tournament" element={<Tournament />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
