import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { ContactInfo } from '../types'

interface ContactContextValue {
  contact: ContactInfo | null
  loading: boolean
}

const ContactContext = createContext<ContactContextValue>({ contact: null, loading: true })

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<ContactInfo>('/contact')
      .then(setContact)
      .catch(() => setContact(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ContactContext.Provider value={{ contact, loading }}>
      {children}
    </ContactContext.Provider>
  )
}

export function useContact() {
  return useContext(ContactContext)
}

export function normalizePhoneForTel(phone?: string) {
  if (!phone) return ''
  return phone.replace(/[^\d+]/g, '')
}

export function normalizeZaloLink(zalo?: string) {
  if (!zalo) return ''
  if (/^https?:\/\//i.test(zalo)) return zalo
  const digits = zalo.replace(/[^\d]/g, '')
  return digits ? `https://zalo.me/${digits}` : ''
}
