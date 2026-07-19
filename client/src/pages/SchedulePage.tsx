import { useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  HoverCard,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { fetchDebts } from '../api/debts'
import type { Debt } from '../types/debt'

const statusColors: Record<string, string> = {
  pending: 'yellow',
  partial: 'blue',
  paid: 'green',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function debtorName(debt: Debt): string {
  if (debt.debtor_user) return `${debt.debtor_user.first_name} ${debt.debtor_user.last_name}`
  if (debt.debtor_contact) return `${debt.debtor_contact.first_name} ${debt.debtor_contact.last_name}`
  return 'Unknown'
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function SchedulePage() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [debts, setDebts] = useState<Debt[]>([])

  useEffect(() => {
    fetchDebts({ page: 1, perPage: 500, search: '' })
      .then((res) => setDebts(res.data.filter((debt) => debt.due_date)))
      .catch(() => {
        notifications.show({ message: 'Failed to load schedule', color: 'red' })
      })
  }, [])

  const debtsByDay = useMemo(() => {
    const map = new Map<string, Debt[]>()
    for (const debt of debts) {
      if (!debt.due_date) continue
      const key = dateKey(new Date(debt.due_date))
      const list = map.get(key) ?? []
      list.push(debt)
      map.set(key, list)
    }
    return map
  }, [debts])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Schedule</Title>
        <Group gap="xs">
          <ActionIcon
            variant="default"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text fw={500} w={160} ta="center">
            {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </Text>
          <ActionIcon
            variant="default"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
        }}
      >
        {WEEKDAYS.map((day) => (
          <Text key={day} size="sm" fw={600} c="dimmed" ta="center" py={4}>
            {day}
          </Text>
        ))}

        {cells.map((date, index) => {
          if (!date) {
            return <Box key={`empty-${index}`} style={{ minHeight: 96 }} />
          }

          const dayDebts = debtsByDay.get(dateKey(date)) ?? []
          const isToday = dateKey(date) === dateKey(today)

          return (
            <Paper
              key={dateKey(date)}
              withBorder
              p="xs"
              style={{
                minHeight: 96,
                background: isToday ? 'var(--mantine-color-blue-light)' : undefined,
              }}
            >
              <Text size="sm" fw={isToday ? 700 : 400}>
                {date.getDate()}
              </Text>
              <Stack gap={4} mt={4}>
                {dayDebts.slice(0, 3).map((debt) => (
                  <HoverCard key={debt.debt_id} width={220} shadow="md" withArrow>
                    <HoverCard.Target>
                      <Badge
                        fullWidth
                        variant="light"
                        color={statusColors[debt.status] ?? 'gray'}
                        style={{ cursor: 'pointer', textTransform: 'none' }}
                      >
                        {debtorName(debt)}
                      </Badge>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Text size="sm" fw={600}>
                        {debtorName(debt)}
                      </Text>
                      <Text size="sm">Remaining: ${debt.remaining_amount}</Text>
                      <Text size="sm" c="dimmed">
                        {debt.description ?? 'No description'}
                      </Text>
                      <Badge mt={4} color={statusColors[debt.status] ?? 'gray'}>
                        {debt.status}
                      </Badge>
                    </HoverCard.Dropdown>
                  </HoverCard>
                ))}
                {dayDebts.length > 3 && (
                  <Text size="xs" c="dimmed">
                    +{dayDebts.length - 3} more
                  </Text>
                )}
              </Stack>
            </Paper>
          )
        })}
      </Box>
    </Paper>
  )
}
