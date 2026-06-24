import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_REDIRECTS = {
  user: '/dashboard',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = ROLE_REDIRECTS[user.role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
