import { Navigate } from "react-router-dom";
import { useAppContext } from "../api/context-providers/app-context";
import { APP_ROUTES } from "./routes";

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const { isLoggedIn, authReady, user } = useAppContext();

  if (!authReady) return null;
  if (!isLoggedIn) return <Navigate to={APP_ROUTES.auth} replace />;
  if (!user.roles.some((r) => allowedRoles.includes(r)))
    return <Navigate to={APP_ROUTES.home} replace />;

  return <>{children}</>;
}
