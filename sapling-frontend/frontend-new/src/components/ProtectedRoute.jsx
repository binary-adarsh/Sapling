import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    const home = user.role === "RECRUITER" ? "/recruiter/dashboard" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}
