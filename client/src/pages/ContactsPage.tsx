import { useEffect, useState } from 'react'
import { Button, Group, Modal, Select, Text, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import {
  createContact,
  deleteContact,
  fetchContacts,
  updateContact,
} from '../api/contacts'
import { fetchUsers } from '../api/users'
import type { Contact } from '../types/contact'
import type { User } from '../types/user'

const contactSchema = z.object({
  user_id: z.string().min(1, 'Owner is required'),
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  contact_no: z.string().max(255).optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

const columns: CrudTableColumn<Contact>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (row) => `${row.first_name} ${row.last_name}`,
  },
  { key: 'email', label: 'Email', render: (row) => row.email ?? '—' },
  { key: 'contact_no', label: 'Phone', render: (row) => row.contact_no ?? '—' },
  {
    key: 'user',
    label: 'Owner',
    render: (row) =>
      row.user ? `${row.user.first_name} ${row.user.last_name}` : '—',
  },
]

export function ContactsPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [editing, setEditing] = useState<Contact | null>(null)
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

  const form = useForm<ContactFormValues>({
    initialValues: {
      user_id: '',
      first_name: '',
      last_name: '',
      email: '',
      contact_no: '',
    },
    validate: zod4Resolver(contactSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (contact: Contact) => {
    setEditing(contact)
    form.setValues({
      user_id: contact.user_id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email ?? '',
      contact_no: contact.contact_no ?? '',
    })
    openForm()
  }

  const handleSubmit = async (values: ContactFormValues) => {
    setSubmitting(true)
    const payload = {
      ...values,
      email: values.email || undefined,
      contact_no: values.contact_no || undefined,
    }
    try {
      if (editing) {
        await updateContact(editing.contact_id, payload)
        notifications.show({ message: 'Contact updated', color: 'green' })
      } else {
        await createContact(payload)
        notifications.show({ message: 'Contact created', color: 'green' })
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
      await deleteContact(deleteTarget.contact_id)
      notifications.show({ message: 'Contact deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete contact', color: 'red' })
    }
  }

  return (
    <>
      <CrudTable
        title="Contacts"
        columns={columns}
        getRowId={(row) => row.contact_id}
        fetchPage={fetchContacts}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        searchPlaceholder="Search contacts…"
        reloadKey={reloadKey}
      />

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit contact' : 'New contact'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Owner"
            placeholder="Select a user"
            data={userOptions}
            searchable
            {...form.getInputProps('user_id')}
          />
          <TextInput
            label="First name"
            placeholder="Bob"
            mt="sm"
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
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Phone"
            placeholder="+1 555 0100"
            mt="sm"
            {...form.getInputProps('contact_no')}
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
        title="Delete contact"
      >
        <Text>
          Are you sure you want to delete{' '}
          <strong>
            {deleteTarget?.first_name} {deleteTarget?.last_name}
          </strong>
          ?
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
