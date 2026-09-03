import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Store from './pages/Store';
import Terms from './pages/Terms';
import Tournament from './pages/Tournament';
import About from './pages/About';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import JoinTeam from './pages/JoinTeam';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DailySpin from './components/rewards/DailySpin';
import LoadingScreen from './components/ui/LoadingScreen';
import StarField from './components/ui/StarField';
import AdBlockDetector from './components/ui/AdBlockDetector';
import ProtectedRoute from './components/layout/ProtectedRoute';

import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <div className="glass p-8 rounded-3xl border-red/20 max-w-md text-center">
            <h1 className="text-2xl text-red mb-4">SYSTEM CRITICAL ERROR</h1>
            <p className="text-gray-400 mb-6">The Xervis Hub encountered an unexpected error. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-neon"
            >
              Restart Hub
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppRoutes() {
  const { user, loading, firebaseUser } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat selection:bg-cyan selection:text-dark"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 85% 60%, rgba(255, 42, 85, 0.06) 0%, transparent 50%), linear-gradient(to bottom, rgba(10, 13, 20, 0.88) 0%, rgba(5, 7, 12, 0.97) 100%), url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070")'
      }}
    >
      <StarField />
      <AdBlockDetector />
      {user && <DailySpin user={user} />}
      <Navbar user={user} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={!firebaseUser ? <Login /> : (user ? <Navigate to="/dashboard" /> : <Navigate to="/signup" />)} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user!} /></ProtectedRoute>} />
          
          {/* Public Routes */}
          <Route path="/store" element={<Store user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/tournament" element={<Tournament user={user} />} />
          <Route path="/join-team" element={<JoinTeam />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin user={user!} /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
