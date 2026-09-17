export const PRODUCT_CATEGORIES = [
  'den-ban',
  'den-treo',
  'den-dung',
  'den-ngu',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
export type OrderStatus = 'moi' | 'dang_xu_ly' | 'da_giao' | 'da_huy'

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: ProductCategory
  stock: number
  isFeatured: boolean
  createdAt: string
}

export interface Banner {
  _id: string
  imageUrl: string
  title?: string
  link?: string
  order: number
  isActive: boolean
}

export interface Post {
  _id: string
  title: string
  slug: string
  content: string
  coverImage: string
  images: string[]
  isPublished: boolean
  createdAt: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  _id: string
  customerName: string
  phone: string
  address: string
  note: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

export interface ApiError {
  message: string
  errors?: { field: string; message: string }[]
}
