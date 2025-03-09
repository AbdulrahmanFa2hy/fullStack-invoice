import { NavLink, useNavigate } from "react-router-dom";
import { FiPlus, FiMenu, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { resetInvoice, generateInvoiceNumber } from "../store/invoiceSlice";
import { setSelectedCustomerId } from "../store/customersSlice"; // Add this import
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "?";
  const names = name
    .trim()
    .split(" ")
    .filter((n) => n);
  if (names.length === 0) return "?";
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : names[0][0].toUpperCase();
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const activeStyle = "bg-blue-700";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoiceHistory, invoiceNumber } = useSelector(
    (state) => state.main.invoice
  );
  const { userData } = useSelector((state) => state.profile);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!userData) {
    return null;
  }

  const handleCreateInvoice = () => {
    const isExistingInvoice = invoiceHistory.some(
      (inv) => inv.invoiceNumber === invoiceNumber
    );

    if (isExistingInvoice) {
      dispatch(resetInvoice());
      dispatch(generateInvoiceNumber());
      dispatch(setSelectedCustomerId(null)); // Add this line to reset customer selection
    }

    navigate("/");
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  return (
    <nav
      className="bg-blue-600 px-4 md:px-8 py-4 shadow-md relative"
      dir={i18n.dir()}
    >
      <div className="mx-auto flex items-center justify-between">
        {/* Left side - Profile and Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
          {/* Profile button */}
          <NavLink
            to="/profile"
            className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
              {getInitials(userData?.name)}
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("home")}
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("invoiceHistory")}
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("customers")}
            </NavLink>
            <NavLink
              to="/company"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("company")}
            </NavLink>
            <NavLink
              to="/invoice-types"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("invoiceType")}
            </NavLink>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Right side - Language Toggle and Create Invoice Button */}
        <div className="flex items-center gap-4">
          {/* Language Toggle - Visible only on desktop */}
          <button
            onClick={toggleLanguage}
            className="hidden md:flex justify-center items-center text-white px-3 py-1 rounded-md hover:bg-blue-800 transition-colors"
            title={
              i18n.language === "ar"
                ? "تغيير اللغة إلى الأنجليزية"
                : "change language to  AR"
            }
          >
            {i18n.language === "ar" ? "EN" : "AR"}
          </button>
          <button
            onClick={handleCreateInvoice}
            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 hover:rotate-90 hover:scale-105 transition-all duration-300 hover:shadow-lg"
            title={t("createNewInvoice")}
          >
            <FiPlus />
          </button>
        </div>
      </div>

      {/* Mobile Navigation with Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } z-40`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        ref={menuRef}
        className={`md:hidden fixed ${
          i18n.language === "ar" ? "right-0" : "left-0"
        } top-0 h-screen w-64 bg-blue-600 border-x border-blue-500 shadow-lg transition-transform duration-300 z-50 ${
          isMenuOpen
            ? "translate-x-0"
            : i18n.language === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>

          {/* Menu Content with adjusted padding */}
          <div className="p-4 pt-16 flex-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("home")}
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("invoiceHistory")}
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("customers")}
            </NavLink>
            <NavLink
              to="/company"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("company")}
            </NavLink>
            <NavLink
              to="/invoice-types"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("invoiceType")}
            </NavLink>

            {/* Language Toggle Button */}
            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="w-full text-start text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2"
            >
              {i18n.language === "ar" ? "EN" : "AR"}
            </button>
          </div>

          {/* Profile Link at Bottom */}
          <div className="border-t border-blue-500 p-4">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 text-white hover:bg-blue-700 p-2 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
                {getInitials(userData?.name)}
              </div>
              <span>{t("profile")}</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
