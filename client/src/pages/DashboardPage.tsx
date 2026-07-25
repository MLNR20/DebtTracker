import { useEffect, useState } from 'react'
import {
  Badge,
  Grid,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { notifications } from '@mantine/notifications'
import {
  IconAlertTriangle,
  IconCashBanknote,
  IconClockDollar,
  IconReceipt2,
} from '@tabler/icons-react'
import {
  fetchDashboardChart,
  fetchDashboardSummary,
  fetchPendingDebts,
} from '../api/dashboard'
import type { DashboardChartPoint, DashboardSummary } from '../types/dashboard'
import type { Debt } from '../types/debt'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'

const statusColors: Record<string, string> = {
  pending: 'yellow',
  partial: 'blue',
  paid: 'green',
}

function formatCurrency(value: number): string {
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [chartData, setChartData] = useState<DashboardChartPoint[]>([])
  const [pendingDebts, setPendingDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchDashboardSummary(), fetchDashboardChart(6), fetchPendingDebts(10)])
      .then(([summaryRes, chartRes, pendingRes]) => {
        if (cancelled) return
        setSummary(summaryRes)
        setChartData(chartRes)
        setPendingDebts(pendingRes)
      })
      .catch(() => {
        if (!cancelled) {
          notifications.show({ message: 'Failed to load dashboard data', color: 'red' })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    )
  }

  return (
    <Stack gap="lg" p="xl">
      <PageHeader header="Dashboard" subheader="Overview of your debts, payments, and activity" />

      <Grid>
      <Grid.Col span={12}>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <StatCard
            label="Total pending"
            value={formatCurrency(summary?.total_pending_amount ?? 0)}
            color="grape"
            icon={IconClockDollar}
          />
          <StatCard
            label="Pending debts"
            value={String(summary?.pending_debts_count ?? 0)}
            color="violet"
            icon={IconReceipt2}
          />
          <StatCard
            label="Overdue"
            value={String(summary?.overdue_count ?? 0)}
            color="pink"
            icon={IconAlertTriangle}
          />
          <StatCard
            label="Total collected"
            value={formatCurrency(summary?.total_collected_amount ?? 0)}
            color="indigo"
            icon={IconCashBanknote}
          />
        </SimpleGrid>
      </Grid.Col>

      <Grid.Col span={12}>
        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="md">
            Debt activity (last 6 months)
          </Title>
          <div style={{ paddingRight: 24, paddingBottom: 8 }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mantine-color-green-6)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--mantine-color-green-6)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="total_amount"
                  name="Total debt"
                  stroke="var(--mantine-color-blue-6)"
                  fill="url(#totalGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="collected_amount"
                  name="Collected"
                  stroke="var(--mantine-color-green-6)"
                  fill="url(#collectedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      </Grid.Col>

      <Grid.Col span={12}>
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="sm">
            Pending balances
          </Title>
          <Table.ScrollContainer minWidth={480} px="md">
            <Table striped highlightOnHover verticalSpacing="xs" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Debtor</Table.Th>
                  <Table.Th>Creditor</Table.Th>
                  <Table.Th>Remaining</Table.Th>
                  <Table.Th>Due date</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pendingDebts.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="md">
                        No pending balances.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {pendingDebts.map((debt) => (
                  <Table.Tr key={debt.debt_id}>
                    <Table.Td>
                      {debt.debtor_user
                        ? `${debt.debtor_user.first_name} ${debt.debtor_user.last_name}`
                        : debt.debtor_contact
                          ? `${debt.debtor_contact.first_name} ${debt.debtor_contact.last_name}`
                          : '—'}
                    </Table.Td>
                    <Table.Td>
                      {debt.creditor
                        ? `${debt.creditor.first_name} ${debt.creditor.last_name}`
                        : '—'}
                    </Table.Td>
                    <Table.Td>{formatCurrency(Number(debt.remaining_amount))}</Table.Td>
                    <Table.Td>
                      {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : '—'}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColors[debt.status] ?? 'gray'}>
                        {debt.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Grid.Col>
      </Grid>
    </Stack>
  )
}
