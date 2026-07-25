import type { ComponentType } from 'react'
import { ActionIcon, Group, Paper, Text } from '@mantine/core'

export function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  color?: string
  icon: ComponentType<{ size?: number | string; stroke?: number }>
}) {
  return (
    <Paper withBorder px={26} py={24} radius="md">
      <Group justify="flex-start" align="center">
        <ActionIcon
          variant="light"
          color={color ?? 'violet'}
          size={40}
          radius="md"
          disabled
          styles={{
            root: {
              backgroundColor: `var(--mantine-color-${color ?? 'violet'}-1)`,
              color: `var(--mantine-color-${color ?? 'violet'}-7)`,
            },
          }}
        >
          <Icon size={22} stroke={1.75} />
        </ActionIcon>
        <div style={{ textAlign: 'left' }}>
          <Text size="md" c="dimmed">
            {label}
          </Text>
          <Text size="2rem" fw={700} mt="0.48rem" c="black">
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  )
}
