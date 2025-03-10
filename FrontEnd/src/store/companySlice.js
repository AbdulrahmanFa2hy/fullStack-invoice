import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";
const UPLOAD_BASE_URL = "http://localhost:3000/uploads";

// Configure axios defaults
axios.defaults.headers.common["Content-Type"] = "application/json";

// Helper function to convert base64 to file
const base64ToFile = async (base64String, filename = "logo.png") => {
  if (!base64String) return null;
  const response = await fetch(base64String);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

// Helper function to format logo URL
const formatLogoUrl = (logoPath) => {
  if (!logoPath) return "";
  if (logoPath.startsWith("http")) return logoPath;
  return `${UPLOAD_BASE_URL}/${logoPath}`;
};

// Helper function to format company data for API
const formatCompanyData = async (data) => {
  const formData = new FormData();

  // Add basic fields
  formData.append("name", data.name || "");
  formData.append("email", data.email || "");
  formData.append("phone", data.phone || "");
  formData.append("address", data.address || "");

  // Handle logo
  if (data.logo) {
    const logoFile = await base64ToFile(data.logo);
    if (logoFile) {
      formData.append("logo", logoFile);
    }
  }

  return formData;
};

// Thunk action to fetch company by user ID
export const fetchCompanyByUserId = createAsyncThunk(
  "company/fetchByUserId",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/companies`, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Thunk action to save company (create or update)
export const saveCompany = createAsyncThunk(
  "company/save",
  async (companyData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = await formatCompanyData(companyData);
      const state = getState();
      const isNewCompany = !state.company.exists;
      let response;

      if (isNewCompany) {
        response = await axios.post(`${API_BASE_URL}/companies`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
        });
      } else {
        response = await axios.put(`${API_BASE_URL}/companies`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
        });
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  logo: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  exists: false,
  status: "idle",
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    updateCompany: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetCompany: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyByUserId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCompanyByUserId.fulfilled, (state, action) => {
        if (action.payload === null) {
          Object.assign(state, { ...initialState, status: "succeeded" });
        } else {
          const companyData = action.payload.company;
          Object.assign(state, {
            ...companyData,
            logo: formatLogoUrl(companyData.logo),
            exists: true,
            status: "succeeded",
            error: null,
          });
        }
      })
      .addCase(fetchCompanyByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch company";
      })
      .addCase(saveCompany.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveCompany.fulfilled, (state, action) => {
        const companyData = action.payload.company;
        Object.assign(state, {
          ...companyData,
          logo: formatLogoUrl(companyData.logo),
          exists: true,
          status: "succeeded",
          error: null,
        });
      })
      .addCase(saveCompany.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save company";
      });
  },
});

export const { updateCompany, resetCompany } = companySlice.actions;
export default companySlice.reducer;
