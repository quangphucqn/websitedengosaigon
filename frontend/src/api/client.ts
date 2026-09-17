import type { ApiError } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const TOKEN_KEY = 'dengosaigon-admin-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại.')
  }
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null
    if (response.status === 401) clearToken()
    throw new Error(error?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function uploadImage(file: File, folder: 'products' | 'banners' | 'posts') {
  const formData = new FormData()
  formData.append('file', file)
  return api<{ url: string }>(`/uploads?folder=${folder}`, {
    method: 'POST',
    body: formData,
  })
}
