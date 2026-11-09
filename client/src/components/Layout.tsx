import { ActionIcon, AppShell, Burger, Divider, Group, Menu, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { fetchMyAccess } from '../api/access'
import { logout } from '../api/auth'
import { clearSession } from '../lib/api'
import { getStoredAccess, saveAccess } from '../lib/access'
import { AccessContext } from './AccessContext'
import { Sidebar } from './Sidebar'
import { filterNavSections, navSections, primaryNavSections } from './navConfig'
import type { Access } from '../types/access'
import type { AuthUser } from '../types/auth'

const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 76

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function Layout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false)
  const navigate = useNavigate()
  const user = getStoredUser()
  const [access, setAccess] = useState<Access | null>(getStoredAccess)

  // Role/page assignments can change after login, so re-sync on every app load.
  useEffect(() => {
    fetchMyAccess()
      .then((fresh) => {
        saveAccess(fresh)
        setAccess(fresh)
      })
      .catch(() => {
        // keep the cached access; a 401 is handled by the api interceptor
      })
  }, [])

  const allowedPaths = useMemo(
    () => new Set((access?.pages ?? []).map((page) => page.page_path)),
    [access],
  )
  const visiblePrimary = useMemo(
    () => filterNavSections(primaryNavSections, allowedPaths),
    [allowedPaths],
  )
  const visibleNav = useMemo(() => filterNavSections(navSections, allowedPaths), [allowedPaths])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore — clear local session regardless
    } finally {
      clearSession()
      navigate('/login')
    }
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: desktopCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Title order={4}>DebtTrack</Title>
          </Group>
          <Group gap="md">
            <Text size="sm" c="dimmed">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <ActionIcon variant="subtle" color="gray" aria-label="Notifications">
              <IconBell size={20} />
            </ActionIcon>
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label="User account">
                  <IconUserCircle size={22} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
          transition: 'width 150ms ease',
        }}
      >
        <Stack h="100%" gap={0}>
          <ScrollArea style={{ flex: 1 }} offsetScrollbars>
            <Stack gap="lg">
              <Sidebar sections={visiblePrimary} collapsed={desktopCollapsed} />
              <Sidebar sections={visibleNav} collapsed={desktopCollapsed} />
            </Stack>
          </ScrollArea>

          <Divider my="sm" />

          {desktopCollapsed ? (
            <Stack align="center" gap="sm" visibleFrom="sm">
              {user && (
                <ActionIcon variant="light" color="violet" radius="xl" size={32} aria-label={user.email_address}>
                  {user.first_name.charAt(0).toUpperCase()}
                </ActionIcon>
              )}
              <ActionIcon variant="subtle" color="gray" onClick={toggleDesktop} aria-label="Toggle sidebar">
                <IconLayoutSidebarLeftExpand size={18} />
              </ActionIcon>
            </Stack>
          ) : (
            <Group justify={user ? 'space-between' : 'center'} wrap="nowrap" visibleFrom="sm">
              {user && (
                <Stack gap={0} px={4} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {user.first_name} {user.last_name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user.email_address}
                  </Text>
                </Stack>
              )}
              <ActionIcon variant="subtle" color="gray" onClick={toggleDesktop} aria-label="Toggle sidebar">
                <IconLayoutSidebarLeftCollapse size={18} />
              </ActionIcon>
            </Group>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <AccessContext.Provider value={access}>
          <Outlet />
        </AccessContext.Provider>
      </AppShell.Main>
    </AppShell>
  )
}
