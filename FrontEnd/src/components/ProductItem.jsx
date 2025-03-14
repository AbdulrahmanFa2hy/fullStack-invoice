import React, { useEffect, useRef } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { removeItem } from '../store/invoiceSlice';
import { useTranslation } from 'react-i18next';

const ProductItem = ({ 
  item, 
  itemErrors = {},
  handleUpdateItem, 
  handleTextareaResize, 
  getInputClassName,
  validateItem
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  const handleBlur = (field) => {
    if (validateItem) {
      validateItem(item.id, field);
    }
  };

  // Auto-resize the textarea on mount and when description changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [item.description]);

  return (
    <div className="mb-5">
      <div className="grid grid-cols-12 gap-1 md:gap-4 items-center">
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <input
            type="text"
            className={`${getInputClassName("input bg-gray-50")} ${
              itemErrors[item.id]?.name ? "border-red-500 bg-red-50" : ""
            }`}
            value={item.name}
            onChange={(e) =>
              handleUpdateItem(item.id, "name", e.target.value)
            }
            onBlur={() => handleBlur("name")}
            placeholder={t("productName")}
            required
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="flex justify-center items-center">
            <textarea
              ref={textareaRef}
              className={getInputClassName(
                "input h-full resize-none overflow-hidden bg-gray-50"
              )}
              value={item.description}
              onChange={(e) => {
                handleUpdateItem(
                  item.id,
                  "description",
                  e.target.value
                );
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              placeholder={t("desc")}
              rows={1}
              style={{
                resize: "none",
                transition: "height 0.1s ease-out",
                minHeight: "38px", // Set a minimum height
              }}
            />
          </div>
        </div>
        <div className="col-span-3 lg:col-span-1">
          <input
            type="number"
            className={`${getInputClassName("input bg-gray-50")} ${
              itemErrors[item.id]?.quantity ? "border-red-500 bg-red-50" : ""
            }`}
            value={item.quantity || ""}
            onChange={(e) => {
              const value = Math.max(0, e.target.value);
              handleUpdateItem(
                item.id,
                "quantity",
                parseFloat(value) || 0
              );
            }}
            onBlur={() => handleBlur("quantity")}
            onFocus={(e) => e.target.select()}
            min="0"
            step="1"
            required
          />
        </div>
        <div className="col-span-3 lg:col-span-1">
          <input
            type="number"
            className={`${getInputClassName("input bg-gray-50")} ${
              itemErrors[item.id]?.price ? "border-red-500 bg-red-50" : ""
            }`}
            value={item.price || ""}
            placeholder="0.00"
            onChange={(e) => {
              const value = Math.max(0, e.target.value);
              handleUpdateItem(
                item.id,
                "price",
                parseFloat(value) || 0
              );
            }}
            onBlur={() => handleBlur("price")}
            onFocus={(e) => e.target.select()}
            min="0"
            step="1"
            required
          />
        </div>
        <div className="col-span-3 lg:col-span-1 text-center font-medium text-sm sm:text-base">
          {t("currency")}
          {(item.quantity * item.price).toFixed(2)}
        </div>
        <div className="col-span-3 lg:col-span-1 flex justify-center">
          <button
            onClick={() => dispatch(removeItem(item.id))}
            className="text-red-500 hover:text-red-700"
            title={t("deleteItem")}
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem; 