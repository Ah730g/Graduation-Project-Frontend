import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

/**
 * FigmaLayout - Layout for Figma-safe routes
 * No authentication checks, no redirects
 */
function FigmaLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Outlet />
    </div>
  );
}

/**
 * FigmaAdminLayout - Admin layout for Figma-safe routes
 * No authentication checks, no redirects
 */
export function FigmaAdminLayout() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-5 dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
}

export default FigmaLayout;
