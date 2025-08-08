import { Navigate, Outlet } from "react-router-dom";
import { useGetMe } from "../../hooks/auth/useGetMe";

export default function GuestOnlyRoute() {
  const { me, isPending } = useGetMe();

  if (isPending) return <div>Loading...</div>;

  if (me) return <Navigate to="/" replace />;

  return <Outlet />;
}
