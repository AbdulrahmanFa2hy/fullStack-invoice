import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiDownload,
  FiShare2,
  FiEye,
  FiLoader,
} from "react-icons/fi";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Swal from "sweetalert2";
import { useInvoiceNumber } from "../hooks/useInvoiceNumber";
import {
  addItem,
  removeItem,
  updateItem,
  saveToHistory,
  generateInvoiceNumber,
  updateTax,
  updateDiscount,
  updatePrivacy,
  updateNotes,
  resetInvoice,
} from "../store/invoiceSlice";
import { setSelectedCustomerId, fetchCustomers } from "../store/customersSlice";
import { updateCompany, fetchCompanyByUserId } from "../store/companySlice";
import LogoModal from "../components/LogoModal";
import { useTranslation } from "react-i18next";
import CustomerSelector from "../components/CustomerSelector";
import InvoiceFrom from "../components/InvoiceFrom";
import InvoiceTo from "../components/InvoiceTo";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductItem from '../components/ProductItem';

function Home() {
  const dispatch = useDispatch();
  const {
    items,
    invoiceHistory,
    type: invoiceType,
    tax,
    discount,
    privacy,
    notes,
  } = useSelector((state) => state.main.invoice);
  const company = useSelector((state) => state.company);
  const invoiceNumber = useInvoiceNumber();
  const { customers, selectedCustomerId } = useSelector(
    (state) => state.customers
  );
  const userId = useSelector((state) => state.profile.userData?.id);
  const selectedCustomer = customers.find(
    (customer) => customer._id === selectedCustomerId || customer.id === selectedCustomerId
  ) || {
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  };

  const invoiceRef = useRef(null);

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [emailErrors, setEmailErrors] = useState({ from: "", to: "" });
  const [itemErrors, setItemErrors] = useState({});
  const { t, i18n } = useTranslation();

  // Add a new state to track the local customer data
  const [localCustomer, setLocalCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Add a loading state to the component
  const [isLoading, setIsLoading] = useState(true);

  // Update useEffect to initialize localCustomer when selectedCustomer changes
  useEffect(() => {
    // Only update localCustomer when selectedCustomerId changes
    if (selectedCustomerId) {
      const customer = customers.find(c => c._id === selectedCustomerId || c.id === selectedCustomerId);
      if (customer) {
        setLocalCustomer({
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || ""
        });
      }
    } else {
      // Reset local customer when no customer is selected
      setLocalCustomer({
        name: "",
        email: "",
        phone: "",
        address: ""
      });
    }
  }, [selectedCustomerId, customers]); // Only depend on selectedCustomerId and customers array

  useEffect(() => {
    if (!invoiceNumber) {
      dispatch(generateInvoiceNumber());
    }
    // Add initial item if items array is empty
    if (items.length === 0) {
      dispatch(addItem());
    }
  }, [dispatch, invoiceNumber, items.length]);

  useEffect(() => {
    // Add this effect to handle RTL/LTR
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Update the useEffect to fetch customers when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch company data
      if (userId) {
          await dispatch(fetchCompanyByUserId()).unwrap();
        }
        
        // Fetch customers
        await dispatch(fetchCustomers()).unwrap();
        
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, userId]);

  // Add validation for items
  const validateItems = () => {
    const errors = {};
    items.forEach((item) => {
      if (!item.name.trim()) {
        errors[item.id] = { ...errors[item.id], name: t("nameRequired") };
      }
      if (!item.price || item.price <= 0) {
        errors[item.id] = { ...errors[item.id], price: t("priceRequired") };
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[item.id] = {
          ...errors[item.id],
          quantity: t("quantityRequired"),
        };
      }
    });
    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateItem = (id, field, value) => {
    dispatch(updateItem({ id, field, value }));
    // Clear error when user starts typing
    if (itemErrors[id]?.[field]) {
      setItemErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined },
      }));
    }
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Update the calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * tax) / 100;
  const total = subtotalAfterDiscount + taxAmount;

  const isExistingInvoice = () => {
    return invoiceHistory.some((inv) => inv.invoiceNumber === invoiceNumber);
  };

  const saveInvoiceData = () => {
    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const discountAmount = (subtotal * discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * tax) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    // Get the selected customer data - either from the selected customer or from local state
    const customerData = selectedCustomerId 
      ? { 
          ...localCustomer,
          id: selectedCustomerId 
        } 
      : localCustomer;

    // Create the invoice object with embedded customer data
    const invoiceData = {
      id: isExistingInvoice()
        ? invoiceHistory.find((inv) => inv.invoiceNumber === invoiceNumber).id
        : `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    invoiceNumber,
      sender: {
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        logo: company.logo,
      },
      customerId: selectedCustomerId || null,
      // Embed the full customer data in the invoice
      customer: customerData,
      items: items.filter((item) => item.name.trim() !== ""),
    subtotal,
      discount,
      discountAmount,
    tax,
    taxAmount,
    total,
      createdAt: isExistingInvoice()
        ? invoiceHistory.find((inv) => inv.invoiceNumber === invoiceNumber)
            .createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    privacy,
    notes,
      type: invoiceType,
    };

    dispatch(saveToHistory(invoiceData));
    Swal.fire({
      icon: "success",
      title: isExistingInvoice() ? t("updated") : t("created"),
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleCustomerChange = (field, value) => {
    setLocalCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerSelect = (customerId) => {
    if (customerId === "") {
      dispatch(setSelectedCustomerId(null));
    } else {
      dispatch(setSelectedCustomerId(customerId));
      
      // Find the selected customer from the customers array
      const customer = customers.find(c => c._id === customerId || c.id === customerId);
      
      // No need to update the form fields as they will be updated via the selectedCustomer variable
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (type, value) => {
    if (type === "from") {
      dispatch(updateCompany({ field: "email", value }));
      setEmailErrors((prev) => ({
        ...prev,
        from: validateEmail(value) ? "" : t("invalidEmail"),
      }));
    } else {
      // Update local customer email
      setLocalCustomer(prev => ({
        ...prev,
        email: value
      }));
      setEmailErrors((prev) => ({
        ...prev,
        to: validateEmail(value) ? "" : t("invalidEmail"),
      }));
    }
  };

  const validateCompleteInvoice = () => {
    if (invoiceType === "complete") {
      // Check company (from) fields
      const requiredCompanyFields = ["name", "phone", "email", "address"];
      const missingCompanyFields = requiredCompanyFields.filter(
        (field) => !company[field]
      );

      if (missingCompanyFields.length > 0) {
        Swal.fire({
          icon: "error",
          // title: t("required"),
          text: t("pleaseFillCompanyDetails"),
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return false;
      }

      // Validate company email
      if (!validateEmail(company.email)) {
        Swal.fire({
          icon: "error",
          // title: t("invalidEmail"),
          text: t("pleaseEnterValidCompanyEmail"),
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return false;
      }

      // Check customer (to) fields
      const requiredCustomerFields = ["name", "phone", "email", "address"];
      const missingCustomerFields = requiredCustomerFields.filter(
        (field) => !localCustomer[field]
      );

      if (missingCustomerFields.length > 0) {
        Swal.fire({
          icon: "error",
          // title: t("required"),
          text: t("pleaseFillCustomerDetails"),
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return false;
      }

      // Validate customer email
      if (!validateEmail(localCustomer.email)) {
        Swal.fire({
          icon: "error",
          // title: t("invalidEmail"),
          text: t("pleaseEnterValidCustomerEmail"),
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return false;
      }
    }

    // Validate items
    if (!validateItems()) {
      Swal.fire({
        icon: "error",
        // title: t("required"),
        text: t("pleaseFillRequiredItemFields"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSaveInvoice = () => {
    if (validateCompleteInvoice()) {
      saveInvoiceData();
      Swal.fire({
        title: isExistingInvoice() ? t("updated") : t("created"),
        text: t("createNewInvoiceQuestion"),
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("yes"),
        cancelButtonText: t("no"),
        customClass: {
          popup: "rounded-2xl shadow-lg",
          title: "text-2xl font-bold text-gray-800",
          htmlContainer: "text-gray-600",
          confirmButton:
            "btn btn-primary px-6 py-2 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors",
          cancelButton:
            "btn bg-gray-100 px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors",
          actions: "gap-3",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(resetInvoice());
          dispatch(generateInvoiceNumber());
          dispatch(setSelectedCustomerId(null));
          // Add initial item if items array is empty
          if (items.length === 0) {
            dispatch(addItem());
          }
        }
      });
    }
  };

  // Update getInputClassName to handle phone inputs more specifically
  const getInputClassName = (baseClass, inputType = "text") => {
    if (inputType === "tel") {
      return `${baseClass} text-start rtl:text-right ltr:text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;
    }
    return `${baseClass} text-start`;
  };

  // Add this function to validate a specific item field
  const validateItem = (itemId, field) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;

    const newErrors = { ...itemErrors };
    
    if (field === 'name' || field === 'all') {
      if (!item.name.trim()) {
        newErrors[itemId] = { ...newErrors[itemId], name: t("nameRequired") };
      } else {
        const { name, ...rest } = newErrors[itemId] || {};
        newErrors[itemId] = rest;
      }
    }
    
    if (field === 'price' || field === 'all') {
      if (!item.price || item.price <= 0) {
        newErrors[itemId] = { ...newErrors[itemId], price: t("priceRequired") };
      } else {
        const { price, ...rest } = newErrors[itemId] || {};
        newErrors[itemId] = rest;
      }
    }
    
    if (field === 'quantity' || field === 'all') {
      if (!item.quantity || item.quantity <= 0) {
        newErrors[itemId] = { ...newErrors[itemId], quantity: t("quantityRequired") };
      } else {
        const { quantity, ...rest } = newErrors[itemId] || {};
        newErrors[itemId] = rest;
      }
    }
    
    setItemErrors(newErrors);
    return Object.keys(newErrors[itemId] || {}).length === 0;
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <div
        className="min-h-screen py-4 px-0 md:py-8 md:px-2 bg-gray-100 flex flex-col md:flex-row gap-1 sm:gap-8 md:gap-0"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex-grow max-w-6xl">
          <div
            ref={invoiceRef}
            className="bg-white rounded-2xl shadow-lg md:shadow-2xl p-2 sm:p-5 md:p-8"
          >
            <div className="relative flex flex-col lg:flex-row justify-between items-center gap-4 mb-4 lg:mb-8">
              <h1 className="self-start text-2xl sm:text-3xl  font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent py-3">
                {t("invoiceGenerator")}
              </h1>
              <div
                className={`absolute top-0 ${
                  i18n.language === "ar" ? "left-0" : "right-0"
                } flex flex-col items-center lg:relative h-16 w-16 lg:h-20 lg:w-20 overflow-hidden`}
              >
                {company.logo ? (
                  <div
                    className="cursor-pointer group h-full w-full"
                    onClick={() => setIsLogoModalOpen(true)}
                  >
                    <img
                      src={company.logo}
                      alt="Company logo"
                      className="h-full w-full object-contain rounded-xl border border-gray-200 "
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLogoModalOpen(true)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t("addLogo")}
                  </button>
                )}
                <LogoModal
                  isOpen={isLogoModalOpen}
                  onClose={() => setIsLogoModalOpen(false)}
                  logo={company.logo}
                  onUpdate={(logoData) =>
                    dispatch(updateCompany({ field: "logo", value: logoData }))
                  }
                  onRemove={() =>
                    dispatch(updateCompany({ field: "logo", value: null }))
                  }
                />
              </div>
              <div className="self-end">
                <p className="text-xs sm:text-base text-gray-600 text-end">
                  {format(new Date(), "PPP", {
                    locale: i18n.language === "ar" ? ar : undefined,
                  })}
                </p>
                <p className="text-sm sm:text-base text-gray-600 text-end">
                  {invoiceNumber}
                </p>
              </div>
            </div>

            {/* Conditionally render the 'to' and 'from' sections based on invoice type */}
            {invoiceType !== "quick" && (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InvoiceFrom 
                        getInputClassName={getInputClassName}
                        emailErrors={emailErrors}
                        onEmailChange={handleEmailChange}
                        invoiceType={invoiceType}
                      />
                      <InvoiceTo 
                        customer={localCustomer}
                        selectedCustomerId={selectedCustomerId}
                        onCustomerSelect={handleCustomerSelect}
                        onCustomerChange={handleCustomerChange}
                        emailErrors={emailErrors}
                        onEmailChange={handleEmailChange}
                        getInputClassName={getInputClassName}
                        invoiceType={invoiceType}
                      />
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="hidden lg:grid  bg-gray-50 p-4 rounded-lg mb-4">
                <div className="hidden lg:grid grid-cols-12 gap-4 mb-2 font-semibold text-gray-600">
                  <div className="col-span-4 text-sm sm:text-base">
                    {t("productName")}
                  </div>
                  <div className="col-span-4 text-sm sm:text-base">
                    {t("desc")}
                  </div>
                  <div className="col-span-1 text-sm sm:text-base text-center">
                    {t("qty")}
                  </div>
                  <div className="col-span-1 text-sm sm:text-base text-center">
                    {t("price")}
                  </div>
                  <div className="col-span-1 text-sm sm:text-base text-center">
                    {t("total")}
                  </div>
                  <div className="col-span-1">{t("actions")}</div>
                </div>
              </div>

              {items.map((item) => (
                <ProductItem
                  key={item.id}
                  item={item}
                  itemErrors={itemErrors}
                  handleUpdateItem={handleUpdateItem}
                  handleTextareaResize={handleTextareaResize}
                  getInputClassName={getInputClassName}
                  validateItem={validateItem}
                />
              ))}
            </div>

            <button
              onClick={() => dispatch(addItem())}
              className="btn btn-accent flex items-center space-s-2 text-sm md:text-base mb-2"
            >
              <FiPlus size={20} /> {t("addItem")}
            </button>
          </div>
        </div>
          
        {/* Action buttons container */}
        <div className="md:min-w-72 md:ms-2">
          <div className="bg-white p-2 md:p-6 rounded-xl drop-shadow-2xl md:drop-shadow-none md:shadow-lg sticky top-8">
            <div className="flex flex-col-reverse md:flex-col gap-4">
              <div className="flex flex-col-reverse md:flex-col gap-3">
                <button className="btn btn-accent flex items-center gap-2 w-full justify-center text-sm md:text-base">
                  <FiDownload /> {t("downloadPDF")}
                </button>
                <button className="btn btn-accent flex items-center gap-2 w-full justify-center text-sm md:text-base">
                  <FiEye /> {t("previewPDF")}
                </button>
                <button className="btn btn-accent flex items-center gap-2 w-full justify-center text-sm md:text-base">
                  <FiShare2 /> {t("shareWhatsApp")}
                </button>
                <button
                  onClick={handleSaveInvoice}
                  className="btn btn-primary flex items-center gap-2 w-full justify-center text-sm md:text-base"
                >
                  <FiSave /> {t("saveInvoice")}
                </button>
              </div>

              <div className="md:border-t pt-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 text-center">
                        {t("taxRate")}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className={getInputClassName(
                            "input w-full ps-4 py-1.5 text-sm"
                          )}
                          value={tax || ""}
                          onChange={(e) => {
                            const value = Math.max(0, e.target.value);
                            dispatch(updateTax(parseFloat(value) || 0));
                          }}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              dispatch(updateTax(Math.min(100, (tax || 0) + 1)));
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              dispatch(updateTax(Math.max(0, (tax || 0) - 1)));
                            }
                          }}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 text-center">
                        {t("discount")}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className={getInputClassName(
                            "input w-full ps-4 py-1.5 text-sm"
                          )}
                          value={discount || ""}
                          onChange={(e) => {
                            const value = Math.max(0, e.target.value);
                            dispatch(updateDiscount(parseFloat(value) || 0));
                          }}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              dispatch(
                                updateDiscount(Math.min(100, (discount || 0) + 1))
                              );
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              dispatch(
                                updateDiscount(Math.max(0, (discount || 0) - 1))
                              );
                            }
                          }}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compact Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="ms-0">{t("subtotal")}:</span>
                      <span className="me-0">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {t("discount")} ({discount}%):
                        </span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {tax > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {t("taxRate")} ({tax}%):
                        </span>
                        <span>+${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-1 border-t text-sm sm:text-base">
                      <span>{t("total")}:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Privacy and Notes Sections */}
                  <div className="space-y-3 mt-4 md:border-t pt-4">
                    <textarea
                      className={getInputClassName(
                        "input w-full text-sm min-h-[60px] resize-none bg-gray-50"
                      )}
                      placeholder={t("addPrivacyTerms")}
                      value={privacy}
                      onChange={(e) => dispatch(updatePrivacy(e.target.value))}
                    ></textarea>
                    <textarea
                      className={getInputClassName(
                        "input w-full text-sm min-h-[60px] resize-none bg-gray-50"
                      )}
                      placeholder={t("addNotes")}
                      value={notes}
                      onChange={(e) => dispatch(updateNotes(e.target.value))}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
