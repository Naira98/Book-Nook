import { Navigate, Outlet } from "react-router-dom";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { Spinner } from "flowbite-react";

export default function RequireAuth() {
  const { me, isPending } = useGetMe();

  if (isPending) return <Spinner />;

  if (!me) return <Navigate to="/login" replace />;

  return <Outlet />;
}
