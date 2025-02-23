import { format, parseISO } from "date-fns";
import { useState } from "react";

const InvoiceDetailModal = ({ invoice, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(invoice);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Invoice #{invoice.invoiceNumber}
          </h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(invoice.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

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
                              handleItemUpdate(item.id, "name", e.target.value)
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
                              handleItemUpdate(item.id, "price", e.target.value)
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
                <p className="text-lg">{invoice.sender.name}</p>
                <p>{invoice.sender.email}</p>
                <p>{invoice.sender.phone}</p>
                <p>{invoice.sender.address}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">To</h3>
                <p className="text-lg">{invoice.recipient.name}</p>
                <p>{invoice.recipient.email}</p>
                <p>{invoice.recipient.phone}</p>
                <p>{invoice.recipient.address}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Created: {formatDate(invoice.createdAt)}</span>
              <span>Last Updated: {formatDate(invoice.updatedAt)}</span>
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
                    {invoice.items.map((item) => (
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
                  Total Amount: ${invoice.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
