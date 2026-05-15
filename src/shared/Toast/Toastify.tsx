// src/components/Toast/ToastContainer.tsx
import React from 'react'
import { Toast } from './Toast'
import type { ToastType } from './Toast'


interface ToastItem {
  id: number
  message: string
  subMessage?: string
  type: ToastType
  centered?: boolean // 👈 Add this line
}


export const Toastify: React.FC<{
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}> = ({ toasts, onDismiss }) => {
  const cornerToasts = toasts.filter(t => !t.centered)
  const centeredToasts = toasts.filter(t => t.centered)

  return (
    <>
      {/* CORNER TOASTS (TOP RIGHT) */}
      <div className='fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none'>
        {cornerToasts.map(t => (
          <div key={t.id} className='pointer-events-auto'>
            <Toast {...t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>

      {/* GLOBAL STATUS NOTICES (TOP CENTER PILL) */}
      <div className='fixed top-8 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-3 items-center pointer-events-none'>
        {centeredToasts.map(t => (
          <div key={t.id} className='pointer-events-auto'>
            <Toast {...t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  )
}
