import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-[#f9fafb]">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      <Footer/>
    </div>
  );
};

export default MainLayout;
