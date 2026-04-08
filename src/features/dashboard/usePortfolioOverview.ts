import { useWalletStore } from "../wallet/wallet.store";
import { useWalletBalance } from "../wallet/useWalletQuery";

export function usePortfolioOverview() {
  const { publicKey, connected } = useWalletStore();
  const walletBalanceQuery = useWalletBalance(
    connected ? (publicKey ?? undefined) : undefined,
  );

  // Day 8 — still mocked for non-wallet data
  const vaultCount = 0;
  const aum = 0;
  const pnl = 0;

  return {
    connected,
    isLoading: walletBalanceQuery.isLoading,
    data:
      connected && walletBalanceQuery.data
        ? {
            totalBalance: walletBalanceQuery.data.balance,
            totalPnL: pnl,
            vaultCount,
            aum,
          }
        : null,
  };
}
