/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'
import type { Trader } from '../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import type { Trader as TraderData } from '../features/home/traders.types'
import { API_BASE } from '../core/query/authClient'
import { profileUrl } from '../utils/formatters'

// ─────────────────────────────────────────
// Search — private to this module
// ─────────────────────────────────────────

export type SearchMode = 'trader' | 'token' | 'address'

const searchModes = [
  {
    id: 'trader' as SearchMode,
    label: 'Trader',
    emoji: '👤',
    placeholder: 'Enter trader name (e.g. PatricK_The_dev)'
  },
  {
    id: 'token' as SearchMode,
    label: 'Token',
    emoji: '🪙',
    placeholder: 'Enter token address (e.g. So111...)'
  },
  {
    id: 'address' as SearchMode,
    label: 'Address',
    emoji: '📋',
    placeholder: 'Enter vault address (e.g. 7tqB...)'
  }
] as const

// ─────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────

export interface NotificationItem {
  id: number
  title: string
  message: string
  type: ToastType
  timestamp: Date
  read: boolean
}

export type SelectedTrader = Trader | TraderData
export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  subMessage?: string
  type: ToastType
  centered?: boolean
}

type VaultStep = 1 | 2 | 3 | 4

type Category =
  | 'All'
  | 'Getting Started'
  | 'Copy Trading'
  | 'Vault Security'
  | 'Transfers'
  | 'On-Chain'
  | 'Fees & Payments'
  | 'Master Trading'
  | 'Risk Management'
  | 'Developers'
  | 'Compliance'

type Difficulty = 'All' | 'Beginner' | 'Intermediate' | 'Advanced'

// ─────────────────────────────────────────
// Context type
// ─────────────────────────────────────────

