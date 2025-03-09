import { useSelector } from "react-redux";

export const useInvoiceNumber = () => {
  const invoiceNumber = useSelector(
    (state) => state.main.invoice.invoiceNumber
  );
  return invoiceNumber || "";
};
