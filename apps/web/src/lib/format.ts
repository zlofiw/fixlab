const moneyFormatter = new Intl.NumberFormat('ru-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
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
    return `${value} ч`
  }

  const days = Math.floor(value / 24)
  const hours = value % 24
  return hours === 0 ? `${days} д` : `${days} д ${hours} ч`
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}
