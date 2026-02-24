const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

export function formatDateTime(value: string): string {
  return dateFormatter.format(new Date(value))
}

export function formatHours(value: number): string {
  if (value < 24) {
    return `${value}h`
  }

  const days = Math.floor(value / 24)
  const hours = value % 24
  return hours === 0 ? `${days}d` : `${days}d ${hours}h`
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}
