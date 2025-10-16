import React from "react";
import background from "../../assets/background.png";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase.config";

const LoginModal = ({ open, onClose }) => {
  if (!open) return null;

  const handleGoogleLogin = async (role) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const email = user.email || "";
      let detectedRole = role;

      if (email.endsWith("@fpt.edu.vn")) {
        detectedRole = "student";
      } else if (role === "student" && !email.endsWith("@fpt.edu.vn")) {
        alert("Please use your student email (e.g., fpt.edu.vn)");
        await auth.signOut();
        return;
      }

      console.log("Logged in as:", detectedRole);
      console.log("User:", user);
      console.log("Firebase ID Token:", idToken);

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: detectedRole,
        })
      );

      // Gửi event để Navbar biết user đã login
      window.dispatchEvent(new Event("storage"));
      onClose();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-2xl w-[1040px] max-w-[95%] shadow-2xl overflow-hidden 
                   animate-fadeIn scale-100 border border-gray-100"
      >
        <div className="grid grid-cols-2 h-[620px]">
          <div
            className="relative flex flex-col justify-between px-10 py-12 text-white"
            style={{
              backgroundImage: `url(${background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div>
              <h2 className="text-4xl font-black text-white drop-shadow">Welcome!</h2>
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-center text-white drop-shadow">
                Teammy.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-center text-white/90 max-w-sm">
                Platform connecting students and instructors <br />
                for capstone projects.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-sm text-white/80 hover:text-white transition"
            >
            </button>
          </div>

          <div className="px-10 py-12 overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-gray-900">Log in</h3>
            </div>

            <div className="mt-10 space-y-10">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  For students
                </label>
                <button
                  onClick={() => handleGoogleLogin("student")}
                  className="mt-3 w-full flex items-center justify-center border rounded-lg px-6 py-4 space-x-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-lg">G</span>
                  <span>Sign in with Google</span>
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  For student email accounts only (eg: fpt.edu.vn)
                </p>
              </div>

              <div className="flex items-center justify-center text-gray-300">
                <div className="flex-grow border-t border-gray-200" />
                <span className="px-3 text-xs uppercase text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  For instructors
                </label>
                <button
                  onClick={() => handleGoogleLogin("instructor")}
                  className="mt-3 w-full flex items-center justify-center border rounded-lg px-6 py-4 space-x-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-lg">G</span>
                  <span>Sign in with Google</span>
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                By signing in, you agree to our{" "}
                <a href="#" className="underline hover:text-gray-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-gray-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
