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
    <Paper withBorder px="xl" py="xl" radius="md">
      <Group justify="flex-start" align="flex-start">
        <ActionIcon
          variant="light"
          color={color ?? 'violet'}
          size={52}
          radius="md"
          disabled
          styles={{
            root: {
              backgroundColor: `var(--mantine-color-${color ?? 'violet'}-1)`,
              color: `var(--mantine-color-${color ?? 'violet'}-7)`,
            },
          }}
        >
          <Icon size={28} stroke={1.75} />
        </ActionIcon>
        <div style={{ textAlign: 'left' }}>
          <Text size="lg" c="dimmed">
            {label}
          </Text>
          <Text size="2.25rem" fw={700} mt="0.48rem" c="black">
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  )
}
