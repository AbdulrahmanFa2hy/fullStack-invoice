import { useTranslation } from "react-i18next";
import CustomerSelector from "./CustomerSelector";

const InvoiceTo = ({
  readOnly = false,
  customer,
  selectedCustomerId,
  onCustomerSelect,
  onCustomerChange,
  emailErrors = {},
  onEmailChange = null,
  getInputClassName,
  invoiceType = "complete"
}) => {
  const { t } = useTranslation();

  const handleCustomerChange = (field, value) => {
    if (readOnly) return;
    if (onCustomerChange) {
      onCustomerChange(field, value);
    }
  };

  const handleEmailChange = (value) => {
    if (readOnly) return;
    handleCustomerChange("email", value);
    if (onEmailChange) {
      onEmailChange("to", value);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
          {t("to")}:
        </h2>
        {!readOnly && (
          <CustomerSelector 
            selectedCustomerId={selectedCustomerId}
            onCustomerSelect={onCustomerSelect}
            selectClassName="w-48 sm:w-72 text-sm p-1 inline-block"
          />
        )}
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder={t("name")}
          className={getInputClassName ? getInputClassName("input") : "input w-full p-2 border rounded"}
          value={customer?.name || ""}
          onChange={(e) => handleCustomerChange("name", e.target.value)}
          required={invoiceType === "complete"}
          readOnly={readOnly}
        />
        <input
          type="tel"
          dir="auto"
          placeholder={t("phone")}
          className={getInputClassName ? getInputClassName("input", "tel") : "input w-full p-2 border rounded"}
          value={customer?.phone || ""}
          onChange={(e) => handleCustomerChange("phone", e.target.value)}
          required={invoiceType === "complete"}
          pattern="[0-9]*"
          inputMode="numeric"
          readOnly={readOnly}
        />
        <input
          type="email"
          placeholder={t("email")}
          className={`${getInputClassName ? getInputClassName("input") : "input w-full p-2 border rounded"} ${
            emailErrors.to ? "border-red-500" : ""
          }`}
          value={customer?.email || ""}
          onChange={(e) => handleEmailChange(e.target.value)}
          required={invoiceType === "complete"}
          readOnly={readOnly}
        />
        <textarea
          placeholder={t("address")}
          className={getInputClassName ? getInputClassName("input h-24") : "input w-full p-2 border rounded h-24"}
          value={customer?.address || ""}
          onChange={(e) => handleCustomerChange("address", e.target.value)}
          required={invoiceType === "complete"}
          readOnly={readOnly}
        ></textarea>
      </div>
    </div>
  );
};

export default InvoiceTo; 