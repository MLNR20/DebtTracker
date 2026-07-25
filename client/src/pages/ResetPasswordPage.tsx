import { Anchor, Button, Container, Paper, PasswordInput, Stack, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { resetPassword } from '../api/auth'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const form = useForm<ResetPasswordFormValues>({
    initialValues: { password: '', password_confirmation: '' },
    validate: zod4Resolver(resetPasswordSchema),
  })

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitting(true)
    try {
      await resetPassword({ ...values, token, email_address: email })
      notifications.show({ message: 'Password reset successfully', color: 'green' })
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

  if (!token || !email) {
    return (
      <Container size={420} my={80}>
        <Title order={2} ta="center" fw={700}>
          Invalid reset link
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt="xs">
          This password reset link is missing or invalid.
        </Text>
        <Text ta="center" mt="md" size="sm">
          <Anchor component={Link} to="/forgot-password">
            Request a new link
          </Anchor>
        </Text>
      </Container>
    )
  }

  return (
    <Container size={420} my={80}>
      <Title order={2} ta="center" fw={700}>
        Reset password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="xs">
        Choose a new password for {email}
      </Text>

      <Paper withBorder shadow="sm" p="xl" mt="xl" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
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
            Reset password
          </Button>
        </form>
      </Paper>

      <Text ta="center" mt="md" size="sm">
        <Anchor component={Link} to="/login">
          Back to sign in
        </Anchor>
      </Text>
    </Container>
  )
}
