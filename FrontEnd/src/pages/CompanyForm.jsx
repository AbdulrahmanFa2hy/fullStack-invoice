import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateCompany,
  resetCompany,
  fetchCompanyByUserId,
  saveCompany,
} from "../store/companySlice";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../components/LoadingSpinner";

function CompanyForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [previewLogo, setPreviewLogo] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { status, error, exists, ...companyData } = useSelector(
    (state) => state.company
  );
  const userId = useSelector((state) => state.profile.userData?.id);

  // Fetch company data when component mounts or userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        try {
          await dispatch(fetchCompanyByUserId()).unwrap();
        } catch (err) {
          console.error("Failed to fetch company:", err);
          if (err === "User not authenticated") {
            navigate("/login", {
              state: { from: location.pathname },
              replace: true,
            });
            return;
          }
        }
      } else {
        dispatch(resetCompany());
      }
    };

    fetchData();

    // Cleanup on unmount
    return () => {
      dispatch(resetCompany());
    };
  }, [dispatch, userId, navigate]);

  // Update preview logo when company data changes
  useEffect(() => {
    if (companyData.logo) {
      setPreviewLogo(companyData.logo);
    }
  }, [companyData.logo]);

  // Update form fields when company data changes
  useEffect(() => {
    if (companyData) {
      Object.entries(companyData).forEach(([field, value]) => {
        if (
          field !== "logo" &&
          field !== "exists" &&
          field !== "status" &&
          field !== "error"
        ) {
          dispatch(updateCompany({ field, value }));
        }
      });
    }
  }, [companyData, dispatch]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewLogo(e.target.result);
        dispatch(updateCompany({ field: "logo", value: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the parent's onClick
    setPreviewLogo(null);
    dispatch(updateCompany({ field: "logo", value: null }));
  };

  const handleInputChange = (field, value) => {
    dispatch(updateCompany({ field, value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    if (!companyData.name?.trim()) {
      setSubmitError(t("companyNameRequired"));
      return false;
    }
    if (
      companyData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)
    ) {
      setSubmitError(t("invalidEmail"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(saveCompany(companyData)).unwrap();

      if (result) {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to save company:", err);
      if (err === "User not authenticated") {
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }
      setSubmitError(
        err.response?.data?.message || err.message || t("errorSavingCompany")
      );
    }
  };

  if (status === "loading") {
    return (
     <LoadingSpinner />
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>
            {t("error")}: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Error Message */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md md:shadow-lg lg:shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8"
        >
          {/* Header layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center mb-4 sm:mb-6 lg:mb-8">
            {/* Logo section */}
            <div className="flex justify-center md:justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="group relative cursor-pointer"
                onClick={() => document.getElementById("logo-input").click()}
              >
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 
                           flex items-center justify-center overflow-hidden hover:border-primary-400 
                           transition-all duration-300 relative"
                >
                  {previewLogo ? (
                    <>
                      <img
                        src={previewLogo}
                        alt="Company Logo"
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        onClick={handleLogoDelete}
                        className="absolute top-2 right-2 p-2 rounded-full 
                               shadow-md z-50 bg-white hover:text-red-500 
                               transition-all duration-200
                               opacity-0 group-hover:opacity-100 text-sm"
                        title={t("deleteItem")}
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                      <p className="text-xs text-gray-500">{t("uploadLogo")}</p>
                    </div>
                  )}
                </div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </motion.div>
            </div>

            {/* Title section */}
            <div className="md:col-span-2 text-center">
              <h2 className="py-2 text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                {t("companyInformation")}
              </h2>
              <p className="text-sm sm:text-base text-gray-500">
                {t("setupCompanyProfile")}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                {
                  field: "name",
                  placeholder: t("companyName"),
                  icon: "far fa-building",
                  colSpan: "sm:col-span-2",
                },
                {
                  field: "email",
                  placeholder: t("companyEmail"),
                  icon: "far fa-envelope",
                  colSpan: "",
                },
                {
                  field: "phone",
                  placeholder: t("contactNumber"),
                  icon: "far fa-phone",
                  colSpan: "",
                  type: "tel",
                  dir: "ltr",
                  className: "text-right",
                },
                {
                  field: "address",
                  placeholder: t("companyAddress"),
                  icon: "far fa-map-marker-alt",
                  colSpan: "sm:col-span-2",
                  isTextarea: true,
                },
              ].map(
                ({
                  field,
                  placeholder,
                  icon,
                  colSpan,
                  isTextarea,
                  type,
                  dir,
                  className,
                }) => (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay:
                        ["name", "email", "phone", "address"].indexOf(field) *
                        0.1,
                    }}
                    className={`relative group ${colSpan}`}
                  >
                    <i
                      className={`${icon} absolute left-3 sm:left-4 ${
                        isTextarea ? "top-6" : "top-1/2"
                      } -translate-y-1/2 text-gray-400 
                    group-focus-within:text-primary-500 transition-colors duration-200`}
                    ></i>
                    {isTextarea ? (
                      <textarea
                        value={companyData[field] || ""}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        rows={3}
                        placeholder={placeholder}
                        className="appearance-none block w-full pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 
                          py-2.5 sm:py-3 md:py-3.5 lg:py-4 border-2
                          border-gray-100 rounded-lg sm:rounded-xl placeholder-gray-400
                          text-sm sm:text-base
                          bg-gray-50 text-gray-700
                          transition-all duration-200 ease-in-out
                          hover:border-gray-200 hover:bg-gray-50/80
                          focus:outline-none focus:border-primary-500 focus:ring-1 
                          focus:ring-primary-500/20 focus:bg-white
                          resize-none"
                      />
                    ) : (
                      <input
                        type={type || (field === "email" ? "email" : "text")}
                        value={companyData[field] || ""}
                        onChange={(e) => {
                          if (field === "phone") {
                            const value = e.target.value.replace(
                              /[^\d\s+-]/g,
                              ""
                            );
                            handleInputChange(field, value);
                          } else {
                            handleInputChange(field, e.target.value);
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        dir={dir}
                        className={`appearance-none block w-full pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 
                          py-2.5 sm:py-3 md:py-3.5 lg:py-4 border-2
                          border-gray-100 rounded-lg sm:rounded-xl placeholder-gray-400
                          text-sm sm:text-base
                          bg-gray-50 text-gray-700
                          transition-all duration-200 ease-in-out
                          hover:border-gray-200 hover:bg-gray-50/80
                          focus:outline-none focus:border-primary-500 focus:bg-white
                          [&::-webkit-inner-spin-button]:appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none ${
                            className || ""
                          }`}
                      />
                    )}
                  </motion.div>
                )
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-primary-600 to-primary-500 
                    text-white py-2.5 sm:py-3 md:py-3.5 lg:py-4 px-4 sm:px-6 
                    text-sm sm:text-base font-semibold
                    rounded-lg sm:rounded-xl
                    hover:from-primary-700 hover:to-primary-600
                    transform transition-all duration-300 shadow-md 
                    hover:shadow-lg"
          >
            {exists ? t("updateCompany") : t("createCompany")}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default CompanyForm;
