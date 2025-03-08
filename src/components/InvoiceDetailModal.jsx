import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const InvoiceDetailModal = ({ invoice, onClose, onUpdate, onDelete }) => {
  const { t, i18n } = useTranslation();
  const modalContentRef = useRef();
  const isRTL = i18n.language === "ar";

  const [isEditing, setIsEditing] = useState(false);
  // Fix the initial state to include all required fields
  const [editForm, setEditForm] = useState({
    id: invoice?.id,
    invoiceNumber: invoice?.invoiceNumber,
    sender: invoice?.sender || {},
    customerId: invoice?.customerId,
    items: invoice?.items || [],
    tax: invoice?.tax || 0,
    discount: invoice?.discount || 0,
    subtotal: invoice?.subtotal || 0,
    total: invoice?.total || 0,
    createdAt: invoice?.createdAt,
    updatedAt: invoice?.updatedAt,
    privacy: invoice?.privacy || "",
    notes: invoice?.notes || "",
    type: invoice?.type || "complete",
  });
  const [currentInvoice, setCurrentInvoice] = useState({
    ...invoice,
    tax: invoice.tax || 0,
    discount: invoice.discount || 0,
  });

  // Add these selectors to get customers and check invoice type
  const customers = useSelector((state) => state.customers.customers);
  // Get the invoice type from the invoice data or default to "complete"
  const invoiceType = invoice?.type;

  // Find customer based on customerId
  const customer = customers.find((c) => c.id === invoice?.customerId) || {
    name: "N/A",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
  };

  // Reset editForm when invoice changes
  useEffect(() => {
    if (invoice) {
      setEditForm({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        sender: invoice.sender || {},
        customerId: invoice.customerId,
        items: invoice.items || [],
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        subtotal: invoice.subtotal || 0,
        total: invoice.total || 0,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        privacy: invoice.privacy || "",
        notes: invoice.notes || "",
        type: invoice.type || "complete",
      });
    }
  }, [invoice]);

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

  const handleUpdate = () => {
    if (editForm.total <= 0) {
      alert(t("totalMustBePositive"));
      return;
    }

    // Calculate new totals with correct order
    const subtotal = editForm.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const discountAmount = (subtotal * editForm.discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * editForm.tax) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    const updatedInvoice = {
      ...editForm,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedInvoice);
    setCurrentInvoice(updatedInvoice);
    setIsEditing(false);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* From Section */}
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">
                      {t("senderDetails")}
                    </h3>
                    <div className="space-y-4">
                      {["name", "email", "phone", "address"].map((field) => (
                        <div key={field}>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t(field)}
                          </label>
                          {field === "address" ? (
                            <textarea
                              value={editForm.sender[field] || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  sender: {
                                    ...editForm.sender,
                                    [field]: e.target.value,
                                  },
                                })
                              }
                              placeholder={t(
                                `placeholders.enter${
                                  field.charAt(0).toUpperCase() + field.slice(1)
                                }`
                              )}
                              className="w-full p-2 border rounded min-h-[80px]"
                              dir="auto"
                            />
                          ) : (
                            <input
                              type={field === "email" ? "email" : "text"}
                              value={editForm.sender[field] || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  sender: {
                                    ...editForm.sender,
                                    [field]: e.target.value,
                                  },
                                })
                              }
                              placeholder={t(
                                `placeholders.enter${
                                  field.charAt(0).toUpperCase() + field.slice(1)
                                }`
                              )}
                              className="w-full p-2 border rounded h-10"
                              dir="auto"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* To Section */}
                  <div className="">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-base sm:text-lg font-semibold">
                        {t("customerDetails")}
                      </h3>
                      <select
                        className="w-4/5 p-2 border rounded h-10"
                        value={editForm.customerId || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customerId: e.target.value,
                          })
                        }
                        dir="auto"
                      >
                        <option value="">{t("selectCustomer")}</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                {/* <h3 className="font-semibold mb-3">{t("itemDetails")}</h3> */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-start">{t("product")}</th>
                        <th className="px-4 py-2 text-start">
                          {t("description")}
                        </th>
                        <th className="px-4 py-2 text-start">
                          {t("quantity")}
                        </th>
                        <th className="px-4 py-2 text-start">{t("price")}</th>
                        <th className="px-4 py-2 text-start">{t("total")}</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editForm.items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b ${
                            index % 2 === 1 ? "bg-gray-50" : ""
                          }`}
                        >
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleItemUpdate(
                                  item.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder={t("enterItemName")}
                              className="border p-1 rounded w-full min-w-[150px]"
                              dir="auto"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleItemUpdate(
                                  item.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder={t("enterItemDescription")}
                              className="border p-1 rounded w-full min-w-[200px]"
                              dir="auto"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = Math.max(0, e.target.value);
                                handleItemUpdate(
                                  item.id,
                                  "quantity",
                                  parseFloat(value) || 0
                                );
                              }}
                              className="border p-1 rounded w-full min-w-[80px] text-end"
                              min="0"
                              step="1"
                              dir="ltr"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="relative">
                              <span className="absolute inset-y-0 start-2 flex items-center text-gray-500">
                                {t("currency")}
                              </span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => {
                                  const value = Math.max(0, e.target.value);
                                  handleItemUpdate(
                                    item.id,
                                    "price",
                                    parseFloat(value) || 0
                                  );
                                }}
                                className="border p-1 ps-6 rounded w-full min-w-[100px] text-end"
                                min="0"
                                step="0.01"
                                dir="ltr"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-end">
                            {isRTL
                              ? `${(item.quantity * item.price).toFixed(2)}${t(
                                  "currency"
                                )}`
                              : `${t("currency")}${
                                  item.quantity * item.price.toFixed(2)
                                }`}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={t("removeItem")}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Item button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAddItem}
                  className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {t("addNewItem")}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[400px] ms-auto">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">
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
                  <label className="text-sm text-gray-600 block">
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
                <div className="flex sm:flex-nowrap md:justify-end gap-2 w-full">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-1/2 md:w-1/4 px-4 py-2 bg-gray-500 text-white rounded text-sm sm:text-base"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="w-1/2 md:w-1/4 px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                  >
                    {t("saveChanges")}
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
                    <p className="text-lg">{currentInvoice.sender.name}</p>
                    <p>{currentInvoice.sender.email}</p>
                    <p>{currentInvoice.sender.phone}</p>
                    <p>{currentInvoice.sender.address}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t("to")}</h3>
                    <p className="text-lg">{customer.name}</p>
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                    <p>{customer.address}</p>
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
                              ? `${(item.quantity * item.price).toFixed(2)}${t(
                                  "currency"
                                )}`
                              : `${t("currency")}${(
                                  item.quantity * item.price
                                ).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="text-right space-y-2 min-w-[200px] sm:min-w-[250px] md:min-w-[300px]">
                  <div className="text-xs sm:text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{t("subtotalAmount")}:</span>
                      <span>
                        {isRTL
                          ? `${currentInvoice.subtotal.toFixed(2)}${t(
                              "currency"
                            )}`
                          : `${t("currency")}${currentInvoice.subtotal.toFixed(
                              2
                            )}`}
                      </span>
                    </div>
                    {currentInvoice.discount > 0 && (
                      <div className="flex justify-between">
                        <span>
                          {t("discountLabel")} ({currentInvoice.discount}%)
                        </span>
                        <span>
                          -
                          {isRTL
                            ? `${currentInvoice.discountAmount.toFixed(2)}${t(
                                "currency"
                              )}`
                            : `${t(
                                "currency"
                              )}${currentInvoice.discountAmount.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    {currentInvoice.tax > 0 && (
                      <div className="flex justify-between">
                        <span>
                          {t("taxLabel")} ({currentInvoice.tax}%)
                        </span>
                        <span>
                          +
                          {isRTL
                            ? `${currentInvoice.taxAmount.toFixed(2)}${t(
                                "currency"
                              )}`
                            : `${t(
                                "currency"
                              )}${currentInvoice.taxAmount.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-bold border-t pt-2">
                    <div className="flex justify-between">
                      <span>{t("totalLabel")}:</span>
                      <span>
                        {isRTL
                          ? `${currentInvoice.total.toFixed(2)}${t("currency")}`
                          : `${t("currency")}${currentInvoice.total.toFixed(
                              2
                            )}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {(currentInvoice.privacy || currentInvoice.notes) && (
                <div className="space-y-4">
                  {currentInvoice.privacy && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        {t("termsAndPrivacy")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentInvoice.privacy}
                      </p>
                    </div>
                  )}
                  {currentInvoice.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("notes")}</h3>
                      <p className="text-sm text-gray-600">
                        {currentInvoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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
              onClick={() => {
                if (window.confirm(t("confirmDelete"))) {
                  onDelete(invoice.id);
                }
              }}
              className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>{t("delete")}</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
