import { useEffect, useRef, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../features/auth/auth.store'
import { API_BASE } from '../query/authClient'
import { toast } from '../store/useToastStore'

const WS_URL = API_BASE.replace('http', 'ws')

const TOAST_MAP: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  TRADE_EXECUTED: 'success',
  PROFIT_TAKE: 'success',
  STOP_LOSS: 'warning',
  DEPOSIT: 'info',
  WITHDRAWAL: 'info',
  NEW_FOLLOWER: 'info',
  TIER_UPGRADE: 'success',
  TIER_DOWNGRADE_STAGED: 'warning'
}

export function useRealtimeUpdates() {
  const { publicKey } = useWallet()
  const { authenticated, user } = useAuthStore()
  const queryClient = useQueryClient()
  const userRef = useRef(user)
  const prefsRef = useRef<Record<string, boolean> | null>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const fetchPreferences = useCallback(async () => {
    if (!userRef.current?.walletAddress) return
    try {
      const res = await fetch(`${API_BASE}/api/notifications/preferences?wallet=${userRef.current.walletAddress}`, {
        credentials: 'include'
      }).then(r => r.json())
      prefsRef.current = res.data ?? { trade_execution: true, vault_activity: true, copy_trading: true }
    } catch {
      prefsRef.current = { trade_execution: true, vault_activity: true, copy_trading: true }
    }
  }, [])

  const shouldShowToast = useCallback((type: string) => {
    const prefs = prefsRef.current
    if (!prefs) return true

    if (['TRADE_EXECUTED', 'PROFIT_TAKE', 'STOP_LOSS'].includes(type)) {
      return prefs.trade_execution !== false
    }
    if (['DEPOSIT', 'WITHDRAWAL', 'TIER_UPGRADE', 'TIER_DOWNGRADE_STAGED', 'NEW_FOLLOWER'].includes(type)) {
      return prefs.vault_activity !== false
    }
    return prefs.copy_trading !== false
  }, [])

  useEffect(() => {
    if (!publicKey || !authenticated || !userRef.current) return

    fetchPreferences()

    let ws: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout>

    const connect = () => {
      const fullWsUrl = `${WS_URL}?userId=${userRef.current?.id}`
      console.log('🔌 Connecting to WebSocket...', fullWsUrl)

      ws = new WebSocket(fullWsUrl)

      ws.onopen = () => {
        console.log('✅ WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          const eventName = parsed?.event
          const data = parsed?.data

          if (eventName === 'VAULT_SYNCED') {
            console.log('🔔 Vault synced → refreshing queries')

            queryClient.invalidateQueries({ queryKey: ['master-vault'] })
            queryClient.invalidateQueries({ queryKey: ['copier-vaults'] })
          }

          if (eventName === 'NEW_NOTIFICATION') {
            console.log('🔔 New notification received:', data?.type)
            queryClient.invalidateQueries({ queryKey: ['notifications'] })

            if (shouldShowToast(data?.type)) {
              const toastType = TOAST_MAP[data?.type] || 'info'
              toast[toastType](`${data?.title}: ${data?.message}`)
            }
          }

          if (eventName === 'NOTIFICATIONS_UPDATED') {
            console.log('🔔 Notifications updated:', data?.type)
            queryClient.invalidateQueries({ queryKey: ['notifications'] })

            if (shouldShowToast(data?.type)) {
              toast.info('New copy trading update')
            }
          }
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        if (!publicKey) return

        console.log('❌ WebSocket closed. Reconnecting in 5s...')
        reconnectTimeout = setTimeout(connect, 5000)
      }

      ws.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err)
        ws?.close()
      }
    }

    connect()

    return () => {
      if (ws) {
        ws.onclose = null
        ws.close()
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [publicKey, authenticated, queryClient, fetchPreferences, shouldShowToast])
  // useEffect(() => {
  //   if (!publicKey || !authenticated || !user) return

  //   fetchPreferences()

  //   let ws: WebSocket | null = null
  //   let reconnectTimeout: ReturnType<typeof setTimeout>

  //   const connect = () => {
  //     const fullWsUrl = `${WS_URL}?userId=${user.id}`
  //     console.log('🔌 Connecting to WebSocket...', fullWsUrl)

  //     ws = new WebSocket(fullWsUrl)

  //     ws.onopen = () => {
  //       console.log('✅ WebSocket connected')
  //     }

  //     ws.onmessage = (event) => {
  //       try {
  //         const parsed = JSON.parse(event.data)
  //         const eventName = parsed?.event
  //         const data = parsed?.data

  //         if (eventName === 'VAULT_SYNCED') {
  //           console.log('🔔 Vault synced → refreshing queries')

  //           queryClient.invalidateQueries({ queryKey: ['master-vault'] })
  //           queryClient.invalidateQueries({ queryKey: ['copier-vaults'] })
  //         }

  //         if (eventName === 'NEW_NOTIFICATION') {
  //           console.log('🔔 New notification received:', data?.type)
  //           queryClient.invalidateQueries({ queryKey: ['notifications'] })

  //           if (shouldShowToast(data?.type)) {
  //             const toastType = TOAST_MAP[data?.type] || 'info'
  //             toast[toastType](`${data?.title}: ${data?.message}`)
  //           }
  //         }

  //         if (eventName === 'NOTIFICATIONS_UPDATED') {
  //           console.log('🔔 Notifications updated:', data?.type)
  //           queryClient.invalidateQueries({ queryKey: ['notifications'] })

  //           if (shouldShowToast(data?.type)) {
  //             toast.info('New copy trading update')
  //           }
  //         }
  //       } catch (err) {
  //         console.error('❌ Failed to parse WebSocket message:', err)
  //       }
  //     }

  //     ws.onclose = () => {
  //       if (!publicKey) return

  //       console.log('❌ WebSocket closed. Reconnecting in 5s...')
  //       reconnectTimeout = setTimeout(connect, 5000)
  //     }

  //     ws.onerror = (err) => {
  //       console.error('⚠️ WebSocket error:', err)
  //       ws?.close()
  //     }
  //   }

  //   connect()

  //   return () => {
  //     if (ws) {
  //       ws.onclose = null
  //       ws.close()
  //     }

  //     if (reconnectTimeout) {
  //       clearTimeout(reconnectTimeout)
  //     }
  //   }
  // }, [publicKey, authenticated, queryClient, fetchPreferences, shouldShowToast])
}
