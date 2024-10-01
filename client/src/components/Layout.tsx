import { LogOut } from "lucide-react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const Layout = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!token) {
    return <Navigate to="/auth" />;
  }
  return (
    <>
      <div className="navbar bg-base-100">
        <div className="flex-1">{/* Put logo here */}</div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li onClick={handleLogout}>
              <a className="">
                Log out <LogOut />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Layout;
