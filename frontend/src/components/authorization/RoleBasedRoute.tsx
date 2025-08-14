import { Navigate, Outlet } from "react-router-dom";
import { useGetMe } from "../../hooks/auth/useGetMe";
import type { UserRole } from "../../types/User";
import Spinner from "../shared/Spinner";

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleBasedRoute({ allowedRoles }: RoleBasedRouteProps) {
  const { me, isPending } = useGetMe();

  if (isPending) return <Spinner />;

  if (!me) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(me.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
