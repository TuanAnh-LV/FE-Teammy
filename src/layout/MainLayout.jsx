import React from "react";
import Navbar from "../components/common/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
