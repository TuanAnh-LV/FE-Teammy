import React, { useEffect } from "react";
import { notification } from "antd";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase.config";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";

const Login = () => {
  const { loginGoogle, token, userInfo, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);

  // If already authenticated, keep user on the app instead of showing login again
  useEffect(() => {
    // If already authenticated, redirect to the correct dashboard based on role
    if (token && (role || userInfo)) {
      let userRole = role || userInfo?.role;
      if (Array.isArray(userRole)) userRole = userRole[0];
      userRole = String(userRole || "")
        .toLowerCase()
        .replace(/^role[_-]?/i, "");

      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "mentor":
          navigate("/mentor/dashboard", { replace: true });
          break;
        case "moderator":
          navigate("/moderator/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  }, [token, userInfo, role, navigate]);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      const userData = await loginGoogle(idToken);

      notification.success({ message: t("signedInWithGoogle") });

      // Normalize role (handle ROLE_ prefix or array shape)
      let userRole = userData?.role;
      if (Array.isArray(userRole)) userRole = userRole[0];
      userRole = String(userRole || "")
        .toLowerCase()
        .replace(/^role[_-]?/i, "");

      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "mentor":
          navigate("/mentor/dashboard");
          break;
        case "moderator":
          navigate("/moderator/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      notification.error({
        message: t("signInFailed"),
        description: error?.message || t("pleaseTryAgain"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#4264d7] to-[#4ccdbb] text-white flex items-center justify-center text-2xl font-bold">
          T
        </div>
        <div className="mt-3 text-2xl font-bold text-gray-900">Teammy</div>
      </div>

      {/* Main box */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 px-8 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in with your Google account to access Teammy
          </p>
        </div>

        {/* Fixed Campus Display */}
        <div className="mb-2 text-xs font-semibold text-gray-500">
          Campus: <span className="text-gray-900">FU-Hồ Chí Minh</span>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-gray-200 rounded-2xl py-3 px-4 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 whitespace-nowrap"
        >
          <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold">
            <span className="text-[#4285F4]">G</span>
          </div>
          <span className="text-sm">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
        </button>

        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>By continuing, you agree to Teammy's terms of use.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
