import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useRef } from "react";
import InvoiceView from "./InvoiceView";
import { generatePDF } from "../utils/pdfGenerator";

const PreviewModal = ({ 
  invoice, 
  customer, 
  onClose, 
  invoiceType = "complete" 
}) => {
  const { t } = useTranslation();
  const invoiceRef = useRef(null);

  // Debug log
  console.log('Preview Modal Data:', {
    invoice,
    customer,
    invoiceType
  });

  const handleDownload = async () => {
    try {
      if (!invoiceRef.current) return;
      
      // Create a clone of the invoice view for PDF generation
      const pdfContainer = invoiceRef.current.cloneNode(true);
      pdfContainer.style.width = '190mm'; // A4 width
      pdfContainer.style.padding = '0'; // Add proper padding
      pdfContainer.style.margin = '0 auto'; // Center the content
      pdfContainer.style.backgroundColor = 'white'; // Ensure white background
      
      document.body.appendChild(pdfContainer);

      // Generate the PDF
      await generatePDF(pdfContainer, `invoice-${invoice.invoice_number}.pdf`);

      // Clean up
      document.body.removeChild(pdfContainer);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        <div className="mb-24 sm:mb-20">
          <InvoiceView 
            ref={invoiceRef}
            invoice={invoice} 
            customer={customer} 
            invoiceType={invoiceType}
          />
        </div>

        {/* Bottom buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-0 start-0 end-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 flex flex-wrap sm:flex-nowrap justify-center gap-3 sm:gap-4"
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="w-full sm:w-auto flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
          >
            <span>{t("downloadPdf")}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full sm:w-auto flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
          >
            <span>{t("close")}</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PreviewModal; 