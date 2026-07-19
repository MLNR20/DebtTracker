import { NavLink as MantineNavLink, Stack, Text, Tooltip } from '@mantine/core'
import { useLocation, useNavigate } from 'react-router-dom'
import { navSections, type NavSection } from './navConfig'

interface SidebarProps {
  sections?: NavSection[]
  collapsed?: boolean
}

export function Sidebar({ sections = navSections, collapsed = false }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Stack gap="lg">
      {sections.map((section) => (
        <div key={section.label}>
          {!collapsed && (
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4} px={0}>
              {section.label}
            </Text>
          )}
          <Stack gap={2}>
            {section.items.map((item) => {
              const Icon = item.icon
              const link = (
                <MantineNavLink
                  key={item.path}
                  label={!collapsed ? item.label : undefined}
                  leftSection={<Icon size={18} stroke={1.75} />}
                  active={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  variant="filled"
                  style={
                    collapsed
                      ? { justifyContent: 'center', paddingInline: 0 }
                      : undefined
                  }
                  styles={
                    collapsed
                      ? { section: { marginInlineEnd: 0 }, body: { flex: 'none' } }
                      : undefined
                  }
                />
              )

              return collapsed ? (
                <Tooltip key={item.path} label={item.label} position="right" withArrow>
                  {link}
                </Tooltip>
              ) : (
                link
              )
            })}
          </Stack>
        </div>
      ))}
    </Stack>
  )
}
