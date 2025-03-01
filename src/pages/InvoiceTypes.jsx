import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setInvoiceType } from "../store/mainSlice";

function InvoiceTypes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const companyData = useSelector((state) => state.company);
  const invoiceTypes = [
    {
      name: "Commercial Invoice",
      description:
        "Most common type for business transactions. Used for selling goods and services between businesses.",
      type: "commercial",
      features: [
        "Payment tracking",
        "Tax calculations",
        "Business details",
        "Item breakdown",
      ],
    },
    {
      name: "Proforma Invoice",
      description:
        "Preliminary bill of sale sent to buyers before the delivery of goods.",
      type: "proforma",
      features: [
        "Shipping details",
        "Estimated costs",
        "Product details",
        "Terms & conditions",
      ],
    },
    {
      name: "Tax Invoice",
      description:
        "Specialized invoice that includes tax calculations and GST/VAT details.",
      type: "tax",
      features: [
        "Tax breakdown",
        "GST/VAT details",
        "Legal compliance",
        "Input credits",
      ],
    },
  ];

  const handleTypeSelection = (type) => {
    dispatch(setInvoiceType(type));
    const isCompanyDataEmpty =
      !companyData ||
      Object.keys(companyData).length === 0 ||
      Object.values(companyData).every((value) => !value);

    if (isCompanyDataEmpty) {
      navigate("/company");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2 inline-block">
            Select Invoice Type
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600">
            Choose the invoice type that matches your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {invoiceTypes.map((type) => (
            <div
              key={type.type}
              className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-full"
              onClick={() => handleTypeSelection(type.type)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-4 sm:p-6 md:p-8 flex flex-col h-full">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors duration-300">
                  {type.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow">
                  {type.description}
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {type.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700 text-xs sm:text-sm"
                    >
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6">
                  <button
                    className="w-full bg-gray-900 text-white py-2.5 sm:py-3 md:py-3.5 px-4 
                                 text-sm sm:text-base font-semibold
                                 rounded-lg sm:rounded-xl
                                 hover:bg-primary-600 transform transition-all duration-300 
                                 hover:scale-[1.02]"
                  >
                    Create {type.name}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InvoiceTypes;
