import { Navigate, Outlet } from "react-router";
import PageSpinner from "../components/PageSpinner";
import { useAuth } from "./AuthContext";
import { homeFor } from "./roles";

export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireRole({ role }) {
  const { user } = useAuth();
  if (user.role !== role) return <Navigate to={homeFor(user.role) ?? "/"} replace />;
  return <Outlet />;
}
