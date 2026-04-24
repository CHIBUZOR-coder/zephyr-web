// zephyr-web/src/features/trades/CopyTradingPanel.tsx

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { useGeneralContext } from '../../Context/GeneralContext';
import TradeHistory from './TradeHistory';

const API_BASE_URL = 'https://zephyr-np09.onrender.com'

interface CopierVaultData {
  id: string;
  vaultPda: string;
  balance: string;
  copyActive: boolean;
  isPaused: boolean;
  masterExecutionVault: {
    masterWallet: string;
    user?: {
      displayName?: string;
    };
  };
}

interface MasterVaultData {
  id: string;
  vaultPda: string;
  totalVolume: string;
  totalTrades: number;
  currentTier: number;
  user?: {
    displayName?: string;
    walletAddress?: string;
  };
}

export const CopyTradingPanel = () => {
  const { publicKey } = useWallet();
  const { setWalletModal } = useGeneralContext();

  const [copierVaults, setCopierVaults] = useState<CopierVaultData[]>([]);
  const [masterVaults, setMasterVaults] = useState<MasterVaultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'copiers' | 'trades'>('copiers');
  const [selectedCopierVault, setSelectedCopierVault] = useState<CopierVaultData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) return;
      
      setLoading(true);
      try {
        const walletStr = publicKey.toString();
        
        const [copierRes, masterRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/vaults/copier/${walletStr}`),
          fetch(`${API_BASE_URL}/api/vaults/master/${walletStr}`),
        ]);

        const copierData = await copierRes.json();
        const masterData = await masterRes.json();

        if (copierData.success) {
          setCopierVaults(copierData.data || []);
        }
        if (masterData.success) {
          setMasterVaults(masterData.data ? [masterData.data] : []);
        }
      } catch (error) {
        console.error('Failed to fetch copy trading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey]);

  const formatBalance = (balance: string) => {
    const solBalance = Number(balance) / 1e9;
    return solBalance.toFixed(4);
  };

  if (!publicKey) {
    return (
      <div className="bg-[#102221] border border-teal-900/40 rounded-2xl p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👛</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-[#B0E4DD80] mb-4">
          Connect your wallet to view your copy trading positions
        </p>
        <button
          onClick={() => setWalletModal(true)}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-xl font-semibold text-sm transition"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#102221] border border-teal-900/40 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-[#1f3c3c] rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-[#1f3c3c] rounded"></div>
                  <div className="h-3 w-24 bg-[#1f3c3c] rounded"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-[#1f3c3c] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasCopierVaults = copierVaults.length > 0;
  const hasMasterVaults = masterVaults.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#102221] border border-teal-900/40 rounded-xl p-4">
          <p className="text-xs text-[#B0E4DD66] uppercase tracking-wider mb-1">
            Active Copiers
          </p>
          <p className="text-2xl font-bold text-white">{copierVaults.length}</p>
        </div>
        <div className="bg-[#102221] border border-teal-900/40 rounded-xl p-4">
          <p className="text-xs text-[#B0E4DD66] uppercase tracking-wider mb-1">
            Following Masters
          </p>
          <p className="text-2xl font-bold text-white">
            {new Set(copierVaults.map((v) => v.masterExecutionVault?.masterWallet)).size}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0B2025] p-1 rounded-xl border border-teal-900/40">
        <button
          onClick={() => setActiveTab('copiers')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'copiers'
              ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Copier Vaults
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'trades'
              ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Trade History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'copiers' && (
        <div className="space-y-4">
          {!hasCopierVaults ? (
            <div className="bg-[#102221] border border-teal-900/40 rounded-xl p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Copier Vaults</h3>
              <p className="text-sm text-[#B0E4DD80]">
                Start copy trading by selecting a master trader to follow
              </p>
            </div>
          ) : (
            copierVaults.map((vault) => (
              <div
                key={vault.id}
                onClick={() => setSelectedCopierVault(vault)}
                className={`bg-[#102221] border rounded-xl p-4 cursor-pointer transition hover:border-teal-500/40 ${
                  selectedCopierVault?.id === vault.id
                    ? 'border-teal-500'
                    : 'border-teal-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#0a1414] flex items-center justify-center">
                      <span className="text-lg">
                        {vault.masterExecutionVault?.user?.displayName?.charAt(0) || 'M'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {vault.masterExecutionVault?.user?.displayName || 
                          vault.masterExecutionVault?.masterWallet.slice(0, 8) + '...'}
                      </p>
                      <p className="text-xs text-[#B0E4DD66]">
                        {vault.masterExecutionVault?.masterWallet.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatBalance(vault.balance)} SOL
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          vault.copyActive && !vault.isPaused
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {vault.isPaused ? 'Paused' : vault.copyActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'trades' && (
        <TradeHistory
          copierWallet={publicKey.toString()}
          title="My Copied Trades"
          showCopierInfo={false}
        />
      )}

      {/* Master Vault Section */}
      {hasMasterVaults && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">My Master Vault</h3>
          {masterVaults.map((vault) => (
            <div
              key={vault.id}
              className="bg-[#102221] border border-teal-900/40 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[#B0E4DD66] uppercase tracking-wider">
                    Total Volume
                  </p>
                  <p className="text-xl font-bold text-white">
                    {formatBalance(vault.totalVolume)} SOL
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#B0E4DD66] uppercase tracking-wider">
                    Total Trades
                  </p>
                  <p className="text-xl font-bold text-white">{vault.totalTrades}</p>
                </div>
              </div>
              <TradeHistory
                vaultPda={vault.vaultPda}
                title="My Trades"
                showMasterInfo={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CopyTradingPanel;
