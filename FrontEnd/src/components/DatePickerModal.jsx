import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiX, FiChevronDown } from "react-icons/fi";

const DatePickerModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialDate = new Date(),
  currentRange = { startDate: "", endDate: "" }
}) => {
  const { t, i18n } = useTranslation();
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectionMode, setSelectionMode] = useState("start"); // "start" or "end"
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  
  // Update the selected dates when the modal opens
  useEffect(() => {
    if (isOpen) {
      // If we have dates in the current range, use them
      if (currentRange.startDate) {
        setSelectedStartDate(new Date(currentRange.startDate));
      } else {
        setSelectedStartDate(null);
      }
      
      if (currentRange.endDate) {
        setSelectedEndDate(new Date(currentRange.endDate));
      } else {
        setSelectedEndDate(null);
      }
      
      // Set selection mode based on what's already selected
      if (currentRange.startDate && !currentRange.endDate) {
        setSelectionMode("end");
      } else {
        setSelectionMode("start");
      }
      
      // Set the calendar to show the current month/year
      const today = new Date();
      setSelectedMonth(today.getMonth());
      setSelectedYear(today.getFullYear());
    }
  }, [isOpen, currentRange]);
  
  // Get month name based on current language
  const getMonthName = (monthIndex) => {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleString(i18n.language, { month: 'long' });
  };
  
  // Generate days for the current month/year
  const getDaysInMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Adjust for Sunday as first day of week
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    
    // Add previous month days
    for (let i = 0; i < adjustedFirstDay; i++) {
      const prevMonthDay = new Date(year, month, 0 - i).getDate();
      days.unshift({
        day: prevMonthDay,
        current: false,
        date: new Date(year, month - 1, prevMonthDay)
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        day: i,
        current: true,
        date: currentDate,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isStartDate: selectedStartDate && currentDate.toDateString() === selectedStartDate.toDateString(),
        isEndDate: selectedEndDate && currentDate.toDateString() === selectedEndDate.toDateString(),
        isInRange: isDateInRange(currentDate, selectedStartDate, selectedEndDate)
      });
    }
    
    // Add next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        current: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };
  
  // Check if a date is within the selected range
  const isDateInRange = (date, start, end) => {
    if (!start || !end) return false;
    return date > start && date < end;
  };
  
  const days = getDaysInMonth(selectedYear, selectedMonth);
  
  // Get day names based on current language
  const getDayNames = () => {
    const days = [];
    const date = new Date(2021, 0, 3); // Start with Sunday
    
    for (let i = 0; i < 7; i++) {
      days.push(date.toLocaleString(i18n.language, { weekday: 'short' }));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };
  
  const dayNames = getDayNames();
  
  // Handle date selection
  const handleDateSelect = (date) => {
    if (selectionMode === "start") {
      setSelectedStartDate(date);
      setSelectionMode("end");
      
      // If end date exists and is before the new start date, clear it
      if (selectedEndDate && date > selectedEndDate) {
        setSelectedEndDate(null);
      }
    } else {
      // Ensure end date is not before start date
      if (selectedStartDate && date < selectedStartDate) {
        // If user selects a date before start date, swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
      
      // Both dates are now selected, prepare to apply
      if (selectedStartDate) {
        // Wait a moment to show the selection before closing
        setTimeout(() => {
          applyDateRange(selectedStartDate, date);
        }, 300);
      }
    }
  };
  
  // Apply the selected date range
  const applyDateRange = (start, end) => {
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };
    
    onConfirm({
      startDate: formatDate(start),
      endDate: formatDate(end)
    });
    
    onClose();
  };
  

  
  // Handle month selection
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setShowMonthSelector(false);
  };
  
  // Handle year selection
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearSelector(false);
  };
  

  
  // Apply current selection
  const handleApply = () => {
    if (selectedStartDate) {
      const formatDate = (date) => {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };
      
      onConfirm({
        startDate: formatDate(selectedStartDate),
        endDate: selectedEndDate ? formatDate(selectedEndDate) : ""
      });
      
      onClose();
    }
  };
  
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-1 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-3 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {t("selectDateRange")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
       
        
        {/* Month/Year Navigation */}
        <div className="relative mb-6">
          <div className="flex justify-between items-center">
            <div className="flex w-full gap-2">
              {/* Month Selector */}
              <button
                onClick={() => {
                  setShowMonthSelector(!showMonthSelector);
                  setShowYearSelector(false);
                }}
                className="w-1/2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-800 flex items-center justify-center gap-1 sm:gap-2 md:gap-3"
              >
                {getMonthName(selectedMonth)}
                <FiChevronDown className={`transition-transform ${showMonthSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Year Selector */}
              <button
                onClick={() => {
                  setShowYearSelector(!showYearSelector);
                  setShowMonthSelector(false);
                }}
                className="w-1/2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-800 flex items-center justify-center gap-1 sm:gap-2 md:gap-3"
              >
                {selectedYear}
                <FiChevronDown className={`transition-transform ${showYearSelector ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Month Selector Dropdown */}
          {showMonthSelector && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-2">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleMonthSelect(i)}
                    className={`p-2 rounded-lg text-sm ${
                      selectedMonth === i 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {getMonthName(i)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Year Selector Dropdown */}
          {showYearSelector && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-2">
              <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                {Array.from({ length: 20 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleYearSelect(new Date().getFullYear() - 10 + i)}
                    className={`p-2 rounded-lg text-sm ${
                      selectedYear === new Date().getFullYear() - 10 + i
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {new Date().getFullYear() - 10 + i}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Selection Mode Indicator */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setSelectionMode("start")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectionMode === "start" 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t("from")}
            </button>
            <button
              onClick={() => setSelectionMode("end")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectionMode === "end" 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t("to")}
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="mb-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, index) => (
              <div key={index} className="text-center text-gray-500 font-medium text-xs">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day.current && handleDateSelect(day.date)}
                className={`
                  h-9 w-full rounded-lg flex items-center justify-center text-sm
                  ${!day.current ? 'text-gray-400' : 
                    day.isStartDate ? 'bg-blue-500 text-white font-medium' : 
                    day.isEndDate ? 'bg-blue-500 text-white font-medium' : 
                    day.isInRange ? 'bg-blue-100 text-blue-800' : 
                    'hover:bg-blue-50 text-gray-700'}
                  ${day.isToday && !day.isStartDate && !day.isEndDate ? 'font-bold ring-1 ring-blue-300' : ''}
                  ${day.current ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedStartDate}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
              selectedStartDate ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {t("apply")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DatePickerModal; 