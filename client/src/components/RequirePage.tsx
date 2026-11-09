import { Button, Stack, Text, Title } from '@mantine/core'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAccess } from './AccessContext'
import { canOpenPath } from '../lib/access'

/** Route guard: renders the nested route only when the user's role includes `path`. */
export function RequirePage({ path }: { path: string }) {
  const access = useAccess()
  const navigate = useNavigate()

  if (canOpenPath(access, path)) {
    return <Outlet />
  }

  const fallback = access?.pages[0]?.page_path

  return (
    <Stack align="center" gap="xs" py={80}>
      <Title order={3}>Access denied</Title>
      <Text c="dimmed" size="sm">
        Your role does not have access to this page.
      </Text>
      {fallback && (
        <Button mt="sm" variant="light" onClick={() => navigate(fallback)}>
          Go to {access?.pages[0]?.page_name}
        </Button>
      )}
    </Stack>
  )
}

/** Sends "/" to the first page the user can open. */
export function HomeRedirect() {
  const access = useAccess()
  const first = access?.pages[0]?.page_path

  return first ? <Navigate to={first} replace /> : <RequirePage path="/" />
}
