import type { DeviceType } from '../types/domain.ts'

export interface MediaAsset {
  url: string
  alt: string
  sourceUrl: string
  credit: string
}

export const HERO_MEDIA: MediaAsset = {
  url: 'https://images.unsplash.com/photo-1742989667140-c69adadf556b?auto=format&fit=crop&w=1800&q=80',
  alt: 'Technician repairing electronics in a workshop',
  sourceUrl: 'https://unsplash.com/photos/a-man-repairing-a-computer-in-a-shop-b5M_PfekyT4',
  credit: 'Michael Wu / Unsplash',
}

export const WORKBENCH_MEDIA: MediaAsset = {
  url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1600',
  alt: 'Electronics repair workstation with tools and circuit boards',
  sourceUrl: 'https://www.pexels.com/photo/electronics-circuit-monitor-repair-257736/',
  credit: 'Pixabay / Pexels',
}

export const TECHNICIAN_MEDIA: MediaAsset = {
  url: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=1200',
  alt: 'Technician holding test equipment during diagnostics',
  sourceUrl: 'https://www.pexels.com/photo/person-holding-black-and-red-digital-device-257904/',
  credit: 'Pixabay / Pexels',
}

export const COMPONENT_CLOSEUP_MEDIA: MediaAsset = {
  url: 'https://images.pexels.com/photos/6755142/pexels-photo-6755142.jpeg?auto=compress&cs=tinysrgb&w=1200',
  alt: 'Microchip on a circuit board close-up',
  sourceUrl: 'https://www.pexels.com/photo/microchip-on-green-circuit-board-6755142/',
  credit: 'Miguel A. Padrinan / Pexels',
}

export const PHONE_PARTS_MEDIA: MediaAsset = {
  url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=1200',
  alt: 'Disassembled smartphone parts on a desk',
  sourceUrl: 'https://www.pexels.com/photo/close-up-photo-of-phone-parts-on-top-of-a-blue-and-white-table-1334597/',
  credit: 'Jess Bailey Designs / Pexels',
}

export const PHONE_REPAIR_MEDIA: MediaAsset = {
  url: 'https://images.unsplash.com/photo-1733741020205-1ed0208314b6?auto=format&fit=crop&w=1200&q=80',
  alt: 'Close-up of phone repair with screwdriver',
  sourceUrl: 'https://unsplash.com/photos/a-man-is-fixing-a-cell-phone-with-a-screwdriver-riR_ZwL1djk',
  credit: 'Omar Sabra / Unsplash',
}

export const DEVICE_MEDIA: Record<DeviceType, MediaAsset> = {
  smartphone: PHONE_REPAIR_MEDIA,
  laptop: WORKBENCH_MEDIA,
  tablet: PHONE_PARTS_MEDIA,
  console: TECHNICIAN_MEDIA,
  tv: COMPONENT_CLOSEUP_MEDIA,
  audio: WORKBENCH_MEDIA,
}

export const GALLERY_MEDIA: MediaAsset[] = [
  HERO_MEDIA,
  WORKBENCH_MEDIA,
  TECHNICIAN_MEDIA,
  COMPONENT_CLOSEUP_MEDIA,
  PHONE_PARTS_MEDIA,
  PHONE_REPAIR_MEDIA,
]
