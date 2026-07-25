import { Anchor, Button, Container, Group, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { register } from '../api/auth'

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(255),
    last_name: z.string().min(1, 'Last name is required').max(255),
    email_address: z.string().min(1, 'Email is required').email('Invalid email'),
    user_name: z.string().min(1, 'Username is required').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RegisterFormValues>({
    initialValues: {
      first_name: '',
      last_name: '',
      email_address: '',
      user_name: '',
      password: '',
      password_confirmation: '',
    },
    validate: zod4Resolver(registerSchema),
  })

  const handleSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true)
    try {
      const { token, user } = await register(values)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      notifications.show({ message: 'Account created', color: 'green' })
      navigate('/dashboard')
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

  return (
    <Container size={460} my={80}>
      <Title order={2} ta="center" fw={700}>
        Create an account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="xs">
        Get started with DebtTrack
      </Text>

      <Paper withBorder shadow="sm" p="xl" mt="xl" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Group grow>
              <TextInput label="First name" withAsterisk {...form.getInputProps('first_name')} />
              <TextInput label="Last name" withAsterisk {...form.getInputProps('last_name')} />
            </Group>
            <TextInput label="Email" placeholder="you@example.com" withAsterisk {...form.getInputProps('email_address')} />
            <TextInput label="Username" withAsterisk {...form.getInputProps('user_name')} />
            <PasswordInput label="Password" withAsterisk {...form.getInputProps('password')} />
            <PasswordInput
              label="Confirm password"
              withAsterisk
              {...form.getInputProps('password_confirmation')}
            />
          </Stack>
          <Button type="submit" fullWidth mt="xl" loading={submitting}>
            Create account
          </Button>
        </form>
      </Paper>

      <Text ta="center" mt="md" size="sm">
        Already have an account?{' '}
        <Anchor component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>
    </Container>
  )
}
