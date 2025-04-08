import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { normalizeArabicText } from '../utils/arabicNormalization';

const ProductSearchDropdown = ({ searchQuery, onSelect, onClose }) => {
  const { t } = useTranslation();
  const { products } = useSelector((state) => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
      setSelectedIndex(-1); // Reset selection when search changes
    } else {
      setFilteredProducts([]);
      setSelectedIndex(-1);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event) => {
      if (filteredProducts.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < filteredProducts.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
            onSelect(filteredProducts[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredProducts, selectedIndex, onSelect, onClose]);

  if (!searchQuery.trim() || filteredProducts.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
    >
      {filteredProducts.map((product, index) => (
        <div
          key={product._id}
          className={`px-4 py-2 cursor-pointer ${
            index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(product)}
        >
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-primary-600">{t('price')}: {product.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductSearchDropdown; 