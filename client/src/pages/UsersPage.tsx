import { useEffect, useState } from 'react'
import { Badge, Button, Group, Modal, Select, Stack, Switch, Text, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createUser, deleteUser, fetchUsers, updateUser } from '../api/users'
import { fetchRoles } from '../api/roles'
import type { User } from '../types/user'
import type { Role } from '../types/role'

const userSchema = z.object({
  role_id: z.string().optional(),
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  email_address: z.string().email('Invalid email').max(255),
  contact_no: z.string().max(255).optional(),
  user_name: z.string().min(1, 'Username is required').max(255),
  password: z.string().max(255).optional(),
  is_active: z.boolean(),
})

type UserFormValues = z.infer<typeof userSchema>

const columns: CrudTableColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (row) => `${row.first_name} ${row.last_name}`,
  },
  { key: 'user_name', label: 'Username' },
  { key: 'email_address', label: 'Email' },
  { key: 'role', label: 'Role', render: (row) => row.role?.role_name ?? '—' },
  {
    key: 'is_active',
    label: 'Status',
    render: (row) => (
      <Badge color={row.is_active ? 'green' : 'gray'}>
        {row.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]

export function UsersPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [editing, setEditing] = useState<User | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    fetchRoles({ page: 1, perPage: 100, search: '' })
      .then((res) => setRoles(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load roles', color: 'red' })
      })
  }, [])

  const roleOptions = roles.map((role) => ({
    value: role.role_id,
    label: role.role_name,
  }))

  const form = useForm<UserFormValues>({
    initialValues: {
      role_id: '',
      first_name: '',
      last_name: '',
      email_address: '',
      contact_no: '',
      user_name: '',
      password: '',
      is_active: true,
    },
    validate: zod4Resolver(userSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (user: User) => {
    setEditing(user)
    form.setValues({
      role_id: user.role_id ?? '',
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
      contact_no: user.contact_no ?? '',
      user_name: user.user_name,
      password: '',
      is_active: user.is_active,
    })
    openForm()
  }

  const handleSubmit = async (values: UserFormValues) => {
    setSubmitting(true)
    const payload = {
      ...values,
      role_id: values.role_id || undefined,
      contact_no: values.contact_no || undefined,
      password: values.password || undefined,
    }
    try {
      if (editing) {
        await updateUser(editing.user_id, payload)
        notifications.show({ message: 'User updated', color: 'green' })
      } else {
        await createUser({ ...payload, password: payload.password ?? '' })
        notifications.show({ message: 'User created', color: 'green' })
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
      await deleteUser(deleteTarget.user_id)
      notifications.show({ message: 'User deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete user', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap="lg" p="xl">
        <CrudTable
          title="Users"
          columns={columns}
          getRowId={(row) => row.user_id}
          fetchPage={fetchUsers}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchPlaceholder="Search users…"
          reloadKey={reloadKey}
        />
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit user' : 'New user'}
        styles={{ title: { color: 'black', fontWeight: 600 } }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="First name"
            placeholder="Bob"
            {...form.getInputProps('first_name')}
          />
          <TextInput
            label="Last name"
            placeholder="Smith"
            mt="sm"
            {...form.getInputProps('last_name')}
          />
          <TextInput
            label="Email"
            placeholder="bob@example.com"
            mt="sm"
            {...form.getInputProps('email_address')}
          />
          <TextInput
            label="Username"
            placeholder="bobsmith"
            mt="sm"
            {...form.getInputProps('user_name')}
          />
          <TextInput
            label="Phone"
            placeholder="+1 555 0100"
            mt="sm"
            {...form.getInputProps('contact_no')}
          />
          <Select
            label="Role"
            placeholder="Select a role"
            data={roleOptions}
            clearable
            mt="sm"
            {...form.getInputProps('role_id')}
          />
          <TextInput
            label={editing ? 'New password (optional)' : 'Password'}
            type="password"
            placeholder="••••••••"
            mt="sm"
            {...form.getInputProps('password')}
          />
          <Switch
            label="Active"
            mt="sm"
            checked={form.values.is_active}
            onChange={(event) =>
              form.setFieldValue('is_active', event.currentTarget.checked)
            }
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
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete user"
        styles={{ title: { color: 'black', fontWeight: 600 } }}
      >
        <Text>
          Are you sure you want to delete{' '}
          <strong>
            {deleteTarget?.first_name} {deleteTarget?.last_name}
          </strong>
          ? This will soft-delete the record.
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
