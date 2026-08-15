import { Text, Title } from '@mantine/core'

export function PageHeader({ header, subheader }: { header: string; subheader?: string }) {
  return (
    <div style={{ width: '100%' }}>
      <Title order={3} c="black">
        {header}
      </Title>
      {subheader && (
        <Text size="lg" c="gray" mt={2}>
          {subheader}
        </Text>
      )}
    </div>
  )
}
