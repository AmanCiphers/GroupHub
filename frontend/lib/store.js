import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/lib/features/auth/authSlice'
import projectsReducer from '@/lib/features/projects/projectsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
  },
})
