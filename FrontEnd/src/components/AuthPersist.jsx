import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { checkAuth } from "../store/profileSlice";

function AuthPersist() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        // If authentication fails, redirect to login but save the current location
        // Don't redirect if already on login or signup page
        if (!["/login", "/signup"].includes(location.pathname)) {
          navigate("/login", {
            state: { from: location.pathname },
            replace: true,
          });
        }
      }
    };

    verifyAuth();
  }, [dispatch, location.pathname, navigate]);

  return <Outlet />;
}

export default AuthPersist;
