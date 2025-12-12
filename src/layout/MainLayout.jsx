import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";
import { useInvitationRealtime } from "../hook/useInvitationRealtime";

const MainLayout = ({ children }) => {
  const { token, userInfo } = useAuth();
  const { isConnected } = useInvitationRealtime(
    token,
    userInfo?.userId || userInfo?.id,
    {}
  );

  useEffect(() => {
    if (isConnected) {
      console.log("[MainLayout] SignalR connected globally - ready to receive events");
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen relative bg-[#f9fafb]">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
