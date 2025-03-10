import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Add Customer Thunk
export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (customerData, { getState, rejectWithValue }) => {
    try {
      const userId = getState().profile.userData?.id;
      const token = localStorage.getItem("token");

      if (!userId) {
        return rejectWithValue({ message: "User ID not found" });
      }

      if (!token) {
        return rejectWithValue({ message: "Authentication token is required" });
      }

      const response = await axios.post(
        "http://localhost:3000/api/v1/customers",
        {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          user_id: userId,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict specifically
      if (error.response && error.response.status === 409) {
        return rejectWithValue({ 
          message: "Customer already exists", 
          code: "DUPLICATE_CUSTOMER" 
        });
      }
      
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Update Customer Thunk
export const updateCustomerThunk = createAsyncThunk(
  "customers/updateCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Authentication token is required" });
      }

      const response = await axios.put(
        `http://localhost:3000/api/v1/customers/${customerData._id}`,
        {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Delete Customer Thunk
export const deleteCustomerThunk = createAsyncThunk(
  "customers/deleteCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Authentication token is required" });
      }

      await axios.delete(
        `http://localhost:3000/api/v1/customers/${customerId}`,
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return customerId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Fetch Customers Thunk
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.profile.userData?.id;
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/customers/${userId}`,
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Return empty array for 404 (no customers found)
          return [];
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch customers");
      }

      const data = await response.json();
      
      // Check if data is an object with a customers property
      if (data && typeof data === 'object' && data.customers) {
        return Array.isArray(data.customers) ? data.customers : [];
      }
      
      // Otherwise, check if data itself is an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  customers: [],
  selectedCustomerId: null,
  status: "idle",
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setSelectedCustomerId: (state, action) => {
      state.selectedCustomerId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Customer cases
      .addCase(addCustomer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers.push(action.payload.customer);
        state.error = null;
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Customer cases
      .addCase(updateCustomerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCustomerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.customers.findIndex(
          (customer) => customer._id === action.payload._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCustomerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Customer cases
      .addCase(deleteCustomerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteCustomerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Customers cases
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload || [];
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setSelectedCustomerId } = customersSlice.actions;

export default customersSlice.reducer;
