import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createRole, deleteRole, fetchRoles, updateRole } from '../api/roles'
import { fetchAllPages } from '../api/pages'
import type { Page } from '../types/page'
import type { Role } from '../types/role'

const roleSchema = z.object({
  role_name: z.string().min(1, 'Role name is required').max(255),
  is_admin: z.boolean(),
  page_ids: z.array(z.string()),
})

type RoleFormValues = z.infer<typeof roleSchema>

const emptyValues: RoleFormValues = { role_name: '', is_admin: false, page_ids: [] }

const columns: CrudTableColumn<Role>[] = [
  { key: 'role_name', label: 'Role name' },
  {
    key: 'access',
    label: 'Access',
    render: (row) =>
      row.is_admin ? (
        <Badge color="violet">Full access</Badge>
      ) : (
        <Text size="sm">
          {row.pages?.length ?? 0} page{row.pages?.length === 1 ? '' : 's'}
        </Text>
      ),
  },
  {
    key: 'date_created',
    label: 'Created',
    render: (row) => new Date(row.date_created).toLocaleString(),
  },
]

function groupPages(pages: Page[]): [string, Page[]][] {
  const groups = new Map<string, Page[]>()
  for (const page of pages) {
    const key = page.page_group ?? 'Other'
    groups.set(key, [...(groups.get(key) ?? []), page])
  }
  return [...groups.entries()]
}

export function RolesPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [viewTarget, setViewTarget] = useState<Role | null>(null)
  const [editing, setEditing] = useState<Role | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [allPages, setAllPages] = useState<Page[]>([])

  const form = useForm<RoleFormValues>({
    initialValues: emptyValues,
    validate: zod4Resolver(roleSchema),
  })

  useEffect(() => {
    fetchAllPages()
      .then(setAllPages)
      .catch(() => notifications.show({ message: 'Failed to load pages', color: 'red' }))
  }, [])

  const pageGroups = useMemo(() => groupPages(allPages), [allPages])

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.setValues(emptyValues)
    form.resetDirty()
    form.clearErrors()
    openForm()
  }

  const handleEdit = (role: Role) => {
    setEditing(role)
    form.setValues({
      role_name: role.role_name,
      is_admin: role.is_admin,
      page_ids: (role.pages ?? []).map((page) => page.page_id),
    })
    form.clearErrors()
    openForm()
  }

  const handleSubmit = async (values: RoleFormValues) => {
    setSubmitting(true)
    try {
      if (editing) {
        await updateRole(editing.role_id, values)
        notifications.show({ message: 'Role updated', color: 'green' })
      } else {
        await createRole(values)
        notifications.show({ message: 'Role created', color: 'green' })
      }
      closeForm()
      reload()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors as Record<string, string[]> | undefined
        if (apiErrors) {
          form.setErrors(
            Object.fromEntries(Object.entries(apiErrors).map(([field, msgs]) => [field, msgs[0]])),
          )
        }
      } else {
        notifications.show({ message: 'Something went wrong', color: 'red' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteRole(deleteTarget.role_id)
      notifications.show({ message: 'Role deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch (err) {
      const message =
        isAxiosError(err) && (err.response?.status === 409 || err.response?.status === 422)
          ? (err.response.data?.message as string | undefined)
          : undefined
      notifications.show({ message: message ?? 'Failed to delete role', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap="lg" p="xl">
        <CrudTable
          title="Roles"
          columns={columns}
          getRowId={(row) => row.role_id}
          fetchPage={fetchRoles}
          onCreate={handleCreate}
          onView={setViewTarget}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchPlaceholder="Search roles…"
          reloadKey={reloadKey}
        />
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        size="lg"
        title={
          <Title order={4} c="dark.9" fw={700}>
            {editing ? 'Edit role' : 'New role'}
          </Title>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Role name"
              placeholder="Admin"
              withAsterisk
              {...form.getInputProps('role_name')}
            />

            <Switch
              label="Full access (admin)"
              description="Admin roles can open every page and cannot be locked out"
              {...form.getInputProps('is_admin', { type: 'checkbox' })}
            />

            <Checkbox.Group
              label="Page access"
              description={
                form.values.is_admin
                  ? 'Admin roles have access to every page.'
                  : 'Choose the pages this role can open.'
              }
              {...form.getInputProps('page_ids')}
            >
              <Stack gap="sm" mt="xs">
                {pageGroups.map(([group, pages]) => (
                  <div key={group}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                      {group}
                    </Text>
                    <Group gap="lg">
                      {pages.map((page) => (
                        <Checkbox
                          key={page.page_id}
                          value={page.page_id}
                          label={page.page_name}
                          disabled={form.values.is_admin}
                          checked={form.values.is_admin ? true : undefined}
                        />
                      ))}
                    </Group>
                  </div>
                ))}
              </Stack>
            </Checkbox.Group>
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeForm} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        title={
          <Title order={4} c="dark.9" fw={700}>
            Role details
          </Title>
        }
      >
        <Text size="sm" c="dimmed">
          Role name
        </Text>
        <Text mb="md">{viewTarget?.role_name}</Text>
        <Text size="sm" c="dimmed">
          Page access
        </Text>
        {viewTarget?.is_admin ? (
          <Badge color="violet" mb="md">
            Full access
          </Badge>
        ) : (viewTarget?.pages?.length ?? 0) > 0 ? (
          <Group gap={6} mb="md">
            {viewTarget?.pages?.map((page) => (
              <Badge key={page.page_id} variant="light">
                {page.page_name}
              </Badge>
            ))}
          </Group>
        ) : (
          <Text mb="md" c="dimmed">
            No pages assigned
          </Text>
        )}
        <Text size="sm" c="dimmed">
          Created
        </Text>
        <Text mb="md">
          {viewTarget && new Date(viewTarget.date_created).toLocaleString()}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setViewTarget(null)}>
            Close
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete role"
      >
        <Text>
          Are you sure you want to delete{' '}
          <strong>{deleteTarget?.role_name}</strong>?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  )
}
