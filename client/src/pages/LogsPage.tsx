import { Badge } from '@mantine/core'
import { ReadOnlyTable, type ReadOnlyTableColumn } from '../components/ReadOnlyTable'
import { fetchLogs } from '../api/logs'
import type { Log } from '../types/log'

function typeColor(type: string): string {
  if (type.endsWith('_deleted') || type === 'logout') return 'red'
  if (type.endsWith('_updated')) return 'yellow'
  if (type.endsWith('_created') || type === 'login') return 'green'
  return 'gray'
}

const columns: ReadOnlyTableColumn<Log>[] = [
  {
    key: 'date_created',
    label: 'Date',
    render: (row) => new Date(row.date_created).toLocaleString(),
  },
  {
    key: 'user',
    label: 'User',
    render: (row) => (row.user ? `${row.user.first_name} ${row.user.last_name}` : '—'),
  },
  {
    key: 'logs_type',
    label: 'Action',
    render: (row) => (
      <Badge color={typeColor(row.logs_type)} variant="light">
        {row.logs_type.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  { key: 'logs_details', label: 'Details', render: (row) => row.logs_details ?? '—' },
]

export function LogsPage() {
  return (
    <ReadOnlyTable
      title="Activity logs"
      columns={columns}
      getRowId={(row) => row.logs_id}
      fetchPage={fetchLogs}
      searchPlaceholder="Search logs…"
    />
  )
}
