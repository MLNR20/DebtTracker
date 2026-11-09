import { createContext, useContext } from 'react'
import type { Access } from '../types/access'

export const AccessContext = createContext<Access | null>(null)

export function useAccess(): Access | null {
  return useContext(AccessContext)
}
