import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { Category, ProductCategory } from '../types'
import { DEFAULT_CATEGORY_LABELS, categoryLabel } from './format'

interface CategoriesContextValue {
  categories: Category[]
  labelFor: (slug: ProductCategory) => string
  ready: boolean
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api<Category[]>('/categories')
      .then((list) => {
        setCategories(list)
        list.forEach((cat) => {
          if (cat.slug in DEFAULT_CATEGORY_LABELS) {
            categoryLabel[cat.slug as ProductCategory] = cat.name
          }
        })
      })
      .catch(() => {})
  }, [])

  const labelFor = (slug: ProductCategory) => {
    const found = categories.find((c) => c.slug === slug)
    if (found) return found.name
    return DEFAULT_CATEGORY_LABELS[slug] ?? slug
  }

  return (
    <CategoriesContext.Provider value={{ categories, labelFor, ready: true }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) {
    return {
      categories: [],
      labelFor: (slug: ProductCategory) => DEFAULT_CATEGORY_LABELS[slug] ?? slug,
      ready: false,
    }
  }
  return ctx
}

export { slugify }
