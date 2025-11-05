import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase.config";
import { Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../translations";

import { AuthService } from "../../services/auth.service";
import { LOCAL_STORAGE } from "../../consts/const";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const dropdownRef = useRef(null);

  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const onStorage = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener("storage", onStorage);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const parseMaybeStringJson = (payload) => {
    if (payload == null) return null;
    const raw = payload?.data ?? payload; 
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  };

  const handleSignIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      // 1) Đăng nhập Google (Firebase)
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      // 2) Lấy Firebase ID Token
      const idToken = await fbUser.getIdToken();

      // 3) Gọi backend /api/auth/login với idToken
      const resp = await AuthService.login({ idToken });

      // 4) Chuẩn hoá response
      const data = parseMaybeStringJson(resp);
      if (!data || !data.accessToken) {
        throw new Error("Login API không trả về accessToken hợp lệ.");
      }

      // 5) Lưu localStorage cho backend (token, role, email…)
      localStorage.setItem(LOCAL_STORAGE.ACCOUNT_ADMIN, JSON.stringify(data));

      // 6) Lưu localStorage cho UI (Navbar)
      const email = data.email ?? fbUser.email ?? "";
      const role =
        data.role ??
        (email.endsWith("@fpt.edu.vn") ? "student" : "instructor");

      const uiUser = {
        name: data.displayName ?? fbUser.displayName ?? "",
        email,
        photoURL: fbUser.photoURL ?? "",
        role,
        skillsCompleted: !!data.skillsCompleted,
      };
      localStorage.setItem("user", JSON.stringify(uiUser));

      // 7) Cập nhật state + thông báo cho các tab khác
      window.dispatchEvent(new Event("storage"));
      setUser(uiUser);
    } catch (error) {
      console.error("Google login failed:", error);
      alert(error?.message || "Login failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem(LOCAL_STORAGE.ACCOUNT_ADMIN); // xoá luôn token backend
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <nav className="!w-full !h-16 !fixed !top-0 !z-50 !bg-white/80 !backdrop-blur-md !border-b !border-gray-200">
      <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !h-full !flex !items-center !justify-between">
        {/* Logo */}
        <Link to="/" className="!no-underline">
          <h1 className="font-sans text-2xl font-black text-black cursor-pointer !mb-0">
            Teammy.
          </h1>
        </Link>

        {/* Nav links */}
        <div className="!hidden md:!flex !items-center !space-x-8 !font-sans !font-semibold !text-[14px] !text-black">
          <Link
            to="/discover"
            className={`!hover:text-blue-600 ${
              isActive("/discover") ? "!text-blue-600" : ""
            }`}
          >
            {getTranslation("findProjects", language)}
          </Link>
          <Link
            to="/forum"
            className={`!hover:text-blue-600 ${
              isActive("/forum") ? "!text-blue-600" : ""
            }`}
          >
            {getTranslation("forum", language)}
          </Link>
          <Link
            to="/my-groups"
            className={`!hover:text-blue-600 ${
              isActive("/my-groups") ? "!text-blue-600" : ""
            }`}
          >
            {getTranslation("myGroups", language)}
          </Link>
          <Link
            to="/workspace"
            className={`!hover:text-blue-600 ${
              isActive("/workspace") ? "!text-blue-600" : ""
            }`}
          >
            {getTranslation("workspace", language)}
          </Link>
        </div>

        {/* Right side */}
        <div className="!flex !items-center !gap-4 !relative" ref={dropdownRef}>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            title={`Switch to ${language === "EN" ? "Vietnamese" : "English"}`}
            className="!flex !items-center !gap-1 !px-2 !py-1 !rounded-full hover:!bg-gray-100 !transition-colors !duration-200"
          >
            <Globe className="!w-5 !h-5 !text-gray-700" />
            <span className="!text-sm !font-semibold !text-gray-700">
              {language}
            </span>
          </button>

          {/* User Avatar / Sign-in */}
          {user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="!flex !items-center !space-x-2 !focus:outline-none"
              >
                <img
                  src={
                    user.photoURL
                      ? user.photoURL.replace("=s96-c", "=s256-c")
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || user.email
                        )}&background=random`
                  }
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="!w-9 !h-9 !rounded-full !border !border-gray-300 !object-cover"
                />
              </button>

              {menuOpen && (
                <div className="!absolute !right-0 !top-full !mt-2 !w-48 !bg-white !shadow-lg !rounded-xl !overflow-hidden">
                  <div className="!px-4 !py-3 !border-b !border-gray-100">
                    <p className="!text-sm !font-medium !text-gray-900 !truncate">
                      {user.name}
                    </p>
                    <p className="!text-xs !text-gray-500 !truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="!py-2">
                    <Link
                      to="/profile"
                      className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                    >
                      {getTranslation("profile", language)}
                    </Link>
                    <Link
                      to="/notifications"
                      className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                    >
                      {getTranslation("notifications", language)}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="!block !w-full !text-left !px-4 !py-2 !text-sm !text-red-600 hover:!bg-red-50"
                    >
                      {getTranslation("logout", language)}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="!px-4 !py-2 !rounded-full !bg-black !text-white !text-sm !font-medium hover:!bg-gray-800 !transition-colors !duration-200 !flex !items-center !space-x-1 !font-sans disabled:!opacity-60"
            >
              <span>
                {signingIn
                  ? getTranslation("loading", language) || "Đang đăng nhập..."
                  : getTranslation("signIn", language)}
              </span>
              <svg
                className="!w-4 !h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
