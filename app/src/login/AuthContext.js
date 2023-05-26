import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("userId") !== null
  );

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
