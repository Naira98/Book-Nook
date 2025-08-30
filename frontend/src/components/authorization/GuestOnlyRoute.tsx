import { Navigate, Outlet } from "react-router-dom";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { getHomePath } from "../../utils/getHomePath";
import FullScreenSpinner from "../shared/FullScreenSpinner";

export default function GuestOnlyRoute() {
  const { me, isPending } = useGetMe();

  if (isPending) return <FullScreenSpinner />;

  if (me) return <Navigate to={getHomePath(me.role, me.interests)} replace />;

  return <Outlet />;
}
