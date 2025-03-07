import { useSelector, useDispatch } from "react-redux";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateInvoice, deleteInvoice } from "../store/invoiceSlice";
import InvoiceDetailModal from "../components/InvoiceDetailModal";
import { normalizeArabicText } from "../utils/arabicNormalization";

const Invoices = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { invoiceHistory } = useSelector((state) => state.main.invoice);
  const customers = useSelector((state) => state.customers.customers);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "PPP");
    } catch (error) {
      return t("invalidDate", "Invalid date");
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleUpdate = (updatedInvoice) => {
    dispatch(updateInvoice(updatedInvoice));
  };

  const handleDelete = (id) => {
    if (window.confirm(t("confirmDelete", "Are you sure you want to delete this invoice?"))) {
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

  const filteredInvoices = [...invoiceHistory]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((invoice) => {
      if (!searchQuery) return true;
      return searchInObject(invoice, searchQuery);
    });

  const getCustomerById = (customerId) => {
    return (
      customers.find((customer) => customer.id === customerId) || {
        name: t("notAvailable", "N/A"),
        email: t("notAvailable", "N/A"),
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            {t("invoiceHistory")}
          </h1>
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder={t("searchInvoices", "Search invoices...")}
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
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 relative overflow-hidden group"
              onClick={() => handleInvoiceClick(invoice)}
            >
              <div className={`absolute top-0 right-0 w-1.5 sm:w-2 h-full ${
                invoice.type === "complete" 
                  ? "bg-blue-500" 
                  : "bg-green-500"
              }`} />
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {invoice.invoiceNumber}
                      </h2>
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${
                        invoice.type === "complete" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {invoice.type === "complete" ? t("completeInvoice") : t("quickInvoice")}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {invoice.type !== "quick" && (
                  <>
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                        {t("from")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">
                            {invoice.sender.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-800">
                            {invoice.sender.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {invoice.sender.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                        {t("to")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">
                            {getCustomerById(invoice.customerId).name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-800">
                            {getCustomerById(invoice.customerId).name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {getCustomerById(invoice.customerId).email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className={`space-y-1 sm:space-y-2 ${
                  invoice.type === "quick" ? "col-span-full" : ""
                }`}>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                    {t("total")}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg sm:text-2xl font-bold text-gray-800">
                      {t("currency")}{invoice.total.toFixed(2)}
                    </p>
                    <button className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200">
                      {t("viewDetails")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              {searchQuery ? t("noMatchingInvoices", "No matching invoices found") : t("noInvoices", "No invoices found")}
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
