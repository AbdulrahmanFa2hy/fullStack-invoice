import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../store/customersSlice";
import { normalizeArabicText } from "../utils/arabicNormalization";

const CustomerModal = ({ customer, onClose, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    }
  }, [customer]);

  if (!customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Make sure to pass the complete form data including the ID
    onEdit({ ...formData, id: customer.id });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {isEditing ? "Edit Customer" : "Customer Details"}
        </h3>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="submit"
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 text-sm">Name</label>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Email</label>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Phone</label>
                <p className="font-medium">{customer.phone}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Address</label>
                <p className="font-medium">{customer.address}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(customer.id)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.customers);

  const filteredCustomers = customers.filter((customer) =>
    normalizeArabicText(Object.values(customer).join(" ")).includes(
      normalizeArabicText(searchQuery)
    )
  );

  const handleDelete = (id) => {
    dispatch(deleteCustomer(id));
    setSelectedCustomer(null);
  };

  const handleEdit = (updatedCustomer) => {
    // Now updatedCustomer will have the ID
    dispatch(updateCustomer(updatedCustomer));
    setSelectedCustomer(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen text-sm sm:text-base">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-8 text-gray-700 tracking-tight">
        Customers
      </h2>

      {/* Search box */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 sm:mb-6 w-full sm:w-1/3 border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 sm:py-3 pl-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 text-sm sm:text-base"
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

      {/* Customers table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-600">
                  Name
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-600">
                  Phone
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-600">
                  Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700">
                    <div className="sm:hidden font-medium mb-1 text-sm">
                      {customer.name}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500">
                      {customer.email}
                      <br />
                      {customer.phone}
                      <br />
                      {customer.address}
                    </div>
                    <div className="hidden sm:block">{customer.name}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-gray-700">
                    {customer.email}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-gray-700">
                    {customer.phone}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-gray-700">
                    {customer.address}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500 bg-gray-50"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Customers;
