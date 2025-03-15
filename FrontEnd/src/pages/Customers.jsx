import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCustomerThunk,
  deleteCustomerThunk,
  addCustomer,
  fetchCustomers,
} from "../store/customersSlice";
import { normalizeArabicText } from "../utils/arabicNormalization";
import { useTranslation } from "react-i18next";
import { FiUserPlus } from "react-icons/fi";
import Swal from "sweetalert2";

const CustomerModal = ({ customer, onClose, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const isRTL = i18n.dir() === "rtl";

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    }
  }, [customer]);

  if (!customer) return null;

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = t("invalidEmail");
    }

    // Phone validation (only numbers and +)
    const phoneRegex = /^[0-9+]+$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t("invalidPhone");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onEdit({ ...formData });
      setIsEditing(false);
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {isEditing ? t("editCustomer") : t("customerDetails")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm">{t("name")}</label>
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
              <label className="text-gray-600 text-sm">{t("email")}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-200"
                } bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="text-gray-600 text-sm">{t("phone")}</label>
              <div className={`relative ${isRTL ? "text-right" : "text-left"}`}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Only allow numbers and plus sign
                    const value = e.target.value.replace(/[^0-9+]/g, "");
                    setFormData({ ...formData, phone: value });
                  }}
                  onKeyPress={(e) => {
                    // Prevent non-numeric input
                    if (!/[0-9+]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  dir="ltr"
                  inputMode="numeric"
                  pattern="[0-9+]*"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.phone ? "border-red-500" : "border-gray-200"
                  } bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none`}
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="text-gray-600 text-sm">{t("address")}</label>
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
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 text-sm">{t("name")}</label>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t("email")}</label>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t("phone")}</label>
                <p
                  className={`font-medium ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir="ltr"
                >
                  {customer.phone}
                </p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t("address")}</label>
                <p className="font-medium">{customer.address}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => onDelete(customer._id)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                {t("delete")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Customers = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { userData } = useSelector((state) => state.profile);
  const { customers, status, error } = useSelector((state) => state.customers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    if (userData?.id) {
      dispatch(fetchCustomers())
        .unwrap()
        .catch((error) => {
          Swal.fire({
            icon: "error",
            text: error.message || t("errorFetchingCustomers"),
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
          });
        });
    }
  }, [dispatch, userData, t]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        text: error.message || t("errorFetchingCustomers"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }, [error, t]);

  const filteredCustomers = (customers || []).filter((customer) =>
    normalizeArabicText(Object.values(customer).join(" ")).includes(
      normalizeArabicText(searchQuery)
    )
  );

  const handleDelete = async (id) => {
    if (!id) {
      Swal.fire({
        icon: "error",
        text: t("invalidCustomerId"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      await dispatch(deleteCustomerThunk(id)).unwrap();
      setSelectedCustomer(null);
      Swal.fire({
        icon: "success",
        text: t("customerDeleted"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error.message || t("errorDeletingCustomer"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleEdit = async (updatedCustomer) => {
    if (!updatedCustomer._id) {
      Swal.fire({
        icon: "error",
        text: t("invalidCustomerId"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      await dispatch(updateCustomerThunk(updatedCustomer)).unwrap();
      setSelectedCustomer(null);
      Swal.fire({
        icon: "success",
        text: t("customerUpdated"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      // Check for specific error types
      let errorMessage = error?.message || t("errorUpdatingCustomer");
      
      // Handle unique constraint errors
      if (error?.message?.includes("duplicate") || error?.message?.includes("unique")) {
        // Check if it's an email error
        if (error?.message?.toLowerCase().includes("email")) {
          errorMessage = t("emailAlreadyExists");
        } 
        // Check if it's a phone error
        else if (error?.message?.toLowerCase().includes("phone")) {
          errorMessage = t("phoneAlreadyExists");
        }
      }
      
      Swal.fire({
        icon: "error",
        text: errorMessage,
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleAddCustomer = async () => {
    // First, let's create a function to show the modal with pre-filled values and error messages
    const showAddCustomerModal = async (initialValues = {}, fieldErrors = {}) => {
      // Create HTML for the form with pre-filled values
      const formHtml = `
        <div class="space-y-4 mt-4">
          <div class="relative">
            <input id="name" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("name")}" value="${initialValues.name || ''}">
            ${fieldErrors.name ? `<p class="text-red-500 text-xs mt-1">${fieldErrors.name}</p>` : ''}
          </div>
          <div class="relative">
            <input id="email" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("email")}" value="${initialValues.email || ''}">
            ${fieldErrors.email ? `<p class="text-red-500 text-xs mt-1">${fieldErrors.email}</p>` : ''}
          </div>
          <div class="relative">
            <input id="phone" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.phone ? 'border-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("phone")}" type="tel" inputmode="numeric" pattern="[0-9+]*" value="${initialValues.phone || ''}">
            ${fieldErrors.phone ? `<p class="text-red-500 text-xs mt-1">${fieldErrors.phone}</p>` : ''}
          </div>
          <div class="relative">
            <input id="address" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.address ? 'border-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("address")}" value="${initialValues.address || ''}">
            ${fieldErrors.address ? `<p class="text-red-500 text-xs mt-1">${fieldErrors.address}</p>` : ''}
          </div>
        </div>
      `;

      const { value: formValues } = await Swal.fire({
        title: t("addNewCustomer"),
        html: formHtml,
        showCancelButton: true,
        confirmButtonText: t("add"),
        cancelButtonText: t("cancel"),
        buttonsStyling: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#f3f4f6',
        preConfirm: () => {
          const name = document.getElementById("name").value;
          const email = document.getElementById("email").value;
          const phone = document.getElementById("phone").value;
          const address = document.getElementById("address").value;

          if (!name || !email || !phone) {
            Swal.showValidationMessage(t("pleaseFillAllFields"));
            return false;
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Swal.showValidationMessage(t("invalidEmail"));
            return false;
          }

          if (!/^[0-9+]+$/.test(phone)) {
            Swal.showValidationMessage(t("invalidPhone"));
            return false;
          }

          return { name, email, phone, address };
        },
        didOpen: () => {
          // Add event listener to phone input
          const phoneInput = document.getElementById('phone');
          phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9+]/g, '');
          });
          
          const cancelButton = Swal.getCancelButton();
          if (cancelButton) {
            cancelButton.style.color = '#374151';
          }
        }
      });

      return formValues;
    };

    // Initial call to show the modal
    let formValues = await showAddCustomerModal();

    // If user submitted the form
    if (formValues) {
      try {
        // Check for duplicates locally
        const existingCustomer = customers.find(
          c => c.email === formValues.email || c.phone === formValues.phone
        );
        
        if (existingCustomer) {
          // Create field-specific errors
          const fieldErrors = {};
          
          if (existingCustomer.email === formValues.email) {
            fieldErrors.email = t("emailAlreadyExists");
          }
          
          if (existingCustomer.phone === formValues.phone) {
            fieldErrors.phone = t("phoneAlreadyExists");
          }
          
          // Show toast notification
          Swal.fire({
            icon: "error",
            text: t("customerAlreadyExists"),
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
          });
          
          // Reopen the modal with the same values and error messages
          formValues = await showAddCustomerModal(formValues, fieldErrors);
          
          // If user cancelled after seeing errors, exit the function
          if (!formValues) return;
          
          // Otherwise, continue with the new values
        }
        
        // If we get here, either there were no duplicates or the user has edited the fields
        // Proceed with API call
        await dispatch(addCustomer(formValues)).unwrap();
        
        // Refresh the customers list after adding
        dispatch(fetchCustomers());

        Swal.fire({
          icon: "success",
          text: t("customerAdded"),
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
      } catch (error) {
        // Handle API errors
        let errorMessage = error?.message || t("errorAddingCustomer");
        const fieldErrors = {};
        
        // Determine which field has the error
        if (error?.code === "DUPLICATE_CUSTOMER") {
          errorMessage = t("customerAlreadyExists");
        } else if (error?.message?.includes("duplicate") || error?.message?.includes("unique")) {
          if (error?.message?.toLowerCase().includes("email")) {
            errorMessage = t("emailAlreadyExists");
            fieldErrors.email = t("emailAlreadyExists");
          } else if (error?.message?.toLowerCase().includes("phone")) {
            errorMessage = t("phoneAlreadyExists");
            fieldErrors.phone = t("phoneAlreadyExists");
          }
        }
        
        // Show toast notification
        Swal.fire({
          icon: "error",
          text: errorMessage,
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
        
        // Reopen the modal with the same values and error messages
        formValues = await showAddCustomerModal(formValues, fieldErrors);
        
        // If user cancelled after seeing errors, exit the function
        if (!formValues) return;
        
        // If user provided new values, try again recursively
        // This creates a loop where the user can keep trying until they succeed or cancel
        handleAddCustomer();
      }
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("customers")}</h1>
        <button
          onClick={handleAddCustomer}
          className="btn btn-primary flex items-center gap-2 whitespace-nowrap text-xs sm:text-base px-2 sm:px-4"
          disabled={status === "loading"}
        >
          <FiUserPlus />
          {t("addNewCustomer")}
        </button>
      </div>

      {/* Search box - make it full width on mobile, 1/3 on larger screens */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 w-full md:w-1/3 border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder={t("searchCustomers")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2.5 sm:py-3 ${
              isRTL ? "pr-11" : "pl-11"
            } rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-sm sm:text-base`}
            disabled={status === "loading"}
          />
          <svg
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-3.5 h-5 w-5 text-gray-400`}
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


      {/* Error state */}
      {status === "failed" && (
        <div className="text-center py-8 text-red-600 bg-white rounded-xl shadow-sm p-6">
          {error?.message || t("errorFetchingCustomers")}
        </div>
      )}

      {/* Customers table */}
      {status === "succeeded" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th
                    className={`px-4 sm:px-6 py-3 sm:py-4 ${
                      isRTL ? "text-end" : "text-start"
                    } text-xs sm:text-sm font-medium text-gray-600`}
                  >
                    {t("name")}
                  </th>
                  <th
                    className={`hidden sm:table-cell px-6 py-4 ${
                      isRTL ? "text-end" : "text-start"
                    } text-xs sm:text-sm font-medium text-gray-600`}
                  >
                    {t("email")}
                  </th>
                  <th
                    className={`hidden sm:table-cell px-6 py-4 ${
                      isRTL ? "text-end" : "text-start"
                    } text-xs sm:text-sm font-medium text-gray-600`}
                  >
                    {t("phone")}
                  </th>
                  <th
                    className={`hidden sm:table-cell px-6 py-4 ${
                      isRTL ? "text-end" : "text-start"
                    } text-xs sm:text-sm font-medium text-gray-600`}
                  >
                    {t("address")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr key="no-customers" className="h-32">
                    <td 
                      colSpan="4" 
                      className="text-center align-middle py-8 text-gray-500 text-base font-medium"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg 
                          className="w-12 h-12 text-gray-300 mb-3" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        {t("noCustomersFound")}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id || customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <td
                        className={`px-4 sm:px-6 py-3 sm:py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                      >
                        <div className="sm:hidden font-medium mb-1 text-sm">
                          {customer.name}
                        </div>
                        <div
                          className={`sm:hidden text-xs text-gray-500 ${
                            isRTL ? "text-end" : "text-start"
                          }`}
                        >
                          {customer.email}
                          <br />
                          <span
                            dir="ltr"
                            className={isRTL ? "text-right" : "text-left"}
                          >
                            {customer.phone}
                          </span>
                          <br />
                          {customer.address}
                        </div>
                        <div className="hidden sm:block">{customer.name}</div>
                      </td>
                      <td
                        className={`hidden sm:table-cell px-6 py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                      >
                        {customer.email}
                      </td>
                      <td
                        className={`hidden sm:table-cell px-6 py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                        dir="ltr"
                      >
                        <span className={isRTL ? "text-right" : "text-left"}>
                          {customer.phone}
                        </span>
                      </td>
                      <td
                        className={`hidden sm:table-cell px-6 py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                      >
                        {customer.address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Customers;
