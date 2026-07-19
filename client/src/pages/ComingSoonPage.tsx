import { Paper, Text, Title } from '@mantine/core'

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Title order={3} mb="xs">
        {title}
      </Title>
      <Text c="dimmed">CRUD for this section hasn't been built yet.</Text>
    </Paper>
  )
}
