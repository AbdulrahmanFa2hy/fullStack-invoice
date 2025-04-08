import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { normalizeArabicText } from '../utils/arabicNormalization';

const ProductSearchDropdown = ({ searchQuery, onSelect, onClose }) => {
  const { t } = useTranslation();
  const { products } = useSelector((state) => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeArabicText(searchQuery.toLowerCase());
      const filtered = products.filter(product =>
        normalizeArabicText(product.name.toLowerCase()).includes(normalizedQuery) ||
        normalizeArabicText(product.description?.toLowerCase() || '').includes(normalizedQuery)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!searchQuery.trim() || filteredProducts.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
    >
      {filteredProducts.map((product) => (
        <div
          key={product._id}
          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(product)}
        >
          <div className="font-medium">{product.name}</div>
          {product.description && (
            <div className="text-sm text-gray-500">{product.description}</div>
          )}
          <div className="text-sm text-primary-600">{t('price')}: {product.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductSearchDropdown; 