import { api } from '../lib/api'
import type { Contact } from '../types/contact'
import type { PaginatedResponse } from '../types/pagination'

export interface ContactInput {
  user_id: string
  first_name: string
  last_name: string
  email?: string
  contact_no?: string
}

export function fetchContacts(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Contact>> {
  return api
    .get<PaginatedResponse<Contact>>('/contacts', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createContact(input: ContactInput): Promise<Contact> {
  return api.post<Contact>('/contacts', input).then((res) => res.data)
}

export function updateContact(contactId: string, input: ContactInput): Promise<Contact> {
  return api.put<Contact>(`/contacts/${contactId}`, input).then((res) => res.data)
}

export function deleteContact(contactId: string): Promise<void> {
  return api.delete(`/contacts/${contactId}`).then(() => undefined)
}
