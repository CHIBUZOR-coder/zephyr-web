// LiveTradeSkeletons.tsx

export const ActiveTradeSkeleton = () => {
  return (
    <div
      className='grid grid-cols-4 items-center px-4 py-4 rounded-xl 
    bg-[#102221] border border-teal-900/40 animate-pulse'
    >
      <div className='flex items-center gap-3'>
        <div className='h-[40px] w-[40px] bg-[#1a2f2f] rounded-lg' />
        <div className='space-y-2'>
          <div className='h-3 w-24 bg-[#1a2f2f] rounded' />
          <div className='h-2 w-16 bg-[#1a2f2f] rounded-full' />
        </div>
      </div>

      <div className='space-y-2'>
        <div className='h-3 w-20 bg-[#1a2f2f] rounded' />
        <div className='h-3 w-16 bg-[#1a2f2f] rounded' />
      </div>

      <div className='space-y-2'>
        <div className='h-3 w-20 bg-[#1a2f2f] rounded' />
        <div className='h-2 w-24 bg-[#1a2f2f] rounded' />
      </div>

      <div className='flex justify-end'>
        <div className='h-6 w-28 bg-[#1a2f2f] rounded-lg' />
      </div>
    </div>
  )
}

export const PositionSkeleton = () => {
  return (
    <div className='bg-[#102221] border border-teal-900/40 rounded-2xl p-6 space-y-6 animate-pulse'>
      <div className='flex justify-between'>
        <div className='space-y-2'>
          <div className='h-4 w-32 bg-[#1a2f2f] rounded' />
          <div className='h-3 w-24 bg-[#1a2f2f] rounded' />
        </div>

        <div className='space-y-2'>
          <div className='h-3 w-20 bg-[#1a2f2f] rounded' />
          <div className='h-3 w-20 bg-[#1a2f2f] rounded' />
        </div>
      </div>

      <div className='grid md:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='space-y-2'>
            <div className='h-2 w-16 bg-[#1a2f2f] rounded' />
            <div className='h-3 w-20 bg-[#1a2f2f] rounded' />
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center'>
        <div className='h-3 w-32 bg-[#1a2f2f] rounded' />
        <div className='h-8 w-24 bg-[#1a2f2f] rounded-xl' />
      </div>
    </div>
  )
}
