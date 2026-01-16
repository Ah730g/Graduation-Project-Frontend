import Navbar from "./Navbar";
import { Navigate, Outlet } from "react-router-dom";
import AxiosClient from "../AxiosClient";
import { useUserContext } from "../contexts/UserContext";

function Layout() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Outlet />
    </div>
  );
}

function AuthLayout() {
  const { token } = useUserContext();
  if (!token) return <Navigate to="/login" />;
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Outlet />
    </div>
  );
}

export { Layout, AuthLayout };
