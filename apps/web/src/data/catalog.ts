import type { DeviceCatalogItem, IssueCatalogItem, TicketStage, UrgencyPolicy } from '../types/domain.ts'

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  {
    id: 'smartphone',
    label: 'Smartphones',
    categoryNote: 'Display, charging ports, battery modules, cameras and board-level diagnostics.',
    baseDiagnosticFee: 6000,
    baseLaborRate: 14000,
    baseHours: 8,
    partsRiskFactor: 1.1,
  },
  {
    id: 'laptop',
    label: 'Laptops',
    categoryNote: 'Cooling systems, keyboards, SSD replacement, motherboard repair and power rails.',
    baseDiagnosticFee: 9000,
    baseLaborRate: 22000,
    baseHours: 14,
    partsRiskFactor: 1.2,
  },
  {
    id: 'tablet',
    label: 'Tablets',
    categoryNote: 'Touch layers, charging controllers, cameras, audio ICs and frame alignment.',
    baseDiagnosticFee: 7500,
    baseLaborRate: 17000,
    baseHours: 10,
    partsRiskFactor: 1.15,
  },
  {
    id: 'console',
    label: 'Game Consoles',
    categoryNote: 'HDMI faults, overheating, storage upgrades and board-level recovery after shorts.',
    baseDiagnosticFee: 9500,
    baseLaborRate: 24000,
    baseHours: 16,
    partsRiskFactor: 1.25,
  },
  {
    id: 'tv',
    label: 'TV Panels',
    categoryNote: 'Backlight strips, power boards, T-CON diagnostics and display chain stability.',
    baseDiagnosticFee: 12000,
    baseLaborRate: 28000,
    baseHours: 20,
    partsRiskFactor: 1.3,
  },
  {
    id: 'audio',
    label: 'Audio Gear',
    categoryNote: 'Amplifiers, speakers, portable audio boards, batteries and wireless modules.',
    baseDiagnosticFee: 5000,
    baseLaborRate: 12000,
    baseHours: 7,
    partsRiskFactor: 1.05,
  },
]

export const ISSUE_CATALOG: IssueCatalogItem[] = [
  {
    id: 'screen',
    label: 'Broken display or no image',
    complexity: 2.2,
    extraHours: 4,
    partsReserve: 38000,
  },
  {
    id: 'battery',
    label: 'Battery drains fast or does not hold charge',
    complexity: 1.6,
    extraHours: 2,
    partsReserve: 21000,
  },
  {
    id: 'charging',
    label: 'No charging or unstable power input',
    complexity: 2.1,
    extraHours: 3,
    partsReserve: 24000,
  },
  {
    id: 'water',
    label: 'Liquid damage',
    complexity: 3.2,
    extraHours: 6,
    partsReserve: 46000,
  },
  {
    id: 'overheat',
    label: 'Overheating, noise or throttling',
    complexity: 2.5,
    extraHours: 5,
    partsReserve: 30000,
  },
  {
    id: 'software',
    label: 'Software failure or boot loop',
    complexity: 1.4,
    extraHours: 2,
    partsReserve: 9000,
  },
  {
    id: 'motherboard',
    label: 'Motherboard or component-level repair',
    complexity: 3.6,
    extraHours: 9,
    partsReserve: 62000,
  },
]

export const URGENCY_POLICIES: UrgencyPolicy[] = [
  {
    id: 'standard',
    label: 'Standard',
    details: 'Scheduled in SLA queue with standard handling and no urgency fee.',
    priceMultiplier: 1,
    timeMultiplier: 1,
  },
  {
    id: 'priority',
    label: 'Priority',
    details: 'Moves into the same-day technician queue with accelerated diagnostics.',
    priceMultiplier: 1.14,
    timeMultiplier: 0.72,
  },
  {
    id: 'express',
    label: 'Express',
    details: 'Dedicated fast lane with minimal queue delay and elevated service rate.',
    priceMultiplier: 1.25,
    timeMultiplier: 0.55,
  },
]

export const STAGE_LABELS: Record<TicketStage, string> = {
  accepted: 'Accepted',
  diagnostics: 'Diagnostics',
  approval: 'Approval',
  repair: 'Repair',
  quality: 'Quality Check',
  ready: 'Ready for Pickup',
}
