import type {
  DeviceCatalogItem,
  DeviceType,
  IssueCatalogItem,
  IssueType,
  TicketStage,
  UrgencyPolicy,
  UrgencyType,
} from '../types/domain.ts'

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  {
    id: 'smartphone',
    label: 'Смартфоны',
    categoryNote: 'Экран, разъемы зарядки, аккумулятор, камеры и диагностика платы.',
    baseDiagnosticFee: 6000,
    baseLaborRate: 14000,
    baseHours: 8,
    partsRiskFactor: 1.1,
  },
  {
    id: 'laptop',
    label: 'Ноутбуки',
    categoryNote: 'Система охлаждения, клавиатура, SSD, питание и компонентный ремонт.',
    baseDiagnosticFee: 9000,
    baseLaborRate: 22000,
    baseHours: 14,
    partsRiskFactor: 1.2,
  },
  {
    id: 'tablet',
    label: 'Планшеты',
    categoryNote: 'Тачскрин, контроллеры питания, камеры, аудио и восстановление корпуса.',
    baseDiagnosticFee: 7500,
    baseLaborRate: 17000,
    baseHours: 10,
    partsRiskFactor: 1.15,
  },
  {
    id: 'console',
    label: 'Игровые консоли',
    categoryNote: 'HDMI, перегрев, накопители и восстановление после коротких замыканий.',
    baseDiagnosticFee: 9500,
    baseLaborRate: 24000,
    baseHours: 16,
    partsRiskFactor: 1.25,
  },
  {
    id: 'tv',
    label: 'Телевизоры',
    categoryNote: 'Подсветка, блоки питания, T-CON и цепочка вывода изображения.',
    baseDiagnosticFee: 12000,
    baseLaborRate: 28000,
    baseHours: 20,
    partsRiskFactor: 1.3,
  },
  {
    id: 'audio',
    label: 'Аудиотехника',
    categoryNote: 'Усилители, колонки, портативная аудиотехника, батареи и беспроводные модули.',
    baseDiagnosticFee: 5000,
    baseLaborRate: 12000,
    baseHours: 7,
    partsRiskFactor: 1.05,
  },
]

export const ISSUE_CATALOG: IssueCatalogItem[] = [
  {
    id: 'screen',
    label: 'Разбит экран или нет изображения',
    complexity: 2.2,
    extraHours: 4,
    partsReserve: 38000,
  },
  {
    id: 'battery',
    label: 'Быстро разряжается или не держит заряд',
    complexity: 1.6,
    extraHours: 2,
    partsReserve: 21000,
  },
  {
    id: 'charging',
    label: 'Не заряжается или нестабильное питание',
    complexity: 2.1,
    extraHours: 3,
    partsReserve: 24000,
  },
  {
    id: 'water',
    label: 'Попадание жидкости',
    complexity: 3.2,
    extraHours: 6,
    partsReserve: 46000,
  },
  {
    id: 'overheat',
    label: 'Перегрев, шум или троттлинг',
    complexity: 2.5,
    extraHours: 5,
    partsReserve: 30000,
  },
  {
    id: 'software',
    label: 'Сбой ПО или циклическая перезагрузка',
    complexity: 1.4,
    extraHours: 2,
    partsReserve: 9000,
  },
  {
    id: 'motherboard',
    label: 'Материнская плата или компонентный ремонт',
    complexity: 3.6,
    extraHours: 9,
    partsReserve: 62000,
  },
]

export const URGENCY_POLICIES: UrgencyPolicy[] = [
  {
    id: 'standard',
    label: 'Стандарт',
    details: 'Очередь по стандартному сроку обслуживания без доплаты за срочность.',
    priceMultiplier: 1,
    timeMultiplier: 1,
  },
  {
    id: 'priority',
    label: 'Приоритет',
    details: 'Заявка попадает в ускоренную очередь диагностики в течение дня.',
    priceMultiplier: 1.14,
    timeMultiplier: 0.72,
  },
  {
    id: 'express',
    label: 'Экспресс',
    details: 'Отдельная линия с минимальной очередью и повышенной ставкой.',
    priceMultiplier: 1.25,
    timeMultiplier: 0.55,
  },
]

export const STAGE_LABELS: Record<TicketStage, string> = {
  accepted: 'Заявка принята',
  diagnostics: 'Диагностика',
  approval: 'Согласование',
  repair: 'Ремонт',
  quality: 'Контроль качества',
  ready: 'Готово к выдаче',
}

export const DEVICE_LABELS: Record<DeviceType, string> = Object.fromEntries(
  DEVICE_CATALOG.map((item) => [item.id, item.label]),
) as Record<DeviceType, string>

export const ISSUE_LABELS: Record<IssueType, string> = Object.fromEntries(
  ISSUE_CATALOG.map((item) => [item.id, item.label]),
) as Record<IssueType, string>

export const URGENCY_LABELS: Record<UrgencyType, string> = Object.fromEntries(
  URGENCY_POLICIES.map((item) => [item.id, item.label]),
) as Record<UrgencyType, string>
