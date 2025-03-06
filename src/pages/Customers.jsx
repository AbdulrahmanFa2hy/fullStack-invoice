import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCustomer,
  deleteCustomer,
} from "../store/customersSlice";
import { normalizeArabicText } from "../utils/arabicNormalization";
import { useTranslation } from "react-i18next";

const CustomerModal = ({ customer, onClose, onEdit, onDelete }) => {
  const { t } = useTranslation();
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
    onEdit({ ...formData, id: customer.id });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {isEditing ? t('editCustomer') : t('customerDetails')}
        </h3>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm">{t('name')}</label>
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
              <label className="text-gray-600 text-sm">{t('email')}</label>
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
              <label className="text-gray-600 text-sm">{t('phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                dir="ltr"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-right"
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">{t('address')}</label>
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
                {t('save')}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 text-sm">{t('name')}</label>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t('email')}</label>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t('phone')}</label>
                <p className="font-medium text-right" dir="ltr">{customer.phone}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t('address')}</label>
                <p className="font-medium">{customer.address}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200"
              >
                {t('edit')}
              </button>
              <button
                onClick={() => onDelete(customer.id)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                {t('delete')}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                {t('close')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Customers = () => {
  const { t } = useTranslation();
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
    dispatch(updateCustomer(updatedCustomer));
    setSelectedCustomer(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen text-sm sm:text-base">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-8 text-gray-700 tracking-tight">
        {t('customers')}
      </h2>

      {/* Search box */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 sm:mb-6 w-full sm:w-1/3 border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchCustomers')}
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
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-start text-xs sm:text-sm font-medium text-gray-600">
                  {t('name')}
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-start text-xs sm:text-sm font-medium text-gray-600">
                  {t('email')}
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-start text-xs sm:text-sm font-medium text-gray-600">
                  {t('phone')}
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-start text-xs sm:text-sm font-medium text-gray-600">
                  {t('address')}
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
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-start">
                    <div className="sm:hidden font-medium mb-1 text-sm">
                      {customer.name}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 text-start">
                      {customer.email}
                      <br />
                      {customer.phone}
                      <br />
                      {customer.address}
                    </div>
                    <div className="hidden sm:block">{customer.name}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-gray-700 text-start">
                    {customer.email}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-gray-700 text-start" dir="ltr">
                    {customer.phone}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-gray-700 text-start">
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
                    {t('noCustomersFound')}
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
