import Card from './Card'
import { useTradingModeStore } from '../../features/dashboard/useTradingModeStore'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUserVaults } from '../../features/master/useUserVaults'
import { useUserProfile } from '../../features/users/useUserProfile'
import { useMasterTierState } from '../../features/master/useMasterTier'
import { useEffect, useMemo } from 'react'
import { useGeneralContext } from '../../Context/GeneralContext'
import { getTimeAgo } from '../../utils/dateHelpers'
import { Link } from 'react-router-dom'
import { TierBadge } from './TierBadge'

function getDefaultAvatar(walletAddress: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(walletAddress)}`
}

export default function ProfileHeader () {
  const { masterMode, toggleMasterMode } = useTradingModeStore()
  const { publicKey } = useWallet()
  const { masterVault } = useUserVaults()
  const { hasMaterVault, setMasterTraderOpen } = useGeneralContext()

  const walletAddress = publicKey?.toBase58() || ''
  const { data: userProfile } = useUserProfile(walletAddress)
  const { data: tierState } = useMasterTierState(walletAddress)
  useEffect(()=>{
    console.log("User Profile:", userProfile)
  },[walletAddress, userProfile])

  const masterVaultAddress = masterVault?.vaultPda || ''

  const displayAddress =
    masterMode && masterVaultAddress ? masterVaultAddress : walletAddress
  const addressSnippet = `${displayAddress.slice(
    0,
    5
  )}...${displayAddress.slice(-5)}`

  const joinedDate = useMemo(() => {
    if (!userProfile?.createdAt) return 'N/A'
    const date = new Date(userProfile.createdAt)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }, [userProfile])

  const handleCopy = () => {
    if (displayAddress && displayAddress !== 'Disconnected') {
      navigator.clipboard.writeText(displayAddress)
      alert('Address copied to clipboard!')
    }
  }

  return (
    <Card className='flex justify-between flex-col md:flex-row gap-6 md:gap-0  p-2'>
      <div className='flex flex-col lg:flex-row  gap-4  w-full md:w-auto'>
        <div className='flex flex-col gap-10 lg:gap-14  items-center md:items-start '>
          <div className='w-[96px] h-[96px] rounded-lg flex items-center justify-center  font-[900] text-[30px] leading-[36px] text-white bg-gradient-to-b from-[#009883] to-[#00A991]'>
            {publicKey ? (
              <img
                src={userProfile?.avatar || getDefaultAvatar(walletAddress)}
                alt='Avatar'
                className='w-full h-full rounded-lg object-cover'
              />
            ) : (
              '??'
            )}
          </div>

          <div className='hidden md:block w-full md:w-auto '>
            <div className='flex justify-end'>
              {masterMode && userProfile?.isVerified && (
                <div className='h-[32px] w-[32px] bg-[#22C55E] flex justify-center items-center p-2 rounded-full'>
                  <span
                    style={{ backgroundImage: `url("/images/Shield_pro.svg")` }}
                    className='bg-center bg-cover h-[16px] w-[16px] inline-block cursor-pointer'
                  ></span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4 w-full md:w-auto'>
          <div className='flex items-center gap-3'>
            <div>
              <h2 className=' text-[24px] font-[900] leading-[32px]'>
                {userProfile?.displayName ||
                  (masterMode ? 'Master Trader' : 'Copier Account')}
              </h2>
            </div>

            {masterMode && tierState?.currentTierLabel && (
              <TierBadge tierLabel={tierState.currentTierLabel} />
            )}
          </div>
          <div className='flex items-center gap-2 text-[#7c9b97]'>
            <p>{masterMode ? 'MASTER VAULT' : 'WALLET'}</p>
            <span
              style={{ backgroundImage: `url("/images/wal.svg")` }}
              className='bg-center bg-cover h-[12px] w-[12px] inline-block cursor-pointer'
            ></span>
            <p className='text-[14px] font-[400] leading-[20px]'>
              {addressSnippet}
            </p>
            <span
              onClick={handleCopy}
              style={{ backgroundImage: `url("/images/cop.svg")` }}
              className='bg-center bg-cover h-[12px] w-[12px] inline-block cursor-pointer hover:opacity-80'
            ></span>
          </div>
          <p className='text-sm text-teal-200/60 max-w-md'>
            {userProfile?.bio
              ? userProfile.bio
              : masterMode
              ? 'Algorithmic trader specializing in high-conviction momentum strategies.'
              : 'Following top performing traders with automated risk management.'}
          </p>
          <div className='flex items-center gap-4'>
            <div className='prion  border-r-[1px] border-r-[#33564a] pr-4'>
              <p className='text-[#50706c] text-[12px] font-[700] leading-[16px] tracking-[1.2px] uppercase'>
                Joined
              </p>
              <p className='text-white text-[14px] font-[700] leading-[20px]'>
                {joinedDate}
              </p>
            </div>
            <div className='prion border-r-[1px] border-r-[#33564a] pr-4'>
              <p className='text-[#50706c] text-[12px] font-[700] leading-[16px] tracking-[1.2px] uppercase'>
                Last Active
              </p>
              <p className='text-[#22C55E] text-[14px] font-[700] leading-[20px]'>
                {userProfile?.updatedAt
                  ? getTimeAgo(userProfile.updatedAt)
                  : 'JUST NOW'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <Link
          to={'/settings'}
          className='btns px-4 py-2 rounded-lg bg-teal-500 text-black text-sm font-semibold flex items-center gap-2'
        >
          <span
            style={{ backgroundImage: `url("/images/edit3.svg")` }}
            className='bg-center bg-cover h-[16px] w-[16px] inline-block cursor-pointer '
          ></span>
          <span>EDIT PROFILE</span>
        </Link>

        <button
          onClick={() => {
            if (!masterMode && !hasMaterVault) {
              setMasterTraderOpen(true)
            } else {
              toggleMasterMode()
            }
          }}
          className='btns px-4 py-2 rounded-lg bg-profile_btn border border-[#23483b] text-sm flex items-center gap-2'
        >
          <span
            style={{ backgroundImage: `url("/images/zap.svg")` }}
            className='bg-center bg-cover h-[16px] w-[16px] inline-block cursor-pointer '
          ></span>
          <span>{masterMode ? 'SWITCH TO COPIER' : 'SWITCH TO MASTER'}</span>
        </button>

        <Link to={"/portfolio"} className='btns px-4 py-2 rounded-lg bg-profile_btn border border-[#23483b] text-sm flex items-center gap-2'>
          <span
            style={{ backgroundImage: `url("/images/activity.svg")` }}
            className='bg-center bg-cover h-[16px] w-[16px] inline-block cursor-pointer '
          ></span>
          <span>VIEW PORTFOLIO</span>
        </Link>
        {masterMode && (
          <button className=' btns px-4 py-2 rounded-lg border border-medal_border bg-medal  text-sm  flex items-center gap-2'>
            <span
              style={{ backgroundImage: `url("/images/yellow_arrow.svg")` }}
              className='bg-center bg-cover h-[16px] w-[16px] inline-block cursor-pointer '
            ></span>
            <p className='font-[900] text-[14px] leading-[20px] tracking-[1.4px] text-[#FE9A00]'>
              Claim Fees
            </p>
          </button>
        )}
      </div>
    </Card>
  )
}
