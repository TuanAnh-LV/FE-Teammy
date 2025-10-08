import { createContext, useState, useContext, useEffect } from "react";
import { AuthService } from "../services/auth.service";
import { HttpException } from "../app/toastException/http.exception";
import socket from "../utils/socket";
// import { toast } from "react-toastify";
// HTTP status codes
const HTTP_STATUS = {
  BADREQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNALSERVER_ERROR: 500,
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole || null;
  });

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken || null;
  });

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
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

  const loginGoogle = async (idToken) => {
    try {
      const response = await AuthService.loginGoogle({ idToken });

      const token = response.data?.token;
      if (!token) {
        throw new Error("Invalid Google login response");
      }

      await handleLogin(token);
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
        const response = await AuthService.getUserRole();
        userData = response.data;
      }

      if (!userData) throw new Error("No user info");

      setUserInfo(userData);
      setRole(userData.role);
      localStorage.setItem("userInfo", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);
      socket.connect();
      socket.emit("join", userData._id);
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
    socket.disconnect();
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token && userInfo?._id) {
      socket.connect();
      socket.emit("join", userInfo._id);

      socket.on("newNotification", (noti) => {
        setNotifications((prev) => [noti, ...prev]);
        setUnreadCount((prev) => prev + 1);
        // toast.info(`🔔 ${noti.title}: ${noti.content}`);
      });
    }

    return () => {
      socket.off("newNotification");
    };
  }, [token, userInfo?._id]);
  //   const forgotPassword = async (params) => {
  //     try {
  //       const response = await AuthService.forgotPassword(params.email);
  //       return response.data;
  //     } catch (error) {
  //       console.error("Failed to forgot password:", error);
  //       throw error instanceof HttpException ? error : new HttpException("Failed to forgot password", HTTP_STATUS.INTERNALSERVER_ERROR);
  //     }
  //   };

  //   const getCurrentUser = async () => {
  //     try {
  //       const storedToken = localStorage.getItem("token");
  //       if (!storedToken) {
  //         throw new HttpException("No token found", HTTP_STATUS.UNAUTHORIZED);
  //       }
  //       const response = await AuthService.getUserRole({ token: storedToken });
  //       if (!response.data?.data) {
  //         throw new HttpException("Invalid response data", HTTP_STATUS.BADREQUEST);
  //       }
  //       setUserInfo(response.data.data);
  //     } catch (error) {
  //       console.error("Failed to get current user:", error);
  //       logout();
  //       throw error instanceof HttpException ? error : new HttpException("Failed to get current user", HTTP_STATUS.INTERNALSERVER_ERROR);
  //     }
  //   };

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
