import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ClientRoute = () => {
  // Aqui se protege una ruta de cliente. Si no hay sesion, la persona vuelve al
  // login y se guarda la ruta original para redirigir despues.
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default ClientRoute;
