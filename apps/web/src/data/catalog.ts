import type { DeviceCatalogItem, IssueCatalogItem, TicketStage, UrgencyPolicy } from '../types/domain.ts'

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  { id: 'smartphone', label: 'Смартфоны', categoryNote: 'Экран, батарея, разъёмы, камера, плата.', baseDiagnosticFee: 4000, baseLaborRate: 9000, baseHours: 6, partsRiskFactor: 1.08 },
  { id: 'laptop', label: 'Ноутбуки', categoryNote: 'Система охлаждения, клавиатура, SSD, питание.', baseDiagnosticFee: 6000, baseLaborRate: 13000, baseHours: 10, partsRiskFactor: 1.14 },
  { id: 'tablet', label: 'Планшеты', categoryNote: 'Сенсор, зарядка, камеры, аудиотракт.', baseDiagnosticFee: 5000, baseLaborRate: 10500, baseHours: 8, partsRiskFactor: 1.1 },
  { id: 'console', label: 'Игровые консоли', categoryNote: 'HDMI, перегрев, накопители, питание.', baseDiagnosticFee: 6500, baseLaborRate: 14500, baseHours: 11, partsRiskFactor: 1.18 },
  { id: 'tv', label: 'Телевизоры', categoryNote: 'Подсветка, блок питания, матрица.', baseDiagnosticFee: 8000, baseLaborRate: 16000, baseHours: 13, partsRiskFactor: 1.2 },
  { id: 'audio', label: 'Аудиотехника', categoryNote: 'Усилители, аккумуляторы, беспроводные модули.', baseDiagnosticFee: 3500, baseLaborRate: 8000, baseHours: 5, partsRiskFactor: 1.04 },
]

export const ISSUE_CATALOG: IssueCatalogItem[] = [
  { id: 'screen', label: 'Экран поврежден / нет изображения', complexity: 2, extraHours: 3, partsReserve: 22000 },
  { id: 'battery', label: 'Быстро садится батарея', complexity: 1.4, extraHours: 2, partsReserve: 12000 },
  { id: 'charging', label: 'Не заряжается / нестабильное питание', complexity: 1.9, extraHours: 3, partsReserve: 15000 },
  { id: 'water', label: 'Попадание влаги', complexity: 2.8, extraHours: 5, partsReserve: 28000 },
  { id: 'overheat', label: 'Перегрев / троттлинг', complexity: 2.2, extraHours: 4, partsReserve: 18000 },
  { id: 'software', label: 'Сбой ПО / циклическая загрузка', complexity: 1.3, extraHours: 2, partsReserve: 5000 },
  { id: 'motherboard', label: 'Ремонт платы / компонентный уровень', complexity: 3.3, extraHours: 7, partsReserve: 36000 },
]

export const URGENCY_POLICIES: UrgencyPolicy[] = [
  { id: 'standard', label: 'Стандарт', details: 'Обычная очередь обслуживания.', priceMultiplier: 1, timeMultiplier: 1 },
  { id: 'priority', label: 'Приоритет', details: 'Ускоренная диагностика и приоритет в очереди.', priceMultiplier: 1.1, timeMultiplier: 0.78 },
  { id: 'express', label: 'Экспресс', details: 'Максимально быстрое выполнение заявки.', priceMultiplier: 1.18, timeMultiplier: 0.62 },
]

export const STAGE_LABELS: Record<TicketStage, string> = {
  accepted: 'Принят',
  diagnostics: 'Диагностика',
  approval: 'Согласование',
  repair: 'Ремонт',
  quality: 'Контроль качества',
  ready: 'Готов к выдаче',
}
