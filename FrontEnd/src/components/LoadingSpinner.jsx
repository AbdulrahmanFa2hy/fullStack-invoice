import { useTranslation } from "react-i18next";

const LoadingSpinner = ({ size = "medium" }) => {
  const { t } = useTranslation();
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600`}
        ></div>
        <p className="mt-4 text-gray-600">{t("loading")}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
