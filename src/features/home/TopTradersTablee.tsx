import { useLeaderboard } from './useLeaderboard'
import { useGeneralContext } from '../../Context/GeneralContext'
import type { Trader as ContextTrader } from '../dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import type { Trader } from './traders.types'



  const handleCopy = (trader: Trader) => {
    // Map home Trader to Context Trader
    const contextTrader: ContextTrader = {
      id: trader.id,
      rank: trader.id,
      name: trader.name,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.walletAddress}`,
      tag: 'Pro',
      tiers: 'Institutional',
      type: 'PRO',
      pnl: `${trader.roi7d}%`,
      aum: trader.aum,
      winRate: `${trader.winRate}%`,
      drawdown: trader.risk,
      trades: 0,
      copiers: 0,
      rio: trader.roi7d,
      follows: 0,
      sol: '0',
      address: trader.walletAddress,
      vaultAddress: trader.vaultPda,
    }
    openVaultFlow(1, contextTrader)
  }

// export default function TopTradersTable () {
//   const { traders, loading, error } = useLeaderboard()
//   const { openVaultFlow } = useGeneralContext()

//   const handleCopy = (trader: Trader) => {
//     const contextTrader: ContextTrader = {
//       id: trader.rank,
//       rank: trader.rank,
//       name: trader.user.displayName,
//       image:
//         trader.user.avatar ??
//         `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.user.walletAddress}`,
//       tag: 'Pro',
//       tiers: trader.tierLabel,
//       type: 'PRO',
//       pnl: `${trader.metrics.roiPct}%`,
//       aum: String(trader.metrics.aumUsd),
//       winRate: `${trader.metrics.winRatePct}%`,
//       drawdown: String(trader.metrics.maxDrawdownPct),
//       trades: trader.metrics.totalTrades,
//       copiers: trader.metrics.activeCopiers,
//       rio: trader.metrics.roiPct,
//       follows: 0,
//       sol: '0',
//       address: trader.user.walletAddress,
//       vaultAddress: trader.vaultPda
//     }
//     openVaultFlow(1, contextTrader)
//   }

//   if (loading) {
//     return (
//       <section className='mt-16'>
//         <div className='flex items-center justify-between mb-6'>
//           <h2 className='text-white text-lg font-semibold tracking-wide uppercase'>
//             Top Traders of the Week
//           </h2>
//         </div>
//         <div className='w-full h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10 flex items-center justify-center'>
//           <p className='text-gray-400'>Loading top traders...</p>
//         </div>
//       </section>
//     )
//   }

//   if (error) {
//     return (
//       <section className='mt-16'>
//         <div className='flex items-center justify-between mb-6'>
//           <h2 className='text-white text-lg font-semibold tracking-wide uppercase'>
//             Top Traders of the Week
//           </h2>
//         </div>
//         <div className='w-full h-64 bg-red-500/5 rounded-2xl border border-red-500/20 flex items-center justify-center'>
//           <p className='text-red-400'>Error: {error}</p>
//         </div>
//       </section>
//     )
//   }

//   return (
//     <section className=' mt-16'>
//       {/* Header */}
//       <div className='flex items-center justify-between mb-6'>
//         <h2 className='text-white text-lg font-semibold tracking-wide uppercase'>
//           TOP TRADERS OF THE WEEK
//         </h2>
//         <button className='text-teal-400 text-xs font-medium hover:underline'>
//           VIEW FULL LEADERBOARD
//         </button>
//       </div>

//       {/* Table */}
//       <div className='overflow-x-auto'>
//         <div className='min-w-[960px] rounded-2xl bg-gradient-to-b from-[#0f1b1b] to-[#0b1414] border border-white/10'>
//           {/* Column headers */}
//           <div className='grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 border-b border-white/10'>
//             <span>Trader</span>
//             <span>ROI (30D)</span>
//             <span>Win Rate</span>
//             <span>Risk Score</span>
//             <span>AUM</span>
//             <span>Action</span>
//           </div>

//           {/* Rows */}
//           {traders.length === 0 ? (
//             <div className='p-10 text-center text-gray-500'>
//               No active master traders found. Create a master vault to appear
//               here!
//             </div>
//           ) : (
//             traders.map((trader, index) => (
//               <div
//                 key={trader.walletAddress || index}
//                 className='grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] px-6 py-5 items-center border-b border-white/5 last:border-none hover:bg-white/5 transition'
//               >
//                 {/* Trader */}
//                 <div className='flex items-center gap-4'>
//                   <div
//                     className={`h-11 w-11 rounded-full bg-cover bg-center overflow-hidden border border-white/10`}
//                     style={{
//                       backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.walletAddress})`
//                     }}
//                   />
//                   <div>
//                     <p className='text-white font-medium leading-none'>
//                       {trader?.user?.displayName}
//                     </p>
//                     <p className='text-[10px] text-gray-500 mt-1 font-mono uppercase'>
//                       {trader.user?.walletAddress?.slice(0, 4)}...
//                       {trader.user?.walletAddress?.slice(-4)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* ROI */}
//                 <div className='text-green-400 font-semibold'>
//                   {trader?.metrics?.roiPct >= 0 ? '+' : ''}
//                   {trader?.metrics?.roiPct}%
//                 </div>

//                 {/* Win rate */}
//                 <div className='text-white'>{trader?.metrics?.winRatePct}%</div>

//                 {/* Risk */}
//                 <div>
//                   <span
//                     className={`inline-flex items-center px-3 py-1 text-[11px] font-semibold rounded-md border ${
//                       riskStyle[trader.risk]
//                     }`}
//                   >
//                     {trader.risk}
//                   </span>
//                 </div>

//                 {/* AUM */}
//                 <div className='text-white'>{trader.aum}</div>

//                 {/* Action */}
//                 <div>
//                   <button
//                     onClick={() => handleCopy(trader)}
//                     className='bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-black border border-teal-500/20 px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider'
//                   >
//                     Copy
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </section>
//   )
// }
