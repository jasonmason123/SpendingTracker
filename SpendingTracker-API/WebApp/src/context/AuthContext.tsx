import { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "../utils";

const AuthContext = createContext<{ isAuthenticated: boolean; loading: boolean }>({ isAuthenticated: false, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);  // Track loading state

  useEffect(() => {
    const isLoggedIn = getCookie("isLoggedIn");
    if (isLoggedIn === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);  // Once the check is done, stop loading
  }, []);

  if (loading) {
    return null;  // Optionally show a loading screen or nothing
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
