import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateProductThunk,
  deleteProductThunk,
  addProduct,
  fetchProducts,
  clearProductError,
} from "../store/productSlice";
import { normalizeArabicText } from "../utils/arabicNormalization";
import { useTranslation } from "react-i18next";
import { FiPackage } from "react-icons/fi";
import Swal from "sweetalert2";

const ProductModal = ({ product, onClose, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const isRTL = i18n.dir() === "rtl";

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!product) return null;

  const validateForm = () => {
    const newErrors = {};

    // Price validation (must be a positive number)
    if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = t("invalidPrice");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onEdit({
        ...formData,
        price: Number(formData.price),
        quantity: 1  // Add default quantity for backend compatibility
      });
      setIsEditing(false);
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {isEditing ? t("editProduct") : t("productDetails")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm">{t("name")}</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">{t("description")}</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                rows="3"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">{t("price")}</label>
              <div className={`relative ${isRTL ? "text-right" : "text-left"}`}>
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                  }}
                  min="0"
                  step="1"
                  dir="ltr"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.price ? "border-red-500" : "border-gray-200"
                  } bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none`}
                  required
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="submit"
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 text-sm">{t("name")}</label>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t("description")}</label>
                {product.description ? (
                  <p className="font-medium">{product.description}</p>
                ) : (
                  <p className="text-gray-400 text-sm flex items-center gap-1.5">
                    {t("noDescription")}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-600 text-sm">{t("price")}</label>
                <p
                  className={`font-medium ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir="ltr"
                >
                  {product.price}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => onDelete(product._id)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                {t("delete")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Products = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { userData } = useSelector((state) => state.profile);
  const { products, status, error } = useSelector((state) => state.products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    // When component mounts, fetch products
    if (userData?.id) {
      dispatch(fetchProducts())
        .unwrap()
        .catch((error) => {
          console.error("Error fetching products:", error);
          Swal.fire({
            icon: "error",
            title: t("error"),
            text: t("errorFetchingProducts"),
            confirmButtonText: t("ok"),
          });
        });
    }
  }, [dispatch, userData, t]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        text: error.message || t("errorFetchingProducts"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      dispatch(clearProductError());
    }
  }, [error, t, dispatch]);

  const filteredProducts = (products || []).filter((product) =>
    normalizeArabicText(
      `${product.name} ${product.description || ""}`
    ).includes(normalizeArabicText(searchQuery))
  );

  const handleDelete = async (id) => {
    if (!id) {
      Swal.fire({
        icon: "error",
        text: t("invalidProductId"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      await Swal.fire({
        title: t("confirmDeleteProduct"),
        text: t("deleteProductConfirmation"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: t("delete"),
        cancelButtonText: t("cancel"),
      }).then(async (result) => {
        if (result.isConfirmed) {
          await dispatch(deleteProductThunk(id)).unwrap();
          setSelectedProduct(null);
          Swal.fire({
            icon: "success",
            text: t("productDeleted"),
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error.message || t("errorDeletingProduct"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleEdit = async (updatedProduct) => {
    if (!updatedProduct._id) {
      Swal.fire({
        icon: "error",
        text: t("invalidProductId"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      await dispatch(updateProductThunk(updatedProduct)).unwrap();
      setSelectedProduct(null);
      Swal.fire({
        icon: "success",
        text: t("productUpdated"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error.message || t("errorUpdatingProduct"),
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleAddProduct = async () => {
    const showAddProductModal = async (initialValues = {}, fieldErrors = {}) => {
      // Store references to the input elements
      let nameInput, descriptionInput, priceInput;
      
      const formHtml = `
        <div class="space-y-4 mt-4">
          <div class="relative">
            <input id="name" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("name")}" value="${initialValues.name || ''}">
          </div>
          <div class="relative">
            <textarea id="description" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("description")}" rows="3">${initialValues.description || ''}</textarea>
          </div>
          <div class="relative">
            <input id="price" class="w-full px-4 py-2.5 rounded-lg border ${fieldErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="${t("price")}" type="number" min="0" step="1" value="${initialValues.price || ''}">
          </div>
        </div>
      `;

      const { value: formValues } = await Swal.fire({
        title: t("addNewProduct"),
        html: formHtml,
        showCancelButton: true,
        confirmButtonText: t("add"),
        cancelButtonText: t("cancel"),
        buttonsStyling: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#f3f4f6',
        didOpen: () => {
          // Get references to the input elements
          nameInput = document.getElementById("name");
          descriptionInput = document.getElementById("description");
          priceInput = document.getElementById("price");
          
          // Add input event listeners to remove error styling when user types
          nameInput.addEventListener('input', () => {
            nameInput.classList.remove('border-red-500', 'bg-red-50');
          });
          
          descriptionInput.addEventListener('input', () => {
            descriptionInput.classList.remove('border-red-500', 'bg-red-50');
          });
          
          priceInput.addEventListener('input', () => {
            priceInput.classList.remove('border-red-500', 'bg-red-50');
          });
          
          const cancelButton = Swal.getCancelButton();
          if (cancelButton) {
            cancelButton.style.color = '#374151';
          }
        },
        preConfirm: () => {
          const name = nameInput.value;
          const description = descriptionInput.value;
          const price = priceInput.value;
          
          let isValid = true;

          // Validate name (3-30 characters as per backend model)
          if (!name) {
            nameInput.classList.add('border-red-500', 'bg-red-50');
            isValid = false;
          } else if (name.length < 3 || name.length > 30) {
            nameInput.classList.add('border-red-500', 'bg-red-50');
            isValid = false;
          }

          // Validate description (if provided, must be 3-600 characters)
          if (description && (description.length < 3 || description.length > 600)) {
            descriptionInput.classList.add('border-red-500', 'bg-red-50');
            isValid = false;
          }

          // Validate price
          if (!price || isNaN(price) || Number(price) <= 0) {
            priceInput.classList.add('border-red-500', 'bg-red-50');
            isValid = false;
          }

          if (!isValid) {
            return false;
          }

          return { 
            name, 
            description: description && description.length >= 3 ? description : "",
            price: Number(price),
            quantity: 1  // Add a default quantity to satisfy the backend requirements
          };
        }
      });

      return formValues;
    };

    let formValues = await showAddProductModal();

    if (formValues) {
      try {
        await dispatch(addProduct(formValues)).unwrap();
        
        Swal.fire({
          icon: "success",
          text: t("productAdded"),
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
      } catch (error) {
        let errorMessage = error?.message || t("errorAddingProduct");
        const fieldErrors = {};
        
        Swal.fire({
          icon: "error",
          text: errorMessage,
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
        });
        
        formValues = await showAddProductModal(formValues, fieldErrors);
        
        if (!formValues) return;
        
        handleAddProduct();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold mb-4">{t("products")}</h1>
        <button
          onClick={handleAddProduct}
          className="btn btn-primary flex items-center gap-2 whitespace-nowrap text-xs sm:text-base px-2 sm:px-4"
          disabled={status === "loading"}
        >
          <FiPackage  />
          {t("addNewProduct")}
        </button>
      </div>

      {/* Search box */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 w-full md:w-1/3 border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2.5 sm:py-3 ${
              isRTL ? "pr-11" : "pl-11"
            } rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-sm sm:text-base`}
            disabled={status === "loading"}
          />
          <svg
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-3.5 h-5 w-5 text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Error state */}
      {status === "failed" && (
        <div className="text-center py-8 text-red-600 bg-white rounded-xl shadow-sm p-6">
          {error?.message || t("errorFetchingProducts")}
        </div>
      )}

      {/* Products table */}
      {status === "succeeded" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th
                      className={`px-4 sm:px-6 py-3 sm:py-4 ${
                        isRTL ? "text-end" : "text-start"
                      } text-xs sm:text-sm font-medium text-gray-600`}
                    >
                      {t("name")}
                    </th>
                    <th
                      className={`hidden sm:table-cell px-6 py-4 ${
                        isRTL ? "text-end" : "text-start"
                      } text-xs sm:text-sm font-medium text-gray-600`}
                    >
                      {t("description")}
                    </th>
                    <th
                      className={`hidden sm:table-cell px-6 py-4 ${
                        isRTL ? "text-end" : "text-start"
                      } text-xs sm:text-sm font-medium text-gray-600`}
                    >
                      {t("price")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id || product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <td
                        className={`px-4 sm:px-6 py-3 sm:py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                      >
                        <div className="sm:hidden font-medium mb-1 text-sm">
                          {product.name}
                        </div>
                        <div
                          className={`sm:hidden text-xs text-gray-500 ${
                            isRTL ? "text-end" : "text-start"
                          }`}
                        >
                          {product.description && (
                            <>
                              {product.description.substring(0, 50)}
                              {product.description.length > 50 ? "..." : ""}
                              <br />
                            </>
                          )}
                          <span
                            dir="ltr"
                            className={isRTL ? "text-right" : "text-left"}
                          >
                            {t("price")}: {product.price}
                          </span>
                        </div>
                        <div className="hidden sm:block">{product.name}</div>
                      </td>
                      <td
                        className={`hidden sm:table-cell px-6 py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                      >
                        {product.description ? (
                          <>
                            {product.description.substring(0, 50)}
                            {product.description.length > 50 ? "..." : ""}
                          </>
                        ) : (
                          <span className="text-gray-400  text-sm flex items-center gap-1.5">
                            {t("noDescription")}
                          </span>
                        )}
                      </td>
                      <td
                        className={`hidden sm:table-cell px-6 py-4 text-gray-700 ${
                          isRTL ? "text-end" : "text-start"
                        }`}
                        dir="ltr"
                      >
                        <span className={isRTL ? "text-right" : "text-left"}>
                          {product.price}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-gray-500 text-lg">{t("noProductsFound")}</p>
              <p className="text-gray-400 mt-2">{t("addNewProduct")}</p>
              <button
                onClick={handleAddProduct}
                className="mt-4 btn btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <FiPackage size={18} />
                {t("addNewProduct")}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Products;