import type { Group } from './group'
import type { User } from './user'

export interface GroupMember {
  group_member_id: string
  group_id: string
  user_id: string
  date_joined: string
  group?: Group
  user?: User
}
