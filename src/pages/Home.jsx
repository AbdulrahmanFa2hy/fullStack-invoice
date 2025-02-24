import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiTrash2, FiSave, FiDownload, FiShare2 } from "react-icons/fi";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import InvoicePDF from "../components/InvoicePDF";
import { useInvoiceNumber } from "../hooks/useInvoiceNumber";
import {
  addItem,
  removeItem,
  updateItem,
  saveToHistory,
  updateSender,
  updateRecipient,
  resetInvoice,
  generateInvoiceNumber,
} from "../store/mainSlice";
import { addCustomer, updateCustomer } from "../store/customersSlice";

function Home() {
  const dispatch = useDispatch();
  const { items, invoiceHistory } = useSelector((state) => state.main.invoice);
  const sender = useSelector((state) => state.main.sender);
  const recipient = useSelector((state) => state.main.recipient);
  const invoiceNumber = useInvoiceNumber();
  const customers = useSelector((state) => state.customers.customers);

  const invoiceRef = useRef(null);

  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!invoiceNumber) {
      dispatch(generateInvoiceNumber());
    }
  });

  const handleUpdateItem = (id, field, value) => {
    dispatch(updateItem({ id, field, value }));
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const generatePDF = async () => {
    const pdfDoc = (
      <InvoicePDF
        sender={sender}
        recipient={recipient}
        items={items}
        invoiceNumber={invoiceNumber}
        tax={tax}
        discount={discount}
      />
    );
    return await pdf(pdfDoc).toBlob();
  };

  const isExistingInvoice = () => {
    return invoiceHistory.some((inv) => inv.invoiceNumber === invoiceNumber);
  };

  const prepareInvoiceData = () => ({
    invoiceNumber,
    sender,
    recipient,
    items,
    subtotal,
    tax,
    taxAmount,
    discount,
    discountAmount,
    total,
    date: new Date().toISOString(),
  });

  const handleCustomerData = () => {
    if (recipient.email) {
      const customerData = {
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
        address: recipient.address,
      };

      const existingCustomer = customers.find(
        (c) => c.email === recipient.email
      );
      if (existingCustomer) {
        dispatch(updateCustomer(customerData));
      } else {
        dispatch(addCustomer(customerData));
      }
    }
  };

  const saveInvoiceData = () => {
    const invoiceData = prepareInvoiceData();
    dispatch(saveToHistory(invoiceData));
    handleCustomerData();
    Swal.fire({
      icon: "success",
      title: isExistingInvoice() ? "Invoice Updated!" : "Invoice Created!",
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const downloadPDF = async () => {
    const blob = await generatePDF();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareOnWhatsApp = async () => {
    const message = `Invoice ${invoiceNumber} from ${sender.name}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSaveInvoice = () => {
    saveInvoiceData();
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    dispatch(updateRecipient({ field: "email", value: email }));

    const existingCustomer = customers.find((c) => c.email === email);
    if (existingCustomer) {
      dispatch(
        updateRecipient({ field: "name", value: existingCustomer.name })
      );
      dispatch(
        updateRecipient({ field: "phone", value: existingCustomer.phone })
      );
      dispatch(
        updateRecipient({ field: "address", value: existingCustomer.address })
      );
    }
  };

  const handleCustomerSelect = (email) => {
    if (email === "") {
      // Clear the form if "Select Customer" is chosen
      dispatch(updateRecipient({ field: "name", value: "" }));
      dispatch(updateRecipient({ field: "email", value: "" }));
      dispatch(updateRecipient({ field: "phone", value: "" }));
      dispatch(updateRecipient({ field: "address", value: "" }));
      return;
    }

    const selectedCustomer = customers.find((c) => c.email === email);
    if (selectedCustomer) {
      dispatch(
        updateRecipient({ field: "name", value: selectedCustomer.name })
      );
      dispatch(
        updateRecipient({ field: "email", value: selectedCustomer.email })
      );
      dispatch(
        updateRecipient({ field: "phone", value: selectedCustomer.phone })
      );
      dispatch(
        updateRecipient({ field: "address", value: selectedCustomer.address })
      );
    }
  };

  return (
    <div className="min-h-screen p-8 pr-0 bg-gray-50 flex">
      <div className="flex-grow max-w-6xl">
        <div ref={invoiceRef} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Invoice Generator
            </h1>
            <div className="text-right">
              <p className="text-gray-600">Date: {format(new Date(), "PPP")}</p>
              <p className="text-gray-600">Invoice #: {invoiceNumber}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  From:
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="input"
                    value={sender.name}
                    onChange={(e) =>
                      dispatch(
                        updateSender({ field: "name", value: e.target.value })
                      )
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="input"
                    value={sender.phone}
                    onChange={(e) =>
                      dispatch(
                        updateSender({ field: "phone", value: e.target.value })
                      )
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={sender.email}
                    onChange={(e) =>
                      dispatch(
                        updateSender({ field: "email", value: e.target.value })
                      )
                    }
                  />
                  <textarea
                    placeholder="Address"
                    className="input h-24"
                    value={sender.address}
                    onChange={(e) =>
                      dispatch(
                        updateSender({
                          field: "address",
                          value: e.target.value,
                        })
                      )
                    }
                  ></textarea>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-start ">
                  <h2 className="text-lg font-semibold text-gray-700">To:</h2>
                  <select
                    className="input w-72 text-sm p-1 mb-4 inline-block"
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    value={recipient.email || ""}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.email} value={customer.email}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="input"
                    value={recipient.name}
                    onChange={(e) =>
                      dispatch(
                        updateRecipient({
                          field: "name",
                          value: e.target.value,
                        })
                      )
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="input"
                    value={recipient.phone}
                    onChange={(e) =>
                      dispatch(
                        updateRecipient({
                          field: "phone",
                          value: e.target.value,
                        })
                      )
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={recipient.email}
                    onChange={handleEmailChange}
                  />
                  <textarea
                    placeholder="Address"
                    className="input h-24"
                    value={recipient.address}
                    onChange={(e) =>
                      dispatch(
                        updateRecipient({
                          field: "address",
                          value: e.target.value,
                        })
                      )
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-12 gap-4 mb-2 font-semibold text-gray-600">
                <div className="col-span-4">Product Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="mb-3 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      className="input"
                      value={item.name}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "name", e.target.value)
                      }
                      placeholder="Product name"
                    />
                  </div>
                  <div className="col-span-4">
                    <textarea
                      className="input min-h-[38px] resize-none overflow-hidden"
                      value={item.description}
                      onChange={(e) => {
                        handleUpdateItem(
                          item.id,
                          "description",
                          e.target.value
                        );
                        handleTextareaResize(e);
                      }}
                      onInput={handleTextareaResize}
                      placeholder="Short description"
                      rows={1}
                      style={{
                        resize: "none",
                        transition: "height 0.1s ease-out",
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="input"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="1"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="input"
                      value={item.price}
                      onChange={(e) =>
                        handleUpdateItem(
                          item.id,
                          "price",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-span-1 text-center font-medium">
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => dispatch(removeItem(item.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => dispatch(addItem())}
              className="btn btn-accent flex items-center gap-2"
            >
              <FiPlus /> Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="w-72 ml-4">
        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <button
                onClick={downloadPDF}
                className="btn btn-accent flex items-center gap-2 w-full justify-center"
              >
                <FiDownload /> Download PDF
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="btn btn-accent flex items-center gap-2 w-full justify-center"
              >
                <FiShare2 /> Share on WhatsApp
              </button>
              <button
                onClick={handleSaveInvoice}
                className="btn btn-primary flex items-center gap-2 w-full justify-center"
              >
                <FiSave /> Save Invoice
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
                      Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input w-full pl-7 py-1.5 text-sm"
                        value={tax}
                        onChange={(e) =>
                          setTax(parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
                      Discount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input w-full pl-7 py-1.5 text-sm"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Summary */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Tax ({tax}%):</span>
                      <span>+${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Discount ({discount}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
