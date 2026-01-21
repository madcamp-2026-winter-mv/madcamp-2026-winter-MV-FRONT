import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * API 일정 startTime 파싱.
 * 백엔드가 UTC로 저장하고 timezone(Z 또는 ±HH:mm) 없이 반환할 수 있어,
 * timezone이 없으면 UTC로 간주하고 'Z'를 붙여 파싱합니다.
 * (예: "2025-01-22T07:00:00" → 07:00 UTC → KST 16:00)
 */
export function parseScheduleDate(iso: string): Date {
  if (!iso) return new Date(NaN)
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(iso)
  return new Date(hasTz ? iso : iso + "Z")
}
