export default function DocsSearch () {
  return (
    <div className='w-full'>
      <input
        placeholder='Search documentation...'
        className='
        w-full
        bg-docsCard
        border border-docsBorder
        rounded-lg
        px-4 py-3
        text-sm
        outline-none
        focus:border-docsPrimary
        '
      />
    </div>
  )
}
