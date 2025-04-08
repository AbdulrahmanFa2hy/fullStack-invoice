import { useSelector, useDispatch } from "react-redux";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  fetchInvoices, 
  updateInvoiceThunk, 
  deleteInvoiceThunk 
} from "../store/invoiceSlice";
import { fetchCustomers } from "../store/customersSlice";
import { fetchCompanyByUserId } from "../store/companySlice";
import { fetchProducts } from "../store/productSlice";
import InvoiceDetailModal from "../components/InvoiceDetailModal";
import { normalizeArabicText } from "../utils/arabicNormalization";
import LoadingSpinner from "../components/LoadingSpinner";
import { FiFilter, FiX, FiSearch } from "react-icons/fi";
import DatePickerModal from "../components/DatePickerModal";
import Swal from "sweetalert2";

const Invoices = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  
  // Get data from all necessary slices
  const { invoiceHistory } = useSelector((state) => state.main.invoice);
  const { status: invoiceStatus, error: invoiceError } = useSelector((state) => state.main);
  const { customers, status: customerStatus } = useSelector((state) => state.customers);
  const company = useSelector((state) => state.company);
  const { products, status: productStatus } = useSelector((state) => state.products);
  const userData = useSelector((state) => state.profile.userData);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerType, setDatePickerType] = useState("start"); // "start" or "end"

  // Fetch all necessary data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (userData?._id) {
          // Fetch all data in parallel
          await Promise.all([
            dispatch(fetchInvoices(userData._id)).unwrap(),
            dispatch(fetchCustomers()).unwrap(),
            dispatch(fetchCompanyByUserId()).unwrap(),
            dispatch(fetchProducts()).unwrap()
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [dispatch, userData?._id]);

  // Check if any data is still loading
  const isDataLoading = [
    invoiceStatus,
    customerStatus,
    company.status,
    productStatus
  ].includes('loading');

  // Show loading state while fetching any data
  if (isLoading || isDataLoading) {
    return <LoadingSpinner />;
  }

  // Show error state if any fetch failed
  if (error || invoiceError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || invoiceError || t("errorLoadingData")}
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "PPP", {
        locale: i18n.language === "ar" ? ar : undefined,
      });
    } catch {
      return t("invalidDate", "Invalid date");
    }
  };

  // Helper function to safely get company data - updated to be more robust
  const getCompanyById = (companyId, fallbackCompany = {}) => {
    // First check if we have a populated company object directly in the invoice
    if (typeof companyId === 'object' && companyId !== null) {
      return {
        ...companyId,
        name: companyId.name || company.data?.name || '',
        email: companyId.email || company.data?.email || '',
        phone: companyId.phone || company.data?.phone || '',
        address: companyId.address || company.data?.address || '',
        logo: companyId.logo || company.data?.logo || ''
      };
    }
    
    // Then use the company data from the Redux store
    if (company.data) {
      return {
        ...company.data,
        name: company.data.name || '',
        email: company.data.email || '',
        phone: company.data.phone || '',
        address: company.data.address || '',
        logo: company.data.logo || ''
      };
    }
    
    // Finally, use the fallback data
    return {
      ...fallbackCompany,
      name: fallbackCompany.name || '',
      email: fallbackCompany.email || '',
      phone: fallbackCompany.phone || '',
      address: fallbackCompany.address || '',
      logo: fallbackCompany.logo || ''
    };
  };

  const handleInvoiceClick = (invoice) => {
    // Prepare complete invoice data with customer and company info
    const completeInvoice = {
      ...invoice,
      customer: getCustomerById(invoice.customer_id, invoice.customer),
      sender: getCompanyById(invoice.company_id, invoice.sender),
      company_id: invoice.company_id || company.data?._id,
      items: invoice.items.map(item => ({
        ...item,
        id: item.id || item._id || Date.now() + Math.random()
      }))
    };
    setSelectedInvoice(completeInvoice);
  };

  const handleUpdate = async (updatedInvoice) => {
    try {
      setIsLoading(true);

      // Ensure company data is preserved in the update
      const completeInvoiceData = {
        ...updatedInvoice,
        sender: getCompanyById(updatedInvoice.company_id, updatedInvoice.sender),
        company_id: updatedInvoice.company_id || company.data?._id
      };
      
      // Dispatch the update to the server
      await dispatch(updateInvoiceThunk({ 
        id: completeInvoiceData._id || completeInvoiceData.id,
        invoiceData: completeInvoiceData
      })).unwrap();
      
      // Refresh the invoices data
      if (userData?._id) {
        await dispatch(fetchInvoices(userData._id)).unwrap();
      }
      
      // Close the modal
      setSelectedInvoice(null);
      
    } catch (error) {
      console.error('Failed to update invoice:', error);
      setError(error.message || 'Failed to update invoice');
      
      // Show error message
      Swal.fire({
        icon: 'error',
        text: error.message || t('failedToUpdateInvoice'),
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await dispatch(deleteInvoiceThunk(id)).unwrap();
      await dispatch(fetchInvoices(userData._id));
      setSelectedInvoice(null);
      
      // Show success message
      Swal.fire({
        icon: "success",
        text: t("invoiceDeletedSuccessfully"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      
      // Show error message
      Swal.fire({
        icon: "error",
        text: error.message || t("failedToDeleteInvoice"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely get customer data
  const getCustomerById = (customerId, fallbackCustomer = {}) => {
    // First check if we have a populated customer object directly in the invoice
    if (typeof customerId === 'object' && customerId !== null) {
      return customerId;
    }
    
    // Then check if we can find it in the customers array
    const customer = customers.find(c => c._id === customerId || c.id === customerId);
    return customer || fallbackCustomer || {
      name: "",
      email: "",
      phone: "",
      address: ""
    };
  };

  // Add this helper function at the top of your component
  const calculateInvoiceTotal = (invoice) => {
    if (!invoice) return 0;
    
    // If total is already calculated
    if (typeof invoice.total === 'number') {
      return invoice.total;
    }

    // Calculate total from items if available
    if (Array.isArray(invoice.items)) {
      const subtotal = invoice.items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + (quantity * price);
      }, 0);

      const discount = Number(invoice.discount) || 0;
      const discountAmount = (subtotal * discount) / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const tax = Number(invoice.tax) || 0;
      const taxAmount = (subtotalAfterDiscount * tax) / 100;
      
      return subtotalAfterDiscount + taxAmount;
    }

    return 0;
  };

  // Simplified filter handling
  const handleOpenDatePicker = () => {
    setIsDatePickerOpen(true);
  };
  
  const handleDateConfirm = (dateRange) => {
    setDateFilter(dateRange);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter({
      startDate: "",
      endDate: ""
    });
  };

  // Check if filters are active
  const hasActiveFilters = searchQuery || dateFilter.startDate || dateFilter.endDate;

  // Filter invoices with date logic
  const filterInvoices = (invoices) => {
    return invoices.filter((invoice) => {
      // First apply search filter
      const passesSearch = !searchQuery || Object.values({
        invoiceNumber: invoice.invoice_number || "",
        customerName: getCustomerById(invoice.customer_id, invoice.customer)?.name || "",
        total: calculateInvoiceTotal(invoice).toString(),
        date: formatDate(invoice.createdAt) || "",
      }).some(value => 
        normalizeArabicText(value.toLowerCase()).includes(
          normalizeArabicText(searchQuery.toLowerCase())
        )
      );

      // Then apply date filter
      let passesDate = true;
      
      if (dateFilter.startDate) {
        const invoiceDate = new Date(invoice.createdAt);
        const startDate = new Date(dateFilter.startDate);
        
        if (datePickerType === "start") {
          passesDate = invoiceDate >= startDate;
          
          // And before or equal to end date if specified
          if (passesDate && dateFilter.endDate) {
            const endDate = new Date(dateFilter.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            passesDate = invoiceDate <= endDate;
          }
        } else {
          passesDate = invoiceDate <= startDate;
        }
      }

      return passesSearch && passesDate;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Header with title and filter button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl  font-bold text-gray-800">
            {t("invoiceHistory")}
          </h1>
          
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={() => handleOpenDatePicker("start")}
              className={`p-2 rounded-full ${hasActiveFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              title={t("filterByDate")}
            >
              <FiFilter size={20} />
            </button>
            
            {/* Reset Button - only show when filters are active */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-2 rounded-full bg-red-100 text-red-600"
                title={t("clearFilters")}
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Search and Active Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("searchInvoices")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {t("search")}: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {dateFilter.startDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t("from")}: {dateFilter.startDate}
                  <button 
                    onClick={() => setDateFilter(prev => ({ ...prev, startDate: "" }))}
                    className="ml-1 text-green-500 hover:text-green-700"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {dateFilter.endDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t("to")}: {dateFilter.endDate}
                  <button 
                    onClick={() => setDateFilter(prev => ({ ...prev, endDate: "" }))}
                    className="ml-1 text-green-500 hover:text-green-700"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* DatePickerModal */}
        <DatePickerModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onConfirm={handleDateConfirm}
          initialDate={new Date()}
          showRangeOption={true}
          onSwitchToEndDate={() => setDatePickerType("end")}
          datePickerType={datePickerType}
          currentRange={dateFilter}
        />
        
        {/* Invoice Cards */}
        {filterInvoices(invoiceHistory).length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {filterInvoices(invoiceHistory).map((invoice) => {
              const customer = getCustomerById(invoice.customer_id, invoice.customer);
              // Always get fresh company data for each invoice
              const companyData = getCompanyById(invoice.company_id, invoice.sender);
              const total = calculateInvoiceTotal(invoice);
              const invoiceType = invoice.type || "complete";
              
              return (
                <div
                  key={invoice._id || invoice.id}
                  onClick={() => handleInvoiceClick(invoice)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6 relative cursor-pointer"
                >
                  <div
                    className={`absolute top-0 right-0 w-1.5 sm:w-2 h-full rounded-tr-xl rounded-br-xl ${
                      invoice.type === "complete" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="flex flex-col w-4/5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-800">
                          {invoice.invoice_number.startsWith('#') 
                            ? invoice.invoice_number 
                            : invoice.invoice_number.replace(/^INV-\d{8}-(\d{3}).*$/, '#$1')}
                        </h2>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoiceType === "complete"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {invoiceType === "complete" ? t("completeInvoice") : t("quickInvoice")}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gird-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {invoiceType !== "quick" && (
                      <>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-500">{t("from")}</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {(companyData?.name || "").charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{companyData?.name || t("notAvailable")}</p>
                              <p className="text-sm text-gray-600">{companyData?.email || t("notAvailable")}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-500">{t("to")}</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {(customer?.name || "").charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{customer?.name}</p>
                              <p className="text-sm text-gray-600">{customer?.email}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className={`space-y-2 ${invoiceType === "quick" ? "col-span-full" : ""}`}>
                      <h3 className="text-sm font-medium text-gray-500">{t("total")}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-gray-800">
                          {t("currency")} {total.toFixed(2)}
                        </p>
                        <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                          {t("viewDetails")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">
              {searchQuery || dateFilter.startDate || dateFilter.endDate 
                ? t("noMatchingInvoices") 
                : t("noInvoices")}
            </p>
          </div>
        )}

        {selectedInvoice && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            customers={customers}
            products={products}
            company={company.data}
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;
