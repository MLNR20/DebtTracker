import { Anchor, Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '../api/auth'
import { saveAccess } from '../lib/access'
import { saveTokens } from '../lib/api'

const loginSchema = z.object({
  login: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    initialValues: { login: '', password: '' },
    validate: zod4Resolver(loginSchema),
  })

  useEffect(() => {
    if (sessionStorage.getItem('session_expired')) {
      sessionStorage.removeItem('session_expired')
      notifications.show({
        message: 'Your session has expired. Please sign in again.',
        color: 'yellow',
      })
    }
  }, [])

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    try {
      const { token, refresh_token, user, access } = await login(values)
      saveTokens({ token, refresh_token })
      localStorage.setItem('auth_user', JSON.stringify(user))
      saveAccess(access)
      notifications.show({ message: 'Logged in successfully', color: 'green' })
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
        notifications.show({ message: 'Invalid credentials', color: 'red' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container size={420} my={80}>
      <Title order={2} ta="center" fw={700}>
        Welcome back
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="xs">
        Sign in to your DebtTrack account
      </Text>

      <Paper withBorder shadow="sm" p="xl" mt="xl" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Username or email"
              placeholder="you@example.com"
              withAsterisk
              {...form.getInputProps('login')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              withAsterisk
              {...form.getInputProps('password')}
            />
            <Anchor component={Link} to="/forgot-password" size="sm" ta="right">
              Forgot password?
            </Anchor>
          </Stack>
          <Button type="submit" fullWidth mt="xl" loading={submitting}>
            Sign in
          </Button>
        </form>
      </Paper>

      <Text ta="center" mt="md" size="sm">
        Don&apos;t have an account?{' '}
        <Anchor component={Link} to="/register">
          Register
        </Anchor>
      </Text>
    </Container>
  )
}
