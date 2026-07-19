import { useState } from 'react'
import { Button, Group, Modal, Text, TextInput, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createRole, deleteRole, fetchRoles, updateRole } from '../api/roles'
import type { Role } from '../types/role'

const roleSchema = z.object({
  role_name: z.string().min(1, 'Role name is required').max(255),
})

type RoleFormValues = z.infer<typeof roleSchema>

const columns: CrudTableColumn<Role>[] = [
  { key: 'role_name', label: 'Role name' },
  {
    key: 'date_created',
    label: 'Created',
    render: (row) => new Date(row.date_created).toLocaleString(),
  },
]

export function RolesPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [viewTarget, setViewTarget] = useState<Role | null>(null)
  const [editing, setEditing] = useState<Role | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RoleFormValues>({
    initialValues: { role_name: '' },
    validate: zod4Resolver(roleSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (role: Role) => {
    setEditing(role)
    form.setValues({ role_name: role.role_name })
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
        const apiErrors = err.response.data?.errors as
          | Record<string, string[]>
          | undefined
        if (apiErrors) {
          form.setErrors(
            Object.fromEntries(
              Object.entries(apiErrors).map(([field, msgs]) => [field, msgs[0]]),
            ),
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
    } catch {
      notifications.show({ message: 'Failed to delete role', color: 'red' })
    }
  }

  return (
    <>
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

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={
          <Title order={4} c="dark.9" fw={700}>
            {editing ? 'Edit role' : 'New role'}
          </Title>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Role name"
            placeholder="Admin"
            withAsterisk
            {...form.getInputProps('role_name')}
          />
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
