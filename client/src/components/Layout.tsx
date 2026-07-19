import { ActionIcon, AppShell, Burger, Divider, Group, Menu, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogin,
  IconUserCircle,
} from '@tabler/icons-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { navSections, primaryNavSections } from './navConfig'

const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 76

export function Layout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false)
  const navigate = useNavigate()

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
                <Menu.Item leftSection={<IconLogin size={16} />} onClick={() => navigate('/login')}>
                  Log in
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

          <Group justify={desktopCollapsed ? 'center' : 'flex-end'} visibleFrom="sm">
            <ActionIcon variant="subtle" color="gray" onClick={toggleDesktop} aria-label="Toggle sidebar">
              {desktopCollapsed ? (
                <IconLayoutSidebarLeftExpand size={18} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={18} />
              )}
            </ActionIcon>
          </Group>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
