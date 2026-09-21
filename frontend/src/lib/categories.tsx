import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { Category } from '../types'
import { DEFAULT_CATEGORY_LABELS } from './format'

interface CategoriesContextValue {
  categories: Category[]
  labelFor: (slug: string) => string
  ready: boolean
  reload: () => void
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

  const reload = () => {
    api<Category[]>('/categories')
      .then(setCategories)
      .catch(() => {})
  }

  useEffect(() => {
    reload()
  }, [])

  const labelFor = (slug: string) => {
    const found = categories.find((category) => category.slug === slug)
    return found?.name ?? DEFAULT_CATEGORY_LABELS[slug] ?? slug
  }

  return (
    <CategoriesContext.Provider value={{ categories, labelFor, ready: true, reload }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) {
    return {
      categories: [],
      labelFor: (slug: string) => DEFAULT_CATEGORY_LABELS[slug] ?? slug,
      ready: false,
      reload: () => {},
    }
  }
  return ctx
}

export { slugify }
