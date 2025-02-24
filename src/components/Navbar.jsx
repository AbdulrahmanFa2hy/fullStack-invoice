import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { resetInvoice, generateInvoiceNumber } from "../store/mainSlice";

const Navbar = () => {
  const activeStyle = "bg-blue-700";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoiceHistory, invoiceNumber } = useSelector(
    (state) => state.main.invoice
  );

  const handleCreateInvoice = () => {
    const isExistingInvoice = invoiceHistory.some(
      (inv) => inv.invoiceNumber === invoiceNumber
    );

    if (isExistingInvoice) {
      dispatch(resetInvoice());
      dispatch(generateInvoiceNumber());
    }

    navigate("/");
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="text-white hover:bg-blue-700 p-2 rounded-full"
            >
              <FaUserCircle size={24} />
            </button>
            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
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
        </div>

        {/* Create Invoice Button */}
        <button
          onClick={handleCreateInvoice}
          className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
          title="Create New Invoice"
        >
          <FiPlus size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
