import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useUserContext } from '../contexts/UserContext';
import { FIGMA_MODE } from '../config/figmaMode';

function AdminLayout() {
  const { user, isAdmin } = useUserContext();

  // In Figma mode, allow access without authentication
  if (!FIGMA_MODE && (!user || !isAdmin())) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-5 dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;

