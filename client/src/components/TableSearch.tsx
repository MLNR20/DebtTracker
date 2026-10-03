import { TextInput } from '@mantine/core'

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TableSearch({ value, onChange, placeholder = 'Search…' }: TableSearchProps) {
  return (
    <TextInput
      label="Search"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      style={{ flex: 1 }}
    />
  )
}
