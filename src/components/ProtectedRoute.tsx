import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const ProtectedRoute = () => {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
