import { useVaultActivities, useAllVaultActivities, formatVaultActivity } from './useVaultActivities'
import type { VaultActivity } from './useVaultActivities'
import { FiClock } from 'react-icons/fi'

export const VaultActivityList = ({ vaultPda, vaultPdas }: { vaultPda?: string, vaultPdas?: string[] }) => {
  const singleVault = useVaultActivities(vaultPda || null)
  const allVaults = useAllVaultActivities(vaultPdas || [], 15)

  const { activities, isLoading } = vaultPda 
    ? singleVault 
    : vaultPdas 
      ? allVaults 
      : { activities: [], isLoading: false }

  if (isLoading) return (
    <div className='flex flex-col items-center justify-center py-10 gap-3'>
      <p className='text-center text-[#11C5A3] text-sm font-semibold tracking-wide animate-pulse'>
        Loading activity...
      </p>
      <div className='text-[#557A74] text-2xl animate-pulse'>
        <FiClock />
      </div>
    </div>
  )
  if (activities.length === 0) return <p className='text-[#546462] text-xs'>No recent activity.</p>

  return (
    <div className="flex flex-col">
      {/* Header Row */}
      <div className="grid grid-cols-5 gap-4 px-3 py-2 border-b border-[#1A3A39]">
        <span className="text-[10px] font-semibold text-[#7C9190] uppercase tracking-wider">Event Type</span>
        <span className="text-[10px] font-semibold text-[#7C9190] uppercase tracking-wider">Token</span>
        <span className="text-[10px] font-semibold text-[#7C9190] uppercase tracking-wider">Amount</span>
        <span className="text-[10px] font-semibold text-[#7C9190] uppercase tracking-wider">Status</span>
        <span className="text-[10px] font-semibold text-[#7C9190] uppercase tracking-wider">Explorer</span>
      </div>

      {/* Activity Rows */}
      <div className="flex flex-col">
        {activities.map((activity: VaultActivity) => {
          const formatted = formatVaultActivity(activity);
          return (
            <div 
              key={formatted.id} 
              className="grid grid-cols-5 gap-4 px-3 py-3 border-b border-[#1A3A39] last:border-b-0 hover:bg-[#0F2A28] transition-colors"
            >
              {/* Event Type Column */}
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-white">{formatted.type}</span>
                <span className="text-[9px] text-[#557A74] mt-0.5">{formatted.time}</span>
              </div>

              {/* Token Column */}
              <div className="flex items-center">
                <span className="text-xs text-white">{formatted.token}</span>
              </div>

              {/* Amount Column */}
              <div className="flex items-center">
                <span className={`text-xs font-bold ${
                  formatted.amount.startsWith('+') ? 'text-[#1ED2AF]' : 
                  formatted.amount.startsWith('-') ? 'text-[#FA6938]' : 'text-white'
                }`}>
                  {formatted.amount}
                </span>
              </div>

              {/* Status Column */}
              <div className="flex items-center">
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  formatted.status === 'success' 
                    ? 'bg-[#1ED2AF]/20 text-[#1ED2AF]' 
                    : 'bg-[#FA6938]/20 text-[#FA6938]'
                }`}>
                  {formatted.status.toUpperCase()}
                </span>
              </div>

              {/* Explorer Column */}
              <div className="flex items-center">
                {formatted.signature !== 'N/A' ? (
                  <a
                    href={`https://solscan.io/tx/${formatted.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1ED2AF] hover:underline flex items-center gap-1"
                  >
                    View
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-xs text-[#546462]">N/A</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
