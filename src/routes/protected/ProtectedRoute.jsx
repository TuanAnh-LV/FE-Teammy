// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
  const { role } = useAuth(); // Retrieve user role from auth context

  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role))
    return <Navigate to="/unauthorize" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
