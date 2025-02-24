import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiTrash2, FiSave, FiDownload, FiShare2 } from "react-icons/fi";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
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

function Home() {
  const dispatch = useDispatch();
  const { items, invoiceHistory } = useSelector((state) => state.main.invoice);
  const sender = useSelector((state) => state.main.sender);
  const recipient = useSelector((state) => state.main.recipient);
  const invoiceNumber = useInvoiceNumber();

  const invoiceRef = useRef(null);

  useEffect(() => {
    if (!invoiceNumber) {
      dispatch(generateInvoiceNumber());
    }
  });

  const handleUpdateItem = (id, field, value) => {
    dispatch(updateItem({ id, field, value }));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const generatePDF = async () => {
    const pdfDoc = (
      <InvoicePDF
        sender={sender}
        recipient={recipient}
        items={items}
        invoiceNumber={invoiceNumber}
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
    total,
    date: new Date().toISOString(),
  });

  const saveInvoiceData = () => {
    const invoiceData = prepareInvoiceData();
    dispatch(saveToHistory(invoiceData));
    dispatch(generateInvoiceNumber()); // Generate new number after saving
    dispatch(resetInvoice());
    alert(isExistingInvoice() ? "Invoice updated!" : "Invoice created!");
  };

  const downloadPDF = async () => {
    saveInvoiceData();
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
    saveInvoiceData();
    const message = `Invoice ${invoiceNumber} from ${sender.name}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSaveInvoice = () => {
    saveInvoiceData();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex">
      <div className="flex-grow max-w-4xl">
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
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  Bill To:
                </h2>
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
                    onChange={(e) =>
                      dispatch(
                        updateRecipient({
                          field: "email",
                          value: e.target.value,
                        })
                      )
                    }
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
                <div className="col-span-6">Product Details</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <input
                    type="text"
                    className="input mb-2"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "name", e.target.value)
                    }
                    placeholder="Product name"
                  />
                  <textarea
                    className="input h-20"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "description", e.target.value)
                    }
                    placeholder="Product description"
                  />
                </div>
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6"></div>
                  <div className="col-span-2">
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
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="input"
                      value={item.price}
                      onChange={(e) =>
                        handleUpdateItem(
                          item.id,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1 text-center">
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
            <div className="text-xl font-semibold">
              Total: ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-72 ml-8">
        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-700">Actions</h2>
          <div className="flex flex-col gap-4">
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
        </div>
      </div>
    </div>
  );
}

export default Home;
