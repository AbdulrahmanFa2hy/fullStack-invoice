import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "profile/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/signup",
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for signin
export const signinUser = createAsyncThunk(
  "profile/signin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/signin",
        credentials
      );
      // Store the token in localStorage
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  "profile/fetchUserData",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await axios.get(
        `http://localhost:3000/api/v1/users/${userId}`,
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.message === "No token found") {
        return rejectWithValue({ message: "Please login again" });
      }
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk for updating user data
export const updateUserData = createAsyncThunk(
  "profile/updateUserData",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await axios.put(
        `http://localhost:3000/api/v1/users/${userId}`,
        userData,
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.message === "No token found") {
        return rejectWithValue({ message: "Please login again" });
      }
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk for deleting user
export const deleteUser = createAsyncThunk(
  "profile/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      await axios.delete(`http://localhost:3000/api/v1/users/${userId}`, {
        headers: {
          token: token,
        },
      });
      return userId;
    } catch (error) {
      if (error.message === "No token found") {
        return rejectWithValue({ message: "Please login again" });
      }
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Check authentication status
export const checkAuth = createAsyncThunk(
  "profile/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(
        "http://localhost:3000/api/v1/auth/verify",
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

const initialState = {
  userData: {
    name: "",
    email: "",
    isAuthenticated: false,
    id: null,
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
      localStorage.removeItem("token");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Signup reducers
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signin reducers
      .addCase(signinUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signinUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isUserExist && action.payload.isUserExist._id) {
          state.userData = {
            ...state.userData,
            ...action.payload.isUserExist,
            id: action.payload.isUserExist._id,
            isAuthenticated: true,
          };
        }
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user data reducers
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user && action.payload.user._id) {
          state.userData = {
            ...state.userData,
            ...action.payload.user,
            id: action.payload.user._id,
            isAuthenticated: true,
          };
        }
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload?.message === "Please login again") {
          state.userData.isAuthenticated = false;
        }
      })
      // Update user data reducers
      .addCase(updateUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.User && action.payload.User._id) {
          state.userData = {
            ...state.userData,
            ...action.payload.User,
            id: action.payload.User._id,
            isAuthenticated: true,
          };
        }
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user reducers
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        state.userData = initialState.userData;
        localStorage.removeItem("token");
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add checkAuth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user && action.payload.user._id) {
          state.userData = {
            ...state.userData,
            ...action.payload.user,
            id: action.payload.user._id,
            isAuthenticated: true,
          };
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userData = initialState.userData;
      });
  },
});

export const {
  setUserData,
  setAuthenticated,
  clearUserData,
  setLoading,
  setError,
} = profileSlice.actions;

export default profileSlice.reducer;
