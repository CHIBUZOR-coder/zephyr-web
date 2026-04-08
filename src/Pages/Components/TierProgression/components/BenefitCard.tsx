export default function BenefitCard () {
  return (
    <div className='bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-xl p-4'>
      <h4 className='text-xs font-semibold text-purple-300 mb-3'>
        INSTITUTIONAL ALPHA BENEFITS
      </h4>

      <ul className='text-xs text-purple-200/80 space-y-1 list-disc ml-4'>
        <li>95% trader performance fee share</li>
        <li>Increased leaderboard visibility</li>
        <li>Institutional trader badge</li>
        <li>Governance verification</li>
      </ul>
    </div>
  )
}
