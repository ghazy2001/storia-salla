import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sallaService from "../../services/sallaService";

export const fetchCustomerFromSalla = createAsyncThunk(
  "user/fetchCustomer",
  async (_, { rejectWithValue }) => {
    try {
      const customer = await sallaService.fetchCustomer();
      return customer;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  customer: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearCustomer: (state) => {
      state.customer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerFromSalla.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerFromSalla.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(fetchCustomerFromSalla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomer } = userSlice.actions;

export const selectCustomer = (state) => state.user.customer;
export const selectUserLoading = (state) => state.user.loading;

export default userSlice.reducer;
