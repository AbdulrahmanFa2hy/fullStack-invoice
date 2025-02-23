import { useSelector, useDispatch } from "react-redux";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { updateInvoice, deleteInvoice } from "../store/mainSlice";
import InvoiceDetailModal from "../components/InvoiceDetailModal";

const Invoices = () => {
  const dispatch = useDispatch();
  const { invoiceHistory } = useSelector((state) => state.main.invoice);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleUpdate = (updatedInvoice) => {
    dispatch(updateInvoice(updatedInvoice));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      dispatch(deleteInvoice(id));
      setSelectedInvoice(null);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Invoice History</h1>
      <div className="grid gap-6">
        {invoiceHistory.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleInvoiceClick(invoice)}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Invoice #{invoice.invoiceNumber}
              </h2>
              <span className="text-gray-500">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">From:</h3>
                <p>{invoice.sender.name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">To:</h3>
                <p>{invoice.recipient.name}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-right font-semibold">
                Total: ${invoice.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Invoices;
