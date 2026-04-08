const stats = [
  { label: 'Articles Found', value: '18', img: '/images/file.svg' },
  { label: 'Categories', value: '10', img: '/images/layers.svg' },
  { label: 'Avg Read Time', value: '~15 min', img: '/images/clock.svg' },
  { label: 'Updates', value: 'Weekly', img: '/images/clock.svg' }
]

export default function DocsStats () {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {stats.map((s, i) => (
        <div
          key={i}
          className='
          bg-docsCard
          border border-docsBorder
          rounded-lg
          p-4
          '
        >
          <span
            style={{ backgroundImage: `url(${s.img})` }}
            className=' bg-center bg-cover h-[16px] w-[16px] inline-block'
          ></span>
          <p className='text-[24px]  font-[900]'>{s.value}</p>

          <p className='text-[10px] font-[700] leading-[15px] tracking-[1px] text-docsMuted mt-1'>{s.label}</p>
        </div>
      ))}
    </div>
  )
}
