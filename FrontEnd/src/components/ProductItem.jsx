import { useState, useRef, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ProductSearchDropdown from "./ProductSearchDropdown";

const ProductItem = ({
  item,
  itemErrors = {},
  handleUpdateItem,
  handleDeleteItem,
  handleTextareaResize,
  getInputClassName,
  validateItem,
  shouldFocus = false,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const nameInputRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Focus the name input when shouldFocus is true
  useEffect(() => {
    if (shouldFocus && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [shouldFocus]);

  const handleBlur = (field) => {
    if (validateItem) {
      validateItem(item.id, field);
    }
  };

  // Auto-resize the textarea on mount and when description changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [item.description]);

  const handleProductSelect = (selectedProduct) => {
    handleUpdateItem(item.id, "name", selectedProduct.name);
    handleUpdateItem(item.id, "description", selectedProduct.description || "");
    handleUpdateItem(item.id, "price", selectedProduct.price);
    handleUpdateItem(item.id, "quantity", 1);
    setShowDropdown(false);
  };

  return (
    <div className="relative grid grid-cols-12 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
      <div className="col-span-12 lg:col-span-4 relative">
        <label className="block lg:hidden text-sm font-medium text-gray-600 mb-1">
          {t("productName")}
        </label>
        <input
          ref={nameInputRef}
          type="text"
          value={item.name}
          onChange={(e) => {
            handleUpdateItem(item.id, "name", e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => handleBlur("name")}
          className={`${getInputClassName("input w-full")} ${
            itemErrors[item.id]?.name ? "border-red-500" : ""
          }`}
          placeholder={t("productName")}
        />
        {showDropdown && (
          <ProductSearchDropdown
            searchQuery={item.name}
            onSelect={handleProductSelect}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <label className="block lg:hidden text-sm font-medium text-gray-600 mb-1">
          {t("description")}
        </label>
        <textarea
          value={item.description || ""}
          onChange={(e) => {
            handleUpdateItem(item.id, "description", e.target.value);
            handleTextareaResize(e);
          }}
          onFocus={handleTextareaResize}
          className={`${getInputClassName(
            "input w-full resize-none"
          )} scrollbar-none overflow-hidden`}
          placeholder={t("description")}
          rows="1"
        />
      </div>

      <div className="col-span-4 lg:col-span-1">
        <label className="block lg:hidden text-sm font-medium text-gray-600 mb-1">
          {t("quantity")}
        </label>
        <input
          type="number"
          value={item.quantity || ""}
          onChange={(e) =>
            handleUpdateItem(
              item.id,
              "quantity",
              parseFloat(e.target.value) || ""
            )
          }
          onBlur={() => handleBlur("quantity")}
          className={`${getInputClassName(
            "input w-full text-center",
            "number"
          )} ${itemErrors[item.id]?.quantity ? "border-red-500" : ""}`}
          min="0"
          step="1"
        />
      </div>

      <div className="col-span-4 lg:col-span-1">
        <label className="block lg:hidden text-sm font-medium text-gray-600 mb-1">
          {t("price")}
        </label>
        <input
          type="number"
          value={item.price || ""}
          onChange={(e) =>
            handleUpdateItem(item.id, "price", parseFloat(e.target.value) || "")
          }
          onBlur={() => handleBlur("price")}
          className={`${getInputClassName(
            "input w-full text-center",
            "number"
          )} ${itemErrors[item.id]?.price ? "border-red-500" : ""}`}
          min="0"
          step="1"
        />
      </div>

      <div className="col-span-3 lg:col-span-1">
        <label className="block lg:hidden text-sm font-medium text-gray-600 mb-1">
          {t("total")}
        </label>
        <input
          type="text"
          value={((item.quantity || 0) * (item.price || 0)).toFixed(2)}
          className="input w-full text-center bg-gray-100"
          readOnly
        />
      </div>

      <div className="col-span-1 flex items-center justify-center">
        <button
          onClick={() => {
            console.log("Delete button clicked for item:", item.id);
            handleDeleteItem(item.id);
          }}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <FiTrash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
