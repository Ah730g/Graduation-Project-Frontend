import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import AxiosClient from "../AxiosClient";
import { useUserContext } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";

function ReviewsManagement() {
  const { t, translateStatus } = useLanguage();
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setMessage } = useUserContext();
  const { showConfirm } = usePopup();
  const highlightedId = searchParams.get('reviewId');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (highlightedId && reviews.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`row-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [highlightedId, reviews]);

  const fetchReviews = () => {
    setLoading(true);
    AxiosClient.get("/admin/reviews")
      .then((response) => {
        setReviews(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      });
  };

  const handleDelete = async (review) => {
    const confirmed = await showConfirm({
      title: t("admin.remove") + " " + t("admin.reviews"),
      message: t("admin.remove") + " " + t("admin.reviews") + "?",
      confirmText: t("admin.remove"),
      cancelText: t("admin.cancel"),
      variant: "danger",
    });

    if (confirmed) {
      AxiosClient.delete(`/admin/reviews/${review.id}`)
        .then(() => {
          setMessage(
            t("admin.reviews") +
              " " +
              t("admin.removed") +
              " " +
              t("common.success")
          );
          fetchReviews();
        })
        .catch((error) => {
          console.error("Error removing review:", error);
          setMessage(t("admin.errorRemovingReview"), "error");
        });
    }
  };

  const columns = [
    {
      key: "user",
      label: t("admin.reviewer"),
      render: (value, row) => (row.user ? row.user.name : "N/A"),
    },
    {
      key: "post",
      label: t("admin.apartment"),
      render: (value, row) => (row.post ? row.post.Title : "N/A"),
    },
    {
      key: "rating",
      label: t("admin.rating"),
      render: (value) => (
        <span className="bg-yellow-200 px-2 py-1 rounded-md text-sm">
          {"⭐".repeat(value)} ({value}/5)
        </span>
      ),
    },
    {
      key: "comment",
      label: t("admin.comment"),
      render: (value) =>
        value
          ? value.length > 50
            ? value.substring(0, 50) + "..."
            : value
          : "N/A",
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

  const actions = (review) => [
    {
      label: t("admin.remove"),
      onClick: () => handleDelete(review),
      variant: "danger",
    },
  ];

  return (
    <div className="px-5 mx-auto max-w-[1366px]">
      <h1 className="text-3xl font-bold text-[#444] mb-8">
        {t("admin.reviews")}
      </h1>
      <AdminTable
        columns={columns}
        data={reviews}
        actions={actions}
        loading={loading}
        highlightedRowId={highlightedId}
      />
    </div>
  );
}

export default ReviewsManagement;
