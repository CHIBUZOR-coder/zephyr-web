import { useState, useMemo, useEffect } from 'react';
import { useSocialFeed } from './useSocialFeed';
import { useUserVaults } from '../../../master/useUserVaults';
import { useAuthStore } from '../../../../features/auth/auth.store';
import { useRecentTrades } from '../../../trades/useTrades';
import type { Trade } from '../../../trades/useTrades';
import { explorerClusterParam } from '../../../../core/config/solanaWallet';

/**
 * Formats a date string into a relative time representation (e.g., "5M AGO").
 */
function formatRelativeDate (dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'JUST NOW'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`
  return `${Math.floor(diffInSeconds / 86400)}D AGO`
}

type FeedItem = 
  | { type: 'post'; data: import('./socialFeed.types').SocialPost }
  | { type: 'trade'; data: Trade };

/**
 * SocialFeed component displays a unified list of community posts and live trade activity.
 * It allows eligible users (vault owners) to share their own updates.
 */
export default function SocialFeed () {
  const { feed: posts, isLoading: loadingPosts, post, isPosting } = useSocialFeed();
  const { trades, loading: loadingTrades, refetch: refetchTrades } = useRecentTrades(30);
  
  // Refresh trades periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTrades();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refetchTrades]);

  const { masterVault, copierVaults } = useUserVaults();
  const { user: authUser } = useAuthStore();
  const [content, setContent] = useState('');

  // Business Rule: Users can only post if they own at least one vault
  const hasVault = !!(masterVault || (copierVaults && copierVaults.length > 0));

  // Merge and sort posts and trades by date
  const unifiedFeed = useMemo(() => {
    const postItems: FeedItem[] = (posts || []).map(p => ({ type: 'post', data: p }));
    const tradeItems: FeedItem[] = (trades || []).map(t => ({ type: 'trade', data: t }));
    
    return [...postItems, ...tradeItems].sort((a, b) => {
      const dateA = new Date(a.type === 'post' ? a.data.createdAt : a.data.executedAt).getTime();
      const dateB = new Date(b.type === 'post' ? b.data.createdAt : b.data.executedAt).getTime();
      return dateB - dateA;
    });
  }, [posts, trades]);

  /**
   * Submits a new post to the backend.
   */
  const handlePost = async () => {
    if (!content.trim() || !hasVault || isPosting) return;
    try {
      await post(content);
      setContent('');
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };

  return (
    <div className='mt-10'>
      <div className='flex gap-2 items-center px-4 mb-4'>
        <h4 className='text-[15px] font-[700] text-white'>Social Feed</h4>
        <p className='w-[6px] h-[6px] rounded-full bg-[#22C55E] animate-pulse'></p>
      </div>

      <div className='bg-[#0f1a18] rounded-xl overflow-hidden shadow-xl border border-[#1a2e2a]'>
        {/* Feed Content */}
        <div className='flex flex-col max-h-[420px] overflow-y-auto scrollbar-hide'>
          {loadingPosts && loadingTrades && unifiedFeed.length === 0 ? (
            <div className='flex flex-col items-center py-12 gap-3'>
              <div className='w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin'></div>
              <p className='text-[12px] text-[#4a6b66] font-medium'>
                Synchronizing live feed...
              </p>
            </div>
          ) : unifiedFeed.length > 0 ? (
            unifiedFeed.map((item, idx) => {
              if (item.type === 'post') {
                const postItem = item.data;
                return (
                  <div key={`post-${postItem.id}`} className='p-4 border-b border-[#1a2e2a] last:border-0 hover:bg-[#122421] transition-colors duration-200'>
                    <div className='flex gap-3'>
                      <div className='w-10 h-10 rounded-full bg-[#1a2e2a] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#23483b]'>
                        {postItem.user.avatar ? (
                          <img src={postItem.user.avatar} alt='Avatar' className='w-full h-full object-cover' />
                        ) : (
                          <span className='text-xs text-[#B0E4DD] font-bold'>
                            {(postItem.user.displayName || postItem.user.username || '??').slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className='flex-grow'>
                        <div className='flex justify-between items-center mb-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-[13px] font-bold text-white'>
                              {postItem.user.displayName || postItem.user.username || 'Anonymous'}
                            </span>
                            <span className='text-[11px] text-[#4a6b66]'>
                              @{postItem.user.username || postItem.user.walletAddress.slice(0, 6)}
                            </span>
                          </div>
                          <span className='text-[10px] text-[#4a6b66] font-medium'>
                            {formatRelativeDate(postItem.createdAt)}
                          </span>
                        </div>
                        <p className='text-[13px] text-[#B0E4DD] leading-relaxed whitespace-pre-wrap'>
                          {postItem.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const trade = item.data;
                const isMaster = trade.vaultType === 'MASTER';
                const name = isMaster 
                  ? (trade.masterExecutionVault?.user?.displayName || `Trader ${trade.masterExecutionVault?.masterWallet?.slice(0, 4)}`)
                  : (trade.copierVault?.copier?.displayName || `Copier ${trade.copierVault?.copier?.walletAddress?.slice(0, 4)}`);
                
                const img = isMaster
                  ? trade.masterExecutionVault?.user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${trade.masterExecutionVault?.masterWallet}`
                  : trade.copierVault?.copier?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${trade.copierVault?.copier?.walletAddress}`;

                return (
                  <div key={`trade-${trade.id}`} className='p-4 border-b border-[#1a2e2a] last:border-0 hover:bg-[#122421] transition-colors duration-200'>
                    <div className='flex gap-3'>
                      <div className='w-10 h-10 rounded-full bg-[#1a2e2a] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#23483b]'>
                        <img src={img} alt='Avatar' className='w-full h-full object-cover' />
                      </div>
                      <div className='flex-grow'>
                        <div className='flex justify-between items-center mb-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-[13px] font-bold text-white'>@{name}</span>
                            <span className='text-[11px] text-[#B0E4DD]'>
                              {isMaster ? 'executed a trade' : 'mirrored a trade'}
                            </span>
                          </div>
                          <span className='text-[10px] text-[#4a6b66] font-medium'>
                            {formatRelativeDate(trade.executedAt)}
                          </span>
                        </div>
                        
                        <div className='bg-[#122421] border border-[#23483b] rounded-lg flex justify-between items-center p-3'>
                          <div className='flex flex-col'>
                            <span className='text-[8px] text-[#4a6b66] uppercase font-bold'>Amount In</span>
                            <span className='text-[11px] text-[#FA6938] font-bold'>
                              {Number(trade.amountInDecimal).toFixed(3)} {trade.tokenInSymbol || 'SOL'}
                            </span>
                          </div>

                          <div className='flex flex-col items-center px-2'>
                            <span className='w-4 h-4 text-[#009883]'>→</span>
                          </div>

                          <div className='flex flex-col text-right'>
                            <span className='text-[8px] text-[#4a6b66] uppercase font-bold'>Tokens Out</span>
                            <div className='flex flex-col'>
                              <span className='text-[11px] text-[#13EC5F] font-bold'>
                                {Number(trade.amountOutDecimal).toFixed(3)} {trade.tokenOutSymbol || trade.tokenOut.slice(0, 4).toUpperCase()}
                              </span>
                              <a
                                href={`https://solscan.io/tx/${trade.signature}${explorerClusterParam}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-[8px] text-[#009883] hover:underline flex items-center justify-end gap-1 font-bold'
                              >
                                SOLSCAN ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <div className='py-16 flex flex-col items-center gap-2'>
              <div className='w-12 h-12 bg-[#1a2e2a] rounded-full flex items-center justify-center mb-2'>
                <span className='text-xl'>🌊</span>
              </div>
              <p className='text-[12px] text-[#B0E4DD] font-medium'>
                Quiet waters...
              </p>
              <p className='text-[10px] text-[#4a6b66]'>
                Trades and updates will appear here soon.
              </p>
            </div>
          )}
        </div>

        {/* Post Input Area (Relocated to bottom with older style) */}
        <div className='mt-8'>
          <p className='h-[0.5px] bg-[#232948]'></p>
          <div className='p-4'>
            <div className='w-full relative flex flex-col'>
              <div className='relative flex justify-center items-center'>
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={hasVault ? "Post an update..." : "Only vault owners can post."}
                  disabled={!hasVault || isPosting}
                  className='bg-[#22403F] text-white w-full p-3 pr-12 rounded-lg text-xs outline-none placeholder-[#4a6b66]'
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePost();
                    }
                  }}
                />
                <button
                  onClick={handlePost}
                  disabled={!hasVault || !content.trim() || isPosting}
                  className={`cursor-pointer flex justify-center items-center rounded-full absolute right-3 h-[30px] w-[30px] transition-all duration-200 ${
                    hasVault && content.trim() && !isPosting
                      ? 'bg-[#009883] hover:scale-110 shadow-[0_0_10px_rgba(0,152,131,0.5)]'
                      : 'bg-[#1a2e2a] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <p
                    style={{
                      backgroundImage: "url('/images/send.svg')"
                    }}
                    className='bg-center bg-cover h-[12px] w-[10px] flex justify-center items-center'
                  ></p>
                </button>
              </div>
              <div className='flex justify-between items-center mt-2 px-1'>
                <span className='text-[9px] text-[#4a6b66] font-medium'>
                  {content.length}/500
                </span>
                {!hasVault && (
                  <span className='text-[9px] text-[#fe9a00] italic font-medium'>
                    * Vault required to post
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
