import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: {
    name: "",
    email: "",
    image: "",
    isAuthenticated: false,
    hasSubscription: false,
  },
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    setAuthenticated: (state, action) => {
      state.userData.isAuthenticated = action.payload;
    },
    clearUserData: (state) => {
      state.userData = initialState.userData;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateProfile: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    setSubscription: (state, action) => {
      state.userData.hasSubscription = action.payload;
    },
  },
});

export const {
  setUserData,
  setAuthenticated,
  clearUserData,
  setLoading,
  setError,
  updateProfile,
  setSubscription,
} = profileSlice.actions;

export default profileSlice.reducer;
