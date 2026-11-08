import { useState } from 'react'
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import {
  createAchievement,
  deleteAchievement,
  fetchAchievements,
  updateAchievement,
} from '../api/achievements'
import type { Achievement } from '../types/achievement'

const achievementSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(255),
  icon: z.string().max(255),
  points: z.number({ message: 'Points are required' }).int().min(0, 'Points must be 0 or more'),
})

type AchievementFormValues = z.infer<typeof achievementSchema>

const columns: CrudTableColumn<Achievement>[] = [
  { key: 'name', label: 'Name' },
  {
    key: 'description',
    label: 'Description',
    render: (row) => row.description ?? '—',
  },
  { key: 'points', label: 'Points' },
  {
    key: 'date_created',
    label: 'Created',
    render: (row) => new Date(row.date_created).toLocaleString(),
  },
]

export function AchievementsPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null)
  const [viewTarget, setViewTarget] = useState<Achievement | null>(null)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<AchievementFormValues>({
    initialValues: { name: '', description: '', icon: '', points: 0 },
    validate: zod4Resolver(achievementSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (achievement: Achievement) => {
    setEditing(achievement)
    form.setValues({
      name: achievement.name,
      description: achievement.description ?? '',
      icon: achievement.icon ?? '',
      points: achievement.points,
    })
    openForm()
  }

  const handleSubmit = async (values: AchievementFormValues) => {
    setSubmitting(true)
    const payload = {
      name: values.name,
      description: values.description || null,
      icon: values.icon || null,
      points: values.points,
    }
    try {
      if (editing) {
        await updateAchievement(editing.achievement_id, payload)
        notifications.show({ message: 'Achievement updated', color: 'green' })
      } else {
        await createAchievement(payload)
        notifications.show({ message: 'Achievement created', color: 'green' })
      }
      closeForm()
      reload()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors as Record<string, string[]> | undefined
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
      await deleteAchievement(deleteTarget.achievement_id)
      notifications.show({ message: 'Achievement deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete achievement', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap="lg" p="xl">
        <CrudTable
          title="Achievements"
          columns={columns}
          getRowId={(row) => row.achievement_id}
          fetchPage={fetchAchievements}
          onCreate={handleCreate}
          onView={setViewTarget}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchPlaceholder="Search achievements…"
          reloadKey={reloadKey}
        />
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={
          <Title order={4} c="dark.9" fw={700}>
            {editing ? 'Edit achievement' : 'New achievement'}
          </Title>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="First payment"
              withAsterisk
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Description"
              placeholder="Awarded for settling a first debt"
              {...form.getInputProps('description')}
            />
            <TextInput
              label="Icon"
              placeholder="trophy"
              {...form.getInputProps('icon')}
            />
            <NumberInput
              label="Points"
              withAsterisk
              min={0}
              allowDecimal={false}
              {...form.getInputProps('points')}
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
            Achievement details
          </Title>
        }
      >
        <Text size="sm" c="dimmed">
          Name
        </Text>
        <Text mb="md">{viewTarget?.name}</Text>
        <Text size="sm" c="dimmed">
          Description
        </Text>
        <Text mb="md">{viewTarget?.description ?? '—'}</Text>
        <Text size="sm" c="dimmed">
          Icon
        </Text>
        <Text mb="md">{viewTarget?.icon ?? '—'}</Text>
        <Text size="sm" c="dimmed">
          Points
        </Text>
        <Text mb="md">{viewTarget?.points}</Text>
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
        title="Delete achievement"
      >
        <Text>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
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
