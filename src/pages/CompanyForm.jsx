import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateCompany } from "../store/companySlice";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";

function CompanyForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [previewLogo, setPreviewLogo] = useState(null);
  const companyData = useSelector((state) => state.company);

  useEffect(() => {
    if (companyData.logo) {
      setPreviewLogo(companyData.logo);
    }
  }, [companyData.logo]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          Company Information
        </h2>
        <p className="text-center text-gray-500 mb-6 sm:mb-8">
          Let's set up your company profile
        </p>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg md:shadow-2xl p-4 sm:p-6 lg:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Logo Section */}
            <div className="lg:row-span-12 h-full flex justify-center items-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="group relative cursor-pointer"
                onClick={() => document.getElementById("logo-input").click()}
              >
                <div
                  className="w-40 h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 
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
                        title="Delete logo"
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-500">
                        Upload Company Logo
                      </p>
                    </div>
                  )}
                </div>
                <div
                  className="absolute inset-0 bg-black bg-opacity-70 rounded-2xl opacity-0 
                           group-hover:opacity-100 transition-opacity duration-300 flex items-center 
                           justify-center"
                >
                  <span className="text-white text-base font-bold">
                    Change Logo
                  </span>
                </div>
              </motion.div>
              <input
                id="logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            {/* Form Fields Section */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  field: "name",
                  placeholder: "Company Name",
                  icon: "far fa-building",
                  colSpan: "sm:col-span-2",
                },
                {
                  field: "email",
                  placeholder: "Company Email Address",
                  icon: "far fa-envelope",
                  colSpan: "",
                },
                {
                  field: "phone",
                  placeholder: "Contact Number",
                  icon: "far fa-phone",
                  colSpan: "",
                },
                {
                  field: "address",
                  placeholder: "Company Address",
                  icon: "far fa-map-marker-alt",
                  colSpan: "sm:col-span-2",
                  isTextarea: true,
                },
              ].map(({ field, placeholder, icon, colSpan, isTextarea }) => (
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
                    className={`${icon} absolute left-4 ${
                      isTextarea ? "top-6" : "top-1/2"
                    } -translate-y-1/2 text-gray-400 
                    group-focus-within:text-primary-500 transition-colors duration-200`}
                  ></i>
                  {isTextarea ? (
                    <textarea
                      value={companyData[field] || ""}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      rows={3}
                      placeholder={placeholder}
                      className="appearance-none block w-full pl-12 pr-4 py-4 border-2
                                border-gray-100 rounded-xl placeholder-gray-400
                                bg-gray-50 text-gray-700 text-base
                                transition-all duration-200 ease-in-out
                                hover:border-gray-200 hover:bg-gray-50/80
                                focus:outline-none focus:border-primary-500 focus:ring-1 
                                focus:ring-primary-500/20 focus:bg-white
                                resize-none"
                    />
                  ) : (
                    <input
                      type={field === "email" ? "email" : "text"}
                      value={companyData[field] || ""}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="appearance-none block w-full pl-12 pr-4 py-4 border-2
                                border-gray-100 rounded-xl placeholder-gray-400
                                bg-gray-50 text-gray-700 text-base
                                transition-all duration-200 ease-in-out
                                hover:border-gray-200 hover:bg-gray-50/80
                                focus:outline-none focus:border-primary-500 focus:bg-white"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-500 
                      text-white py-3 sm:py-4 px-6 rounded-xl font-semibold 
                      hover:from-primary-700 hover:to-primary-600
                      transform transition-all duration-300 shadow-md 
                      hover:shadow-lg"
          >
            Save and Continue
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default CompanyForm;
