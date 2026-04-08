export interface MasterVaultBackendResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    vaultPda: string;
    masterWallet: string;
    programId: string;
    bump: number;
    successFeeBps: number;
    volumeFeeBps: number;
    totalDeposits: string;
    totalVolume: string;
    totalFeesEarned: string;
    totalTrades: number;
    isPaused: boolean;
    positionCounter: string;
    totalRealizedProfit: string;
    takeProfitTriggerBps: number;
    takeProfitSellBps: number;
    highWaterMark: string;
    currentTier: number;
    pendingDowngradeTier: number;
    verifiedFlags: number;
    tierConfirmedSlot: string;
    rollingVolumeUsd: string;
    rollingAumUsd: string;
  };
}
