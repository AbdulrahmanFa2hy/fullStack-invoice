import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Async thunk for fetching invoices
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      console.log('Fetching invoices for userId:', userId);
      console.log('URL:', `${API_BASE_URL}/invoices/user/${userId}`);

      const response = await axios.get(`${API_BASE_URL}/invoices/user/${userId}`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      
      console.log('Response:', response.data);
      
      // Make sure we're returning the populated data
      return response.data.invoices;

    } catch (error) {
      // If it's a 404, return empty array instead of rejecting
      if (error.response?.status === 404) {
        console.log('No invoices found, returning empty array');
        return [];
      }
      
      console.error('Error fetching invoices:', error.response || error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch invoices"
      );
    }
  }
);

// Async thunk for creating invoice
export const createInvoice = createAsyncThunk(
  "invoices/createInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.post(
        `${API_BASE_URL}/invoices`,
        invoiceData,
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Make sure we're returning the correct data structure
      return response.data.invoice || response.data; // Handle both possible response formats
    } catch (error) {
      console.error('Create invoice error:', error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create invoice"
      );
    }
  }
);

// Async thunk for updating invoice
export const updateInvoiceThunk = createAsyncThunk(
  "invoices/updateInvoice",
  async ({ id, invoiceData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.put(
        `${API_BASE_URL}/invoices/${id}`,
        invoiceData,
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data.invoice;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update invoice"
      );
    }
  }
);

// Async thunk for deleting invoice
export const deleteInvoiceThunk = createAsyncThunk(
  "invoices/deleteInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      await axios.delete(`${API_BASE_URL}/invoices/${id}`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete invoice"
      );
    }
  }
);



const initialState = {
  invoice: {
    items: [
      {
        id: Date.now(),
        name: "",
        description: "",
        quantity: 1,
        price: 0,
      },
    ],
    invoiceNumber: "",
    invoiceHistory: [],
    tax: 0,
    discount: 0,
    privacy: "",
    notes: "",
    type: "complete",
    dailyCounter: 1,
    lastInvoiceDate: null,
  },
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Helper function to generate unique ID
// const generateUniqueId = () =>
//   `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateNewInvoiceNumber = (lastDate, counter) => {
  // Get the highest invoice number from history and increment
  const highestNumber = counter || 0;
  const nextNumber = highestNumber + 1;
  
  // Simple format: #001, #002, etc.
  return {
    invoiceNumber: `#${nextNumber.toString().padStart(3, "0")}`,
    newCounter: nextNumber,
    newDate: new Date().toISOString()
  };
};

const invoiceSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setInvoiceNumber: (state, action) => {
      state.invoice.invoiceNumber = action.payload;
    },
    addItem: (state) => {
      state.invoice.items.push({
        id: Date.now() + Math.random(), // Ensure uniqueness even if added in the same millisecond
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
    saveToHistory: (state, action) => {
      const currentDate = new Date().toISOString();
      const existingInvoiceIndex = state.invoice.invoiceHistory.findIndex(
        (inv) => inv.id === action.payload.id
      );

      if (existingInvoiceIndex !== -1) {
        // Update existing invoice
        state.invoice.invoiceHistory[existingInvoiceIndex] = {
          ...action.payload,
          updatedAt: currentDate,
          // Ensure customer data is preserved
          customer: action.payload.customer || {},
        };
      } else {
        // Add new invoice
        state.invoice.invoiceHistory.push({
          ...action.payload,
          date: currentDate,
          // Ensure customer data is preserved
          customer: action.payload.customer || {},
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
        state.invoice.dailyCounter || 1
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
      state.invoice.tax = 0;
      state.invoice.discount = 0;
      state.invoice.privacy = "";
      state.invoice.notes = "";
    },
    setInvoiceType: (state, action) => {
      state.invoice.type = action.payload;
    },
    updateTax: (state, action) => {
      state.invoice.tax = action.payload;
    },
    updateDiscount: (state, action) => {
      state.invoice.discount = action.payload;
    },
    updatePrivacy: (state, action) => {
      state.invoice.privacy = action.payload;
    },
    updateNotes: (state, action) => {
      state.invoice.notes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoice.invoiceHistory = action.payload || [];
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.invoice.invoiceHistory = [];
      })
      // Create invoice cases
      .addCase(createInvoice.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Initialize the array if it doesn't exist
        if (!state.invoice.invoiceHistory) {
          state.invoice.invoiceHistory = [];
        }
        // Add the new invoice
        state.invoice.invoiceHistory.push(action.payload);
        state.error = null;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update invoice cases
      .addCase(updateInvoiceThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateInvoiceThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.invoice.invoiceHistory.findIndex(
          (inv) => inv._id === action.payload._id
        );
        if (index !== -1) {
          state.invoice.invoiceHistory[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInvoiceThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete invoice cases
      .addCase(deleteInvoiceThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteInvoiceThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoice.invoiceHistory = state.invoice.invoiceHistory.filter(
          (inv) => inv._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteInvoiceThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setInvoiceNumber,
  addItem,
  removeItem,
  updateItem,
  saveToHistory,
  updateInvoice,
  deleteInvoice,
  generateInvoiceNumber,
  resetInvoice,
  setInvoiceType,
  updateTax,
  updateDiscount,
  updatePrivacy,
  updateNotes,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
