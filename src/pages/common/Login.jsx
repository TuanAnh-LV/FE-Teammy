import React, { useState } from "react";
import { Link } from "react-router-dom";
import { notification } from "antd";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase.config";
import { useAuth } from "../../context/AuthContext";

const campuses = [
  "FU-Hòa Lạc",
  "FU-Hồ Chí Minh",
  "FU-Đà Nẵng",
  "FU-Cần Thơ",
  "FU-Quy Nhơn",
];

const Login = () => {
  const { loginGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [campus, setCampus] = useState("");

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      await loginGoogle(idToken, {
        email: fbUser.email ?? "",
        displayName: fbUser.displayName ?? "",
        photoURL: fbUser.photoURL ?? "",
        avatarUrl: fbUser.photoURL ?? "",
        // TODO: gửi campus lên API sau này
        campus,
      });

      notification.success({ message: "Signed in with Google" });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Sign in failed",
        description: error?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#4264d7] to-[#4ccdbb] text-white flex items-center justify-center text-2xl font-bold">
          T
        </div>
        <div className="mt-3 text-2xl font-bold text-gray-900">Teammy</div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 px-8 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">
            Sign in with your Google account to access Teammy
          </p>
        </div>

        {/* Row: Campus select + Google button */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campus dropdown */}
          <div className="sm:w-1/2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Select campus
            </label>
            <div className="relative">
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4264d7] focus:border-transparent"
              >
                <option value="">Select Campus</option>
                {campuses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {/* caret icon */}
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="sm:flex-1 border border-gray-200 rounded-2xl py-3 px-4 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            {/* Custom Google "G" icon */}
            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold">
              <span className="text-[#4285F4]">G</span>
            </div>
            <span className="text-sm">
              {loading ? "Signing in..." : "Continue with Google"}
            </span>
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>By continuing, you agree to Teammy&apos;s terms of use.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
