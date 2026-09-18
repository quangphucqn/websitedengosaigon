import type { OrderStatus, ProductCategory } from '../types'

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const DEFAULT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  'den-ban': 'Đèn bàn',
  'den-treo': 'Đèn treo',
  'den-dung': 'Đèn đứng',
  'den-ngu': 'Đèn ngủ',
}

export const categoryLabel: Record<ProductCategory, string> = {
  ...DEFAULT_CATEGORY_LABELS,
}

export const statusLabel: Record<OrderStatus, string> = {
  moi: 'Mới',
  dang_xu_ly: 'Đang xử lý',
  da_giao: 'Đã giao',
  da_huy: 'Đã hủy',
}
