import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { FiUserPlus, FiSearch, FiChevronDown } from "react-icons/fi";
import { addCustomer, setSelectedCustomerId } from "../store/customersSlice";
import Swal from "sweetalert2";
import { useState, useRef, useEffect } from "react";

const CustomerSelector = ({ 
  selectedCustomerId, 
  onCustomerSelect, 
  showAddButton = true,
  className = "",
  selectClassName = ""
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.customers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter customers based on search term
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // First check if name matches the search term
      const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // If one matches by name and the other doesn't, prioritize the name match
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // If both match by name or both don't match by name, sort alphabetically
      return a.name.localeCompare(b.name);
    });

  // Get selected customer name
  const selectedCustomerName = selectedCustomerId 
    ? customers.find(c => c._id === selectedCustomerId || c.id === selectedCustomerId)?.name || ""
    : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      const searchInput = document.getElementById('customer-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isDropdownOpen]);

  const handleCustomerSelect = (customerId) => {
    if (onCustomerSelect) {
      onCustomerSelect(customerId);
    } else {
      // Default behavior if no custom handler is provided
      dispatch(setSelectedCustomerId(customerId === "" ? null : customerId));
    }
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleAddCustomerClick = async () => {
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
        }
        
        // If we get here, either there were no duplicates or the user has edited the fields
        // Proceed with API call to add the customer
        const response = await dispatch(addCustomer(formValues)).unwrap();
        
        // If successful, select the new customer
        if (response && response.customer && (response.customer._id || response.customer.id)) {
          handleCustomerSelect(response.customer._id || response.customer.id);
        }
        
        // Show success message
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
        handleAddCustomerClick();
      }
    }
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center gap-2 w-full">
        {/* Search input at top level */}
        <div className="relative flex-shrink" ref={dropdownRef}>
          <div className="relative">
            <input
              id="customer-search-input"
              type="text"
              className={`w-full px-3 py-2 pl-8 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectClassName}`}
              placeholder={selectedCustomerId ? selectedCustomerName : t("searchCustomers")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isDropdownOpen) {
                  setIsDropdownOpen(true);
                }
              }}
              onFocus={() => setIsDropdownOpen(true)}
            />
            <FiSearch className="absolute left-2.5 top-3 text-gray-400" />
            <FiChevronDown 
              className={`absolute right-2.5 top-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="max-h-60 overflow-y-auto py-1 thin-scrollbar">
                <div 
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCustomerSelect("")}
                >
                  {t("none")}
                </div>
                
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div 
                      key={customer._id || customer.id}
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                        (customer._id === selectedCustomerId || customer.id === selectedCustomerId) 
                          ? 'bg-blue-50' 
                          : ''
                      }`}
                      onClick={() => handleCustomerSelect(customer._id || customer.id)}
                    >
                      <div className="font-medium">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-center">
                    {t("noCustomersFound")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {showAddButton && (
          <button
            onClick={handleAddCustomerClick}
            className="btn btn-accent btn-sm flex items-center justify-center gap-1 h-full"
            title={t("addNewCustomer")}
            style={{ minHeight: '38px' }} // Match height with search input
          >
            <FiUserPlus size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector; 