import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const normalizeRole = (r) =>
  String(r || "")
    .toLowerCase()
    .replace(/^role[_-]?/i, "")
    .trim();

const RoleBasedRedirect = ({ children }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userRole = normalizeRole(role);
    const currentPath = location.pathname;

    const roleRedirects = {
      admin: {
        allowedPaths: ["/admin", "/profile"],
        defaultPath: "/admin/dashboard",
      },
      moderator: {
        allowedPaths: ["/moderator", "/profile"],
        defaultPath: "/moderator/dashboard",
      },
      mentor: {
        allowedPaths: ["/mentor", "/profile"],
        defaultPath: "/mentor/dashboard",
      },
    };

    const roleConfig = roleRedirects[userRole];

    if (roleConfig) {
      const isAllowed = roleConfig.allowedPaths.some((path) =>
        currentPath.startsWith(path)
      );

      if (!isAllowed && currentPath !== "/login" && currentPath !== "/") {
        navigate(roleConfig.defaultPath, { replace: true });
      }
    }
  }, [role, location.pathname, navigate]);

  return children;
};

export default RoleBasedRedirect;
