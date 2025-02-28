import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerRight: {
    textAlign: "right",
  },
  headerText: {
    fontSize: 10,
    marginBottom: 4,
  },
  section: {
    marginBottom: 30,
  },
  grid: {
    flexDirection: "row",
    gap: 40,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  tableRowEven: {
    backgroundColor: "#f9fafb",
  },
  name: {
    width: "40%",
    paddingRight: 8,
  },
  description: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 2,
  },
  quantity: {
    width: "20%",
    paddingRight: 8,
  },
  price: {
    width: "20%",
    paddingRight: 8,
  },
  total: {
    width: "20%",
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "bold",
  },
  cell: {
    fontSize: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  contactInfo: {
    marginBottom: 8,
  },
  summaryContainer: {
    marginTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    width: 200,
    alignSelf: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "left",
  },
  summaryValue: {
    fontSize: 8,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
    alignSelf: "center",
    marginHorizontal: 20,
  },
});

const InvoicePDF = ({
  sender, // This will now receive company data
  customer,
  items,
  invoiceNumber,
  tax = 0,
  discount = 0,
  businessInfo,
  privacy = "",
  notes = "",
}) => {
  // Remove any Redux related code

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {businessInfo?.businessName || "INVOICE"}{" "}
              {/* Use businessInfo from props */}
            </Text>
          </View>
          {sender.logo && <Image src={sender.logo} style={styles.logo} />}
          <View style={styles.headerRight}>
            <Text style={styles.headerText}>
              Date: {format(new Date(), "PPP")}
            </Text>
            <Text style={styles.headerText}>Invoice #: {invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>From:</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.text}>{sender?.name || "N/A"}</Text>
                <Text style={styles.text}>{sender?.phone || "N/A"}</Text>
                <Text style={styles.text}>{sender?.email || "N/A"}</Text>
                <Text style={styles.text}>{sender?.address || "N/A"}</Text>
              </View>
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill To:</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.text}>{customer?.name || "N/A"}</Text>
                <Text style={styles.text}>{customer?.phone || "N/A"}</Text>
                <Text style={styles.text}>{customer?.email || "N/A"}</Text>
                <Text style={styles.text}>{customer?.address || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.name]}>Product Name</Text>
            <Text style={[styles.headerCell, styles.quantity]}>Quantity</Text>
            <Text style={[styles.headerCell, styles.price]}>Price</Text>
            <Text style={[styles.headerCell, styles.total]}>Total</Text>
          </View>

          {items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowEven]}
            >
              <View style={styles.name}>
                <Text style={styles.cell}>{item.name || "N/A"}</Text>
                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.cell, styles.quantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.cell, styles.price]}>
                ${item.price.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.total]}>
                ${(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount ({discount}%)</Text>
                <Text style={styles.summaryValue}>
                  -${discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            {tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({tax}%)</Text>
                <Text style={styles.summaryValue}>
                  +${taxAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {(privacy || notes) && (
          <View style={[styles.section, { marginTop: 20 }]}>
            {privacy && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>
                  Terms & Privacy:
                </Text>
                <Text style={[styles.text, { color: "#666" }]}>{privacy}</Text>
              </View>
            )}
            {notes && (
              <View>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>
                  Notes:
                </Text>
                <Text style={[styles.text, { color: "#666" }]}>{notes}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
