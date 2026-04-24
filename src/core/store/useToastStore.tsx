import { create } from 'zustand'
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo } from 'react-icons/fi'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    
    const duration = toast.duration || 4000
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

// Alert helpers - import and use these in any component
// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  success: (message: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'success', message, duration }),
  error: (message: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'error', message, duration }),
  warning: (message: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'warning', message, duration }),
  info: (message: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'info', message, duration }),
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success': return <FiCheckCircle className="text-green-400" />
    case 'error': return <FiXCircle className="text-red-400" />
    case 'warning': return <FiAlertTriangle className="text-yellow-400" />
    case 'info': return <FiInfo className="text-blue-400" />
  }
}

const getStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'bg-green-900/90 border-green-500'
    case 'error': return 'bg-red-900/90 border-red-500'
    case 'warning': return 'bg-yellow-900/90 border-yellow-500'
    case 'info': return 'bg-blue-900/90 border-blue-500'
  }
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()
  
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl border ${getStyles(t.type)} 
                     text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-right duration-300`}
        >
          {getIcon(t.type)}
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}