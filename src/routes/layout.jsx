import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Layout() {
  const isLoggedIn = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Added loading state to avoid flicker

  useEffect(() => {
    // Check login status on route change
    if (
      isLoggedIn &&
      (location.pathname === "/login" || location.pathname === "/register")
    ) {
      navigate("/");
    }

    if (
      !isLoggedIn &&
      (location.pathname === "/" || location.pathname === "/calls")
    ) {
      navigate("/login");
    }

    setLoading(false); // Set loading to false once login check is complete
  }, [isLoggedIn, location.pathname, navigate]);

  // Prevent rendering homepage content if the user is not logged in
  if (loading) {
    return null; // Or return a loading spinner if desired
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
