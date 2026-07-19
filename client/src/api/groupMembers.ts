import { api } from '../lib/api'
import type { GroupMember } from '../types/groupMember'
import type { PaginatedResponse } from '../types/pagination'

export interface GroupMemberInput {
  group_id: string
  user_id: string
  date_joined?: string
}

export function fetchGroupMembers(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<GroupMember>> {
  return api
    .get<PaginatedResponse<GroupMember>>('/group-members', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createGroupMember(input: GroupMemberInput): Promise<GroupMember> {
  return api.post<GroupMember>('/group-members', input).then((res) => res.data)
}

export function updateGroupMember(
  groupMemberId: string,
  input: GroupMemberInput,
): Promise<GroupMember> {
  return api
    .put<GroupMember>(`/group-members/${groupMemberId}`, input)
    .then((res) => res.data)
}

export function deleteGroupMember(groupMemberId: string): Promise<void> {
  return api.delete(`/group-members/${groupMemberId}`).then(() => undefined)
}
