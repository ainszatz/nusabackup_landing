import type { Database } from '@/types/database'

export type LeadStatus = Database['public']['Enums']['lead_status']
export type LeadChannel = Database['public']['Enums']['lead_channel']

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'baru', label: 'Baru', color: 'bg-blue-100 text-blue-800' },
  { value: 'dihubungi', label: 'Dihubungi', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  { value: 'menang', label: 'Menang', color: 'bg-green-100 text-green-800' },
  { value: 'kalah', label: 'Kalah', color: 'bg-red-100 text-red-800' },
]
