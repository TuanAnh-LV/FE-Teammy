// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const { role } = useAuth();

//   if (!role) return <Navigate to="/login" replace />;
//   if (!allowedRoles.includes(role))
//     return <Navigate to="/unauthorize" replace />;

//   return children ? children : <Outlet />;
// };

// export default ProtectedRoute;
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// ⚙️ Giả lập user (sau này thay bằng auth context hoặc token decode)
const getMockUser = () => {
  // 🧠 Lấy role từ localStorage hoặc đặt mặc định
  const role = localStorage.getItem("role") || "mentor";
  return { role };
};

const ProtectedRoute = ({ allowedRoles }) => {
  const user = getMockUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
