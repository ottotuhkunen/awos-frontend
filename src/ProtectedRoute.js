import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div 
        style={{ 
          background:'var(--bg-pattern-color)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh'
        }}>
        <p style={{color: 'var(--top-menu-text)'}}>Loading...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;