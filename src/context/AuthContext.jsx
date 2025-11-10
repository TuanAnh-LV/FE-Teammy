import { createContext, useState, useContext, useEffect } from "react";
import { AuthService } from "../services/auth.service";
import { HttpException } from "../app/toastException/http.exception";
// import { toast } from "react-toastify";
// HTTP status codes
const HTTP_STATUS = {
  BADREQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNALSERVER_ERROR: 500,
};

const AuthContext = createContext(undefined);

// Ensure a consistent user shape across the app
const normalizeUserInfo = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  return {
    userId: raw.userId || raw.uid,
    email: raw.email,
    name: raw.displayName || raw.name || "",
    photoURL: raw.avatarUrl || raw.avatarURL || raw.photoURL || raw.photoUrl || "",
    role: raw.role,
    emailVerified: !!raw.emailVerified,
    skillsCompleted: !!raw.skillsCompleted,
  };
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole && storedRole !== "undefined" ? storedRole : null;
  });

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken || null;
  });

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (!storedUserInfo) return null;
      const parsed = JSON.parse(storedUserInfo);
      return normalizeUserInfo(parsed);
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage:", error);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (userInfo) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        localStorage.removeItem("userInfo");
      }
    } catch (error) {
      console.error("Failed to update userInfo in localStorage:", error);
    }
  }, [userInfo]);

  const loginGoogle = async (idToken, fallbackProfile = null) => {
    try {
      const response = await AuthService.login({ idToken });

      const token = response.data?.accessToken || response.data?.token;
      if (!token) {
        throw new Error("Invalid Google login response");
      }

      await handleLogin(token, fallbackProfile);
    } catch (error) {
      console.error("Failed to login with Google:", error);
      throw error instanceof HttpException
        ? error
        : new HttpException(
          "Failed to login with Google",
          HTTP_STATUS.INTERNALSERVER_ERROR
        );
    }
  };

  const handleLogin = async (token, userFromLogin = null) => {
    try {
      if (!token)
        throw new HttpException("No token provided", HTTP_STATUS.UNAUTHORIZED);

      localStorage.setItem("token", token);
      setToken(token);

      let userData = userFromLogin;

      if (!userData) {
        const response = await AuthService.me(); 
        userData = response.data;
      }

      if (!userData) throw new Error("No user info");

      // Normalize backend fields → UI shape used across the app
      const normalized = normalizeUserInfo(userData);

      setUserInfo(normalized);
      setRole(normalized.role);
      localStorage.setItem("userInfo", JSON.stringify(normalized));
      localStorage.setItem("role", normalized.role);

    } catch (error) {
      console.error("Failed to get user info:", error);
      throw error instanceof HttpException
        ? error
        : new HttpException(
          "Failed to get user info",
          HTTP_STATUS.INTERNALSERVER_ERROR
        );
    }
  };
  const logout = () => {
    setToken(null);
    setRole(null);
    setUserInfo(null);
    localStorage.clear();
    window.location.href = "/";
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        token,
        setToken,
        userInfo,
        setUserInfo,
        isLoading,
        setIsLoading,
        handleLogin,
        logout,
        // forgotPassword,
        // getCurrentUser,
        loginGoogle,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new HttpException(
      "useAuth must be used within an AuthProvider",
      HTTP_STATUS.INTERNALSERVER_ERROR
    );
  }
  return context;
};

