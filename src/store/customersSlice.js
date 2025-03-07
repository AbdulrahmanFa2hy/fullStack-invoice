import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customers: [],
  selectedCustomerId: null,
  // userid: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    addCustomer: (state, action) => {
      const newCustomer = {
        ...action.payload,
        id: Date.now().toString(), // Generate unique ID
      };
      state.customers.push(newCustomer);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(
        (customer) => customer.id === action.payload.id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(
        (customer) => customer.id !== action.payload
      );
    },
    setSelectedCustomerId: (state, action) => {
      state.selectedCustomerId = action.payload;
    },
  },
});

export const {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomerId,
} = customersSlice.actions;

export default customersSlice.reducer;
