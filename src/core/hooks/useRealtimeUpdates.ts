import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../features/auth/auth.store'
import { API_BASE } from '../query/authClient'

const WS_URL = API_BASE.replace('http', 'ws')

export function useRealtimeUpdates() {
  const { publicKey } = useWallet()
  const { authenticated } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    // ✅ Only connect when wallet + auth are ready
    if (!publicKey || !authenticated) return

    let ws: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout>

    const connect = () => {
      console.log('🔌 Connecting to WebSocket...', WS_URL)

      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('✅ WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          const eventName = parsed?.event

          if (eventName === 'VAULT_SYNCED') {
            console.log('🔔 Vault synced → refreshing queries')

            // ✅ React Query handles refetch cleanly
            queryClient.invalidateQueries({
              queryKey: ['master-vault']
            })

            queryClient.invalidateQueries({
              queryKey: ['copier-vaults']
            })
          }
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        // 🚨 Prevent reconnect spam if wallet disconnects
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
        ws.onclose = null // prevent reconnect on unmount
        ws.close()
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [publicKey, authenticated, queryClient])
}
