import { Anchor, Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { resetPassword } from '../api/auth'

const forgotPasswordSchema = z
  .object({
    email_address: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: { email_address: '', password: '', password_confirmation: '' },
    validate: zod4Resolver(forgotPasswordSchema),
  })

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitting(true)
    try {
      await resetPassword(values)
      notifications.show({ message: 'Password updated successfully', color: 'green' })
      navigate('/login')
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
    <Container size={420} my={80}>
      <Title order={2} ta="center" fw={700}>
        Update password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="xs">
        Enter your email and choose a new password
      </Text>

      <Paper withBorder shadow="sm" p="xl" mt="xl" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              withAsterisk
              {...form.getInputProps('email_address')}
            />
            <PasswordInput
              label="New password"
              withAsterisk
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Confirm new password"
              withAsterisk
              {...form.getInputProps('password_confirmation')}
            />
          </Stack>
          <Button type="submit" fullWidth mt="xl" loading={submitting}>
            Update password
          </Button>
        </form>
      </Paper>

      <Text ta="center" mt="md" size="sm">
        Remembered your password?{' '}
        <Anchor component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>
    </Container>
  )
}
