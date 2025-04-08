import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import InvoiceFrom from "./InvoiceFrom";
import InvoiceTo from "./InvoiceTo";
import ProductItem from './ProductItem';
import { FiPlus } from "react-icons/fi";
import { updateInvoiceThunk, deleteInvoiceThunk } from "../store/invoiceSlice";

// Helper function to calculate invoice total
const calculateInvoiceTotal = (invoice) => {
  if (!invoice) return 0;
  
  // If total is already calculated
  if (typeof invoice.total === 'number') {
    return invoice.total;
  }

  // Calculate total from items if available
  if (Array.isArray(invoice.items)) {
    const subtotal = invoice.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + (quantity * price);
    }, 0);

    const discount = Number(invoice.discount) || 0;
    const discountAmount = (subtotal * discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = Number(invoice.tax) || 0;
    const taxAmount = (subtotalAfterDiscount * tax) / 100;
    
    return subtotalAfterDiscount + taxAmount;
  }

  return 0;
};

const InvoiceDetailModal = ({ 
  invoice = {}, 
  onClose = () => {}, 
  customers = [],
  company = {}
}) => {
  const { t, i18n } = useTranslation();
  const modalContentRef = useRef();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemErrors, setItemErrors] = useState({});

  // Initialize editForm with calculated total if needed
  const [editForm, setEditForm] = useState({
    id: invoice?._id || invoice?.id || '',
    invoiceNumber: invoice?.invoice_number || invoice?.invoiceNumber || '',
    sender: invoice?.sender || company || {},
    customerId: invoice?.customer_id || invoice?.customerId || '',
    items: invoice?.items?.map(item => ({
      ...item,
      id: item.id || item._id || Date.now() + Math.random()
    })) || [],
    tax: Number(invoice?.tax) || 0,
    discount: Number(invoice?.discount) || 0,
    subtotal: Number(invoice?.subtotal) || 0,
    total: calculateInvoiceTotal(invoice),
    createdAt: invoice?.createdAt || new Date().toISOString(),
    updatedAt: invoice?.updatedAt || new Date().toISOString(),
    privacy: invoice?.privacy || "",
    notes: invoice?.notes || "",
    type: invoice?.type || "complete",
  });
  const [currentInvoice, setCurrentInvoice] = useState({
    ...invoice,
    sender: invoice?.sender || company || {
      name: t("notAvailable"),
      email: t("notAvailable"),
      phone: t("notAvailable"),
      address: t("notAvailable")
    },
    items: invoice?.items?.map(item => ({
      ...item,
      id: item.id || item._id || Date.now() + Math.random()
    })) || [],
    tax: invoice?.tax || 0,
    discount: invoice?.discount || 0,
    customer: invoice?.customer || {
      name: t("notAvailable"),
      email: t("notAvailable"),
      phone: t("notAvailable"),
      address: t("notAvailable")
    }
  });

  // Add these selectors to get customers and check invoice type
  const invoiceType = invoice?.type;

  // Initialize customer state
  const [customer, setCustomer] = useState(() => {
    // First try to use the customer data from the invoice
    if (invoice?.customer && Object.keys(invoice.customer).length > 0) {
      return invoice.customer;
    }
    
    // Then try to find the customer in the customers array
    const foundCustomer = customers.find(c => 
      c._id === (invoice?.customer_id || invoice?.customerId)
    );
    
    if (foundCustomer) {
      return foundCustomer;
    }
    
    // Finally, fall back to default values
    return {
      name: t("notAvailable"),
      email: t("notAvailable"),
      phone: t("notAvailable"),
      address: t("notAvailable")
    };
  });

  // Effect to update form when invoice changes
  useEffect(() => {
    if (invoice) {
      setEditForm(prev => ({
        ...prev,
        id: invoice._id || invoice.id || '',
        invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || '',
        sender: invoice.sender || company || {},
        customerId: invoice.customer_id || invoice.customerId || '',
        items: (invoice.items || []).map(item => ({
          ...item,
          id: item.id || item._id || Date.now() + Math.random()
        })),
        tax: Number(invoice.tax) || 0,
        discount: Number(invoice.discount) || 0,
        subtotal: Number(invoice.subtotal) || 0,
        total: calculateInvoiceTotal(invoice),
        privacy: invoice.privacy || "",
        notes: invoice.notes || "",
        type: invoice.type || "complete",
      }));

      setCurrentInvoice({
        ...invoice,
        sender: invoice.sender || company || {},
        items: (invoice.items || []).map(item => ({
          ...item,
          id: item.id || item._id || Date.now() + Math.random()
        })),
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
      });

      // Update customer state when invoice changes
      if (invoice.customer && Object.keys(invoice.customer).length > 0) {
        setCustomer(invoice.customer);
      } else {
        const foundCustomer = customers.find(c => 
          c._id === (invoice.customer_id || invoice.customerId)
        );
        if (foundCustomer) {
          setCustomer(foundCustomer);
        }
      }

      // Reset item errors when invoice changes
      setItemErrors({});
    }
  }, [invoice, company, customers, t]);

  if (!invoice) return null;

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "PPP", {
        locale: i18n.language === "ar" ? ar : undefined,
      });
    } catch {
      return "Invalid date";
    }
  };

  // Add validation for items
  const validateItem = (itemId, field) => {
    const item = editForm.items.find(item => item.id === itemId);
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

  // Update handleUpdate to use SweetAlert
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedInvoice = {
        ...editForm,
        total: calculateInvoiceTotal(editForm)
      };
      
      await dispatch(updateInvoiceThunk(updatedInvoice)).unwrap();
      setIsEditing(false);
      onClose();
      
      Swal.fire({
        icon: 'success',
        title: t('Success'),
        text: t('Invoice updated successfully'),
      });
    } catch (err) {
      setError(err.message || t('Failed to update invoice'));
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: err.message || t('Failed to update invoice'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemUpdate = (itemId, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]:
                field === "price" || field === "quantity"
                  ? Number(value)
                  : value,
            }
          : item
      ),
      total: prev.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    }));
  };

  const handleAddItem = () => {
    setEditForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: "", description: "", quantity: 1, price: 0 },
      ],
    }));
  };

  const handleRemoveItem = (itemId) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
      total: prev.items
        .filter((item) => item.id !== itemId)
        .reduce((sum, item) => sum + item.price * item.quantity, 0),
    }));
  };

  // Add click handler for the overlay
  const handleOverlayClick = (e) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target)
    ) {
      onClose();
    }
  };

  // Add this function to handle textarea resize
  const handleTextareaResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Add a function to get input class names
  const getInputClassName = (baseClass) => {
    return `${baseClass} text-start`;
  };

  // Update handleDelete to handle confirmation only
  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: t('areYouSure'),
        text: t('youWillNotBeAbleToRecover'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('yesDeleteIt'),
        cancelButtonText: t('noKeepIt'),
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        setError(null);
        await dispatch(deleteInvoiceThunk(invoice._id)).unwrap();
        onClose();
        
        Swal.fire({
          icon: 'success',
          text: t('invoiceDeletedSuccessfully'),
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (err) {
      setError(err.message || t('failedToDeleteInvoice'));
      Swal.fire({
        icon: 'error',
        text: err.message || t('failedToDeleteInvoice'),
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleOverlayClick}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            {t("invoiceDetails")} - {invoice.invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        {/* Main content */}
        <div className="mb-24 sm:mb-20">
          {" "}
          {/* Adjust bottom margin for floating buttons */}
          {isEditing ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Conditionally render the 'from' and 'to' sections based on invoice type */}
              {invoiceType !== "quick" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <InvoiceFrom 
                    readOnly={!isEditing}
                    company={editForm.sender}
                    getInputClassName={() => "w-full p-2 border rounded"}
                    invoiceType={invoiceType}
                  />
                  <InvoiceTo 
                    readOnly={!isEditing}
                    customer={customer}
                    selectedCustomerId={editForm.customerId}
                    onCustomerSelect={(customerId) => {
                      // Find the selected customer from the customers array
                      const selectedCustomer = customers.find(c => c._id === customerId || c.id === customerId);
                      
                      // Update both the customerId in editForm and the customer state
                      setEditForm({
                        ...editForm,
                        customerId: customerId,
                      });
                      
                      // If a customer was found, update the customer state with their data
                      if (selectedCustomer) {
                        setCustomer({
                          name: selectedCustomer.name || "",
                          email: selectedCustomer.email || "",
                          phone: selectedCustomer.phone || "",
                          address: selectedCustomer.address || ""
                        });
                      } else if (customerId === "") {
                        // If no customer was selected (empty string), reset the customer state
                        setCustomer({
                          name: "",
                          email: "",
                          phone: "",
                          address: ""
                        });
                      }
                    }}
                    onCustomerChange={(field, value) => {
                      setCustomer(prev => ({
                        ...prev,
                        [field]: value
                      }));
                    }}
                    getInputClassName={() => "w-full p-2 border rounded"}
                    invoiceType={invoiceType}
                  />
                </div>
              )}

              <div className="mt-4">
                {/* Replace the table with ProductItem components */}
                <div className="hidden lg:grid bg-gray-50 p-4 rounded-lg mb-4">
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

                {editForm.items.map((item) => (
                  <ProductItem
                    key={item.id}
                    item={item}
                    itemErrors={itemErrors}
                    handleUpdateItem={handleItemUpdate}
                    handleTextareaResize={handleTextareaResize}
                    getInputClassName={getInputClassName}
                    validateItem={validateItem}
                  />
                ))}
              </div>

              {/* Add Item button - updated to match Home page style */}
              <button
                onClick={handleAddItem}
                className="btn btn-accent flex w-full text-center gap-2 sm:w-fit justify-center items-center space-s-2 text-sm md:text-base mb-2"
              >
                {t("addItem")} <FiPlus size={20} /> 
              </button>

              <div className="grid grid-cols-2 text-center gap-4 max-w-[400px] ms-auto">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm text-gray-600 block">
                    {t("discount")} (%)
                  </label>
                  <input
                    type="number"
                    value={editForm.discount}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        discount: Math.max(
                          0,
                          Math.min(100, parseFloat(e.target.value) || 0)
                        ),
                      }))
                    }
                    className="w-full border rounded p-2 text-end"
                    min="0"
                    max="100"
                    step="0.1"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm text-gray-600 block">
                    {t("taxRate")} (%)
                  </label>
                  <input
                    type="number"
                    value={editForm.tax}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        tax: Math.max(
                          0,
                          Math.min(100, parseFloat(e.target.value) || 0)
                        ),
                      }))
                    }
                    className="w-full border rounded p-2 text-end"
                    min="0"
                    max="100"
                    step="0.1"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block">
                    {t("termsAndPrivacy")}
                  </label>
                  <textarea
                    className="w-full p-2 mt-1 border rounded bg-gray-50"
                    value={editForm.privacy}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        privacy: e.target.value,
                      }))
                    }
                    placeholder={t("enterTerms")}
                    rows={3}
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block">
                    {t("notes")}
                  </label>
                  <textarea
                    className="w-full p-2 mt-1 border rounded bg-gray-50"
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder={t("enterNotes")}
                    rows={3}
                    dir="auto"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
                <div className="self-end text-base min-w-fit sm:text-lg md:text-xl font-bold">
                  {t("totalLabel")}:{" "}
                  {isRTL
                    ? `${editForm.total.toFixed(2)}${t("currency")}`
                    : `${t("currency")}${editForm.total.toFixed(2)}`}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpdate}
                    disabled={isLoading}
                  >
                    {isLoading ? t('Saving...') : t('Save Changes')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Conditionally render the 'from' and 'to' sections based on invoice type */}
              {invoiceType !== "quick" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t("from")}</h3>
                    <p className="text-lg">{currentInvoice?.sender?.name || t("notAvailable")}</p>
                    <p>{currentInvoice?.sender?.email || t("notAvailable")}</p>
                    <p>{currentInvoice?.sender?.phone || t("notAvailable")}</p>
                    <p>{currentInvoice?.sender?.address || t("notAvailable")}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t("to")}</h3>
                    <p className="text-lg">{customer?.name || t("notAvailable")}</p>
                    <p>{customer?.email || t("notAvailable")}</p>
                    <p>{customer?.phone || t("notAvailable")}</p>
                    <p>{customer?.address || t("notAvailable")}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs md text-gray-500">
                <div className="flex flex-col">
                  {t("createdِAt")}
                  <span>{formatDate(currentInvoice.createdAt)}</span>
                </div>
                <div className="flex flex-col">
                  {t("lastUpdated")}
                  <span>{formatDate(currentInvoice.updatedAt)}</span>
                </div>
              </div>

              <div className="pt-2">
                {/* <h3 className="font-semibold mb-3">{t("items")}</h3> */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-start">{t("product")}</th>
                        <th className="px-4 py-2 text-start">
                          {t("description")}
                        </th>
                        <th className="px-4 py-2 text-end">{t("quantity")}</th>
                        <th className="px-4 py-2 text-end">{t("price")}</th>
                        <th className="px-4 py-2 text-end">{t("total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b ${
                            index % 2 === 1 ? "bg-gray-50" : ""
                          }`}
                        >
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-end">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-end">
                            {isRTL
                              ? `${item.price.toFixed(2)}${t("currency")}`
                              : `${t("currency")}${item.price.toFixed(2)}`}
                          </td>
                          <td className="px-4 py-2 text-end">
                            {isRTL
                              ? `${(item.quantity * item.price).toFixed(2)}${t("currency")}`
                              : `${t("currency")}${(item.quantity * item.price).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add the missing buttons at the bottom of the component */}
        {!isEditing && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-0 start-0 end-0 bg-white border-t border-gray-200 p-2 sm:p-4 flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:gap-3 rounded-t-lg"
            style={{
              maxWidth: "60rem",
              margin: "0 auto",
              boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>{t("downloadPdf")}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>{t("edit")}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>{t("delete")}</span>
            </motion.button>
          </motion.div>
        )}

        {/* Add error display */}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailModal;