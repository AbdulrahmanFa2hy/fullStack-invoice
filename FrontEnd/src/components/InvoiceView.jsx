import { useTranslation } from "react-i18next";
import { forwardRef } from "react";

const InvoiceView = forwardRef(({ invoice, customer, invoiceType, isPdfMode }, ref) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Debug log
  console.log('InvoiceView Data:', {
    invoice,
    customer,
    invoiceType,
    isPdfMode
  });

  // Calculate totals
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + (item.quantity * item.price),
    0
  );
  const discountAmount = (subtotal * (invoice.discount || 0)) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * (invoice.tax || 0)) / 100;
  const total = subtotalAfterDiscount + taxAmount;

  return (
    <div 
      ref={ref}
      className={`space-y-4 sm:space-y-6 ${isPdfMode ? 'p-2 bg-white min-h-[297mm]'  : ''} `}
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        pageBreakInside: 'auto',
        pageBreakBefore: 'auto',
        pageBreakAfter: 'auto'
      }}
    >
      {/* Header Section - No Break */}
      <div className="no-break" style={{ pageBreakInside: 'avoid', marginBottom: '20px' }}>
        {/* Logo and Invoice Number */}
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            {t("invoiceDetails")} {invoice.invoice_number}
          </h2>
          {invoice?.sender?.logo && (
            <img 
              src={invoice.sender.logo} 
              alt="Company Logo" 
              className="h-16 w-auto object-contain"
            />
          )}
        </div>

        {/* Conditionally render the 'from' and 'to' sections based on invoice type */}
        {invoiceType !== "quick" && (
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-2">
              <h3 className="font-semibold">{t("from")}</h3>
              <p className="text-lg">{invoice?.sender?.name || t("notAvailable")}</p>
              <p>{invoice?.sender?.email || t("notAvailable")}</p>
              <p>{invoice?.sender?.phone || t("notAvailable")}</p>
              <p>{invoice?.sender?.address || t("notAvailable")}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{t("to")}</h3>
              <p className="text-lg">{customer?.name || t("notAvailable")}</p>
              <p>{customer?.email || t("notAvailable")}</p>
              <p>{customer?.phone || t("notAvailable")}</p>
              <p>{customer?.address || t("notAvailable")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items Table Section */}
      <div className="items-section" style={{ pageBreakInside: 'auto' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 no-break" style={{ pageBreakInside: 'avoid', display: 'table-header-group' }}>
              <tr>
                <th className="px-4 py-2 text-start w-[40%]">{t("product")}</th>
                <th className="px-4 py-2 text-end">{t("quantity")}</th>
                <th className="px-4 py-2 text-end">{t("price")}</th>
                <th className="px-4 py-2 text-end">{t("total")}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={item.id || `item-${index}`}
                  className={`border-b item-row ${index % 2 === 1 ? "bg-gray-50" : ""}`}
                  style={{ 
                    pageBreakInside: 'avoid',
                    breakAfter: 'auto',
                    breakBefore: 'auto'
                  }}
                >
                  <td className="px-4 py-2">
                    <div className="space-y-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && item.description.trim() !== "" && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-end">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-end">
                    {isRTL
                      ? `${item.price.toFixed(2)}${t("currency")}`
                      : `${t("currency")}${item.price.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-2 text-end">
                    {isRTL
                      ? `${(item.quantity * item.price).toFixed(2)}${t("currency")}`
                      : `${t("currency")}${(item.quantity * item.price).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section - No Break */}
        <div className="mt-4 ms-auto max-w-sm summary-section" 
          style={{ 
            pageBreakInside: 'avoid',
            breakBefore: 'auto',
            breakAfter: 'auto'
          }}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">{t("subtotal")}:</span>
              <span>
                {isRTL
                  ? `${subtotal.toFixed(2)}${t("currency")}`
                  : `${t("currency")}${subtotal.toFixed(2)}`}
              </span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between py-2 text-gray-600">
                <span>{t("discount")} ({invoice.discount}%):</span>
                <span className="text-red-600">
                  -{isRTL
                    ? `${discountAmount.toFixed(2)}${t("currency")}`
                    : `${t("currency")}${discountAmount.toFixed(2)}`}
                </span>
              </div>
            )}

            {invoice.tax > 0 && (
              <div className="flex justify-between py-2 text-gray-600">
                <span>{t("taxRate")} ({invoice.tax}%):</span>
                <span>
                  +{isRTL
                    ? `${taxAmount.toFixed(2)}${t("currency")}`
                    : `${t("currency")}${taxAmount.toFixed(2)}`}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
              <span>{t("total")}:</span>
              <span>
                {isRTL
                  ? `${total.toFixed(2)}${t("currency")}`
                  : `${t("currency")}${total.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy and Notes Sections */}
        {(invoice.privacy || invoice.notes) && (
          <div className="mt-6 space-y-4 text-sm" style={{ pageBreakInside: 'avoid' }}>
            {invoice.privacy && invoice.privacy.trim() !== "" && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t("termsAndPrivacy")}</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.privacy}</p>
              </div>
            )}
            {invoice.notes && invoice.notes.trim() !== "" && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t("notes")}</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

InvoiceView.displayName = 'InvoiceView';

export default InvoiceView; 