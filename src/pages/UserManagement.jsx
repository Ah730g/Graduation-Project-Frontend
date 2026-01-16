import { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";
import UserDetailsModal from "../components/UserDetailsModal";
import AxiosClient from "../AxiosClient";
import { useUserContext } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { setMessage } = useUserContext();
  const { t, translateRole, translateStatus, language } = useLanguage();
  const { showConfirm } = usePopup();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchUsers = () => {
    setLoading(true);
    const params = searchTerm ? { search: searchTerm } : {};
    AxiosClient.get("/admin/users", { params })
      .then((response) => {
        setUsers(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === "active" ? "disabled" : "active";
    AxiosClient.patch(`/admin/users/${user.id}/status`, { status: newStatus })
      .then(() => {
        setMessage(
          t("admin.user") +
            " " +
            (newStatus === "active"
              ? t("admin.enabled")
              : t("admin.disabled")) +
            " " +
            t("common.success")
        );
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error updating user status:", error);
        setMessage(t("admin.errorUpdatingStatus"), "error");
      });
  };

  const handleDelete = async (user) => {
    const confirmed = await showConfirm({
      title: t("admin.delete") + " " + t("admin.user"),
      message: `${t("admin.delete")} ${t("admin.user")} ${user.name}?`,
      confirmText: t("admin.delete"),
      cancelText: t("admin.cancel"),
      variant: "danger",
    });

    if (confirmed) {
      AxiosClient.delete(`/admin/users/${user.id}`)
        .then(() => {
          setMessage(
            t("admin.user") +
              " " +
              t("admin.deleted") +
              " " +
              t("common.success")
          );
          fetchUsers();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          setMessage(t("admin.errorDeletingUser"), "error");
        });
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUserId(user.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleModalUpdate = () => {
    fetchUsers();
  };

  const columns = [
    { key: "name", label: t("admin.name") },
    { key: "email", label: t("admin.email") },
    {
      key: "role",
      label: t("admin.role"),
      render: (value) => (
        <span className="bg-gray-200 px-2 py-1 rounded-md text-sm">
          {translateRole(value)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("admin.status"),
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-md text-sm ${
            value === "active" ? "bg-green-200" : "bg-red-200"
          }`}
        >
          {translateStatus(value)}
        </span>
      ),
    },
  ];

  const actions = (user) => [
    {
      label: t("admin.viewDetails"),
      onClick: () => handleViewDetails(user),
      variant: "default",
    },
    {
      label: user.status === "active" ? t("admin.disable") : t("admin.enable"),
      onClick: () => handleToggleStatus(user),
      variant: user.status === "active" ? "default" : "success",
    },
    {
      label: t("admin.delete"),
      onClick: () => handleDelete(user),
      variant: "danger",
    },
  ];

  return (
    <div className="px-5 mx-auto max-w-[1366px]">
      <h1 className="text-3xl font-bold text-[#444] mb-8">
        {t("admin.userManagement")}
      </h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder={t("admin.searchUsers") || "Search by name, email, national ID, or identity name..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full max-w-md border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-300 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}
        />
      </div>
      <AdminTable
        columns={columns}
        data={users}
        actions={actions}
        loading={loading}
      />
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleModalUpdate}
      />
    </div>
  );
}

export default UserManagement;
