import { useEffect, useState } from 'react'
import { Button, Group as MantineGroup, Modal, Select, Stack, Text, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createGroup, deleteGroup, fetchGroups, updateGroup } from '../api/groups'
import { fetchUsers } from '../api/users'
import type { Group } from '../types/group'
import type { User } from '../types/user'

const groupSchema = z.object({
  group_name: z.string().min(1, 'Group name is required').max(255),
  group_description: z.string().max(255).optional(),
  created_by: z.string().min(1, 'Creator is required'),
})

type GroupFormValues = z.infer<typeof groupSchema>

const columns: CrudTableColumn<Group>[] = [
  { key: 'group_name', label: 'Group name' },
  {
    key: 'group_description',
    label: 'Description',
    render: (row) => row.group_description ?? '—',
  },
  {
    key: 'creator',
    label: 'Created by',
    render: (row) =>
      row.creator ? `${row.creator.first_name} ${row.creator.last_name}` : '—',
  },
]

export function GroupsPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  const [editing, setEditing] = useState<Group | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers({ page: 1, perPage: 100, search: '' })
      .then((res) => setUsers(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load users', color: 'red' })
      })
  }, [])

  const userOptions = users.map((user) => ({
    value: user.user_id,
    label: `${user.first_name} ${user.last_name} (${user.user_name})`,
  }))

  const form = useForm<GroupFormValues>({
    initialValues: {
      group_name: '',
      group_description: '',
      created_by: '',
    },
    validate: zod4Resolver(groupSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (group: Group) => {
    setEditing(group)
    form.setValues({
      group_name: group.group_name,
      group_description: group.group_description ?? '',
      created_by: group.created_by,
    })
    openForm()
  }

  const handleSubmit = async (values: GroupFormValues) => {
    setSubmitting(true)
    const payload = {
      ...values,
      group_description: values.group_description || undefined,
    }
    try {
      if (editing) {
        await updateGroup(editing.group_id, payload)
        notifications.show({ message: 'Group updated', color: 'green' })
      } else {
        await createGroup(payload)
        notifications.show({ message: 'Group created', color: 'green' })
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
      await deleteGroup(deleteTarget.group_id)
      notifications.show({ message: 'Group deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete group', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap="lg" p="xl">
        <CrudTable
          title="Groups"
          columns={columns}
          getRowId={(row) => row.group_id}
          fetchPage={fetchGroups}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchPlaceholder="Search groups…"
          reloadKey={reloadKey}
        />
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit group' : 'New group'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Group name"
            placeholder="Roommates"
            {...form.getInputProps('group_name')}
          />
          <TextInput
            label="Description"
            placeholder="Shared apartment expenses"
            mt="sm"
            {...form.getInputProps('group_description')}
          />
          <Select
            label="Created by"
            placeholder="Select a user"
            data={userOptions}
            searchable
            mt="sm"
            {...form.getInputProps('created_by')}
          />
          <MantineGroup justify="flex-end" mt="md">
            <Button variant="default" onClick={closeForm} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </MantineGroup>
        </form>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete group"
      >
        <Text>
          Are you sure you want to delete <strong>{deleteTarget?.group_name}</strong>?
          This will soft-delete the record.
        </Text>
        <MantineGroup justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </MantineGroup>
      </Modal>
    </>
  )
}
