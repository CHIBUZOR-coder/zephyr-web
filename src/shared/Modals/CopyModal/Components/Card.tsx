interface CardProps {
  label: string
  value: string
}

const Card = ({ label, value }: CardProps) => (
  <div className='bg-[#0a1717] border border-[#1c3535] rounded-lg p-4 flex flex-col gap-2'>
    <p className='text-xs text-[#F3F3F3] '>{label}</p>
    <p
      className={`font-semibold font-jetbrains text-[18px] ${
        label === 'Profit Take'
          ? ' text-[#10b981]'
          : label === 'Max Drawdown Stop'
          ? 'text-[red]'
          : 'text-white'
      } `}
    >
      {value}
    </p>
  </div>
)

export default Card
