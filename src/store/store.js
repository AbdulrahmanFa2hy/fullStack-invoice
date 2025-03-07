import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./invoiceSlice";
import customersReducer from "./customersSlice";
import profileReducer from "./profileSlice";
import companyReducer from "./companySlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    customers: customersReducer,
    profile: profileReducer,
    company: companyReducer,
  },
});
