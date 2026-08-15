import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Group as MantineGroup,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import {
  createGroupExpense,
  deleteGroupExpense,
  fetchGroupExpenses,
  updateGroupExpense,
} from '../api/groupExpenses'
import { fetchGroups } from '../api/groups'
import { fetchUsers } from '../api/users'
import type { GroupExpense } from '../types/groupExpense'
import type { Group } from '../types/group'
import type { User } from '../types/user'

const splitTypeOptions = [
  { value: 'equal', label: 'Equal split' },
  { value: 'custom', label: 'Custom split' },
]

const splitTypeColors: Record<string, string> = {
  equal: 'blue',
  custom: 'grape',
}

const groupExpenseSchema = z.object({
  group_id: z.string().min(1, 'Group is required'),
  paid_by_user_id: z.string().min(1, 'Payer is required'),
  total_amount: z.number().min(0),
  description: z.string().max(255).optional(),
  split_type: z.string().min(1, 'Split type is required'),
  date_incurred: z.string().min(1, 'Date is required'),
})

type GroupExpenseFormValues = z.infer<typeof groupExpenseSchema>

const columns: CrudTableColumn<GroupExpense>[] = [
  {
    key: 'group',
    label: 'Group',
    render: (row) => row.group?.group_name ?? '—',
  },
  {
    key: 'payer',
    label: 'Paid by',
    render: (row) => (row.payer ? `${row.payer.first_name} ${row.payer.last_name}` : '—'),
  },
  { key: 'total_amount', label: 'Total', render: (row) => `₱${row.total_amount}` },
  {
    key: 'split_type',
    label: 'Split',
    render: (row) => (
      <Badge color={splitTypeColors[row.split_type] ?? 'gray'}>{row.split_type}</Badge>
    ),
  },
  {
    key: 'date_incurred',
    label: 'Date',
    render: (row) => new Date(row.date_incurred).toLocaleDateString(),
  },
  {
    key: 'description',
    label: 'Description',
    render: (row) => row.description ?? '—',
  },
]

export function GroupExpensesPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<GroupExpense | null>(null)
  const [editing, setEditing] = useState<GroupExpense | null>(null)
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

  const form = useForm<GroupExpenseFormValues>({
    initialValues: {
      group_id: '',
      paid_by_user_id: '',
      total_amount: 0,
      description: '',
      split_type: 'equal',
      date_incurred: '',
    },
    validate: zod4Resolver(groupExpenseSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (expense: GroupExpense) => {
    setEditing(expense)
    form.setValues({
      group_id: expense.group_id,
      paid_by_user_id: expense.paid_by_user_id,
      total_amount: Number(expense.total_amount),
      description: expense.description ?? '',
      split_type: expense.split_type,
      date_incurred: expense.date_incurred.slice(0, 10),
    })
    openForm()
  }

  const handleSubmit = async (values: GroupExpenseFormValues) => {
    setSubmitting(true)
    const payload = {
      ...values,
      description: values.description || undefined,
    }
    try {
      if (editing) {
        await updateGroupExpense(editing.expense_id, payload)
        notifications.show({ message: 'Expense updated', color: 'green' })
      } else {
        await createGroupExpense(payload)
        notifications.show({ message: 'Expense created', color: 'green' })
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
      await deleteGroupExpense(deleteTarget.expense_id)
      notifications.show({ message: 'Expense deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete expense', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap="lg" p="xl">
        <CrudTable
          title="Group expenses"
          columns={columns}
          getRowId={(row) => row.expense_id}
          fetchPage={fetchGroupExpenses}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchPlaceholder="Search expenses…"
          reloadKey={reloadKey}
        />
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit expense' : 'New expense'}
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
            label="Paid by"
            placeholder="Select a user"
            data={userOptions}
            searchable
            mt="sm"
            {...form.getInputProps('paid_by_user_id')}
          />
          <NumberInput
            label="Total amount"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            mt="sm"
            {...form.getInputProps('total_amount')}
          />
          <TextInput
            label="Description"
            placeholder="Dinner at the mall"
            mt="sm"
            {...form.getInputProps('description')}
          />
          <Select
            label="Split type"
            data={splitTypeOptions}
            mt="sm"
            allowDeselect={false}
            {...form.getInputProps('split_type')}
          />
          <TextInput
            type="date"
            label="Date incurred"
            mt="sm"
            {...form.getInputProps('date_incurred')}
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
        title="Delete expense"
      >
        <Text>
          Are you sure you want to delete this expense? This will soft-delete the record.
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
