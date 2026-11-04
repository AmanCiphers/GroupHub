import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue, signal }) => {
    try {
      return await api.getDashboard(signal)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  data: null,
  status: 'idle',
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'idle'
        state.data = action.payload
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'error'
        state.error = action.payload || 'Failed to load dashboard.'
      })
  },
})

export const { resetDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
