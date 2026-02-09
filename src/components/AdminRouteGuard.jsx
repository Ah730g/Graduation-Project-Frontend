import { Navigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { FIGMA_MODE } from '../config/figmaMode';

function AdminRouteGuard({ children }) {
  const { user, isAdmin } = useUserContext();

  // In Figma mode, allow access without authentication
  if (!FIGMA_MODE && (!user || !isAdmin())) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRouteGuard;




