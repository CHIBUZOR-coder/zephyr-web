export default function SocialFeed () {
  return (
    <div className='mt-10'>
      <div className='flex gap-2 items-center px-4'>
        <h4 className='text-[15px] font-[700]  '>Social Feed</h4>
        <p className='w-[6px] h-[6px] rounded-full bg-[#22C55E] animate-pulse'></p>
      </div>
      <div className=' bg-[#0f1a18] rounded-xl'>
        <div className=' p-4 flex flex-col mt-4 gap-8'>
          <p className='text-[12px] text-[#B0E4DD] text-center py-4'>
            No social feed data available yet.
          </p>
        </div>
      </div>
    </div>
  )
}