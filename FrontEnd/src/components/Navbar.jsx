import { NavLink, useNavigate } from "react-router-dom";
import { FiPlus, FiMenu, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { 
  resetInvoice, 
  getNextInvoiceNumber, 
  createInvoice, 
  saveToHistory 
} from "../store/invoiceSlice";
import { setSelectedCustomerId } from "../store/customersSlice";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

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
  const { 
    invoiceHistory, 
    invoiceNumber, 
    items, 
    tax, 
    discount, 
    privacy, 
    notes,
    type: invoiceType 
  } = useSelector((state) => state.main.invoice);
  const { selectedCustomerId } = useSelector((state) => state.customers);
  const { userData } = useSelector((state) => state.profile);
  const company = useSelector((state) => state.company);
  const { t, i18n } = useTranslation();

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

  const hasUnsavedChanges = () => {
    // Check if there are any items with content
    const hasItems = items.some(item => 
      item.name.trim() !== "" || 
      item.description.trim() !== "" || 
      item.quantity > 0 || 
      item.price > 0
    );
    
    // Check if there are any other fields with content
    const hasOtherContent = 
      tax > 0 || 
      discount > 0 || 
      (privacy && privacy.trim() !== "") || 
      (notes && notes.trim() !== "");
    
    return hasItems || hasOtherContent;
  };

  const handleCreateInvoice = async () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges()) {
      Swal.fire({
        title: t("createNewInvoice"),
        text: t("saveCurrentInvoicePrompt"),
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: t("saveAndCreate"),
        denyButtonText: t("createWithoutSaving"),
        cancelButtonText: t("cancel"),
        buttonsStyling: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // User wants to save current invoice first
          const saveResult = await saveCurrentInvoice();
          if (saveResult !== null) {
            // Only create new invoice if save was successful
            createNewInvoice();
          }
        } else if (result.isDenied) {
          // User wants to discard changes and create new invoice
          createNewInvoice();
        }
        // If canceled, do nothing
      });
    } else {
      // No unsaved changes, create new invoice directly
      createNewInvoice();
    }
  };

  // Function to save the current invoice
  const saveCurrentInvoice = async () => {
    try {
      // Validate inputs before saving
      if (!validateInputs()) {
        return null; // Return null instead of throwing an error to handle validation failures gracefully
      }
      
      // Make sure we're using the new invoice number format
      if (!invoiceNumber || !invoiceNumber.startsWith('#')) {
        dispatch(getNextInvoiceNumber());
      }
      
      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const discountAmount = (subtotal * discount) / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const taxAmount = (subtotalAfterDiscount * tax) / 100;
      const total = subtotalAfterDiscount + taxAmount;

      // Check if this invoice already exists in our history
      const existingInvoice = invoiceHistory.find(
        inv => inv.invoiceNumber === invoiceNumber || inv.invoice_number === invoiceNumber
      );

      // Create the invoice data object for the backend
      const invoiceData = {
        invoice_number: invoiceNumber,
        user_id: userData?.id,
        company_id: company._id || company.id,
        customer_id: selectedCustomerId,
        items: items
          .filter((item) => item.name.trim() !== "")
          .map(item => ({
            name: item.name,
            description: item.description || "",
            quantity: Number(item.quantity),
            price: Number(item.price)
          })),
        subtotal: Number(subtotal),
        discount: Number(discount),
        discountAmount: Number(discountAmount),
        tax: Number(tax),
        taxAmount: Number(taxAmount),
        total: Number(total),
        type: invoiceType,
        privacy: privacy || "",
        notes: notes || "",
      };

      // If it's an existing invoice, include the ID
      if (existingInvoice) {
        invoiceData.id = existingInvoice._id || existingInvoice.id;
      }

      // Dispatch the createInvoice thunk
      const result = await dispatch(createInvoice(invoiceData)).unwrap();
      
      // Save to local history with company data
      dispatch(saveToHistory({
        ...result,
        id: result._id,
        sender: {
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          logo: company.logo || "",
        },
        customer: result.customer ? {
          name: result.customer.name || "",
          email: result.customer.email || "",
          phone: result.customer.phone || "",
          address: result.customer.address || "",
        } : {},
        createdAt: result.createdAt || new Date().toISOString(),
        updatedAt: result.updatedAt || new Date().toISOString(),
      }));
      
      // Show success toast
      Swal.fire({
        icon: "success",
        text: existingInvoice ? t("invoiceUpdated") : t("invoiceSaved"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });

      return result;
    } catch (error) {
      console.error('Failed to save invoice:', error);
      
      let errorMessage = t("failedToSaveInvoice");
      if (error.message?.includes('duplicate key error') || 
          error.message?.includes('already exists')) {
        errorMessage = t("duplicateInvoiceNumber");
        dispatch(getNextInvoiceNumber());
      }
      
      Swal.fire({
        icon: "error",
        text: errorMessage,
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      
      throw error;
    }
  };

  // Update the validateInputs function to check all validation conditions
  const validateInputs = () => {
    
    // Check if there are any items with valid data
    const hasValidItems = items.some(item => 
      item.name.trim() !== "" && 
      item.quantity > 0 && 
      item.price > 0
    );
    

    
    // For complete invoice type, validate customer selection
    if (invoiceType === 'complete' && !selectedCustomerId) {
      Swal.fire({
        icon: "error",
        text: t("pleaseSelectCustomer"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return false; // Return false immediately for this critical error
    }
    
    // Validate each item individually
    for (const item of items) {
      if (item.name.trim() !== "") {
        if (item.quantity <= 0) {
          Swal.fire({
            icon: "error",
            text: `${t("quantityRequired")} ${t("for")} ${item.name}`,
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
          });
          return false; // Return false immediately for this error
        }
        
        if (item.price <= 0) {
          Swal.fire({
            icon: "error",
            text: `${t("priceRequired")} ${t("for")} ${item.name}`,
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
          });
          return false; // Return false immediately for this error
        }
      }
    }
    if (!hasValidItems) {
      Swal.fire({
        icon: "error",
        text: t("pleaseAddValidItems"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return false; // Return false immediately for this critical error
    }
    
    return true; // All validations passed
  };

  const createNewInvoice = () => {
    // Reset the invoice
    dispatch(resetInvoice());
    
    // Get the next invoice number from the backend
    dispatch(getNextInvoiceNumber());
    
    // Reset customer selection
    dispatch(setSelectedCustomerId(null));
    
    // Don't add an initial item here, as Home.jsx will handle that
    
    // Navigate to home
    navigate("/");
    
    // Close the menu if it's open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  return (
    <nav
      className="bg-blue-600 px-4 md:px-8 py-4 shadow-md relative"
      dir={i18n.dir()}
    >
      <div className="mx-auto flex items-center justify-between">
        {/* Left side - Profile and Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
          {/* Profile button */}
          <NavLink
            to="/profile"
            className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
              {getInitials(userData?.name)}
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("home")}
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("invoiceHistory")}
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("customers")}
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("products")}
            </NavLink>
            <NavLink
              to="/company"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("company")}
            </NavLink>
            <NavLink
              to="/invoice-types"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors ${
                  isActive ? activeStyle : ""
                }`
              }
            >
              {t("invoiceType")}
            </NavLink>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Right side - Language Toggle and Create Invoice Button */}
        <div className="flex items-center gap-4">
          {/* Language Toggle - Visible only on desktop */}
          <button
            onClick={toggleLanguage}
            className="hidden md:flex justify-center items-center text-white px-3 py-1 rounded-md hover:bg-blue-800 transition-colors"
            title={
              i18n.language === "ar"
                ? "تغيير اللغة إلى الأنجليزية"
                : "change language to  AR"
            }
          >
            {i18n.language === "ar" ? "EN" : "AR"}
          </button>
          <button
            onClick={handleCreateInvoice}
            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 hover:rotate-90 hover:scale-105 transition-all duration-300 hover:shadow-lg"
            title={t("createNewInvoice")}
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
        className={`md:hidden fixed ${
          i18n.language === "ar" ? "right-0" : "left-0"
        } top-0 h-screen w-64 bg-blue-600 border-x border-blue-500 shadow-lg transition-transform duration-300 z-50 ${
          isMenuOpen
            ? "translate-x-0"
            : i18n.language === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
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
              {t("home")}
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
              {t("invoiceHistory")}
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
              {t("customers")}
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("products")}
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
              {t("company")}
            </NavLink>
            <NavLink
              to="/invoice-types"
              className={({ isActive }) =>
                `text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2 ${
                  isActive ? activeStyle : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t("invoiceType")}
            </NavLink>

            {/* Language Toggle Button */}
            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="w-full text-start text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors block mb-2"
            >
              {i18n.language === "ar" ? "EN" : "AR"}
            </button>
          </div>

          {/* Profile Link at Bottom */}
          <div className="border-t border-blue-500 p-4">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 text-white hover:bg-blue-700 p-2 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
                {getInitials(userData?.name)}
              </div>
              <span>{t("profile")}</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
