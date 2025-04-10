// this logo modal for the home page
import { useTranslation } from "react-i18next";

const LogoModal = ({ isOpen, onClose, logo, onUpdate, onRemove }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(reader.result);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{t("companyLogo")}</h3>
        <div className="space-y-4">
          {logo && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 border rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt={t("currentLogo")}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    onRemove(); // Remove invalid logo
                  }}
                />
              </div>
              <button
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                className="text-red-500 text-sm hover:text-red-700"
              >
                {t("removeCurrentLogo")}
              </button>
            </div>
          )}
          <div className="border-t pt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoModal;
