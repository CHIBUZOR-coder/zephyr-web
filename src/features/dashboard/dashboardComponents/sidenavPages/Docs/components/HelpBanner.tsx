export default function HelpBanner () {
  return (
    <div
      className='
      mt-10
      bg-docsCard
      border border-docsBorder
      rounded-lg
      p-6
      flex
      flex-col
      md:flex-row
      justify-between
      items-center
      gap-4
      '
    >
      <div>
        <h3 className='font-semibold text-sm'>NEED MORE HELP?</h3>

        <p className='text-xs text-docsMuted mt-1'>
          Contact our support team if you can't find what you're looking for.
        </p>
      </div>

      <button
        className='
        bg-docsPrimary
        text-black
        text-xs
        px-4 py-2
        rounded-md
        font-medium
        hover:opacity-90
        '
      >
        CONTACT SUPPORT
      </button>
    </div>
  )
}
