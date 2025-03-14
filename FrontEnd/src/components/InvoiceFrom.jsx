import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { updateCompany } from "../store/companySlice";
import LogoModal from "./LogoModal";
import { useState } from "react";

const InvoiceFrom = ({ 
  readOnly = false, 
  company, 
  getInputClassName,
  emailErrors = {},
  onEmailChange = null,
  invoiceType = "complete"
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  
  // If no company is provided, use the one from the store
  const storeCompany = useSelector((state) => state.company);
  const companyData = company || storeCompany;

  const handleCompanyChange = (field, value) => {
    if (readOnly) return;
    dispatch(updateCompany({ field, value }));
  };

  const handleEmailChange = (value) => {
    if (readOnly) return;
    if (onEmailChange) {
      onEmailChange("from", value);
    }
    handleCompanyChange("email", value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
          {t("from")}:
        </h2>
        
      </div>
      
      {isLogoModalOpen && (
        <LogoModal onClose={() => setIsLogoModalOpen(false)} />
      )}
      
      <div className="space-y-3">
        <input
          type="text"
          placeholder={t("companyName")}
          className={getInputClassName ? getInputClassName("input") : "input w-full p-2 border rounded"}
          value={companyData.name || ""}
          onChange={(e) => handleCompanyChange("name", e.target.value)}
          required={invoiceType === "complete"}
          readOnly={readOnly}
        />
        <input
          type="tel"
          dir="auto"
          placeholder={t("phone")}
          className={getInputClassName ? getInputClassName("input", "tel") : "input w-full p-2 border rounded"}
          value={companyData.phone || ""}
          onChange={(e) => handleCompanyChange("phone", e.target.value)}
          required={invoiceType === "complete"}
          pattern="[0-9]*"
          inputMode="numeric"
          readOnly={readOnly}
        />
        <input
          type="email"
          placeholder={t("email")}
          className={`${getInputClassName ? getInputClassName("input") : "input w-full p-2 border rounded"} ${
            emailErrors.from ? "border-red-500" : ""
          }`}
          value={companyData.email || ""}
          onChange={(e) => handleEmailChange(e.target.value)}
          required={invoiceType === "complete"}
          readOnly={readOnly}
        />
        <textarea
          placeholder={t("address")}
          className={getInputClassName ? getInputClassName("input h-24") : "input w-full p-2 border rounded h-24"}
          value={companyData.address || ""}
          onChange={(e) => handleCompanyChange("address", e.target.value)}
          required={invoiceType === "complete"}
          readOnly={readOnly}
        ></textarea>
      </div>
    </div>
  );
};

export default InvoiceFrom; 