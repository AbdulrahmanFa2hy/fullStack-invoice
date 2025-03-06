import { format, parseISO } from "date-fns";
import { useState, useRef, useEffect } from "react"; // Add useRef and useEffect import
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux"; // Add this import
import { updateCustomer } from "../store/customersSlice"; // Add this import

const InvoiceDetailModal = ({ invoice, onClose, onUpdate, onDelete }) => {
  const dispatch = useDispatch(); // Add dispatch
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
  });
  const [currentInvoice, setCurrentInvoice] = useState({
    ...invoice,
    tax: invoice.tax || 0,
    discount: invoice.discount || 0,
  });

  // Add these selectors to get customers and check invoice type
  const customers = useSelector((state) => state.customers.customers);
  const company = useSelector((state) => state.company);
  // Get the invoice type from the invoice data or default to "complete"
  const invoiceType = invoice?.type || "complete";

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
      });
    }
  }, [invoice]);

  if (!invoice) return null;

  const {
    invoiceNumber,
    date,
    sender = {},
    customerId, // Change toCustomer to customerId
    items = [],
    subtotal = 0,
    tax = 0,
    taxAmount = 0,
    discount = 0,
    discountAmount = 0,
    total = 0,
  } = invoice;

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleCustomerUpdate = (field, value) => {
    const selectedCustomer = customers.find(
      (c) => c.id === editForm.customerId
    );
    if (selectedCustomer) {
      const updatedCustomer = {
        ...selectedCustomer,
        [field]: value,
      };
      dispatch(updateCustomer(updatedCustomer));
    }
  };

  const handleUpdate = () => {
    if (editForm.total <= 0) {
      alert("Total amount must be greater than 0");
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

  // Add ref for the modal content
  const modalContentRef = useRef();

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
    >
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            {invoice.invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
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
                    <h3 className="text-base sm:text-lg font-semibold">From</h3>
                    <div className="space-y-4">
                      {["name", "email", "phone", "address"].map((field) => (
                        <div key={field}>
                          <label className="block text-sm text-gray-600 capitalize mb-1">
                            {field}
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
                              className="w-full p-2 border rounded min-h-[80px]"
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
                              className="w-full p-2 border rounded h-10"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* To Section */}
                  <div className="">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-base sm:text-lg font-semibold">To</h3>
                      <select
                        className="w-4/5 p-2 border rounded h-10"
                        value={editForm.customerId || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customerId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Customer</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    {editForm.customerId && (
                      <div className="space-y-4">
                        {[
                          { key: "name", type: "text" },
                          { key: "email", type: "email" },
                          { key: "phone", type: "tel" },
                          { key: "address", type: "textarea" },
                        ].map(({ key, type }) => (
                          <div key={key}>
                            <label className="block text-sm text-gray-600 capitalize mb-1">
                              {key}
                            </label>
                            {type === "textarea" ? (
                              <textarea
                                className="w-full p-2 border rounded min-h-[80px]"
                                value={
                                  customers.find(
                                    (c) => c.id === editForm.customerId
                                  )?.[key] || ""
                                }
                                onChange={(e) =>
                                  handleCustomerUpdate(key, e.target.value)
                                }
                              />
                            ) : (
                              <input
                                type={type}
                                className="w-full p-2 border rounded h-10"
                                value={
                                  customers.find(
                                    (c) => c.id === editForm.customerId
                                  )?.[key] || ""
                                }
                                onChange={(e) =>
                                  handleCustomerUpdate(key, e.target.value)
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full text-sm sm:text-base">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
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
                              className="border p-1 rounded w-full min-w-[150px]"
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
                              className="border p-1 rounded w-full min-w-[200px]"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) => {
                                const value = Math.max(0, e.target.value);
                                handleItemUpdate(
                                  item.id,
                                  "quantity",
                                  parseFloat(value) || 0
                                );
                              }}
                              onFocus={(e) => e.target.select()}
                              className="border p-1 rounded w-full min-w-[80px] text-right"
                              min="0"
                              step="1"
                              onKeyDown={(e) => {
                                if (e.key === "ArrowUp") {
                                  e.preventDefault();
                                  const newValue =
                                    (parseFloat(e.target.value) || 0) + 1;
                                  handleItemUpdate(
                                    item.id,
                                    "quantity",
                                    newValue
                                  );
                                } else if (e.key === "ArrowDown") {
                                  e.preventDefault();
                                  const newValue = Math.max(
                                    0,
                                    (parseFloat(e.target.value) || 0) - 1
                                  );
                                  handleItemUpdate(
                                    item.id,
                                    "quantity",
                                    newValue
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.price || ""}
                              onChange={(e) => {
                                const value = Math.max(0, e.target.value);
                                handleItemUpdate(
                                  item.id,
                                  "price",
                                  parseFloat(value) || 0
                                );
                              }}
                              onFocus={(e) => e.target.select()}
                              className="border p-1 rounded w-full min-w-[100px] text-right"
                              min="0"
                              step="1"
                              onKeyDown={(e) => {
                                if (e.key === "ArrowUp") {
                                  e.preventDefault();
                                  const newValue =
                                    (parseFloat(e.target.value) || 0) + 1;
                                  handleItemUpdate(item.id, "price", newValue);
                                } else if (e.key === "ArrowDown") {
                                  e.preventDefault();
                                  const newValue = Math.max(
                                    0,
                                    (parseFloat(e.target.value) || 0) - 1
                                  );
                                  handleItemUpdate(item.id, "price", newValue);
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            ${(item.quantity * item.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700"
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
                  Add Item
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[400px] ml-auto">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Discount (%)</label>
                  {/* Discount input */}
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Tax (%)</label>
                  {/* Tax input */}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">
                    Terms & Privacy
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
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Notes</label>
                  <textarea
                    className="w-full p-2 mt-1 border rounded bg-gray-50"
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
                <div className="self-end text-base min-w-fit sm:text-lg md:text-xl font-bold">
                  Total: ${editForm.total.toFixed(2)}
                </div>
                <div className="flex sm:flex-nowrap md:justify-end gap-2 w-full">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-1/2 md:w-1/4 px-4 py-2 bg-gray-500 text-white rounded text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="w-1/2 md:w-1/4 px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                  >
                    Save Changes
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
                    <h3 className="font-semibold">From</h3>
                    <p className="text-lg">{currentInvoice.sender.name}</p>
                    <p>{currentInvoice.sender.email}</p>
                    <p>{currentInvoice.sender.phone}</p>
                    <p>{currentInvoice.sender.address}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">To</h3>
                    <p className="text-lg">{customer.name}</p>
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                    <p>{customer.address}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs md text-gray-500">
                <div className="flex flex-col">
                  Created
                  <span>{formatDate(currentInvoice.createdAt)}</span>
                </div>
                <div className="flex flex-col">
                  Last updated
                  <span>{formatDate(currentInvoice.updatedAt)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
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
                          <td className="px-4 py-2 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-right">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            ${(item.quantity * item.price).toFixed(2)}
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
                      <span>Subtotal:</span>
                      <span>${currentInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    {currentInvoice.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount ({currentInvoice.discount}%):</span>
                        <span>
                          -${currentInvoice.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {currentInvoice.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({currentInvoice.tax}%):</span>
                        <span>+${currentInvoice.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-bold border-t pt-2">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>${currentInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {(currentInvoice.privacy || currentInvoice.notes) && (
                <div className="space-y-4">
                  {currentInvoice.privacy && (
                    <div>
                      <h3 className="font-semibold mb-2">Terms & Privacy</h3>
                      <p className="text-sm text-gray-600">
                        {currentInvoice.privacy}
                      </p>
                    </div>
                  )}
                  {currentInvoice.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
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
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:p-4 flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:gap-3 rounded-t-lg"
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
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>PDF</span>
            </motion.button>

            {/* Edit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 00-2 2v11a2 2 00-2 2h11a2 2 002-2v-5m-1.414-9.414a2 2 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit</span>
            </motion.button>

            {/* Delete button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(invoice.id)}
              className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0116.138 21H7.862a2 2 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 00-1-1h-4a1 1 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Delete</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
