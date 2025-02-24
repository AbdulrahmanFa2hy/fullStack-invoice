import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../store/customersSlice";
import { normalizeArabicText } from "../utils/arabicNormalization";

const Customers = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "", // Added address field
  });
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.customers);

  const filteredCustomers = customers.filter((customer) =>
    normalizeArabicText(Object.values(customer).join(" ")).includes(
      normalizeArabicText(searchQuery)
    )
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updateCustomer(formData));
    } else {
      dispatch(
        addCustomer({
          ...formData,
          id: Date.now().toString(),
        })
      );
    }
    resetForm();
  };

  const handleDelete = (id) => {
    dispatch(deleteCustomer(id));
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", email: "", phone: "", address: "" });
    setIsEditing(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold mb-8 text-gray-700 tracking-tight">
        Customers
      </h2>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 md:col-span-2 lg:col-span-3"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-500 text-white px-8 py-3 rounded-lg hover:bg-indigo-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:ring-2 focus:ring-indigo-200"
            >
              {isEditing ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 w-1/3 border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Address
              </th>
              <th className="px-6 py-4  text-sm font-medium text-gray-600 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 text-gray-700">{customer.name}</td>
                <td className="px-6 py-4 text-gray-700">{customer.email}</td>
                <td className="px-6 py-4 text-gray-700">{customer.phone}</td>
                <td className="px-6 py-4 text-gray-700">{customer.address}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg mr-2 hover:bg-amber-200 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-gray-500 bg-gray-50"
                >
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
