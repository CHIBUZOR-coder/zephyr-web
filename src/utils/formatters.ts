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

export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '$0.00'
  if (num === 0) return '$0.00'
  
  if (num >= 1) {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  if (num >= 0.0001) {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
  }
  
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`
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
