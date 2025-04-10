import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateCompany,
  resetCompany,
  fetchCompanyByUserId,
  saveCompany,
} from "../store/companySlice";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../components/LoadingSpinner";
import Swal from 'sweetalert2';

function CompanyForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [previewLogo, setPreviewLogo] = useState(null);
  const { status, error, exists, ...companyData } = useSelector(
    (state) => state.company
  );
  const userId = useSelector((state) => state.profile.userData?.id);
  const selectedInvoiceType = useSelector((state) => state.main.invoice.type);
  
  // Add state to track validation errors for each field
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    email: false,
    phone: false
  });

  // Add a state to track if logo should be deleted
  const [shouldDeleteLogo, setShouldDeleteLogo] = useState(false);

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
    setShouldDeleteLogo(true); // Mark logo for deletion
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
    // Reset all validation errors
    const errors = {
      name: false,
      email: false,
      phone: false
    };
    
    let isValid = true;

    // Name validation (required, 3-30 characters)
    if (!companyData.name?.trim()) {
      errors.name = true;
      showErrorAlert(t("companyNameRequired"));
      isValid = false;
    } else if (companyData.name.trim().length < 3 || companyData.name.trim().length > 30) {
      errors.name = true;
      showErrorAlert(t("companyNameLength"));
      isValid = false;
    }

    // Email validation (required, valid format)
    if (!companyData.email?.trim()) {
      errors.email = true;
      showErrorAlert(t("emailRequired"));
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
      errors.email = true;
      showErrorAlert(t("invalidEmail"));
      isValid = false;
    }

    // Phone validation (required)
    if (!companyData.phone?.trim()) {
      errors.phone = true;
      showErrorAlert(t("phoneRequired"));
      isValid = false;
    }

    // Address is now completely optional with no validation

    // Update validation errors state
    setValidationErrors(errors);
    
    return isValid;
  };

  // Function to show SweetAlert error messages as toast
  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      text: message,
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: document.documentElement.dir === 'rtl' ? 'swal2-rtl' : ''
      }
    });
  };

  // Function to show success messages as toast
  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      text: message,
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: document.documentElement.dir === 'rtl' ? 'swal2-rtl' : ''
      }
    });
  };

  // Prevent default HTML5 validation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Run our custom validation instead
    if (validateForm()) {
      submitForm();
    }
  };
  
  const submitForm = async () => {
    try {
      // Create a copy of company data to modify
      const dataToSubmit = { ...companyData };
      
      // If logo should be deleted, explicitly set a flag for the API
      if (shouldDeleteLogo) {
        dataToSubmit.deleteLogo = true;
      }
      
      const result = await dispatch(saveCompany(dataToSubmit)).unwrap();

      if (result) {
        // Show success message as toast
        showSuccessAlert(exists ? t("companyUpdatedSuccess") : t("companyCreatedSuccess"));
        
        // Reset the delete logo flag after successful save
        setShouldDeleteLogo(false);
        
        // After saving company data, check if invoice type exists
        if (selectedInvoiceType && selectedInvoiceType !== "") {
          // If invoice type already selected, go to home
          navigate("/");
        } else {
          // If no invoice type, go to invoice types selection
          navigate("/invoice-types");
        }
      }
    } catch (err) {
      console.error("Failed to save company:", err);
      
      // Handle authentication errors
      if (err === "User not authenticated") {
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }
      
      // Handle conflict error (company already exists)
      if (typeof err === 'string' && err.includes("already exists")) {
        showErrorAlert(t("companyAlreadyExists"));
        return;
      }
      
      // Show generic error message with SweetAlert toast
      showErrorAlert(err.response?.data?.message || err.message || t("errorSavingCompany"));
    }
  };

  // Helper function to determine input class based on validation state
  const getInputClass = (field, className = "") => {
    const baseClass = `appearance-none block w-full pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 
      py-2.5 sm:py-3 md:py-3.5 lg:py-4 border-2
      rounded-lg sm:rounded-xl placeholder-gray-400
      text-sm sm:text-base
      transition-all duration-200 ease-in-out
      focus:outline-none
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none ${className}`;
    
    if (validationErrors[field]) {
      return `${baseClass} border-red-300 bg-red-50 focus:border-red-500 focus:bg-white text-red-700 placeholder-red-300`;
    }
    
    return `${baseClass} border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-50/80 focus:border-primary-500 focus:bg-white text-gray-700`;
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
        <motion.form
          onSubmit={handleFormSubmit}
          noValidate // Disable browser's native validation
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
                          
                          // Clear validation error when user types
                          if (validationErrors[field]) {
                            setValidationErrors({
                              ...validationErrors,
                              [field]: false
                            });
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        dir={dir}
                        className={getInputClass(field, className)}
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
