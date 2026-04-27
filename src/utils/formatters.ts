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
  
  if (num >= 0.01) {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
  }
  
  if (num >= 0.0001) {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`
  }
  
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}`
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

export function formatSocialLink(value: string, platform: 'x' | 'telegram'): string {
  const input = value.trim();
  if (!input) return '';

  if (platform === 'x') {
    // Check if it's already a full URL
    const xUrlRegex = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i;
    const match = input.match(xUrlRegex);
    if (match) {
      const username = match[4];
      return `https://x.com/${username}`;
    }
    
    // Handle @username or just username
    const username = input.startsWith('@') ? input.slice(1) : input;
    // Basic validation: alphanumeric and underscore
    if (/^[a-zA-Z0-9_]+$/.test(username)) {
      return `https://x.com/${username}`;
    }
  }

  if (platform === 'telegram') {
    // Check if it's already a full URL
    const tgUrlRegex = /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/i;
    const match = input.match(tgUrlRegex);
    if (match) {
      const username = match[4];
      return `https://t.me/${username}`;
    }

    // Handle @username or just username
    const username = input.startsWith('@') ? input.slice(1) : input;
    if (/^[a-zA-Z0-9_]+$/.test(username)) {
      return `https://t.me/${username}`;
    }
  }

  return input;
}
