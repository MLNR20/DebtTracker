import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Group as MantineGroup,
  Modal,
  NumberInput,
  Select,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createDebt, deleteDebt, fetchDebts, updateDebt } from '../api/debts'
import { fetchUsers } from '../api/users'
import { fetchContacts } from '../api/contacts'
import type { Debt } from '../types/debt'
import type { User } from '../types/user'
import type { Contact } from '../types/contact'

const debtorTypeOptions = [
  { value: 'user', label: 'Registered user' },
  { value: 'contact', label: 'Contact' },
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
]

const statusColors: Record<string, string> = {
  pending: 'yellow',
  partial: 'blue',
  paid: 'green',
}

const debtSchema = z
  .object({
    creditor_id: z.string().min(1, 'Creditor is required'),
    debtor_type: z.enum(['user', 'contact']),
    debtor_user_id: z.string().optional(),
    debtor_contact_id: z.string().optional(),
    total_amount: z.number().min(0),
    remaining_amount: z.number().min(0),
    description: z.string().max(255).optional(),
    due_date: z.string().optional(),
    status: z.string().min(1, 'Status is required'),
  })
  .refine(
    (values) =>
      values.debtor_type === 'user'
        ? Boolean(values.debtor_user_id)
        : Boolean(values.debtor_contact_id),
    {
      message: 'Debtor is required',
      path: ['debtor_user_id'],
    },
  )

type DebtFormValues = z.infer<typeof debtSchema>

const columns: CrudTableColumn<Debt>[] = [
  {
    key: 'creditor',
    label: 'Creditor',
    render: (row) =>
      row.creditor ? `${row.creditor.first_name} ${row.creditor.last_name}` : '—',
  },
  {
    key: 'debtor',
    label: 'Debtor',
    render: (row) =>
      row.debtor_user
        ? `${row.debtor_user.first_name} ${row.debtor_user.last_name}`
        : row.debtor_contact
          ? `${row.debtor_contact.first_name} ${row.debtor_contact.last_name}`
          : '—',
  },
  { key: 'total_amount', label: 'Total', render: (row) => `₱${row.total_amount}` },
  {
    key: 'remaining_amount',
    label: 'Remaining',
    render: (row) => `₱${row.remaining_amount}`,
  },
  {
    key: 'due_date',
    label: 'Due',
    render: (row) => (row.due_date ? new Date(row.due_date).toLocaleDateString() : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <Badge color={statusColors[row.status] ?? 'gray'}>{row.status}</Badge>
    ),
  },
]

export function DebtsPage() {
  const navigate = useNavigate()
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    fetchUsers({ page: 1, perPage: 100, search: '' })
      .then((res) => setUsers(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load users', color: 'red' })
      })
    fetchContacts({ page: 1, perPage: 100, search: '' })
      .then((res) => setContacts(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load contacts', color: 'red' })
      })
  }, [])

  const userOptions = users.map((user) => ({
    value: user.user_id,
    label: `${user.first_name} ${user.last_name} (${user.user_name})`,
  }))

  const contactOptions = contacts.map((contact) => ({
    value: contact.contact_id,
    label: `${contact.first_name} ${contact.last_name}`,
  }))

  const form = useForm<DebtFormValues>({
    initialValues: {
      creditor_id: '',
      debtor_type: 'user',
      debtor_user_id: '',
      debtor_contact_id: '',
      total_amount: 0,
      remaining_amount: 0,
      description: '',
      due_date: '',
      status: 'pending',
    },
    validate: zod4Resolver(debtSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (debt: Debt) => {
    setEditing(debt)
    form.setValues({
      creditor_id: debt.creditor_id,
      debtor_type: debt.debtor_contact_id ? 'contact' : 'user',
      debtor_user_id: debt.debtor_user_id ?? '',
      debtor_contact_id: debt.debtor_contact_id ?? '',
      total_amount: Number(debt.total_amount),
      remaining_amount: Number(debt.remaining_amount),
      description: debt.description ?? '',
      due_date: debt.due_date ? debt.due_date.slice(0, 10) : '',
      status: debt.status,
    })
    openForm()
  }

  const handleSubmit = async (values: DebtFormValues) => {
    setSubmitting(true)
    const { debtor_type, ...rest } = values
    const payload = {
      ...rest,
      debtor_user_id: debtor_type === 'user' ? values.debtor_user_id || undefined : undefined,
      debtor_contact_id:
        debtor_type === 'contact' ? values.debtor_contact_id || undefined : undefined,
      description: values.description || undefined,
      due_date: values.due_date || undefined,
    }
    try {
      if (editing) {
        await updateDebt(editing.debt_id, payload)
        notifications.show({ message: 'Debt updated', color: 'green' })
      } else {
        await createDebt(payload)
        notifications.show({ message: 'Debt created', color: 'green' })
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
      await deleteDebt(deleteTarget.debt_id)
      notifications.show({ message: 'Debt deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete debt', color: 'red' })
    }
  }

  return (
    <>
      <MantineGroup justify="flex-end" mb="md">
        <Button variant="light" onClick={() => navigate('/debts/bulk-assign')}>
          Assign to multiple debtors
        </Button>
      </MantineGroup>

      <CrudTable
        title="Debts"
        columns={columns}
        getRowId={(row) => row.debt_id}
        fetchPage={fetchDebts}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        searchPlaceholder="Search debts…"
        reloadKey={reloadKey}
      />

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit debt' : 'New debt'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Creditor"
            placeholder="Select a user"
            data={userOptions}
            searchable
            {...form.getInputProps('creditor_id')}
          />
          <Select
            label="Debtor type"
            data={debtorTypeOptions}
            mt="sm"
            allowDeselect={false}
            {...form.getInputProps('debtor_type')}
          />
          {form.values.debtor_type === 'contact' ? (
            <Select
              label="Debtor"
              placeholder="Select a contact"
              data={contactOptions}
              searchable
              mt="sm"
              {...form.getInputProps('debtor_contact_id')}
            />
          ) : (
            <Select
              label="Debtor"
              placeholder="Select a user"
              data={userOptions}
              searchable
              mt="sm"
              {...form.getInputProps('debtor_user_id')}
            />
          )}
          <NumberInput
            label="Total amount"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            mt="sm"
            {...form.getInputProps('total_amount')}
          />
          <NumberInput
            label="Remaining amount"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            mt="sm"
            {...form.getInputProps('remaining_amount')}
          />
          <TextInput
            label="Description"
            placeholder="Dinner split"
            mt="sm"
            {...form.getInputProps('description')}
          />
          <TextInput
            type="date"
            label="Due date"
            mt="sm"
            {...form.getInputProps('due_date')}
          />
          <Select
            label="Status"
            data={statusOptions}
            mt="sm"
            {...form.getInputProps('status')}
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
        title="Delete debt"
      >
        <Text>
          Are you sure you want to delete this debt? This will soft-delete the record.
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
