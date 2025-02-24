import { format, parseISO } from "date-fns";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import { motion } from "framer-motion";

const InvoiceDetailModal = ({ invoice, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(invoice);
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleUpdate = () => {
    if (editForm.total <= 0) {
      alert("Total amount must be greater than 0");
      return;
    }
    onUpdate(editForm);
    setCurrentInvoice(editForm);
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

  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <InvoicePDF
          sender={currentInvoice.sender}
          recipient={currentInvoice.recipient}
          items={currentInvoice.items}
          invoiceNumber={currentInvoice.invoiceNumber}
          businessInfo={{
            businessName: "INVOICE",
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${currentInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Invoice #${currentInvoice.invoiceNumber}
From: ${currentInvoice.sender.name}
To: ${currentInvoice.recipient.name}
Total Amount: $${currentInvoice.total.toFixed(2)}
    `);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Invoice #{invoice.invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Main content */}
        <div className="mb-20">
          {" "}
          {/* Add bottom margin for floating buttons */}
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">From</h3>
                  {["name", "email", "phone", "address"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-sm text-gray-600 capitalize">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={editForm.sender[field]}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            sender: {
                              ...editForm.sender,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="border p-2 rounded w-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">To</h3>
                  {["name", "email", "phone", "address"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-sm text-gray-600 capitalize">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={editForm.recipient[field]}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            recipient: {
                              ...editForm.recipient,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="border p-2 rounded w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Items</h3>
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Add Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                      {editForm.items.map((item) => (
                        <tr key={item.id} className="border-b">
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
                              className="border p-1 rounded w-full"
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
                              className="border p-1 rounded w-full"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemUpdate(
                                  item.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="border p-1 rounded w-full text-right"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                handleItemUpdate(
                                  item.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="border p-1 rounded w-full text-right"
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

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xl font-bold">
                  Total: ${editForm.total.toFixed(2)}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
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
                  <p className="text-lg">{currentInvoice.recipient.name}</p>
                  <p>{currentInvoice.recipient.email}</p>
                  <p>{currentInvoice.recipient.phone}</p>
                  <p>{currentInvoice.recipient.address}</p>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Created: {formatDate(currentInvoice.createdAt)}</span>
                <span>
                  Last Updated: {formatDate(currentInvoice.updatedAt)}
                </span>
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
                      {currentInvoice.items.map((item) => (
                        <tr key={item.id} className="border-b">
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
                <div className="text-right">
                  <p className="text-xl font-bold">
                    Total Amount: ${currentInvoice.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating action buttons */}
        {!isEditing && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center space-x-3 rounded-t-lg"
            style={{
              maxWidth: "60rem",
              margin: "0 auto",
              boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download PDF</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppShare}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Share on WhatsApp</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(invoice.id)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
