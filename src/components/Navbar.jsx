import { NavLink, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { resetInvoice, generateInvoiceNumber } from "../store/mainSlice";

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
  const activeStyle = "bg-blue-700";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoiceHistory, invoiceNumber } = useSelector(
    (state) => state.main.invoice
  );
  const { userData } = useSelector((state) => state.profile);

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
    }

    navigate("/");
  };

  return (
    <nav className="bg-blue-600 px-8 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink
            to="/profile"
            className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
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
