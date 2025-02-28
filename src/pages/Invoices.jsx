import { useSelector, useDispatch } from "react-redux";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { updateInvoice, deleteInvoice } from "../store/mainSlice";
import InvoiceDetailModal from "../components/InvoiceDetailModal";
import { normalizeArabicText } from "../utils/arabicNormalization";

const Invoices = () => {
  const dispatch = useDispatch();
  const { invoiceHistory } = useSelector((state) => state.main.invoice);
  const customers = useSelector((state) => state.customers.customers);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const searchInObject = (obj, query) => {
    if (!obj) return false;
    const searchText = normalizeArabicText(query);

    return Object.values(obj).some((value) => {
      if (typeof value === "string") {
        return normalizeArabicText(value).includes(searchText);
      }
      if (typeof value === "number") {
        return value.toString().includes(searchText);
      }
      if (typeof value === "object") {
        return searchInObject(value, searchText);
      }
      return false;
    });
  };

  const filteredInvoices = invoiceHistory.filter((invoice) => {
    if (!searchQuery) return true;
    return searchInObject(invoice, searchQuery);
  });

  const getCustomerById = (customerId) => {
    return (
      customers.find((customer) => customer.id === customerId) || {
        name: "N/A",
        email: "N/A",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Invoice History
          </h1>
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 cursor-pointer">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              onClick={() => handleInvoiceClick(invoice)}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {invoice.invoiceNumber}
                    </h2>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                    From
                  </h3>
                  <p className="text-sm sm:text-base text-gray-800">
                    {invoice.sender.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {invoice.sender.email || ""}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                    To
                  </h3>
                  <p className="text-sm sm:text-base text-gray-800">
                    {getCustomerById(invoice.customerId).name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {getCustomerById(invoice.customerId).email}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                    Amount
                  </h3>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-800">
                    ${invoice.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              {searchQuery ? "No matching invoices found" : "No invoices found"}
            </p>
          </div>
        )}

        {selectedInvoice && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;
