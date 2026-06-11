import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

// Wraps a page that requires login. If there's no logged-in user,
// redirect to the login page instead of rendering the page.
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
