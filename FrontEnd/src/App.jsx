import "./i18n/i18n";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthenticated, checkAuth } from "./store/profileSlice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Invoices from "./pages/Invoices";
import InvoiceTypes from "./pages/InvoiceTypes"; // Renamed from SubscriptionPlans
import Customers from "./pages/Customers";
import Profile from "./pages/Profile";
import CompanyForm from "./pages/CompanyForm";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.profile.userData);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  const handleAuth = () => {
    dispatch(setAuthenticated(true));
  };

  const AuthRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <AuthRoute>
              <Home />
            </AuthRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <AuthRoute>
              <Invoices />
            </AuthRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <AuthRoute>
              <Customers />
            </AuthRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthRoute>
              <Profile />
            </AuthRoute>
          }
        />
        <Route
          path="/invoice-types"
          element={
            <AuthRoute>
              <InvoiceTypes />
            </AuthRoute>
          }
        />
        <Route
          path="/company"
          element={
            <AuthRoute>
              <CompanyForm />
            </AuthRoute>
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <Signup onSignup={handleAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
