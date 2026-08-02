import { useEffect, useState } from 'react'
import {
  Button,
  Group as MantineGroup,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createDebt } from '../api/debts'
import { fetchUsers } from '../api/users'
import { fetchContacts } from '../api/contacts'
import type { User } from '../types/user'
import type { Contact } from '../types/contact'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
]

const bulkDebtSchema = z
  .object({
    creditor_id: z.string().min(1, 'Creditor is required'),
    debtor_user_ids: z.array(z.string()),
    debtor_contact_ids: z.array(z.string()),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().max(255).optional(),
    due_date: z.string().optional(),
    status: z.string().min(1, 'Status is required'),
  })
  .refine(
    (values) => values.debtor_user_ids.length + values.debtor_contact_ids.length > 0,
    { message: 'Select at least one debtor', path: ['debtor_user_ids'] },
  )

type BulkDebtFormValues = z.infer<typeof bulkDebtSchema>

export function BulkDebtAssignPage() {
  const navigate = useNavigate()
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

  const form = useForm<BulkDebtFormValues>({
    initialValues: {
      creditor_id: '',
      debtor_user_ids: [],
      debtor_contact_ids: [],
      amount: 0,
      description: '',
      due_date: '',
      status: 'pending',
    },
    validate: zod4Resolver(bulkDebtSchema),
  })

  const handleSubmit = async (values: BulkDebtFormValues) => {
    setSubmitting(true)
    const basePayload = {
      creditor_id: values.creditor_id,
      total_amount: values.amount,
      remaining_amount: values.amount,
      description: values.description || undefined,
      due_date: values.due_date || undefined,
      status: values.status,
    }

    try {
      await Promise.all([
        ...values.debtor_user_ids.map((userId) =>
          createDebt({ ...basePayload, debtor_user_id: userId }),
        ),
        ...values.debtor_contact_ids.map((contactId) =>
          createDebt({ ...basePayload, debtor_contact_id: contactId }),
        ),
      ])
      notifications.show({
        message: `Created ${values.debtor_user_ids.length + values.debtor_contact_ids.length} debts`,
        color: 'green',
      })
      navigate('/debts')
    } catch {
      notifications.show({ message: 'Something went wrong', color: 'red' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Paper withBorder p="xl" radius="md" maw={560}>
      <Title order={3} mb="md">
        Assign debt to multiple debtors
      </Title>
      <Text c="dimmed" size="sm" mb="lg">
        Pick a creditor and any number of debtors — each selected debtor will owe the
        same amount.
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Creditor"
          placeholder="Select a user"
          data={userOptions}
          searchable
          {...form.getInputProps('creditor_id')}
        />
        <MultiSelect
          label="Debtors (registered users)"
          placeholder="Select users"
          data={userOptions}
          searchable
          mt="sm"
          {...form.getInputProps('debtor_user_ids')}
        />
        <MultiSelect
          label="Debtors (contacts)"
          placeholder="Select contacts"
          data={contactOptions}
          searchable
          mt="sm"
          {...form.getInputProps('debtor_contact_ids')}
        />
        <NumberInput
          label="Amount owed by each debtor"
          placeholder="0.00"
          min={0}
          decimalScale={2}
          mt="sm"
          {...form.getInputProps('amount')}
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
          allowDeselect={false}
          {...form.getInputProps('status')}
        />
        <MantineGroup justify="flex-end" mt="md">
          <Button variant="default" type="button" onClick={() => navigate('/debts')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create debts
          </Button>
        </MantineGroup>
      </form>
    </Paper>
  )
}
