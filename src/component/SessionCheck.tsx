import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Modal } from "antd";
import { jwtDecode } from "jwt-decode";

const SessionCheck: React.FC = () => {
  const { sessionId, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);

  const decodeToken = (token: string) => {
    try {
      return jwtDecode<{ exp: number }>(token);
    } catch (error) {
      // console.error("Failed to decode token:", error);
      return null;
    }
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  useEffect(() => {
    if (!sessionId) {
      navigate("/login");
      return;
    }

    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.exp) {
        const expirationTime = decodedToken.exp * 1000;
        if (Date.now() > expirationTime) {
          setIsExpired(true);
        } else {
          const timeUntilExpiry = expirationTime - Date.now();
          setTimeout(() => setIsExpired(true), timeUntilExpiry);
        }
      }
    }
  }, [sessionId, token, navigate]);

  useEffect(() => {
    if (isExpired) {
      Modal.confirm({
        title: "Session Expired",
        content: "Your session has expired. Please log in again.",
        okText: "Log Out",
        cancelText: "Cancel",
        onOk: handleLogout,
        onCancel: () => setIsExpired(false),
        maskStyle: {
          backgroundColor: "#0C743FC9",
        },
        bodyStyle: {
          borderRadius: "0 !important",
        },
      });
    }
  }, [isExpired, handleLogout]);

  return null;
};

export default SessionCheck;
