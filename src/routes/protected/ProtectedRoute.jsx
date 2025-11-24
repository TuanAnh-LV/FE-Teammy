// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const normalizeRole = (r) =>
  String(r || "")
    .toLowerCase()
    .replace(/^role[_-]?/i, "")
    .trim();

const asRoleList = (role) => {
  if (!role) return [];
  if (Array.isArray(role)) return role.map(normalizeRole);
  if (String(role).includes(","))
    return String(role).split(",").map(normalizeRole);
  return [normalizeRole(role)];
};

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { role } = useAuth(); // Retrieve user role from auth context

  const userRoles = asRoleList(role);

  if (!userRoles || userRoles.length === 0)
    return <Navigate to="/login" replace />;

  const allowed = allowedRoles.map(normalizeRole);

  const ok = userRoles.some((r) => allowed.includes(r));
  if (!ok) return <Navigate to="/unauthorize" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
