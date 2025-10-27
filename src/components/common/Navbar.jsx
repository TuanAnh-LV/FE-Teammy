import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase.config";
import { Globe } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    window.addEventListener("storage", () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    });

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || "";
      const role = email.endsWith("@fpt.edu.vn") ? "student" : "instructor";

      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("storage"));
      setUser(userData);
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = language === "EN" ? "VIE" : "EN";
    setLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <nav className="!w-full !h-16 !fixed !top-0 !z-50 !bg-white/80 !backdrop-blur-md !border-b !border-gray-200">
      <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !h-full !flex !items-center !justify-between">
        {/* Logo */}
        <Link to="/" className="!no-underline">
          <h1 className="!font-sans !text-2xl !font-black !text-black !cursor-pointer !mb-0">
            Teammy.
          </h1>
        </Link>

        {/* Nav links */}
        <div className="!hidden md:!flex !items-center !space-x-8 !font-sans !font-semibold !text-[14px] !text-black">
          <Link
            to="/discover"
            className={`!hover:text-blue-600 ${isActive("/discover") ? "!text-blue-600" : ""
              }`}
          >
            Find Projects
          </Link>
          <Link
            to="/forum"
            className={`!hover:text-blue-600 ${isActive("/forum") ? "!text-blue-600" : ""
              }`}
          >
            Forum
          </Link>
          <Link
            to="/my-groups"
            className={`!hover:text-blue-600 ${isActive("/my-groups") ? "!text-blue-600" : ""
              }`}
          >
            My Groups
          </Link>
          <Link
            to="/workspace"
            className={`!hover:text-blue-600 ${isActive("/workspace") ? "!text-blue-600" : ""
              }`}
          >
            Workspace
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
                    <p className="!text-xs !text-gray-500 !truncate">{user.email}</p>
                  </div>
                  <div className="!py-2">
                    <Link
                      to="/profile"
                      className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/notifications"
                      className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                    >
                      Notifications
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="!block !w-full !text-left !px-4 !py-2 !text-sm !text-red-600 hover:!bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="!px-4 !py-2 !rounded-full !bg-black !text-white !text-sm !font-medium hover:!bg-gray-800 !transition-colors !duration-200 !flex !items-center !space-x-1 !font-sans"
            >
              <span>Sign in</span>
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
