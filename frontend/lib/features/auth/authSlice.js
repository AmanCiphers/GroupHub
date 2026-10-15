import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials, { rejectWithValue }) => {
    try {
      return await api.register(credentials)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      return await api.login(credentials)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      await api.logout(getState().auth.csrfToken)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getMe()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  user: null,
  csrfToken: null,
  status: 'idle',
  initialized: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload || 'Registration failed.'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
        state.csrfToken = action.payload.csrfToken
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload || 'Login failed.'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.csrfToken = null
        state.status = 'idle'
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null
        state.csrfToken = null
        state.status = 'idle'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.csrfToken = action.payload.csrfToken
        state.status = 'authenticated'
        state.initialized = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
        state.csrfToken = null
        state.status = 'idle'
        state.initialized = true
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
