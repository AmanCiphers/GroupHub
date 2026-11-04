import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/lib/features/auth/authSlice'
import projectsReducer from '@/lib/features/projects/projectsSlice'
import dashboardReducer from '@/lib/features/dashboard/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    dashboard: dashboardReducer,
  },
})
