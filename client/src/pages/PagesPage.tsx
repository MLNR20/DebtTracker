import { useState } from 'react'
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createPage, deletePage, fetchPages, updatePage } from '../api/pages'
import type { Page } from '../types/page'

const pageSchema = z.object({
  page_key: z
    .string()
    .min(1, 'Key is required')
    .max(255)
    .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, dashes and underscores only'),
  page_name: z.string().min(1, 'Name is required').max(255),
  page_path: z
    .string()
    .min(1, 'Path is required')
    .max(255)
    .startsWith('/', 'Path must start with /'),
  page_group: z.string().max(255),
  sort_order: z.number().int().min(0),
})

type PageFormValues = z.infer<typeof pageSchema>

const emptyValues: PageFormValues = {
  page_key: '',
  page_name: '',
  page_path: '/',
  page_group: '',
  sort_order: 0,
}

const columns: CrudTableColumn<Page>[] = [
  { key: 'page_name', label: 'Name' },
  { key: 'page_key', label: 'Key' },
  { key: 'page_path', label: 'Path' },
  { key: 'page_group', label: 'Group', render: (row) => row.page_group ?? '—' },
  { key: 'sort_order', label: 'Order' },
]

export function PagesPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null)
  const [viewTarget, setViewTarget] = useState<Page | null>(null)
  const [editing, setEditing] = useState<Page | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PageFormValues>({
    initialValues: emptyValues,
    validate: zod4Resolver(pageSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.setValues(emptyValues)
    form.resetDirty()
    form.clearErrors()
    openForm()
  }

  const handleEdit = (page: Page) => {
    setEditing(page)
    form.setValues({
      page_key: page.page_key,
      page_name: page.page_name,
      page_path: page.page_path,
      page_group: page.page_group ?? '',
      sort_order: page.sort_order,
    })
    form.clearErrors()
    openForm()
  }

  const handleSubmit = async (values: PageFormValues) => {
    setSubmitting(true)
    const payload = { ...values, page_group: values.page_group.trim() || null }
    try {
      if (editing) {
        await updatePage(editing.page_id, payload)
        notifications.show({ message: 'Page updated', color: 'green' })
      } else {
        await createPage(payload)
        notifications.show({ message: 'Page created', color: 'green' })
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
      await deletePage(deleteTarget.page_id)
      notifications.show({ message: 'Page deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete page', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap="lg" p="xl">
        <CrudTable
          title="Pages"
          columns={columns}
          getRowId={(row) => row.page_id}
          fetchPage={fetchPages}
          onCreate={handleCreate}
          onView={setViewTarget}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchPlaceholder="Search pages…"
          reloadKey={reloadKey}
        />
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={
          <Title order={4} c="dark.9" fw={700}>
            {editing ? 'Edit page' : 'New page'}
          </Title>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="Reports"
              withAsterisk
              {...form.getInputProps('page_name')}
            />
            <TextInput
              label="Key"
              description="Unique identifier used for access checks"
              placeholder="reports"
              withAsterisk
              {...form.getInputProps('page_key')}
            />
            <TextInput
              label="Path"
              description="Client route, e.g. /reports"
              placeholder="/reports"
              withAsterisk
              {...form.getInputProps('page_path')}
            />
            <TextInput
              label="Group"
              description="Navigation section the page belongs to"
              placeholder="Activity"
              {...form.getInputProps('page_group')}
            />
            <NumberInput
              label="Sort order"
              min={0}
              allowDecimal={false}
              {...form.getInputProps('sort_order')}
            />
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
            Page details
          </Title>
        }
      >
        {viewTarget && (
          <>
            {(
              [
                ['Name', viewTarget.page_name],
                ['Key', viewTarget.page_key],
                ['Path', viewTarget.page_path],
                ['Group', viewTarget.page_group ?? '—'],
                ['Sort order', String(viewTarget.sort_order)],
                ['Created', new Date(viewTarget.date_created).toLocaleString()],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <Text size="sm" c="dimmed">
                  {label}
                </Text>
                <Text mb="md">{value}</Text>
              </div>
            ))}
          </>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setViewTarget(null)}>
            Close
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete page"
      >
        <Text>
          Are you sure you want to delete <strong>{deleteTarget?.page_name}</strong>? Roles will
          lose access to it.
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
