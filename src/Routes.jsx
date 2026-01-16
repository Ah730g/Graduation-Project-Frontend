import { createBrowserRouter } from "react-router-dom";
import { Layout, AuthLayout } from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import ListPage from "./pages/ListPage";
import EstateInfo from "./pages/EstateInfo";
import Profile from "./pages/Profile";
import GuestLayout from "./components/GuestLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import UpdateUser from "./pages/UpdateUser";
import AddPost from "./pages/AddPost";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import ApartmentManagement from "./pages/ApartmentManagement";
import RentalRequestsManagement from "./pages/RentalRequestsManagement";
import ContractManagement from "./pages/ContractManagement";
import ReviewsManagement from "./pages/ReviewsManagement";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSettings from "./pages/AdminSettings";
import IdentityVerification from "./pages/IdentityVerification";
import IdentityVerificationReview from "./pages/IdentityVerificationReview";
import BookingRequests from "./pages/BookingRequests";
import Notifications from "./pages/Notifications";
import Payment from "./pages/Payment";
import ContractSigning from "./pages/ContractSigning";
import Ratings from "./pages/Ratings";
import EstateInfoLoader from "./Lib/Loaders";

const route = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/list",
        element: <ListPage />,
      },
      {
        path: "/:id",
        element: <EstateInfo />,
        loader: EstateInfoLoader,
      },
      {
        path: "/",
        element: <GuestLayout />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/signup",
            element: <Signup />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/user/profile",
        element: <Profile />,
      },
      {
        path: "/user/profile/update",
        element: <UpdateUser />,
      },
      {
        path: "/post/add",
        element: <AddPost />,
      },
      {
        path: "/identity-verification",
        element: <IdentityVerification />,
      },
      {
        path: "/booking-requests",
        element: <BookingRequests />,
      },
      {
        path: "/notifications",
        element: <Notifications />,
      },
      {
        path: "/payment",
        element: <Payment />,
      },
      {
        path: "/contracts/:id",
        element: <ContractSigning />,
      },
      {
        path: "/ratings",
        element: <Ratings />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "apartments",
        element: <ApartmentManagement />,
      },
      {
        path: "rental-requests",
        element: <RentalRequestsManagement />,
      },
      {
        path: "contracts",
        element: <ContractManagement />,
      },
      {
        path: "reviews",
        element: <ReviewsManagement />,
      },
      {
        path: "notifications",
        element: <AdminNotifications />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
      {
        path: "identity-verifications",
        element: <IdentityVerificationReview />,
      },
    ],
  },
]);
export default route;
