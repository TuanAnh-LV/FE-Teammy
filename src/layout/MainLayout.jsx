import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import LoginModal from "../components/common/LoginModal";

const MainLayout = ({ children }) => {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="min-h-screen relative">
      <Navbar onSignIn={() => setOpenLogin(true)} />

      <main className="flex-1">
        {children}
      </main>

      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </div>
  );
};

export default MainLayout;
