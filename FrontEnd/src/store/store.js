import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./invoiceSlice";
import customersReducer from "./customersSlice";
import profileReducer from "./profileSlice";
import companyReducer from "./companySlice";
import productReducer from "./productSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    customers: customersReducer,
    profile: profileReducer,
    company: companyReducer,
    products: productReducer,
  },
});
