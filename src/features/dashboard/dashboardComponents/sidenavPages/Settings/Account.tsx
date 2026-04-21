import { useState, useEffect } from 'react'
import { FaXTwitter, FaTelegram } from 'react-icons/fa6'
import { useWallet } from '@solana/wallet-adapter-react'
import AvatarUpload from './Components/AvatarUpload'
import { useUserProfile } from './hooks/useUserProfile'

export default function Account() {
  const { connected } = useWallet()
  const { profile, isLoading, isSaving, error, updateProfile } = useUserProfile()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [twitter, setTwitter] = useState('')
  const [discord, setDiscord] = useState('')
  const [telegram, setTelegram] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile) {
        setDisplayName(profile.displayName || '')
        setBio(profile.bio || '')
        setTwitter(profile.twitter || '')
        setDiscord(profile.discord || '')
        setTelegram(profile.telegram || '')
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [profile])

  const isSocialCooldownActive = false;
  const daysUntilSocialUnlock = 0;

  const handleSave = async () => {
    if (!connected) return
    setSaveStatus('idle')

    const socialsChanged = 
      (twitter !== (profile?.twitter || '')) ||
      (discord !== (profile?.discord || '')) ||
      (telegram !== (profile?.telegram || ''));

    if (socialsChanged) {
      const confirmed = window.confirm(
        'Are you sure you want to update your social links? Once saved, you will not be able to edit them again for 14 days.'
      );
      if (!confirmed) return;
    }

    try {
      await updateProfile({ displayName, bio, twitter, discord, telegram })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    }
  }

  if (!connected) {
    return (
      <div className='w-full max-w-3xl'>
        <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
          PROFILE & IDENTITY
        </h1>
        <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
          Connect your wallet to manage your profile
        </p>
        <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
          <p className='text-textMuted text-sm text-center py-8'>
            Please connect your wallet to view and edit your profile settings.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='w-full max-w-3xl'>
        <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
          PROFILE & IDENTITY
        </h1>
        <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
          Manage your public profile and on-chain identity
        </p>
        <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
          <div className='animate-pulse space-y-4'>
            <div className='h-20 bg-gray-700 rounded-lg' />
            <div className='h-10 bg-gray-700 rounded-lg' />
            <div className='h-10 bg-gray-700 rounded-lg' />
            <div className='h-24 bg-gray-700 rounded-lg' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-3xl'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
            PROFILE & IDENTITY
          </h1>
          <p className='text-xs sm:text-sm text-textMuted mt-1'>
            Manage your public profile and on-chain identity
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='px-4 py-2 bg-accent text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50'
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className='mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm'>
          {error}
        </div>
      )}

      {saveStatus === 'success' && (
        <div className='mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm'>
          Profile updated successfully!
        </div>
      )}

      {/* Card */}
      <div
        className='
        rounded-xl
        border border-borderSubtle
        p-5 sm:p-6
        bg-gradient-to-b
        from-cardTop
        to-cardBottom
        shadow-[0_0_0_1px_rgba(0,255,200,0.04),0_10px_40px_rgba(0,0,0,0.6)]
        mt-6
        '
      >
        {/* Avatar Upload */}
        <AvatarUpload avatar={profile?.avatar} seed={profile?.walletAddress} />

        {/* Form */}
        <div className='space-y-5 mt-6'>
          {/* Display Name */}
          <div>
            <label className='text-[11px] tracking-wide text-textMuted'>
              DISPLAY NAME
            </label>

            <input
              type='text'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder='Your display name'
              className='
              w-full mt-1
              px-3 py-2
              rounded-lg
              border border-borderSubtle
              bg-inputBg
              text-sm
              outline-none
              focus:border-accent
              '
            />
          </div>

          {/* Bio */}
          <div>
            <div className='flex justify-between'>
              <label className='text-[11px] tracking-wide text-textMuted'>
                BIO
              </label>

              <span className='text-[10px] text-textMuted'>{bio.length}/160</span>
            </div>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              maxLength={160}
              placeholder='Tell others about yourself'
              className='
              w-full mt-1
              px-3 py-2
              h-24
              rounded-lg
              border border-borderSubtle
              bg-inputBg
              text-sm
              outline-none
              resize-none
              focus:border-accent
              '
            />
          </div>

          {/* Social Links */}
          <div className='space-y-3'>
            <p className='text-[11px] tracking-wide text-textMuted'>
              SOCIAL LINKS
            </p>
            {isSocialCooldownActive && (
              <p className='text-[10px] text-amber-500'>
                Social links are locked. You can update them again in {daysUntilSocialUnlock} days.
              </p>
            )}

            {/* Twitter */}
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 flex items-center justify-center rounded-md bg-black'>
                <FaXTwitter size={13} />
              </div>

              <input
                type='text'
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder='@username'
                className='
                flex-1
                px-3 py-2
                rounded-lg
                border border-borderSubtle
                bg-inputBg
                text-sm
                outline-none
                focus:border-accent
                disabled:opacity-50 disabled:cursor-not-allowed
                '
                disabled={isSocialCooldownActive}
              />
            </div>

            {/* Discord */}
            {/* <div className='flex items-center gap-2'>
              <div className='w-7 h-7 flex items-center justify-center rounded-md bg-indigo-500'>
                <FaDiscord size={13} />
              </div>

              <input
                type='text'
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder='@username'
                className='
                flex-1
                px-3 py-2
                rounded-lg
                border border-borderSubtle
                bg-inputBg
                text-sm
                outline-none
                focus:border-accent
                disabled:opacity-50 disabled:cursor-not-allowed
                '
                disabled={isSocialCooldownActive}
              />
            </div> */}

            {/* Telegram */}
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 flex items-center justify-center rounded-md bg-sky-500'>
                <FaTelegram size={13} />
              </div>

              <input
                type='text'
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder='@username'
                className='
                flex-1
                px-3 py-2
                rounded-lg
                border border-borderSubtle
                bg-inputBg
                text-sm
                outline-none
                focus:border-accent
                disabled:opacity-50 disabled:cursor-not-allowed
                '
                disabled={isSocialCooldownActive}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
