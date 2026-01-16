import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import PostDetailsModal from "../components/PostDetailsModal";
import AxiosClient from "../AxiosClient";
import { useUserContext } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";

function ApartmentManagement() {
  const { t, translateStatus } = useLanguage();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { setMessage } = useUserContext();
  const { showConfirm } = usePopup();
  const highlightedId = searchParams.get('postId');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (highlightedId && posts.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`row-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [highlightedId, posts]);

  const fetchPosts = () => {
    setLoading(true);
    AxiosClient.get("/admin/posts")
      .then((response) => {
        setPosts(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  };

  const handleStatusUpdate = (post, newStatus) => {
    AxiosClient.patch(`/admin/posts/${post.id}/status`, { status: newStatus })
      .then(() => {
        setMessage(
          t("admin.post") +
            " " +
            translateStatus(newStatus) +
            " " +
            t("common.success")
        );
        fetchPosts();
      })
      .catch((error) => {
        console.error("Error updating post status:", error);
        setMessage(t("admin.errorUpdatingPost"), "error");
      });
  };

  const handleDelete = async (post) => {
    const confirmed = await showConfirm({
      title: t("admin.delete") + " " + t("admin.post"),
      message: `${t("admin.delete")} "${post.Title}"?`,
      confirmText: t("admin.delete"),
      cancelText: t("admin.cancel"),
      variant: "danger",
    });

    if (confirmed) {
      AxiosClient.delete(`/admin/posts/${post.id}`)
        .then(() => {
          setMessage(
            t("admin.post") +
              " " +
              t("admin.deleted") +
              " " +
              t("common.success")
          );
          fetchPosts();
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
          setMessage(t("admin.errorDeletingPost"), "error");
        });
    }
  };

  const columns = [
    { key: "Title", label: t("admin.title") },
    {
      key: "user",
      label: t("admin.owner"),
      render: (value, row) => (row.user ? row.user.name : "N/A"),
    },
    { key: "Address", label: t("admin.address") },
  ];

  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const actions = (post) => {
    const actionButtons = [
      {
        label: t("admin.viewDetails"),
        onClick: () => handleViewDetails(post),
        variant: "info",
      },
      {
        label: t("admin.edit"),
        onClick: () => handleEdit(post),
        variant: "default",
      },
    ];
    if (post.status !== "blocked") {
      actionButtons.push({
        label: t("admin.block"),
        onClick: () => handleStatusUpdate(post, "blocked"),
        variant: "danger",
      });
    }
    actionButtons.push({
      label: t("admin.delete"),
      onClick: () => handleDelete(post),
      variant: "danger",
    });
    return actionButtons;
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setIsEditMode(false);
  };

  const handleModalUpdate = () => {
    fetchPosts();
  };

  return (
    <div className="px-5 mx-auto max-w-[1366px]">
      <h1 className="text-3xl font-bold text-[#444] mb-8">
        {t("admin.apartmentManagement")}
      </h1>
      <AdminTable
        columns={columns}
        data={posts}
        actions={actions}
        loading={loading}
        highlightedRowId={highlightedId}
      />
      {isModalOpen && selectedPost && (
        <PostDetailsModal
          postId={selectedPost.id}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handleModalUpdate}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}

export default ApartmentManagement;
