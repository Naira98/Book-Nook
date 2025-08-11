import { useGetMe } from "../../hooks/auth/useGetMe";
import logo from "../../assets/light-bg-logo.svg";
export default function CourierNav() {
  const { me } = useGetMe();
  return (
    <nav className="bg-primary px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center justify-center">
          <img src={logo} alt="logo" className="w-20" />
        </div>

        <p className="font-medium text-white">
          {me?.first_name} {me?.last_name}
        </p>
      </div>
    </nav>
  );
}
