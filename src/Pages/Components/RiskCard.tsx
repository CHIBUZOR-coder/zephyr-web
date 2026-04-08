import Card from "./Card"


interface RiskCardProps {
  title: string
  value: string
  subtitle: string
  color?: string
}

export default function RiskCard ({
  title,
  value,
  subtitle,
  color = 'text-white'
}: RiskCardProps) {
  return (
    <Card className="p-2">
      <h4 className='text-sm text-teal-200/70 mb-2'>{title}</h4>

      <div className={`text-3xl font-semibold ${color}`}>{value}</div>

      <p className='text-xs text-teal-300/50 mt-1'>{subtitle}</p>
    </Card>
  )
}
