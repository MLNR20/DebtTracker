import { Text, Title } from '@mantine/core'

export function PageHeader({ header, subheader }: { header: string; subheader: string }) {
  return (
    <div>
      <Title order={2} c="black">
        {header}
      </Title>
      <Text size="md" c="gray" mt={2}>
        {subheader}
      </Text>
    </div>
  )
}
