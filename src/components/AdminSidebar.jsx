import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

function AdminSidebar() {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { path: "/admin/dashboard", labelKey: "admin.dashboard", icon: "📊" },
    { path: "/admin/users", labelKey: "admin.userManagement", icon: "👥" },
    {
      path: "/admin/apartments",
      labelKey: "admin.apartmentManagement",
      icon: "🏠",
    },
    {
      path: "/admin/identity-verifications",
      labelKey: "admin.identityVerifications",
      icon: "🆔",
    },
    {
      path: "/admin/rental-requests",
      labelKey: "admin.rentalRequests",
      icon: "📝",
    },
    { path: "/admin/contracts", labelKey: "admin.contracts", icon: "📄" },
    { path: "/admin/reviews", labelKey: "admin.reviews", icon: "⭐" },
    {
      path: "/admin/support/tickets",
      labelKey: "admin.supportTickets",
      icon: "💬",
    },
    {
      path: "/admin/reports",
      labelKey: "admin.reportsLabel",
      icon: "📈",
    },
  ];

  return (
    <div className="w-64 bg-[#fcf5f3] dark:bg-gray-800 min-h-screen p-5 max-md:w-full max-md:min-h-0 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#444] dark:text-white">Admin Panel</h2>
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="mb-4 bg-yellow-300 dark:bg-yellow-400 hover:scale-105 px-4 py-3 rounded-md font-bold transition duration-300 ease text-[#444] dark:text-gray-900 flex items-center justify-center gap-2"
      >
        <span>🏠</span>
        <span>{t("admin.backToHome")}</span>
      </Link>

      {/* Language Toggle Button - Fixed Position */}
      <div className="mb-6">
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="w-full bg-yellow-300 dark:bg-yellow-400 hover:scale-105 px-4 py-3 rounded-md font-bold transition duration-300 ease text-[#444] dark:text-gray-900 flex items-center justify-center gap-2"
          title={
            language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"
          }
        >
          <span>🌐</span>
          <span>{language === "en" ? "عربي" : "English"}</span>
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition duration-300 ease ${
                isActive
                  ? "bg-yellow-300 dark:bg-yellow-400 font-bold text-[#444] dark:text-gray-900"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-[#888] dark:text-gray-300 hover:text-[#444] dark:hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminSidebar;
