import { useNavigate } from "react-router-dom";

function SubscriptionPlans({ onSubscribe }) {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic Invoicing",
      description:
        "Perfect for small businesses. Includes basic invoice templates and monthly reporting.",
      image: "/images/basic-plan.svg", // You'll need to add these images to your public folder
      type: "basic",
    },
    {
      name: "Professional Suite",
      description:
        "Advanced invoicing features with customizable templates and detailed analytics.",
      image: "/images/pro-plan.svg",
      type: "professional",
    },
    {
      name: "Enterprise Solution",
      description:
        "Full-featured invoice management system with multi-user support and API access.",
      image: "/images/enterprise-plan.svg",
      type: "enterprise",
    },
  ];

  const handlePlanSelection = (planType) => {
    // TODO: Handle plan selection logic with backend
    onSubscribe();
    navigate("/"); // Redirect to home after selection
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Invoice Plan
          </h2>
          <p className="mt-3 text-xl text-gray-500">
            Select the plan that best fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handlePlanSelection(plan.type)}
            >
              <div className="p-6">
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="w-full h-48 object-cover mb-6"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700">
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
