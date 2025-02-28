import { NavLink, useNavigate } from "react-router-dom";
import { FiPlus, FiMenu, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { resetInvoice, generateInvoiceNumber } from "../store/mainSlice";
import { setSelectedCustomerId } from "../store/customersSlice"; // Add this import
import { useState, useRef, useEffect } from "react";

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

  return (
    <nav className="bg-blue-600 px-4 md:px-8 py-4 shadow-md relative">
      <div className="mx-auto flex items-center justify-between">
        {/* Mobile Menu Button - Now First Item */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className="hidden md:flex items-center gap-4 md:gap-8">
          {/* Hide profile link on mobile - it will be in dropdown */}
          <NavLink
            to="/profile"
            className="hidden md:block text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            {userData?.image ? (
              <img
                src={userData.image}
                alt={userData.name || "Profile"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
                {getInitials(userData?.name)}
              </div>
            )}
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              Invoices
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              Customers
            </NavLink>
            <NavLink
              to="/company"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              Company
            </NavLink>
          </div>
        </div>

        {/* Create Invoice Button */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleCreateInvoice}
            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 hover:rotate-90 hover:scale-105 transition-all duration-300 hover:shadow-lg"
            title="Create New Invoice"
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
        className={`md:hidden fixed left-0 top-0 h-screen w-64 bg-blue-600 border-r border-blue-500 shadow-lg transition-transform duration-300 z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
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
              Home
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
              Invoices
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
              Customers
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
              Company
            </NavLink>
          </div>

          {/* Profile Link at Bottom */}
          <div className="border-t border-blue-500 p-4">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 text-white hover:bg-blue-700 p-2 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {userData?.image ? (
                <img
                  src={userData.image}
                  alt={userData.name || "Profile"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
                  {getInitials(userData?.name)}
                </div>
              )}
              <span>Profile</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
