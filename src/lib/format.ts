const moneyFormatter = new Intl.NumberFormat('ru-KZ', {
  style: 'currency',
  currency: 'KZT',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('ru-KZ', {
  day: '2-digit',
  month: '2-digit',
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
