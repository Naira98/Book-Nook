import { Spinner } from "flowbite-react";
import { Navigate, Outlet } from "react-router-dom";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { getHomePath } from "../../utils/getHomePath";

export default function GuestOnlyRoute() {
  const { me, isPending } = useGetMe();

  if (isPending) return <Spinner />;

  if (me) return <Navigate to={getHomePath(me.role, me.interests)} replace />;

  return <Outlet />;
}
