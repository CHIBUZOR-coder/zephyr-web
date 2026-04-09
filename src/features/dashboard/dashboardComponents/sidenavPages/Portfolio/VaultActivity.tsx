import type { VaultActivityItem } from "./Portfolio"
import { useVaultActivities, formatVaultActivity } from "./useVaultActivities"

interface VaultActivityProps {
  activities?: VaultActivityItem[]
  vaultAddress?: string | null
}

export function VaultActivity ({ activities, vaultAddress }: VaultActivityProps) {
  const { activities: fetchedActivities, isLoading } = useVaultActivities(vaultAddress ?? null, 15)

  const displayActivities = activities && activities.length > 0
    ? activities
    : fetchedActivities.map(formatVaultActivity)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-40 text-[#5f7d84] font-mono text-xs uppercase tracking-widest'>
        <div className='animate-pulse'>Loading activities...</div>
      </div>
    )
  }

  if (displayActivities.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-40 gap-3'>
        <div className='h-12 w-12 rounded-full bg-[#102221] flex items-center justify-center'>
          <span
            className='h-6 w-6 bg-center bg-cover opacity-40'
            style={{ backgroundImage: `url("/images/refresh.svg")` }}
          ></span>
        </div>
        <p className='text-[#5f7d84] text-xs font-mono uppercase tracking-widest'>
          No vault activities yet
        </p>
      </div>
    )
  }

  return (
    <div className='min-h-screen text-white w-full'>
      <div className='w-full overflow-x-auto'>
        <table className='min-w-[1000px] w-full border-separate border-spacing-y-4'>
          <thead>
            <tr className='text-xs tracking-widest text-[#5f7d84] uppercase'>
              <th className='text-left px-6'>Event Type</th>
              <th className='text-left'>Token</th>
              <th className='text-left'>Amount</th>
              <th className='text-left'>Status</th>
              <th className='text-right px-6'>Explorer</th>
            </tr>
          </thead>
          <tbody>
            {displayActivities.map(item => {
              const isPositive = item.amount.startsWith('+')
              const isNegative = item.amount.startsWith('-')

              return (
                <tr
                  key={item.id}
                  className='bg-[#102221] border border-[#0f3a40] hover:border-[#19d3c5]/40 transition-all duration-300'
                >
                  <td className='px-6 py-5'>
                    <div className='flex items-center gap-4'>
                      <div className='bg-[#0a1414] p-2 flex justify-center items-center rounded-lg'>
                        <span
                          className='bg-center bg-cover h-[20px] w-[20px] inline-block'
                          style={{
                            backgroundImage: `url("/images/refresh.svg")`
                          }}
                        ></span>
                      </div>
                      <div>
                        <p className='font-[900] text-[12px]'>{item.type}</p>
                        <p className='text-[10px] text-[#46514f] font-[700]'>
                          {item.time}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='py-5 font-[900] text-[12px]'>{item.token}</td>
                  <td
                    className={`py-5 font-[900] text-[12px] ${
                      isPositive
                        ? 'text-[#19d3c5]'
                        : isNegative
                        ? 'text-red-400'
                        : 'text-white'
                    }`}
                  >
                    {item.amount}
                  </td>
                  <td className='py-5'>
                    <div className='flex items-center gap-2'>
                      <span
                        className='bg-center bg-cover h-[14px] w-[14px]'
                        style={{
                          backgroundImage: `url("/images/success.svg")`
                        }}
                      ></span>
                      <span className='text-[9px] font-[900] text-[#00c0a8] uppercase tracking-wider'>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className='py-5 px-6 text-right'>
                    {item.signature && item.signature !== 'N/A' ? (
                      <a
                        href={`https://solscan.io/tx/${item.signature}?cluster=devnet`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 px-4 py-2 bg-[#0a1414] border border-[#23483b] rounded-lg hover:border-[#19d3c5]/40 hover:bg-[#0f2525] transition'
                      >
                        <span className='text-[10px] font-[400] text-[#546462]'>
                          {item.tx}
                        </span>
                        <span
                          className='bg-center bg-cover h-[12px] w-[12px]'
                          style={{ backgroundImage: `url("/images/redirr.svg")` }}
                        ></span>
                      </a>
                    ) : (
                      <span className='text-[10px] font-[400] text-[#546462]/50'>
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
