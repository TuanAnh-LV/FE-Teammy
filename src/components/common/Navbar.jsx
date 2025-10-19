import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase.config";

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);

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

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const email = user.email || "";
      let role = "guest";

      if (email.endsWith("@fpt.edu.vn")) {
        role = "student";
      } else {
        role = "instructor";
      }

      // Lưu thông tin user
      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Báo cho các component khác biết đã login
      window.dispatchEvent(new Event("storage"));
      setUser(userData);

      console.log("Đăng nhập thành công:", userData);
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

  return (
    <nav
      className={`w-full h-16 fixed top-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur-md shadow-sm"
        : "bg-white/10 backdrop-blur-lg border-b border-white/20"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="no-underline">
              <h1
                className={`!font-sans text-[24px] !mb-0 !leading-[96px] !tracking-[4%] !font-black transition-colors duration-300 cursor-pointer ${scrolled ? "text-black" : "text-white"
                  }`}
              >
                Teammy.
              </h1>
            </Link>
          </div>


          {/* Nav links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {["discover", "forum", "my-groups", "workspace"].map((item) => (
                <Link
                  key={item}
                  to={`/${item}`}
                  className={`px-3 py-2 transition-colors duration-200 font-sans font-bold text-[15px] 
        ${isActive(`/${item}`)
                      ? scrolled
                        ? "bg-gradient-to-r from-[#00C6FF] via-[#FFCB57] to-[#FF333D] bg-clip-text text-transparent"
                        : "text-black"
                      : scrolled
                        ? "text-black hover:text-white"
                        : "text-white hover:text-gray-200"
                    }`}
                >
                  {item
                    .split("-")
                    .map((w) => w[0].toUpperCase() + w.slice(1))
                    .join(" ")}
                </Link>
              ))}
            </div>

          </div>

          {/* Right side */}
          <div className="flex-shrink-0 relative" ref={dropdownRef}>
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
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
                    className="w-9 h-9 rounded-full border border-gray-300 object-cover bg-gray-100"
                  />

                </button>

                {menuOpen && (
                  <div
                    className={`absolute right-0 mt-3 w-48 rounded-xl shadow-lg overflow-hidden ${scrolled ? "bg-white" : "bg-white/95 backdrop-blur-md"
                      }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Notifications
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block !w-full !text-left px-4 py-2 !text-sm !text-red-600 hover:bg-red-50"
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
                className={`px-4 py-2 rounded-[32px] text-sm font-medium transition-colors duration-200 flex items-center space-x-1 font-sans ${scrolled
                  ? "!bg-black !text-white hover:bg-gray-800"
                  : "!bg-white/24 !text-white hover:bg-white/32 backdrop-blur-sm"
                  }`}
              >
                <span>Sign in</span>
                <svg
                  className="w-4 h-4"
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
      </div>
    </nav>
  );
};

export default Navbar;
