// src/components/Toast/ToastContainer.tsx
import React from 'react'
import { Toast } from './Toast'
import type { ToastType } from './Toast'


interface ToastItem {
  id: number
  message: string
  subMessage?: string
  type: ToastType
}

export const Toastify: React.FC<{
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}> = ({ toasts, onDismiss }) => {
  return (
    <div className='fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none'>
      {toasts.map(t => (
        <div key={t.id} className='pointer-events-auto'>
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
