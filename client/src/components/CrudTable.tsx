import { useEffect, useState, type ReactNode } from 'react'
import {
  Alert,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import { PageHeader } from './PageHeader'
import type { PaginatedResponse } from '../types/pagination'

export interface CrudTableColumn<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

interface CrudTableProps<T> {
  title: string
  columns: CrudTableColumn<T>[]
  getRowId: (row: T) => string
  fetchPage: (params: {
    page: number
    perPage: number
    search: string
  }) => Promise<PaginatedResponse<T>>
  onCreate?: () => void
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  createLabel?: string
  searchPlaceholder?: string
  perPage?: number
  /** Bumped by the parent to force a refetch (e.g. after create/update/delete). */
  reloadKey?: number
}

export function CrudTable<T>({
  title,
  columns,
  getRowId,
  fetchPage,
  onCreate,
  onView,
  onEdit,
  onDelete,
  createLabel = 'New',
  searchPlaceholder = 'Search…',
  perPage: initialPerPage = 15,
  reloadKey = 0,
}: CrudTableProps<T>) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [result, setResult] = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, perPage])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPage({ page, perPage, search: debouncedSearch })
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, perPage, debouncedSearch, reloadKey, fetchPage])

  const rows = result?.data ?? []
  const showActions = Boolean(onView || onEdit || onDelete)

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="md">
        <PageHeader header={title} />
        {onCreate && (
          <Button onClick={onCreate} color="green">{createLabel}</Button>
        )}
      </Group>

      <Group justify="space-between" mb="md" align="flex-end">
        <TextInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          value={String(perPage)}
          onChange={(value) => setPerPage(value ? Number(value) : initialPerPage)}
          data={[
            { value: '10', label: 'Show 10' },
            { value: '25', label: 'Show 25' },
            { value: '50', label: 'Show 50' },
            { value: '100', label: 'Show 100' },
          ]}
          w={130}
          allowDeselect={false}
        />
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <Table.ScrollContainer minWidth={480}>
        <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
          <Table.Thead style={{ backgroundColor: '#f1f3f5' }}>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key} style={{ color: '#1a1b1e' }}>
                  {column.label}
                </Table.Th>
              ))}
              {showActions && (
                <Table.Th w={260} style={{ color: '#1a1b1e' }}>
                  Actions
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (showActions ? 1 : 0)}>
                  <Group justify="center" py="md">
                    <Loader size="sm" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            )}

            {!loading && rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (showActions ? 1 : 0)}>
                  <Text c="dimmed" ta="center" py="md">
                    No records found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}

            {!loading &&
              rows.map((row) => (
                <Table.Tr key={getRowId(row)}>
                  {columns.map((column) => (
                    <Table.Td key={column.key}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </Table.Td>
                  ))}
                  {showActions && (
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        {onView && (
                          <Button
                            size="xs"
                            variant="filled"
                            color="gray"
                            leftSection={<IconEye size={16} />}
                            onClick={() => onView(row)}
                          >
                            View
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            size="xs"
                            variant="filled"
                            leftSection={<IconPencil size={16} />}
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="xs"
                            variant="filled"
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" mt="md">
        <Pagination
          value={page}
          onChange={setPage}
          total={result?.last_page ?? 1}
        />
        <Text size="sm" c="dimmed">
          {result ? `Showing ${result.current_page} out of ${result.last_page} (${result.total} total)` : ''}
        </Text>
      </Group>
    </Paper>
  )
}