type GeneralContextType = {
  // Wallet Modal
  walletModal: boolean
  setWalletModal: (val: boolean) => void

  // Deposit
  depositOpen: boolean
  setDepositOpen: (val: boolean) => void
  depositConfirmed: boolean
  setDepositConfirm: (val: boolean) => void

  // Withdrawal
  withdrawOpen: boolean
  setWithdrawOpen: (val: boolean) => void

  // Vault Flow
  vaultFlowOpen: boolean
  vaultStep: VaultStep
  openVaultFlow: (step?: VaultStep, trader?: Trader) => void
  closeVaultFlow: () => void
  setVaultStep: (step: VaultStep) => void

  // Filter
  category: Category
  setCategory: (category: Category) => void
  difficulty: Difficulty
  setDifficulty: (difficulty: Difficulty) => void

  // Selected Trader
  selectedTrader: Trader | null
  setSelectedTrader: (trader: Trader | null) => void

  // Notifications
  openNotifications: boolean
  setOpenNotifications: (val: boolean) => void

  // Mobile sidenav
  openMenu: boolean
  setOpenMenu: (val: boolean) => void

  // Risk Alert
  showRiskModal: boolean
  setShowRiskModal: (val: boolean) => void

  // Stop Copy Modal
  openStopModal: boolean
  setOpenStopModal: (val: boolean) => void

  // Stop Copy Confirm
  stopCopyConfirm: boolean
  setStopCopyConfirm: (val: boolean) => void

  // Visible
  visible: boolean
  setVisible: (val: boolean) => void

  // Call Trade Modal
  openCallTrade: boolean
  setOpenCallTrade: (val: boolean) => void

  // Master Trader Intro Modal
  masterTraderOpen: boolean
  setMasterTraderOpen: (val: boolean) => void

  // Master Trader Flow
  masterTradingFlowOpen: boolean
  setMasterTradingFlowOpen: (val: boolean) => void

  // Has Master Vault
  hasMaterVault: boolean
  setHasMatervalt: (val: boolean) => void

  // Selected Vault PDA
  selectedVaultPda: string | null
  setSelectedVaultPda: (pda: string | null) => void

  // Tier Config
  tierConfigInitOpen: boolean
  setTierConfigInitOpen: (val: boolean) => void

  // Claim Fees
  claimFeesOpen: boolean
  setClaimFeesOpen: (val: boolean) => void

  // Prefilled Token Address
  prefilledTokenAddress: string | null
  setPrefilledTokenAddress: (address: string | null) => void

  // Edit Risk
  editRiskvisible: boolean
  setEditRiskvisible: (val: boolean) => void

  // Marked as Read
  markedAsRead: boolean
  setMarkedAsRead: (val: boolean) => void

  // Call Trade Toast
  callTradeToast: boolean
  setCallTradeToast: (val: boolean) => void

  // Toasts
  toasts: ToastItem[]
  showToast: (
    message: string,
    subMessage?: string,
    type?: ToastType,
    centered?: boolean
  ) => void
  dismissToast: (id: number) => void

  // ── Search (all navbar needs)
  searchModes: typeof searchModes // static list, shared via context not via export
  searchMode: SearchMode
  setSearchMode: (mode: SearchMode) => void
  searchModeOpen: boolean
  setSearchModeOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  activePlaceholder: string
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const GeneralContext = createContext<GeneralContextType | undefined>(undefined)

// ─────────────────────────────────────────
// Provider
// NOTE: <GeneralProvider> must be rendered inside <Router> so that
//       useNavigate() works for handleSearch.
// ─────────────────────────────────────────

export const GeneralProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()

  // Wallet Modal
  const [walletModal, setWalletModal] = useState(false)

  // Deposit
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositConfirmed, setDepositConfirm] = useState(false)

  // Withdrawal
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  // Notifications
  const [openNotifications, setOpenNotifications] = useState(false)

  // Vault Flow
  const [vaultFlowOpen, setVaultFlowOpen] = useState(false)
  const [vaultStep, setVaultStep] = useState<VaultStep>(1)

  const openVaultFlow = (step: VaultStep = 1, trader: Trader | null = null) => {
    setVaultStep(step)
    setSelectedTrader(trader)
    setVaultFlowOpen(true)
  }

  const closeVaultFlow = () => {
    setVaultFlowOpen(false)
    setVaultStep(1)
  }

  // Trader / Filter
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const [category, setCategory] = useState<Category>('All')
  const [difficulty, setDifficulty] = useState<Difficulty>('All')

  // UI toggles
  const [openMenu, setOpenMenu] = useState(false)
  const [openStopModal, setOpenStopModal] = useState(false)
  const [visible, setVisible] = useState(false)
  const [openCallTrade, setOpenCallTrade] = useState(false)
  const [masterTraderOpen, setMasterTraderOpen] = useState(false)
  const [masterTradingFlowOpen, setMasterTradingFlowOpen] = useState(false)
  const [hasMaterVault, setHasMatervalt] = useState(false)
  const [selectedVaultPda, setSelectedVaultPda] = useState<string | null>(null)
  const [tierConfigInitOpen, setTierConfigInitOpen] = useState(false)
  const [claimFeesOpen, setClaimFeesOpen] = useState(false)
  const [prefilledTokenAddress, setPrefilledTokenAddress] = useState<
    string | null
  >(null)
  const [editRiskvisible, setEditRiskvisible] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [stopCopyConfirm, setStopCopyConfirm] = useState(false)
  const [markedAsRead, setMarkedAsRead] = useState(false)
  const [callTradeToast, setCallTradeToast] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (
      message: string,
      subMessage?: string,
      type: ToastType = 'success',
      centered: boolean = false
    ) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, subMessage, type, centered }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
    },
    []
  )

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    setCallTradeToast(false)
  }, [])

  // In GeneralContext.tsx
  // ── Search
  const [searchMode, setSearchMode] = useState<SearchMode>('trader')
  const [searchModeOpen, setSearchModeOpen] = useState(false)

  // ✅ useRef initialized once, synced after render via useEffect
  const searchModeRef = useRef<SearchMode>('trader')

  useEffect(() => {
    searchModeRef.current = searchMode
  }, [searchMode])

  const activePlaceholder = useMemo(
    () => searchModes.find(m => m.id === searchMode)!.placeholder,
    [searchMode]
  )

  const handleSearch = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      
      // Client-side sanitization: Strip HTML tags
      const rawQuery = e.currentTarget.value.trim()
      const query = rawQuery.replace(/<[^>]*>?/gm, '').trim()
      
      e.currentTarget.value = ''
      if (!query) return

      const mode = searchModeRef.current

      if (mode === 'trader') {
        try {
          const res = await fetch(
            `${API_BASE}/api/search/trader?query=${query.toLowerCase()}`
          )

          if (res.status === 429) {
            showToast(
              'Slow Down',
              'You are searching too fast. Please wait a moment.',
              'error',
              true
            )
            return
          }

          const data = await res.json()
          if (data.success) {
            navigate(profileUrl(data.data.displayName, data.data.walletAddress))
          } else {
            showToast(
              'Search Failed',
              'No trader or user found matching your query.',
              'error',
              true
            )
          }
        } catch (err) {
          console.error('Trader search failed', err)
          showToast(
            'Search Error',
            'Something went wrong while searching. Please try again.',
            'error',
            true
          )
        }
      } else if (mode === 'token') {
        try {
          // 1. Basic format check
          new PublicKey(query)

          // 2. Quick validation against Jupiter (mints) or DexScreener (pairs)
          // We'll just check if it's a known mint first for simplicity
          const res = await fetch(`https://api.jup.ag/price/v2?ids=${query}`)

          if (res.status === 429) {
            showToast(
              'Slow Down',
              'You are searching too fast. Please wait a moment.',
              'error',
              true
            )
            return
          }

          const data = await res.json()

          if (!data.data || Object.keys(data.data).length === 0) {
            // Try DexScreener if Jupiter price API doesn't know it
            const dexRes = await fetch(
              `https://api.dexscreener.com/latest/dex/pairs/solana/${query}`
            )
            const dexData = await dexRes.json()
            if (!dexData.pairs || dexData.pairs.length === 0) {
              throw new Error('Token not found')
            }
          }

          setPrefilledTokenAddress(query)
          requestAnimationFrame(() => setOpenCallTrade(true))
        } catch (err) {
          showToast(
            'Invalid Token',
            'Could not find a valid token or pool at this address.',
            'error',
            true
          )
        }
      } else if (mode === 'address') {
        try {
          // 1. Basic format check
          new PublicKey(query)

          // 2. Check if it's a known User or Vault
          // We try to fetch the profile by address
          const res = await fetch(`${API_BASE}/api/users/${query}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          })

          if (res.status === 429) {
            showToast(
              'Slow Down',
              'You are searching too fast. Please wait a moment.',
              'error',
              true
            )
            return
          }

          if (!res.ok) {
            // Check if it's a master vault address (even if user record is missing)
            const vaultRes = await fetch(
              `${API_BASE}/api/vaults/master/${query}`,
              {
                headers: { 'ngrok-skip-browser-warning': 'true' }
              }
            )

            if (vaultRes.status === 429) {
              showToast(
                'Slow Down',
                'You are searching too fast. Please wait a moment.',
                'error',
                true
              )
              return
            }

            if (!vaultRes.ok) throw new Error('Address not found')
          }

          navigate(profileUrl(null, query))
        } catch (err) {
          showToast(
            'Invalid Address',
            'No active vault or trader found at this address.',
            'error',
            true
          )
        }
      }
    },
    [navigate]
  )

  return (
    <GeneralContext.Provider
      value={{
        walletModal,
        setWalletModal,
        vaultFlowOpen,
        vaultStep,
        openVaultFlow,
        closeVaultFlow,
        setVaultStep,
        selectedTrader,
        setSelectedTrader,
        depositOpen,
        setDepositOpen,
        withdrawOpen,
        setWithdrawOpen,
        depositConfirmed,
        setDepositConfirm,
        category,
        setCategory,
        difficulty,
        setDifficulty,
        openNotifications,
        setOpenNotifications,
        openMenu,
        setOpenMenu,
        showRiskModal,
        setShowRiskModal,
        openStopModal,
        setOpenStopModal,
        stopCopyConfirm,
        setStopCopyConfirm,
        visible,
        setVisible,
        openCallTrade,
        setOpenCallTrade,
        masterTraderOpen,
        setMasterTraderOpen,
        masterTradingFlowOpen,
        setMasterTradingFlowOpen,
        hasMaterVault,
        setHasMatervalt,
        selectedVaultPda,
        setSelectedVaultPda,
        tierConfigInitOpen,
        setTierConfigInitOpen,
        claimFeesOpen,
        setClaimFeesOpen,
        prefilledTokenAddress,
        setPrefilledTokenAddress,
        editRiskvisible,
        setEditRiskvisible,
        markedAsRead,
        setMarkedAsRead,
        toasts,
        showToast,
        dismissToast,
        callTradeToast,
        setCallTradeToast,
        // Search
        searchModes,
        searchMode,
        setSearchMode,
        searchModeOpen,
        setSearchModeOpen,
        activePlaceholder,
        handleSearch
      }}
    >
      {children}
    </GeneralContext.Provider>
  )
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export const useGeneralContext = () => {
  const context = useContext(GeneralContext)
  if (context === undefined) {
    throw new Error('useGeneralContext must be used within GeneralProvider')
  }
  return context
}
