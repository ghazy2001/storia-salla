import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sallaService from "../../services/sallaService";

export const fetchOrders = createAsyncThunk(
  "dashboard/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await sallaService.fetchOrders();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "dashboard/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await sallaService.deleteOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAnalytics = createAsyncThunk(
  "dashboard/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await sallaService.fetchAnalytics();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  orders: [],
  analytics: {
    kpis: {
      totalSales: 0,
      ordersCount: 0,
      customersCount: 0,
      averageOrderValue: 0,
    },
    dailySales: [],
    topProducts: [],
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (o) => (o._id || o.id) !== action.payload,
        );
      })
      // Analytics
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        if (action.payload) {
          state.analytics = action.payload;
        }
      });
  },
});

export const selectOrders = (state) => state.dashboard.orders;
export const selectAnalytics = (state) => state.dashboard.analytics;
export const selectDashboardLoading = (state) => state.dashboard.loading;

export default dashboardSlice.reducer;
