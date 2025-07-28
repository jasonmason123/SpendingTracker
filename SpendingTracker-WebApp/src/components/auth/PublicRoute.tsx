import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
