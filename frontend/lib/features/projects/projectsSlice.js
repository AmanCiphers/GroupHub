import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      return await api.listProjects(params)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (payload, { getState, rejectWithValue }) => {
    try {
      return await api.createProject(payload, getState().auth.csrfToken)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  projects: [],
  total: 0,
  page: 1,
  pages: 1,
  status: 'idle',
  createStatus: 'idle',
  error: null,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'idle'
        state.projects = action.payload.projects
        state.total = action.payload.total
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload || 'Failed to load projects.'
      })
      .addCase(createProject.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.createStatus = 'idle'
        state.projects = [action.payload.project, ...state.projects]
        state.total += 1
      })
      .addCase(createProject.rejected, (state, action) => {
        state.createStatus = 'error'
        state.error = action.payload || 'Failed to create project.'
      })
  },
})

export const { clearError } = projectsSlice.actions
export default projectsSlice.reducer