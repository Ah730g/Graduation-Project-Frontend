import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useUserContext } from '../contexts/UserContext';

function AdminLayout() {
  const { user, isAdmin } = useUserContext();

  if (!user || !isAdmin()) {
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

