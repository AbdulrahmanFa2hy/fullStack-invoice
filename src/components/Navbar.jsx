import { NavLink } from "react-router-dom";

const Navbar = () => {
  const activeStyle = "bg-blue-700";

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-start gap-8">
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
    </nav>
  );
};

export default Navbar;
