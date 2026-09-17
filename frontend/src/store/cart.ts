import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'

type CartState = {
  items: CartItem[]
  add: (product: Product) => boolean
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) => {
        set((state) => {
          const current = state.items.find((item) => item.productId === product._id)
          if (current) {
            return {
              items: state.items.map((item) =>
                item.productId === product._id
                  ? { ...item, quantity: item.quantity + 1, stock: product.stock }
                  : item,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? '',
                quantity: 1,
                stock: product.stock,
              },
            ],
          }
        })
        return true
      },
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'dengosaigon-cart', storage: createJSONStorage(() => localStorage) },
  ),
)
