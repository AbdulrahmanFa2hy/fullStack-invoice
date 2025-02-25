import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./mainSlice";
import customersReducer from "./customersSlice";
import profileReducer from "./profileSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    customers: customersReducer,
    profile: profileReducer,
  },
});
