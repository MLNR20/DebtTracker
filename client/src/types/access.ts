import type { Page } from './page'

export type AccessPage = Pick<
  Page,
  'page_id' | 'page_key' | 'page_name' | 'page_path' | 'page_group' | 'sort_order'
>

/** The signed-in user's role and the pages that role may open. */
export interface Access {
  role: { role_id: string; role_name: string; is_admin: boolean } | null
  is_admin: boolean
  pages: AccessPage[]
}
