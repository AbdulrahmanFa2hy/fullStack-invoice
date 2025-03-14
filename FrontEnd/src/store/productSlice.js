import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Async thunk for fetching all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getState().profile.userData?.id;
      const token = localStorage.getItem("token");
      
      if (!userId) {
        return rejectWithValue("User ID not found");
      }
      
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      console.log(`Fetching products for user: ${userId}`);
      
      const response = await axios.get(`${API_BASE_URL}/products/user/${userId}`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      
      console.log("Products response:", response.data);
      return response.data.products || [];
    } catch (error) {
      console.error("Error in fetchProducts:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch products"
      );
    }
  }
);

// Async thunk for adding a product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { getState, rejectWithValue }) => {
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
        `${API_BASE_URL}/products`,
        {
          name: productData.name,
          description: productData.description,
          quantity: productData.quantity,
          price: productData.price,
          user_id: userId,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk for updating a product
export const updateProductThunk = createAsyncThunk(
  "products/updateProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Authentication token is required" });
      }

      const response = await axios.put(
        `${API_BASE_URL}/products/${productData._id}`,
        {
          name: productData.name,
          description: productData.description,
          quantity: productData.quantity,
          price: productData.price,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk for deleting a product
export const deleteProductThunk = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Authentication token is required" });
      }

      await axios.delete(
        `${API_BASE_URL}/products/${productId}`,
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Initial state
const initialState = {
  products: [],
  selectedProductId: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Create the product slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedProductId: (state, action) => {
      state.selectedProductId = action.payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products cases
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload || [];
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add product cases
      .addCase(addProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products.push(action.payload);
        state.error = null;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update product cases
      .addCase(updateProductThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete product cases
      .addCase(deleteProductThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setSelectedProductId, clearProductError } = productSlice.actions;

export default productSlice.reducer; 