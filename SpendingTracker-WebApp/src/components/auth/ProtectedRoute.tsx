import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return null;  // Optionally return null until loading is complete
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
