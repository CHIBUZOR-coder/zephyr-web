export const VaultActivitySkeleton = () => {
  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-3.5 py-2 border-b border-[#1A3A39]'>
        <div className='h-2 rounded-sm bg-[#1A3A39] animate-pulse w-full'></div>
      </div>

      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='grid grid-cols-[2fr_1fr_1fr_1.2fr_1.5fr] gap-3 px-3.5 py-3.5 border-b border-[#1A3A39] last:border-b-0 items-center'
        >
          {/* Event Type: circle + label + subtitle */}
          <div className='flex items-center gap-2.5'>
            <div className='w-7 h-7 rounded-full bg-[#1A3A39] animate-pulse shrink-0' />
            <div className='flex flex-col gap-1.5'>
              <div className='h-2.5 w-[90px] rounded-sm bg-[#1A3A39] animate-pulse' />
              <div className='h-2 w-[55px] rounded-sm bg-[#1A3A39] animate-pulse opacity-50' />
            </div>
          </div>

          {/* Token */}
          <div className='h-2.5 w-9 rounded-sm bg-[#1A3A39] animate-pulse' />

          {/* Amount */}
          <div className='h-3 w-12 rounded-sm bg-[#1A3A39] animate-pulse' />

          {/* Status: dot + label */}
          <div className='flex items-center gap-1.5'>
            <div className='w-3.5 h-3.5 rounded-full bg-[#1A3A39] animate-pulse shrink-0' />
            <div className='h-2.5 w-14 rounded-sm bg-[#1A3A39] animate-pulse' />
          </div>

          {/* Timestamp + Explorer button */}
          <div className='flex flex-col gap-1.5 items-start'>
            <div className='h-2 w-[70px] rounded-sm bg-[#1A3A39] animate-pulse opacity-60' />
            <div className='h-[22px] w-16 rounded bg-[#1A3A39] animate-pulse' />
          </div>
        </div>
      ))}
    </div>
  )
}
