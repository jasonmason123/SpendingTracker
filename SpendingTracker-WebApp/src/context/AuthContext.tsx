import { createContext, useContext, useState, useEffect } from "react";
import { getCookie, getUserInfo } from "../utils";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  loading: boolean;
  username: string;
  email: string;
  dateJoined: string;
}>({
  isAuthenticated: false,
  loading: true,
  username: "",
  email: "",
  dateJoined: "",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dateJoined, setDateJoined] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);  // Track loading state

  useEffect(() => {
    const isLoggedIn = getCookie("isLoggedIn");
    if (isLoggedIn === "true") {
      setIsAuthenticated(true);
      
      const userInfo = getUserInfo();
      if (userInfo != null) {
        setUsername(userInfo.username);
        setEmail(userInfo.email);
        setDateJoined(userInfo.dateJoined);
      }
    }
    setLoading(false);  // Once the check is done, stop loading
  }, []);

  if (loading) {
    return null;  // Optionally show a loading screen or nothing
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, username, email, dateJoined }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
