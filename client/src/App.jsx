import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';

// Auth Pages
import UserLoginPage from './pages/auth/UserLoginPage';
import UserSignupPage from './pages/auth/UserSignupPage';
import ProviderSignupPage from './pages/auth/ProviderSignupPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// User Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import UserBookings from './pages/user/UserBookings';
import NewBooking from './pages/user/NewBooking';
import UserNotifications from './pages/user/UserNotifications';
import UserProfile from './pages/user/UserProfile';

// Provider Dashboard Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderBookings from './pages/provider/ProviderBookings';
import ManageServices from './pages/provider/ManageServices';
import ProviderEarnings from './pages/provider/ProviderEarnings';
import ProviderReviews from './pages/provider/ProviderReviews';
import ProviderProfile from './pages/provider/ProviderProfile';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProviders from './pages/admin/ManageProviders';
import ManageBookings from './pages/admin/ManageBookings';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import ProviderApplications from './pages/admin/ProviderApplications';
import ProviderMap from './pages/admin/ProviderMap';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* ─── PUBLIC ROUTES ─── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />

            {/* ─── AUTH ROUTES ─── */}
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/signup" element={<UserSignupPage />} />
            <Route path="/provider/signup" element={<ProviderSignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ─── USER DASHBOARD ROUTES ─── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bookings"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/book"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <NewBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* ─── PROVIDER DASHBOARD ROUTES ─── */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/bookings"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/services"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ManageServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/earnings"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderEarnings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/reviews"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/profile"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderProfile />
                </ProtectedRoute>
              }
            />

            {/* ─── ADMIN DASHBOARD ROUTES ─── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/providers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageProviders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProviderApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/map"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProviderMap />
                </ProtectedRoute>
              }
            />

            {/* ─── FALLBACK ─── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
