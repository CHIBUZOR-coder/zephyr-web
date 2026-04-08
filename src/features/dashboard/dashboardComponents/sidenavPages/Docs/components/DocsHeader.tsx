export default function DocsHeader () {
  return (
    <div>
      <div className='flex items-center gap-3'>
        <div className='w-[64px] h-[64px] flex justify-center items-center bg-[#041816] border-[1px] border-[#1f4d47] rounded-lg '>
          <span
            style={{ backgroundImage: `url("/images/book.svg")` }}
            className='bg-center bg-cover h-[32px] w-[32px]'
          ></span>
        </div>

        <div className="flex flex-col ">
          <h1 className='text-[30px] leading-[48px] font-[900]'>
            DOCUMENTATION
          </h1>
          <p className='text-[15px] font-[400] text-[#B0E4DD] '>
            Browse platform guides, developer resources, and trading
            documentation
          </p>
        </div>
      </div>
    </div>
  )
}
