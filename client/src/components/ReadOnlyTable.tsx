import { useEffect, useState, type ReactNode } from 'react'
import {
  Alert,
  Group,
  Loader,
  Pagination,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconEye } from '@tabler/icons-react'
import { Button } from '@mantine/core'
import type { PaginatedResponse } from '../types/pagination'

export interface ReadOnlyTableColumn<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

interface ReadOnlyTableProps<T> {
  title: string
  columns: ReadOnlyTableColumn<T>[]
  getRowId: (row: T) => string
  fetchPage: (params: {
    page: number
    perPage: number
    search: string
  }) => Promise<PaginatedResponse<T>>
  onView?: (row: T) => void
  searchPlaceholder?: string
  perPage?: number
  /** Bumped by the parent to force a refetch. */
  reloadKey?: number
}

export function ReadOnlyTable<T>({
  title,
  columns,
  getRowId,
  fetchPage,
  onView,
  searchPlaceholder = 'Search…',
  perPage = 15,
  reloadKey = 0,
}: ReadOnlyTableProps<T>) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [result, setResult] = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

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
  const showActions = Boolean(onView)

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>{title}</Title>
      </Group>

      <TextInput
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        mb="md"
      />

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <Table.ScrollContainer minWidth={480}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key}>{column.label}</Table.Th>
              ))}
              {showActions && <Table.Th w={120}>Actions</Table.Th>}
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
                      <Group gap="xs" wrap="nowrap">
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
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" mt="md">
        <Text size="sm" c="dimmed">
          {result ? `${result.total} total` : ''}
        </Text>
        <Pagination
          value={page}
          onChange={setPage}
          total={result?.last_page ?? 1}
        />
      </Group>
    </Paper>
  )
}
