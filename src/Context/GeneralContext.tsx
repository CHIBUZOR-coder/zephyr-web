/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Trader } from '../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import type { Trader as TraderData } from '../features/home/traders.types'



// NEW: Notifications are persistent (not auto-dismissed)
export interface NotificationItem {
  id: number
  title: string // e.g. "Stop Loss Triggered"
  message: string // e.g. "Your $JUP position hit stop loss at -5%"
  type: ToastType // reuse 'success' | 'error' | 'info'
  timestamp: Date
  read: boolean // 👈 key difference from Toast
}

// Union of both Trader types
export type SelectedTrader = Trader | TraderData
export type ToastType = 'success' | 'error' | 'info'

/* ------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------ */
// 👇 Add Toast item type
export interface ToastItem {
  id: number
  message: string
  subMessage?: string
  type: ToastType
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

type GeneralContextType = {
  walletModal: boolean
  setWalletModal: (val: boolean) => void
  //Depositional
  depositOpen: boolean
  setDepositOpen: (val: boolean) => void
  depositConfirmed: boolean
  setDepositConfirm: (val: boolean) => void
  //Withdrawal Modal
  withdrawOpen: boolean
  setWithdrawOpen: (val: boolean) => void
  // Vault Flow Modal
  vaultFlowOpen: boolean
  vaultStep: VaultStep
  openVaultFlow: (step?: VaultStep, trader?: Trader) => void
  closeVaultFlow: () => void
  setVaultStep: (step: VaultStep) => void
  //filter
  category: Category
  setCategory: (category: Category) => void
  difficulty: Difficulty
  setDifficulty: (difficulty: Difficulty) => void

  // 🔥 Selected Trader
  selectedTrader: Trader | null
  setSelectedTrader: (trader: Trader | null) => void
  //Notification
  openNotifications: boolean
  setOpenNotifications: (val: boolean) => void
  //Mobile sidenav
  openMenu: boolean
  setOpenMenu: (val: boolean) => void
  //RISK Alert
  showRiskModal: boolean
  setShowRiskModal: (val: boolean) => void
  //StopCopyModal
  openStopModal: boolean
  setOpenStopModal: (val: boolean) => void
  //Stop Copy Confirm
  stopCopyConfirm: boolean
  setStopCopyConfirm: (val: boolean) => void
  //Visible
  visible: boolean
  setVisible: (val: boolean) => void
  //CllTrade Modal
  openCallTrade: boolean
  setOpenCallTrade: (val: boolean) => void
  // Master Trader Intro Modal
  masterTraderOpen: boolean
  setMasterTraderOpen: (val: boolean) => void
  // Master Trader Modal flow
  masterTradingFlowOpen: boolean
  setMasterTradingFlowOpen: (val: boolean) => void
  //hasMater vault
  hasMaterVault: boolean
  setHasMatervalt: (val: boolean) => void
  // Selected Vault PDA for Deposit/Withdrawal
  selectedVaultPda: string | null
  setSelectedVaultPda: (pda: string | null) => void
  //TierConfig Initialization
  tierConfigInitOpen: boolean
  setTierConfigInitOpen: (val: boolean) => void
  //Claim Fees
  claimFeesOpen: boolean
  setClaimFeesOpen: (val: boolean) => void

  // Prefilled Token Address for Call Trade Modal
  prefilledTokenAddress: string | null
  setPrefilledTokenAddress: (address: string | null) => void

  //EditRiskvisible
  editRiskvisible: boolean

  setEditRiskvisible: (val: boolean) => void

  //Marked as read for risk alert
  markedAsRead: boolean
  setMarkedAsRead: (val: boolean) => void

  callTradeToast: boolean
  setCallTradeToast: (val: boolean) => void
  // 👇 Add Toast
  toasts: ToastItem[]
  showToast: (message: string, subMessage?: string, type?: ToastType) => void
  dismissToast: (id: number) => void
}

/* ------------------------------------------------ */
/* CONTEXT */
/* ------------------------------------------------ */

const GeneralContext = createContext<GeneralContextType | undefined>(undefined)

/* ------------------------------------------------ */
/* PROVIDER */
/* ------------------------------------------------ */

export const GeneralProvider = ({ children }: { children: ReactNode }) => {
  // Wallet Modal
  const [walletModal, setWalletModal] = useState(false)
  //Deposit Modal
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositConfirmed, setDepositConfirm] = useState(false)
  //Withdrawal Modal
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)

  // 🔥 Vault Flow State
  const [vaultFlowOpen, setVaultFlowOpen] = useState(false)
  const [vaultStep, setVaultStep] = useState<VaultStep>(1)
  //RISK Alert
  const [showRiskModal, setShowRiskModal] = useState(false)
  //Stop Confirmation
  const [stopCopyConfirm, setStopCopyConfirm] = useState(false)

  /* Open modal and optionally jump to a step jj*/
  const openVaultFlow = (step: VaultStep = 1, trader: Trader | null = null) => {
    setVaultStep(step)
    setSelectedTrader(trader)
    setVaultFlowOpen(true)
  }

  /* Close and reset step */
  const closeVaultFlow = () => {
    setVaultFlowOpen(false)
    setVaultStep(1)
  }

  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const [category, setCategory] = useState<Category>('All')
  const [difficulty, setDifficulty] = useState<Difficulty>('All')
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
  const [prefilledTokenAddress, setPrefilledTokenAddress] = useState<string | null>(null)
  const [editRiskvisible, setEditRiskvisible] = useState(false)
  const [markedAsRead, setMarkedAsRead] = useState(false)
  const [callTradeToast, setCallTradeToast] = useState(false)
  // 👇 Add Toast State
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (message: string, subMessage?: string, type: ToastType = 'success') => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, subMessage, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4500)
    },
    []
  )

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    setCallTradeToast(false)
  }, [])

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
        toasts, // 👈 Add
        showToast, // 👈 Add
        dismissToast, // 👈 Add
        callTradeToast,
        setCallTradeToast
      }}
    >
      {children}
    </GeneralContext.Provider>
  )
}

/* ------------------------------------------------ */
/* HOOK */
/* ------------------------------------------------ */

export const useGeneralContext = () => {
  const context = useContext(GeneralContext)

  if (context === undefined) {
    throw new Error('useGeneralContext must be used within GeneralProvider')
  }

  return context
}
