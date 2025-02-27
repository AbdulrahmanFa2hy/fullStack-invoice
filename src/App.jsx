import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthenticated, setSubscription } from "./store/profileSlice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Invoices from "./pages/Invoices";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Customers from "./pages/Customers";
import Profile from "./pages/Profile";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, hasSubscription } = useSelector(
    (state) => state.profile.userData
  );

  const handleAuth = () => {
    dispatch(setAuthenticated(true));
  };

  const handleSubscription = () => {
    dispatch(setSubscription(true));
  };

  const AuthRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (!hasSubscription) {
      return <Navigate to="/subscription-plans" replace />;
    }

    return children;
  };

  return (
    <Router>
      {isAuthenticated && hasSubscription && <Navbar />}
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
          path="/subscription-plans"
          element={
            isAuthenticated && !hasSubscription ? (
              <SubscriptionPlans onSubscribe={handleSubscription} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleAuth} />
            ) : (
              <Navigate
                to={hasSubscription ? "/" : "/subscription-plans"}
                replace
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <Signup onSignup={handleAuth} />
            ) : (
              <Navigate
                to={hasSubscription ? "/" : "/subscription-plans"}
                replace
              />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
