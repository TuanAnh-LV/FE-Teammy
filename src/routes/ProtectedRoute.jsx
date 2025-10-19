import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role))
    return <Navigate to="/unauthorize" replace />;

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
