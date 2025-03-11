import { useTranslation } from "react-i18next";

const LoadingSpinner = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
      <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
  <p className="mt-4 text-gray-600">{t("loading")}</p>
</div>
</div>
  );
};

export default LoadingSpinner;
