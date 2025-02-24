import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./mainSlice";
import customersReducer from "./customersSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    customers: customersReducer,
  },
});
