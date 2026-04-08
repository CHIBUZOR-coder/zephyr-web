export default function ProfileIdentity () {
  return (
    <div className='max-w-3xl'>
      <h1 className='text-xl font-semibold mb-1'>PROFILE & IDENTITY</h1>

      <p className='text-sm text-textMuted mb-6'>
        Manage your public profile and on-chain identity
      </p>

      <div className='bg-card border border-borderSubtle rounded-xl p-6 space-y-6'>
        {/* avatar */}
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-lg bg-accent flex items-center justify-center font-semibold text-black'>
            AK
          </div>

          <button className='text-sm border border-borderSubtle px-3 py-1 rounded-md hover:bg-panel'>
            Upload Photo
          </button>
        </div>

        {/* display name */}
        <div>
          <label className='text-xs text-textMuted'>DISPLAY NAME</label>

          <input
            className='w-full mt-1 bg-panel border border-borderSubtle rounded-lg px-3 py-2'
            defaultValue='Alpha King'
          />
        </div>

        {/* username */}
        <div>
          <label className='text-xs text-textMuted'>USERNAME</label>

          <input
            className='w-full mt-1 bg-panel border border-borderSubtle rounded-lg px-3 py-2'
            defaultValue='@alpha_king'
          />
        </div>

        {/* bio */}
        <div>
          <label className='text-xs text-textMuted'>BIO</label>

          <textarea className='w-full mt-1 bg-panel border border-borderSubtle rounded-lg px-3 py-2 h-20' />
        </div>

        {/* social */}
        <div className='space-y-3'>
          <p className='text-xs text-textMuted'>SOCIAL LINKS</p>

          <input
            className='w-full bg-panel border border-borderSubtle rounded-lg px-3 py-2'
            placeholder='@alphatrader'
          />

          <input
            className='w-full bg-panel border border-borderSubtle rounded-lg px-3 py-2'
            placeholder='@alphatrader'
          />

          <input
            className='w-full bg-panel border border-borderSubtle rounded-lg px-3 py-2'
            placeholder='alphatrader#1234'
          />
        </div>
      </div>
    </div>
  )
}
