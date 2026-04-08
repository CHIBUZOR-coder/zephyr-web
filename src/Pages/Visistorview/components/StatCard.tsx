type StatCardProps = {
  label: string
  value: string | number
  negative?: boolean
  highlight?: boolean
}

export default function StatCard ({
  label,
  value,
  negative,
  highlight
}: StatCardProps) {
  return (
    <div className='bg-gradient-to-b from-[#0a2a2a] to-[#061c1c] p-4 rounded-xl border border-white/5'>
      <p className='text-xs text-gray-400 mb-2'>{label}</p>

      <p
        className={`text-lg font-semibold ${
          negative
            ? 'text-red-400'
            : highlight
            ? 'text-green-400'
            : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
