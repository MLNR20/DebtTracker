import { Text, Title } from '@mantine/core'

export function PageHeader({ header, subheader }: { header: string; subheader?: string }) {
  return (
    <div style={{ width: '100%' }}>
      <Title order={4} c="black">
        {header}
      </Title>
      {subheader && (
        <Text size="md" c="gray" mt="sm">
          {subheader}
        </Text>
      )}
    </div>
  )
}
