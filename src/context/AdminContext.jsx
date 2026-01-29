import React, { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("storia_admin_logged_in");
    if (loggedIn === "true") {
      setIsAdmin(true);
    }
  }, []);

  const login = (email) => {
    // Validate specific admin email
    if (email === "sastoria60@gmail.com") {
      setIsAdmin(true);
      localStorage.setItem("storia_admin_logged_in", "true");
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("storia_admin_logged_in");
  };

  const toggleLoginModal = () => {
    if (isAdmin) {
      // If already admin, maybe navigate to dashboard?
      // For now, just toggling modal might not be useful if logged in.
      // We'll handle navigation in the component.
    } else {
      setShowLoginModal((prev) => !prev);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        showLoginModal,
        setShowLoginModal,
        toggleLoginModal,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
