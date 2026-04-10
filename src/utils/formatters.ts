export function formatCurrency(value: number | string, options?: {
  compact?: boolean
  decimals?: number
}): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return '$0'
  
  if (options?.compact) {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(1)}B`
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(1)}M`
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}K`
    }
    return `$${num.toFixed(options?.decimals ?? 0)}`
  }
  
  return `$${num.toFixed(options?.decimals ?? 2)}`
}

export function formatPercentage(value: number | string, decimals = 1): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0%'
  return `${num.toFixed(decimals)}%`
}

export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  return num.toLocaleString()
}
