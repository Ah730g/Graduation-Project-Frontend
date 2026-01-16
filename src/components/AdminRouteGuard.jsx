import { Navigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';

function AdminRouteGuard({ children }) {
  const { user, isAdmin } = useUserContext();

  if (!user || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRouteGuard;




