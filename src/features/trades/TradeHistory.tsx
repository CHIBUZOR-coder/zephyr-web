// zephyr-web/src/features/trades/TradeHistory.tsx

import { useState } from 'react';
import { useVaultTrades, useMasterTrades, useCopierTrades } from './useTrades';
import type { Trade } from './useTrades';

interface TradeHistoryProps {
  vaultPda?: string;
  masterWallet?: string;
  copierWallet?: string;
  title?: string;
  showMasterInfo?: boolean;
  showCopierInfo?: boolean;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAmount = (amount: number, decimals = 4) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  return amount.toFixed(decimals);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-500/20 text-green-400';
    case 'FAILED':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-yellow-500/20 text-yellow-400';
  }
};

const TradeRow = ({ trade, showMasterInfo, showCopierInfo }: { 
  trade: Trade; 
  showMasterInfo?: boolean;
  showCopierInfo?: boolean;
}) => {
  const isCopier = trade.vaultType === 'COPIER';
  const masterName = trade.masterExecutionVault?.user?.displayName || 
    trade.masterExecutionVault?.masterWallet?.slice(0, 8) + '...';
  const copierName = trade.copierVault?.copier?.displayName || 
    trade.copierVault?.copier?.walletAddress?.slice(0, 8) + '...';

  return (
    <div className="bg-[#102221] border border-teal-900/40 rounded-xl p-4 hover:border-teal-500/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                {formatAmount(trade.amountInDecimal)} SOL
              </span>
              <span className="text-xs text-gray-400">
                → {formatAmount(trade.amountOutDecimal)} {trade.tokenOut.slice(0, 4)}...
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-[#B0E4DD66]">{formatTimestamp(trade.executedAt)}</span>
              {showMasterInfo && !isCopier && (
                <span className="text-[#B0E4DD66]">• Your Trade</span>
              )}
              {showCopierInfo && isCopier && masterName && (
                <span className="text-[#B0E4DD66]">• Mirroring {masterName}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCopier && trade.copierVault?.copier && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0a1414] flex items-center justify-center">
                <span className="text-xs text-gray-400">
                  {copierName?.slice(0, 2)}
                </span>
              </div>
            </div>
          )}

          {!isCopier && trade.masterExecutionVault && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0a1414] flex items-center justify-center">
                <span className="text-xs text-gray-400">
                  {masterName?.slice(0, 2)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-white font-medium">{masterName}</p>
                <p className="text-xs text-gray-400">Master</p>
              </div>
            </div>
          )}

          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(trade.status)}`}>
            {trade.status}
          </span>

          {trade.copiedTrades && trade.copiedTrades.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-teal-400">
              <span>{trade.copiedTrades.length}</span>
              <span>copiers</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TradeHistory = ({
  vaultPda,
  masterWallet,
  copierWallet,
  title = 'Trade History',
  showMasterInfo = false,
  showCopierInfo = false,
}: TradeHistoryProps) => {
  const [limit, setLimit] = useState(20);

  const { trades: vaultTrades, loading: vaultLoading } = useVaultTrades(vaultPda || '', limit);
  const { trades: masterTrades, loading: masterLoading } = useMasterTrades(masterWallet || '', limit);
  const { trades: copierTrades, loading: copierLoading } = useCopierTrades(copierWallet || '', limit);

  const trades = vaultTrades || masterTrades || copierTrades || [];
  const loading = vaultLoading || masterLoading || copierLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={() => setLimit((l) => Math.min(l + 20, 100))}
          className="text-sm text-teal-400 hover:text-teal-300"
        >
          Load More
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-[#102221] border border-teal-900/40 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-24 bg-[#1f3c3c] rounded"></div>
                  <div className="h-4 w-32 bg-[#1f3c3c] rounded"></div>
                </div>
                <div className="h-6 w-20 bg-[#1f3c3c] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="bg-[#102221] border border-teal-900/40 rounded-xl p-8 text-center">
          <p className="text-gray-400">No trades found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade) => (
            <TradeRow
              key={trade.id}
              trade={trade}
              showMasterInfo={showMasterInfo}
              showCopierInfo={showCopierInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
