import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  logo: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  // userid: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    updateCompany: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetCompany: (state) => {
      return initialState;
    },
  },
});

export const { updateCompany, resetCompany } = companySlice.actions;
export default companySlice.reducer;
