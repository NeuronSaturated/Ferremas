import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const ProtectedRoute = () => {
  // Aca se protege el panel interno. Solo un token admin permite entrar.
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
