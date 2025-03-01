import { PDFViewer } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";

function PDFPreview({
  sender = {
    name: "Your Company Name",
    phone: "Your Phone",
    email: "your@email.com",
    address: "Your Address",
    logo: null,
  },
  customer = {
    name: "Customer Name",
    phone: "Customer Phone",
    email: "customer@email.com",
    address: "Customer Address",
  },
  items = [
    {
      id: "sample",
      name: "Sample Item",
      description: "Sample Description",
      quantity: 1,
      price: 0,
    },
  ],
  invoiceNumber = "PREVIEW",
  tax = 0,
  discount = 0,
  privacy = "",
  notes = "",
}) {
  return (
    <PDFViewer style={{ width: "100%", height: "100%" }}>
      <InvoicePDF
        sender={sender}
        customer={customer}
        items={items}
        invoiceNumber={invoiceNumber}
        tax={tax}
        discount={discount}
        businessInfo={{ businessName: "INVOICE" }}
        privacy={privacy}
        notes={notes}
      />
    </PDFViewer>
  );
}

export default PDFPreview;
