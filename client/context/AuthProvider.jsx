import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext.jsx";

const backendUrl =  "https://quick-chat-sq4p.vercel.app/";
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectSocket = useCallback(
    (userData) => {
      if (!userData || (socket && socket.connected)) return;

      const newSocket = io(backendUrl, {
        query: { userId: userData._id },
      });

      setSocket(newSocket);
      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });
    },
    [socket]
  );

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error(
        "Auth check failed:",
        error.response?.data?.message || error.message
      );
      setAuthUser(null);
      setToken(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  }, [connectSocket]);

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);

        // ✅ Save token in both state, localStorage, and axios headers
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.token}`;

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
    if (socket) {
      socket.disconnect();
    }
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) {
      // ✅ Always set Bearer token in header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokenFromStorage}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const value = {
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    loading,
    axios
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
