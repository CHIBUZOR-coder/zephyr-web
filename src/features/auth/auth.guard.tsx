import { Navigate, Outlet } from 'react-router-dom'
import {  useAuthStore } from './auth.store'
import { useAuthReady } from './useAuthReady'

export default function AuthGuard () {
  const authReady = useAuthReady()
  const authenticated = useAuthStore(s => s.authenticated)

  // ⏳ WAIT for Zustand rehydration
  if (!authReady) {
    return (
      <div className='min-h-screen flex items-center justify-center text-white'>
        Restoring session…
      </div>
    )
  }

  // 🔒 NOT authenticated → go to PUBLIC page
  if (!authenticated) {
    return <Navigate to='/wallet' replace />
  }

  // ✅ ALLOW ACCESS
  return <Outlet />
}
