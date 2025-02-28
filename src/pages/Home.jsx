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
  generateInvoiceNumber,
} from "../store/mainSlice";
import {
  addCustomer,
  updateCustomer,
  setSelectedCustomerId,
} from "../store/customersSlice";
import { updateCompany } from "../store/companySlice";
import LogoModal from "../components/LogoModal";

function Home() {
  const dispatch = useDispatch();
  const { items, invoiceHistory } = useSelector((state) => state.main.invoice);
  const company = useSelector((state) => state.company);
  const invoiceNumber = useInvoiceNumber();
  const { customers, selectedCustomerId } = useSelector(
    (state) => state.customers
  );
  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId
  ) || {
    name: "",
    phone: "",
    email: "",
    address: "",
  };

  const invoiceRef = useRef(null);

  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [privacy, setPrivacy] = useState("");
  const [notes, setNotes] = useState("");
  const [showLogoInput, setShowLogoInput] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  useEffect(() => {
    if (!invoiceNumber) {
      dispatch(generateInvoiceNumber());
    }
    // Add initial item if items array is empty
    if (items.length === 0) {
      dispatch(addItem());
    }
  }, [dispatch, invoiceNumber, items.length]);

  const handleUpdateItem = (id, field, value) => {
    dispatch(updateItem({ id, field, value }));
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

  const generatePDF = async () => {
    // Create businessInfo object
    const businessInfo = {
      businessName: "INVOICE",
    };

    const pdfDoc = (
      <InvoicePDF
        sender={company}
        customer={selectedCustomer} // Pass customer directly instead of using customerId
        items={items}
        invoiceNumber={invoiceNumber}
        tax={tax}
        discount={discount}
        businessInfo={businessInfo} // Add businessInfo
        privacy={privacy}
        notes={notes}
      />
    );
    return await pdf(pdfDoc).toBlob();
  };

  const isExistingInvoice = () => {
    return invoiceHistory.some((inv) => inv.invoiceNumber === invoiceNumber);
  };

  const prepareInvoiceData = () => ({
    invoiceNumber,
    sender: company, // Update to use company data
    customerId: selectedCustomerId, // Change this line to save only the ID
    items,
    subtotal,
    tax,
    taxAmount,
    discount,
    discountAmount,
    total,
    privacy,
    notes,
    date: new Date().toISOString(),
  });

  const handleCustomerChange = (field, value) => {
    if (selectedCustomerId) {
      // Update existing customer
      dispatch(
        updateCustomer({
          id: selectedCustomerId,
          ...selectedCustomer,
          [field]: value,
        })
      );
    } else {
      // Create new customer with ID before adding
      const newCustomer = {
        id: Date.now().toString(),
        name: "",
        phone: "",
        email: "",
        address: "",
        [field]: value,
      };
      dispatch(addCustomer(newCustomer));
      dispatch(setSelectedCustomerId(newCustomer.id));
    }
  };

  const handleCustomerSelect = (customerId) => {
    if (customerId === "") {
      dispatch(setSelectedCustomerId(null));
    } else {
      dispatch(setSelectedCustomerId(customerId));
    }
  };

  const saveInvoiceData = () => {
    const invoiceData = prepareInvoiceData();
    dispatch(saveToHistory(invoiceData));
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
    const message = `Invoice ${invoiceNumber} from ${company.name}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSaveInvoice = () => {
    saveInvoiceData();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateCompany({ field: "logo", value: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen py-4 px-0 md:py-8 md:px-2 bg-gray-100 flex flex-col md:flex-row gap-2 sm:gap-8 md:gap-0">
      <div className="flex-grow max-w-6xl">
        <div
          ref={invoiceRef}
          className="bg-white rounded-2xl shadow-lg md:shadow-2xl p-2 sm:p-5 md:p-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4 lg:mb-8">
            <h1 className="self-start text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Invoice Generator
            </h1>
            <div className="flex flex-col items-center relative">
              {company.logo ? (
                <div
                  className="cursor-pointer group"
                  onClick={() => setIsLogoModalOpen(true)}
                >
                  <img
                    src={company.logo}
                    alt="Company logo"
                    className="h-12 w-12 object-contain rounded-full border border-gray-200 "
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsLogoModalOpen(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Add logo
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
            <div className="text-right self-end">
              <p className="text-xs sm:text-base text-gray-600">
                {format(new Date(), "PPP")}
              </p>
              <p className="text-sm sm:text-base text-gray-600">
                {invoiceNumber}
              </p>
            </div>
          </div>

          <div className="mb-4 md:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
                  From:
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="input"
                    value={company.name}
                    onChange={(e) =>
                      dispatch(
                        updateCompany({ field: "name", value: e.target.value })
                      )
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="input"
                    value={company.phone}
                    onChange={(e) =>
                      dispatch(
                        updateCompany({ field: "phone", value: e.target.value })
                      )
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={company.email}
                    onChange={(e) =>
                      dispatch(
                        updateCompany({ field: "email", value: e.target.value })
                      )
                    }
                  />
                  <textarea
                    placeholder="Address"
                    className="input h-24"
                    value={company.address}
                    onChange={(e) =>
                      dispatch(
                        updateCompany({
                          field: "address",
                          value: e.target.value,
                        })
                      )
                    }
                  ></textarea>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                    To:
                  </h2>
                  <select
                    className="input w-48 sm:w-72 text-sm p-1 mb-4 inline-block"
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    value={selectedCustomerId || ""}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
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
                    value={selectedCustomer.name}
                    onChange={(e) =>
                      handleCustomerChange("name", e.target.value)
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="input"
                    value={selectedCustomer.phone}
                    onChange={(e) =>
                      handleCustomerChange("phone", e.target.value)
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={selectedCustomer.email}
                    onChange={(e) =>
                      handleCustomerChange("email", e.target.value)
                    }
                  />
                  <textarea
                    placeholder="Address"
                    className="input h-24"
                    value={selectedCustomer.address}
                    onChange={(e) =>
                      handleCustomerChange("address", e.target.value)
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="hidden lg:grid  bg-gray-50 p-4 rounded-lg mb-4">
              <div className="hidden lg:grid grid-cols-12 gap-4 mb-2 font-semibold text-gray-600">
                <div className="col-span-4 text-sm sm:text-base">Product</div>
                <div className="col-span-4 text-sm sm:text-base">
                  Description
                </div>
                <div className="col-span-1 text-sm sm:text-base text-center">
                  Qty
                </div>
                <div className="col-span-1 text-sm sm:text-base text-center">
                  Price
                </div>
                <div className="col-span-1 text-sm sm:text-base text-center">
                  Total
                </div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="mb-5">
                <div className="grid grid-cols-12 gap-1 md:gap-4 items-center">
                  <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                    <input
                      type="text"
                      className="input bg-gray-50"
                      value={item.name}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "name", e.target.value)
                      }
                      placeholder="Product name"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                    <div className="flex justify-center items-center">
                      <textarea
                        className="input h-full resize-none overflow-hidden bg-gray-50"
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
                        placeholder="description"
                        rows={1}
                        style={{
                          resize: "none",
                          transition: "height 0.1s ease-out",
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-3 lg:col-span-1">
                    <input
                      type="number"
                      className="input bg-gray-50"
                      value={item.quantity || ""}
                      onChange={(e) => {
                        const value = Math.max(0, e.target.value);
                        handleUpdateItem(
                          item.id,
                          "quantity",
                          parseFloat(value) || 0
                        );
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      step="1"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const newValue =
                            (parseFloat(e.target.value) || 0) + 1;
                          handleUpdateItem(item.id, "quantity", newValue);
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const newValue = Math.max(
                            0,
                            (parseFloat(e.target.value) || 0) - 1
                          );
                          handleUpdateItem(item.id, "quantity", newValue);
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-3 lg:col-span-1">
                    <input
                      type="number"
                      className="input bg-gray-50"
                      value={item.price || ""}
                      placeholder="0.00"
                      onChange={(e) => {
                        const value = Math.max(0, e.target.value);
                        handleUpdateItem(
                          item.id,
                          "price",
                          parseFloat(value) || 0
                        );
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      step="1"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const newValue =
                            (parseFloat(e.target.value) || 0) + 1;
                          handleUpdateItem(item.id, "price", newValue);
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const newValue = Math.max(
                            0,
                            (parseFloat(e.target.value) || 0) - 1
                          );
                          handleUpdateItem(item.id, "price", newValue);
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-3 lg:col-span-1 text-center font-medium text-sm sm:text-base">
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                  <div className="col-span-3 lg:col-span-1 flex justify-center">
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

          <button
            onClick={() => dispatch(addItem())}
            className="btn btn-accent flex items-center gap-2 text-sm md:text-base mb-2"
          >
            <FiPlus size={20} /> Add Item
          </button>
        </div>
      </div>

      <div className="md:min-w-72 md:ml-2">
        <div className="bg-white p-2 md:p-6 rounded-xl drop-shadow-2xl md:drop-shadow-none md:shadow-lg sticky top-8">
          <div className="flex flex-col-reverse md:flex-col gap-4">
            <div className="flex flex-col gap-3">
              <button
                onClick={downloadPDF}
                className="btn btn-accent flex items-center gap-2 w-full justify-center text-sm md:text-base"
              >
                <FiDownload /> Download PDF
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="btn btn-accent flex items-center gap-2 w-full justify-center text-sm md:text-base"
              >
                <FiShare2 /> Share on WhatsApp
              </button>
              <button
                onClick={handleSaveInvoice}
                className="btn btn-primary flex items-center gap-2 w-full justify-center text-sm md:text-base"
              >
                <FiSave /> Save Invoice
              </button>
            </div>

            <div className="md:border-t pt-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 text-center">
                      Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input w-full pl-7 py-1.5 text-sm"
                        value={tax || ""}
                        onChange={(e) => {
                          const value = Math.max(0, e.target.value);
                          setTax(parseFloat(value) || 0);
                        }}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setTax((prev) => Math.min(100, (prev || 0) + 1));
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setTax((prev) => Math.max(0, (prev || 0) - 1));
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
                      Discount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input w-full pl-7 py-1.5 text-sm"
                        value={discount || ""}
                        onChange={(e) => {
                          const value = Math.max(0, e.target.value);
                          setDiscount(parseFloat(value) || 0);
                        }}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setDiscount((prev) =>
                              Math.min(100, (prev || 0) + 1)
                            );
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setDiscount((prev) => Math.max(0, (prev || 0) - 1));
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
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Discount ({discount}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Tax ({tax}%):</span>
                      <span>+${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-1 border-t text-sm sm:text-base">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Privacy and Notes Sections */}
                <div className="space-y-3 mt-4 md:border-t pt-4">
                  <textarea
                    className="input w-full text-sm min-h-[60px] resize-none bg-gray-50"
                    placeholder="Add privacy and terms"
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                  ></textarea>
                  <textarea
                    className="input w-full text-sm min-h-[60px] resize-none bg-gray-50"
                    placeholder="Add notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
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
