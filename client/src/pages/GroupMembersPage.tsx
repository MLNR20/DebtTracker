import { useEffect, useState } from 'react'
import { Button, Group as MantineGroup, Modal, Select, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import {
  createGroupMember,
  deleteGroupMember,
  fetchGroupMembers,
  updateGroupMember,
} from '../api/groupMembers'
import { fetchGroups } from '../api/groups'
import { fetchUsers } from '../api/users'
import type { GroupMember } from '../types/groupMember'
import type { Group } from '../types/group'
import type { User } from '../types/user'

const groupMemberSchema = z.object({
  group_id: z.string().min(1, 'Group is required'),
  user_id: z.string().min(1, 'User is required'),
})

type GroupMemberFormValues = z.infer<typeof groupMemberSchema>

const columns: CrudTableColumn<GroupMember>[] = [
  {
    key: 'group',
    label: 'Group',
    render: (row) => row.group?.group_name ?? '—',
  },
  {
    key: 'user',
    label: 'Member',
    render: (row) => (row.user ? `${row.user.first_name} ${row.user.last_name}` : '—'),
  },
  {
    key: 'date_joined',
    label: 'Date joined',
    render: (row) =>
      row.date_joined ? new Date(row.date_joined).toLocaleDateString() : '—',
  },
]

export function GroupMembersPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<GroupMember | null>(null)
  const [editing, setEditing] = useState<GroupMember | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchGroups({ page: 1, perPage: 100, search: '' })
      .then((res) => setGroups(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load groups', color: 'red' })
      })
    fetchUsers({ page: 1, perPage: 100, search: '' })
      .then((res) => setUsers(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load users', color: 'red' })
      })
  }, [])

  const groupOptions = groups.map((group) => ({
    value: group.group_id,
    label: group.group_name,
  }))

  const userOptions = users.map((user) => ({
    value: user.user_id,
    label: `${user.first_name} ${user.last_name} (${user.user_name})`,
  }))

  const form = useForm<GroupMemberFormValues>({
    initialValues: {
      group_id: '',
      user_id: '',
    },
    validate: zod4Resolver(groupMemberSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (groupMember: GroupMember) => {
    setEditing(groupMember)
    form.setValues({
      group_id: groupMember.group_id,
      user_id: groupMember.user_id,
    })
    openForm()
  }

  const handleSubmit = async (values: GroupMemberFormValues) => {
    setSubmitting(true)
    try {
      if (editing) {
        await updateGroupMember(editing.group_member_id, values)
        notifications.show({ message: 'Group member updated', color: 'green' })
      } else {
        await createGroupMember(values)
        notifications.show({ message: 'Group member added', color: 'green' })
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
      await deleteGroupMember(deleteTarget.group_member_id)
      notifications.show({ message: 'Group member removed', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to remove group member', color: 'red' })
    }
  }

  return (
    <>
      <CrudTable
        title="Group members"
        columns={columns}
        getRowId={(row) => row.group_member_id}
        fetchPage={fetchGroupMembers}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        searchPlaceholder="Search group members…"
        reloadKey={reloadKey}
      />

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit group member' : 'Add group member'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Group"
            placeholder="Select a group"
            data={groupOptions}
            searchable
            {...form.getInputProps('group_id')}
          />
          <Select
            label="Member"
            placeholder="Select a user"
            data={userOptions}
            searchable
            mt="sm"
            {...form.getInputProps('user_id')}
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
        title="Remove group member"
      >
        <Text>
          Are you sure you want to remove{' '}
          <strong>
            {deleteTarget?.user
              ? `${deleteTarget.user.first_name} ${deleteTarget.user.last_name}`
              : 'this member'}
          </strong>{' '}
          from <strong>{deleteTarget?.group?.group_name ?? 'the group'}</strong>?
        </Text>
        <MantineGroup justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Remove
          </Button>
        </MantineGroup>
      </Modal>
    </>
  )
}
