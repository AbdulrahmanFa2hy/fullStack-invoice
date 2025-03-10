import "./i18n/i18n";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanyForm from "./pages/CompanyForm";
import Invoices from "./pages/Invoices";
import Profile from "./pages/Profile";
import InvoiceTypes from "./pages/InvoiceTypes";
import Customers from "./pages/Customers";
import AuthPersist from "./components/AuthPersist";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n";
import Navbar from "./components/Navbar";

// Wrapper component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<AuthPersist />}>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<CompanyForm />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invoice-types" element={<InvoiceTypes />} />
          <Route path="/customers" element={<Customers />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <AppContent />
        </Router>
      </I18nextProvider>
    </Provider>
  );
}

export default App;
