import { useState, useEffect, useCallback, useRef } from 'react'
import { FaXTwitter, FaTelegram } from 'react-icons/fa6'
import { useWallet } from '@solana/wallet-adapter-react'
import AvatarUpload from './Components/AvatarUpload'
import { useUserProfile } from './hooks/useUserProfile'
import { formatSocialLink } from '../../../../../utils/formatters'
import { ConfirmationModal } from '../../../../../shared/Modals'

const COOLDOWN_DAYS = 7

export default function Account () {
  const { connected } = useWallet()
  const { profile, isLoading, isSaving, error, updateProfile } =
    useUserProfile()

  const [displayName, setDisplayName] = useState('')
  const [userName, setUserName] = useState('')
  const [bio, setBio] = useState('')
  const [twitter, setTwitter] = useState('')
  const [discord, setDiscord] = useState('')
  const [telegram, setTelegram] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkUsername = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (trimmed.length < 3) {
      setUsernameAvailable(null)
      return
    }
    if (profile?.username && trimmed.toLowerCase() === profile.username.toLowerCase()) {
      setUsernameAvailable(true)
      return
    }
    setCheckingUsername(true)
    try {
      const res = await fetch(`/api/users/check-username/${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      setUsernameAvailable(data.available)
    } catch {
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }, [profile?.username])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setUserName(profile.username || '')
      setBio(profile.bio || '')
      setTwitter(profile.twitter || '')
      setDiscord(profile.discord || '')
      setTelegram(profile.telegram || '')
    }
  }, [profile])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      checkUsername(userName)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [userName, checkUsername])

  const isSocialCooldownActive = false
  const daysUntilSocialUnlock = 0

  const executeSave = async () => {
    setSaveStatus('idle')
    setShowConfirmModal(false)

    // Client-side sanitization: Strip HTML tags
    const sanitize = (val: string) => val.replace(/<[^>]*>?/gm, '').trim();

    const cleanDisplayName = sanitize(displayName);
    const cleanUserName = sanitize(userName).replace(/[^a-zA-Z0-9_]/g, '');
    const cleanBio = sanitize(bio);
    const cleanTwitter = sanitize(twitter);
    const cleanTelegram = sanitize(telegram);

    const formattedTwitter = formatSocialLink(cleanTwitter, 'x')
    const formattedTelegram = formatSocialLink(cleanTelegram, 'telegram')

    // Only send fields that actually changed to avoid triggering social cooldown
    const changedFields: Record<string, string | undefined> = {}
    if ((cleanUserName || undefined) !== (profile?.username || undefined)) changedFields.username = cleanUserName || undefined
    if ((cleanDisplayName || undefined) !== (profile?.displayName || undefined)) changedFields.displayName = cleanDisplayName
    if ((cleanBio || undefined) !== (profile?.bio || undefined)) changedFields.bio = cleanBio
    if (formattedTwitter !== (profile?.twitter || '')) changedFields.twitter = formattedTwitter
    if ((discord || undefined) !== (profile?.discord || undefined)) changedFields.discord = discord
    if (formattedTelegram !== (profile?.telegram || '')) changedFields.telegram = formattedTelegram

    try {
      await updateProfile(changedFields)
      
      // Update local state with sanitized/formatted values
      setDisplayName(cleanDisplayName)
      setUserName(cleanUserName)
      setBio(cleanBio)
      setTwitter(formattedTwitter)
      setTelegram(formattedTelegram)
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    }
  }

  const handleSave = async () => {
    if (!connected) return

    if (userName && userName.length >= 3 && usernameAvailable === false) {
      setSaveStatus('error')
      return
    }

    const formattedTwitter = formatSocialLink(twitter, 'x')
    const formattedTelegram = formatSocialLink(telegram, 'telegram')

    const profileFieldsChanged = 
      (userName.toLowerCase() !== (profile?.username?.toLowerCase() || '')) ||
      (formattedTwitter !== (profile?.twitter || '')) ||
      (discord !== (profile?.discord || '')) ||
      (formattedTelegram !== (profile?.telegram || ''));

    if (profileFieldsChanged) {
      setShowConfirmModal(true)
    } else {
      executeSave()
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
      <div className='flex items-center justify-between flex-col lg:flex-row w-full gap-3 '>
        <div className='w-full lg:w-[60%]'>
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
          className=' bg-accent text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 p-2 w-full lg:w-auto'
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
          {/* Username */}
          <div>
            <label className='text-[11px] tracking-wide text-textMuted'>
              @USERNAME
            </label>

            <div className='mt-1 relative'>
              <input
                type='text'
                value={userName}
                onChange={e => {
                  const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                  setUserName(v)
                }}
                maxLength={30}
                placeholder='Choose a unique username'
                className={`
                  w-full
                  px-3 py-2
                  rounded-lg
                  border
                  bg-inputBg
                  text-sm
                  outline-none
                  ${usernameAvailable === false ? 'border-red-500 focus:border-red-500' :
                    usernameAvailable === true && userName.length >= 3 ? 'border-green-500 focus:border-green-500' :
                    'border-borderSubtle focus:border-accent'}
                `}
              />
              {checkingUsername && (
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-textMuted'>
                  Checking...
                </span>
              )}
              {!checkingUsername && userName.length >= 3 && usernameAvailable === true && (
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-400'>
                  Available
                </span>
              )}
              {!checkingUsername && userName.length >= 3 && usernameAvailable === false && (
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-red-400'>
                  Taken
                </span>
              )}
            </div>
            <p className='text-[10px] text-textMuted mt-1'>
              3-30 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className='text-[11px] tracking-wide text-textMuted'>
              DISPLAY NAME
            </label>

            <input
              type='text'
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
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

              <span className='text-[10px] text-textMuted'>
                {bio.length}/160
              </span>
            </div>

            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 160))}
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
                Social links are locked. You can update them again in{' '}
                {daysUntilSocialUnlock} days.
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
                onChange={e => setTwitter(e.target.value)}
                placeholder='Input your Twitter or X profile link'
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
                onChange={e => setTelegram(e.target.value)}
                placeholder='Paste your Telegram profile link'
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

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
        title="Confirm Profile Update?"
        description={
          <>
            Are you sure you want to update your profile?
            <br /><br />
            Once saved, you will not be able to edit your username or social links again for <span className="text-[#FE9A00] font-bold">{COOLDOWN_DAYS} days</span>.
          </>
        }
        confirmLabel="Update Profile"
        cancelLabel="Cancel"
        variant="warning"
        isLoading={isSaving}
      />
    </div>
  )
}
