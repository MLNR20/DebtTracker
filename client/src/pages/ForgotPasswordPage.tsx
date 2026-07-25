import { Anchor, Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { forgotPassword } from '../api/auth'

const forgotPasswordSchema = z.object({
  email_address: z.string().min(1, 'Email is required').email('Invalid email'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: { email_address: '' },
    validate: zod4Resolver(forgotPasswordSchema),
  })

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitting(true)
    try {
      await forgotPassword(values)
      setSent(true)
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
        Forgot password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="xs">
        Enter your email and we&apos;ll send you a reset link
      </Text>

      <Paper withBorder shadow="sm" p="xl" mt="xl" radius="md">
        {sent ? (
          <Text ta="center" size="sm">
            If an account exists for that email, a password reset link has been sent.
          </Text>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                withAsterisk
                {...form.getInputProps('email_address')}
              />
            </Stack>
            <Button type="submit" fullWidth mt="xl" loading={submitting}>
              Send reset link
            </Button>
          </form>
        )}
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
