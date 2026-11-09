import type { Access } from '../types/access'

const ACCESS_KEY = 'auth_access'

export function getStoredAccess(): Access | null {
  const raw = localStorage.getItem(ACCESS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Access
  } catch {
    return null
  }
}

export function saveAccess(access: Access) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(access))
}

export function clearAccess() {
  localStorage.removeItem(ACCESS_KEY)
}

export function canOpenPath(access: Access | null, path: string): boolean {
  if (!access) return false
  return access.pages.some((page) => page.page_path === path)
}
