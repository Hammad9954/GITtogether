import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

// Protected Student Pages
import Dashboard from './pages/Dashboard';
import DiscoverProjects from './pages/DiscoverProjects';
import ProjectDetails from './pages/ProjectDetails';
import CreateEditProject from './pages/CreateEditProject';
import DiscoverStudents from './pages/DiscoverStudents';
import StudentProfile from './pages/StudentProfile';
import Teams from './pages/Teams';
import TeamWorkspace from './pages/TeamWorkspace';
import Applications from './pages/Applications';
import Hackathons from './pages/Hackathons';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import SkillSharing from './pages/SkillSharing';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

// Route Guards
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090B0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#B7FF5A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[#A1AAA0]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090B0A]">
        <div className="w-10 h-10 border-2 border-[#B7FF5A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Authenticated Workspace with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Projects */}
        <Route path="/projects" element={<DiscoverProjects />} />
        <Route path="/projects/create" element={<CreateEditProject />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/projects/:id/edit" element={<CreateEditProject />} />

        {/* Students & Profiles */}
        <Route path="/students" element={<DiscoverStudents />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/profile" element={<StudentProfile />} />

        {/* Teams & Workspace */}
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamWorkspace />} />

        {/* Applications */}
        <Route path="/applications" element={<Applications />} />

        {/* Hackathons */}
        <Route path="/hackathons" element={<Hackathons />} />

        {/* Collaboration & Social */}
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/skill-sharing" element={<SkillSharing />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/settings" element={<Settings />} />

        {/* Admin Moderation Panel */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
