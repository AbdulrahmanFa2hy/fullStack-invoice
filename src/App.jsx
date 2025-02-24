import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Invoices from "./pages/Invoices";
import SubscriptionPlans from "./pages/SubscriptionPlans";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleSubscription = () => {
    setHasSubscription(true);
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
              <div>Customers Page</div>
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
