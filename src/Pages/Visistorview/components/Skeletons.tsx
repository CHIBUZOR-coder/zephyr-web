export function ProfileSkeleton () {
  return (
    <div className='min-h-screen bg-[#040f10] text-white px-4 md:px-8 py-6 animate-pulse'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* ================= HEADER ================= */}
        <div className='bg-gradient-to-r from-[#0a2a2a] to-[#051a1a] rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 border border-white/5'>
          {/* LEFT */}
          <div className='flex gap-4'>
            <div className='w-14 h-14 rounded-xl bg-[#0d2b2b]' />

            <div className='space-y-2'>
              <div className='h-4 w-32 bg-[#0d2b2b] rounded' />
              <div className='h-3 w-24 bg-[#0d2b2b] rounded' />
              <div className='h-3 w-40 bg-[#0d2b2b] rounded' />
              <div className='h-3 w-28 bg-[#0d2b2b] rounded' />
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className='flex flex-col md:flex-row gap-2 w-full md:w-auto'>
            <div className='h-9 w-full md:w-32 bg-[#0d2b2b] rounded-lg' />
            <div className='h-9 w-full md:w-24 bg-[#0d2b2b] rounded-lg' />
            <div className='h-9 w-full md:w-36 bg-[#0d2b2b] rounded-lg' />
          </div>
        </div>

        {/* ================= STATS GRID ================= */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-gradient-to-b from-[#0a2a2a] to-[#061c1c] p-4 rounded-xl border border-white/5 space-y-2'
            >
              <div className='h-3 w-16 bg-[#0d2b2b] rounded' />
              <div className='h-5 w-20 bg-[#0d2b2b] rounded' />
            </div>
          ))}
        </div>

        {/* ================= PERFORMANCE ================= */}
        <div className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] rounded-2xl p-6 border border-white/5'>
          {/* Header */}
          <div className='flex justify-between items-center mb-4'>
            <div className='h-3 w-32 bg-[#0d2b2b] rounded' />

            <div className='flex gap-2'>
              <div className='h-6 w-10 bg-[#0d2b2b] rounded' />
              <div className='h-6 w-10 bg-[#0d2b2b] rounded' />
              <div className='h-6 w-10 bg-[#0d2b2b] rounded' />
            </div>
          </div>

          {/* Chart */}
          <div className='h-56 w-full rounded-xl bg-[#0d2b2b] border border-white/5' />

          {/* Bottom stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 mt-6 gap-4 text-center'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='h-3 w-16 mx-auto bg-[#0d2b2b] rounded' />
                <div className='h-4 w-20 mx-auto bg-[#0d2b2b] rounded' />
              </div>
            ))}
          </div>
        </div>

        {/* ================= RISK SECTION ================= */}
        <div className='space-y-4'>
          <div className='grid md:grid-cols-2 gap-4'>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] p-5 rounded-xl border border-white/5 space-y-3'
              >
                <div className='h-3 w-24 bg-[#0d2b2b] rounded' />
                <div className='h-5 w-20 bg-[#0d2b2b] rounded' />
              </div>
            ))}
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] p-5 rounded-xl border border-white/5 space-y-3'
              >
                <div className='h-3 w-24 bg-[#0d2b2b] rounded' />
                <div className='h-5 w-20 bg-[#0d2b2b] rounded' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
