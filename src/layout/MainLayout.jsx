import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ⚙️ Nếu có children (render thủ công) thì dùng, còn không thì Outlet (router render) */}
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
