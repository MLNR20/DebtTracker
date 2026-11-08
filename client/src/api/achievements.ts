import { api } from '../lib/api'
import type { Achievement } from '../types/achievement'
import type { PaginatedResponse } from '../types/pagination'

export interface AchievementInput {
  name: string
  description?: string | null
  icon?: string | null
  points: number
}

export function fetchAchievements(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Achievement>> {
  return api
    .get<PaginatedResponse<Achievement>>('/achievements', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createAchievement(input: AchievementInput): Promise<Achievement> {
  return api.post<Achievement>('/achievements', input).then((res) => res.data)
}

export function updateAchievement(
  achievementId: string,
  input: AchievementInput,
): Promise<Achievement> {
  return api.put<Achievement>(`/achievements/${achievementId}`, input).then((res) => res.data)
}

export function deleteAchievement(achievementId: string): Promise<void> {
  return api.delete(`/achievements/${achievementId}`).then(() => undefined)
}
