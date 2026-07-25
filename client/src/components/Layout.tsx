import { ActionIcon, AppShell, Burger, Divider, Group, Menu, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'
import { Sidebar } from './Sidebar'
import { navSections, primaryNavSections } from './navConfig'
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

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore — clear local session regardless
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
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
              <Sidebar sections={primaryNavSections} collapsed={desktopCollapsed} />
              <Sidebar sections={navSections} collapsed={desktopCollapsed} />
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
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
