import type {
  DeviceCatalogItem,
  IssueCatalogItem,
  TicketStage,
  UrgencyPolicy,
} from '../types/domain.ts'

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  {
    id: 'smartphone',
    label: 'Смартфоны',
    categoryNote: 'Экран, батарея, контроллер питания, камеры.',
    baseDiagnosticFee: 6000,
    baseLaborRate: 14000,
    baseHours: 8,
    partsRiskFactor: 1.1,
  },
  {
    id: 'laptop',
    label: 'Ноутбуки',
    categoryNote: 'Материнские платы, охлаждение, SSD и клавиатуры.',
    baseDiagnosticFee: 9000,
    baseLaborRate: 22000,
    baseHours: 14,
    partsRiskFactor: 1.2,
  },
  {
    id: 'tablet',
    label: 'Планшеты',
    categoryNote: 'Сенсоры, разъемы, микросхемы питания.',
    baseDiagnosticFee: 7500,
    baseLaborRate: 17000,
    baseHours: 10,
    partsRiskFactor: 1.15,
  },
  {
    id: 'console',
    label: 'Игровые консоли',
    categoryNote: 'HDMI, перегрев, восстановление после коротких замыканий.',
    baseDiagnosticFee: 9500,
    baseLaborRate: 24000,
    baseHours: 16,
    partsRiskFactor: 1.25,
  },
  {
    id: 'tv',
    label: 'Телевизоры',
    categoryNote: 'Подсветка, блоки питания, платы управления.',
    baseDiagnosticFee: 12000,
    baseLaborRate: 28000,
    baseHours: 20,
    partsRiskFactor: 1.3,
  },
  {
    id: 'audio',
    label: 'Аудио техника',
    categoryNote: 'Колонки, усилители, беспроводные модули и аккумуляторы.',
    baseDiagnosticFee: 5000,
    baseLaborRate: 12000,
    baseHours: 7,
    partsRiskFactor: 1.05,
  },
]

export const ISSUE_CATALOG: IssueCatalogItem[] = [
  {
    id: 'screen',
    label: 'Разбит экран / нет изображения',
    complexity: 2.2,
    extraHours: 4,
    partsReserve: 38000,
  },
  {
    id: 'battery',
    label: 'Быстро разряжается / не держит заряд',
    complexity: 1.6,
    extraHours: 2,
    partsReserve: 21000,
  },
  {
    id: 'charging',
    label: 'Не заряжается / не видит кабель',
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
    label: 'Сильный нагрев / шум / троттлинг',
    complexity: 2.5,
    extraHours: 5,
    partsReserve: 30000,
  },
  {
    id: 'software',
    label: 'Сбой ПО / циклическая перезагрузка',
    complexity: 1.4,
    extraHours: 2,
    partsReserve: 9000,
  },
  {
    id: 'motherboard',
    label: 'Плата / чипы / сложный компонентный ремонт',
    complexity: 3.6,
    extraHours: 9,
    partsReserve: 62000,
  },
]

export const URGENCY_POLICIES: UrgencyPolicy[] = [
  {
    id: 'standard',
    label: 'Стандарт',
    details: 'Очередь по SLA, без доплаты.',
    priceMultiplier: 1,
    timeMultiplier: 1,
  },
  {
    id: 'priority',
    label: 'Приоритет',
    details: 'Берем в работу в течение дня.',
    priceMultiplier: 1.14,
    timeMultiplier: 0.72,
  },
  {
    id: 'express',
    label: 'Экспресс',
    details: 'Отдельная линия, минимальная очередь.',
    priceMultiplier: 1.25,
    timeMultiplier: 0.55,
  },
]

export const STAGE_LABELS: Record<TicketStage, string> = {
  accepted: 'Заявка принята',
  diagnostics: 'Диагностика',
  approval: 'Согласование с клиентом',
  repair: 'Ремонт и замена компонентов',
  quality: 'Финальный контроль качества',
  ready: 'Готово к выдаче',
}
