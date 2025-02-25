import { createSlice, createAction } from "@reduxjs/toolkit";

const generateInitialInvoiceNumber = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${dateStr}-001`;
};

const initialState = {
  sender: {
    name: "",
    phone: "",
    email: "",
    address: "",
  },
  recipient: {
    name: "",
    phone: "",
    email: "",
    address: "",
  },
  invoice: {
    items: [{ id: 1, name: "", description: "", quantity: 1, price: 0 }],
    invoiceNumber: generateInitialInvoiceNumber(),
    invoiceHistory: [],
    lastInvoiceDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    dailyCounter: 1,
  },
};

// Helper function to generate unique ID
const generateUniqueId = () =>
  `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateNewInvoiceNumber = (lastDate, counter) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Reset counter if it's a new day
  if (lastDate !== dateStr) {
    counter = 1;
  } else {
    counter += 1;
  }

  // Format: INV-YYYYMMDD-SEQUENCE (e.g., INV-20231125-001)
  return {
    invoiceNumber: `INV-${dateStr}-${counter.toString().padStart(3, "0")}`,
    newCounter: counter,
    newDate: dateStr,
  };
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    updateSender: (state, action) => {
      const { field, value } = action.payload;
      state.sender[field] = value;
    },
    updateRecipient: (state, action) => {
      const { field, value } = action.payload;
      state.recipient[field] = value;
    },
    setInvoiceNumber: (state, action) => {
      state.invoice.invoiceNumber = action.payload;
    },
    addItem: (state) => {
      state.invoice.items.push({
        id: state.invoice.items.length + 1,
        name: "",
        description: "",
        quantity: 1,
        price: 0,
      });
    },
    removeItem: (state, action) => {
      state.invoice.items = state.invoice.items.filter(
        (item) => item.id !== action.payload
      );
    },
    updateItem: (state, action) => {
      const { id, field, value } = action.payload;
      const item = state.invoice.items.find((item) => item.id === id);
      if (item) {
        item[field] = value;
      }
    },
    updateBusinessInfo: (state, action) => {
      const { field, value } = action.payload;
      state.invoice[field] = value;
    },
    saveToHistory: (state, action) => {
      const currentDate = new Date().toISOString();
      const existingIndex = state.invoice.invoiceHistory.findIndex(
        (inv) => inv.invoiceNumber === action.payload.invoiceNumber
      );

      const invoiceData = {
        ...action.payload,
        date: currentDate,
      };

      if (existingIndex >= 0) {
        state.invoice.invoiceHistory[existingIndex] = {
          ...invoiceData,
          id: state.invoice.invoiceHistory[existingIndex].id,
          createdAt: state.invoice.invoiceHistory[existingIndex].createdAt,
          updatedAt: currentDate,
        };
      } else {
        state.invoice.invoiceHistory.push({
          ...invoiceData,
          id: generateUniqueId(),
          createdAt: currentDate,
          updatedAt: currentDate,
        });
      }
    },
    updateInvoice: (state, action) => {
      const index = state.invoice.invoiceHistory.findIndex(
        (inv) => inv.id === action.payload.id
      );
      if (index !== -1) {
        state.invoice.invoiceHistory[index] = action.payload;
      }
    },
    deleteInvoice: (state, action) => {
      state.invoice.invoiceHistory = state.invoice.invoiceHistory.filter(
        (inv) => inv.id !== action.payload
      );
    },
    generateInvoiceNumber: (state) => {
      const { invoiceNumber, newCounter, newDate } = generateNewInvoiceNumber(
        state.invoice.lastInvoiceDate,
        state.invoice.dailyCounter
      );
      state.invoice.invoiceNumber = invoiceNumber;
      state.invoice.dailyCounter = newCounter;
      state.invoice.lastInvoiceDate = newDate;
    },
    resetInvoice: (state) => {
      state.invoice.items = [
        {
          id: Date.now(),
          name: "",
          description: "",
          quantity: 1,
          price: 0,
        },
      ];
      state.sender = initialState.sender;
      state.recipient = initialState.recipient;
    },
  },
});

export const {
  updateSender,
  updateRecipient,
  setInvoiceNumber,
  addItem,
  removeItem,
  updateItem,
  updateBusinessInfo,
  saveToHistory,
  updateInvoice,
  deleteInvoice,
  generateInvoiceNumber,
  resetInvoice,
} = mainSlice.actions;

export default mainSlice.reducer;
