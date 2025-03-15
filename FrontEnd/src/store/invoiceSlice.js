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

// Add a new function to check if an invoice exists
export const checkInvoiceExists = createAsyncThunk(
  "invoices/checkInvoiceExists",
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.get(`${API_BASE_URL}/invoices/check/${invoiceNumber}`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      
      return response.data;
    } catch (error) {
      // If it's a 404, it means the invoice doesn't exist
      if (error.response?.status === 404) {
        return { exists: false };
      }
      
      return { 
        exists: error.response?.status === 409, 
        invoice: error.response?.data?.invoice 
      };
    }
  }
);

// Add a function to check if an invoice exists on the server
export const checkInvoiceExistsOnServer = createAsyncThunk(
  "invoices/checkInvoiceExistsOnServer",
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.get(`${API_BASE_URL}/invoices/check/${invoiceNumber}`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      
      return {
        exists: true,
        invoice: response.data.invoice
      };
    } catch (error) {
      // If it's a 404, it means the invoice doesn't exist
      if (error.response?.status === 404) {
        return { exists: false };
      }
      
      return rejectWithValue(
        error.response?.data?.message || "Failed to check invoice"
      );
    }
  }
);

// Modify the createInvoice thunk to handle both create and update
export const createInvoice = createAsyncThunk(
  "invoices/createInvoice",
  async (invoiceData, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Check if invoice with this number already exists
      const existingInvoices = getState().main.invoice.invoiceHistory;
      const existingInvoice = existingInvoices.find(
        inv => inv.invoice_number === invoiceData.invoice_number || 
              inv.invoiceNumber === invoiceData.invoice_number
      );

      let response;
      
      if (existingInvoice) {
        // If it exists, update it
        const invoiceId = existingInvoice._id || existingInvoice.id;
        response = await axios.put(
          `${API_BASE_URL}/invoices/${invoiceId}`,
          invoiceData,
          {
            headers: {
              token: token,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // If it doesn't exist, create a new one
        response = await axios.post(
          `${API_BASE_URL}/invoices`,
          invoiceData,
          {
            headers: {
              token: token,
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      // Make sure we're returning the correct data structure
      return response.data.invoice || response.data;
    } catch (error) {
      console.error('Create invoice error:', error.response?.data || error);
      
      // If we get a 409 Conflict (duplicate invoice number), generate a new number and try again
      if (error.response?.status === 409) {
        // Generate a new invoice number
        dispatch(generateInvoiceNumber());
        return rejectWithValue("Invoice number already exists. A new number has been generated.");
      }
      
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

// Update the getNextInvoiceNumber thunk to start from #001 if no invoices exist
export const getNextInvoiceNumber = createAsyncThunk(
  "invoices/getNextInvoiceNumber",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Get the current invoice history from state
      const invoiceHistory = getState().main.invoice.invoiceHistory;
      
      // If there are no invoices in history, start from #001
      if (!invoiceHistory || invoiceHistory.length === 0) {
        return "#001";
      }

      // Otherwise, get the next number from the backend
      const response = await axios.get(`${API_BASE_URL}/invoices/next-number`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      
      return response.data.nextInvoiceNumber;
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      
      // If there's an error, generate a number locally based on existing invoices
      const invoiceHistory = getState().main.invoice.invoiceHistory;
      
      if (!invoiceHistory || invoiceHistory.length === 0) {
        return "#001"; // Start from #001 if no invoices exist
      }
      
      // Find the highest invoice number
      let highestNumber = 0;
      
      invoiceHistory.forEach(invoice => {
        const invoiceNum = invoice.invoice_number || invoice.invoiceNumber;
        if (invoiceNum) {
          const match = invoiceNum.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > highestNumber) {
              highestNumber = num;
            }
          }
        }
      });
      
      // Return the next number
      return `#${(highestNumber + 1).toString().padStart(3, '0')}`;
    }
  }
);

// Add this function to get the saved invoice type from localStorage
const getSavedInvoiceType = () => {
  try {
    const savedType = localStorage.getItem('invoiceType');
    return savedType || 'complete'; // Default to 'complete' if not found
  } catch (error) {
    console.error('Error reading invoice type from localStorage:', error);
    return 'complete';
  }
};

// Update the initialState to have only one item in the items array
const initialState = {
  invoice: {
    invoiceNumber: "",
    items: [
      {
        id: Date.now(),
        name: "",
        description: "",
        quantity: 1,
        price: 0,
      }
    ], // Initialize with just one empty item
    tax: 0,
    discount: 0,
    privacy: "",
    notes: "",
    invoiceHistory: [],
    dailyCounter: 1,
    lastInvoiceDate: null,
    type: getSavedInvoiceType(), // Use the saved type or default
  },
  status: "idle",
  error: null,
};

// Helper function to generate unique ID
// const generateUniqueId = () =>
//   `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Update the generateNewInvoiceNumber function to check existing invoices
const generateNewInvoiceNumber = (lastDate, counter, invoiceHistory = []) => {
  // If there are no invoices, start from #001
  if (!invoiceHistory || invoiceHistory.length === 0) {
    return {
      invoiceNumber: "#001",
      newCounter: 1,
      newDate: new Date().toISOString()
    };
  }
  
  // Get the highest invoice number from history and increment
  let highestNumber = counter || 0;
  
  invoiceHistory.forEach(invoice => {
    const invoiceNum = invoice.invoice_number || invoice.invoiceNumber;
    if (invoiceNum) {
      const match = invoiceNum.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    }
  });
  
  const nextNumber = highestNumber + 1;
  
  // Simple format: #001, #002, etc.
  return {
    invoiceNumber: `#${nextNumber.toString().padStart(3, "0")}`,
    newCounter: nextNumber,
    newDate: new Date().toISOString()
  };
};

// Update the generateInvoiceNumber reducer to use the invoice history
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
        state.invoice.dailyCounter || 1,
        state.invoice.invoiceHistory
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
      // Save to localStorage
      try {
        localStorage.setItem('invoiceType', action.payload);
      } catch (error) {
        console.error('Error saving invoice type to localStorage:', error);
      }
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
      })
      // Get next invoice number cases
      .addCase(getNextInvoiceNumber.fulfilled, (state, action) => {
        if (action.payload) {
          state.invoice.invoiceNumber = action.payload;
          // Extract the number part for the counter
          const numberMatch = action.payload.match(/\d+/);
          if (numberMatch) {
            state.invoice.dailyCounter = parseInt(numberMatch[0], 10);
          }
          state.invoice.lastInvoiceDate = new Date().toISOString();
        } else {
          // Fallback to local generation if API fails
          const { invoiceNumber, newCounter, newDate } = generateNewInvoiceNumber(
            state.invoice.lastInvoiceDate,
            state.invoice.dailyCounter || 1,
            state.invoice.invoiceHistory
          );
          state.invoice.invoiceNumber = invoiceNumber;
          state.invoice.dailyCounter = newCounter;
          state.invoice.lastInvoiceDate = newDate;
        }
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
