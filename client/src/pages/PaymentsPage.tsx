import { useEffect, useState } from 'react'
import {
  Button,
  Group as MantineGroup,
  Modal,
  NumberInput,
  Select,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { CrudTable, type CrudTableColumn } from '../components/CrudTable'
import { createPayment, deletePayment, fetchPayments, updatePayment } from '../api/payments'
import { fetchDebts } from '../api/debts'
import type { Payment } from '../types/payment'
import type { Debt } from '../types/debt'

const paymentTypeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'gcash', label: 'GCash' },
  { value: 'other', label: 'Other' },
]

const paymentSchema = z.object({
  debt_id: z.string().min(1, 'Debt is required'),
  paid_amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_type: z.string().min(1, 'Payment type is required'),
  remarks: z.string().max(255).optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

function debtorName(debt: Debt): string {
  return debt.debtor_user
    ? `${debt.debtor_user.first_name} ${debt.debtor_user.last_name}`
    : debt.debtor_contact
      ? `${debt.debtor_contact.first_name} ${debt.debtor_contact.last_name}`
      : 'Unknown debtor'
}

function debtLabel(debt: Debt): string {
  return `${debtorName(debt)} — ₱${debt.remaining_amount} remaining`
}

const columns: CrudTableColumn<Payment>[] = [
  {
    key: 'debt',
    label: 'Debt',
    render: (row) => (row.debt ? debtorName(row.debt) : '—'),
  },
  {
    key: 'remaining_amount',
    label: 'Remaining balance',
    render: (row) => (row.debt ? `₱${row.debt.remaining_amount}` : '—'),
  },
  {
    key: 'paid_amount',
    label: 'Amount paid',
    render: (row) => `₱${row.paid_amount}`,
  },
  { key: 'payment_type', label: 'Type' },
  {
    key: 'created_at',
    label: 'Date',
    render: (row) =>
      new Date(row.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
  },
  { key: 'remarks', label: 'Remarks', render: (row) => row.remarks ?? '—' },
]

export function PaymentsPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [debts, setDebts] = useState<Debt[]>([])

  useEffect(() => {
    fetchDebts({ page: 1, perPage: 100, search: '' })
      .then((res) => setDebts(res.data))
      .catch(() => {
        notifications.show({ message: 'Failed to load debts', color: 'red' })
      })
  }, [])

  const debtOptions = debts.map((debt) => ({
    value: debt.debt_id,
    label: debtLabel(debt),
  }))

  const form = useForm<PaymentFormValues>({
    initialValues: {
      debt_id: '',
      paid_amount: 0,
      payment_type: 'cash',
      remarks: '',
    },
    validate: zod4Resolver(paymentSchema),
  })

  const reload = () => setReloadKey((key) => key + 1)

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    openForm()
  }

  const handleEdit = (payment: Payment) => {
    setEditing(payment)
    form.setValues({
      debt_id: payment.debt_id,
      paid_amount: Number(payment.paid_amount),
      payment_type: payment.payment_type,
      remarks: payment.remarks ?? '',
    })
    openForm()
  }

  const handleSubmit = async (values: PaymentFormValues) => {
    setSubmitting(true)
    const payload = {
      ...values,
      remarks: values.remarks || undefined,
    }
    try {
      if (editing) {
        await updatePayment(editing.payment_id, payload)
        notifications.show({ message: 'Payment updated', color: 'green' })
      } else {
        await createPayment(payload)
        notifications.show({ message: 'Payment recorded', color: 'green' })
      }
      closeForm()
      reload()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors as
          | Record<string, string[]>
          | undefined
        if (apiErrors) {
          form.setErrors(
            Object.fromEntries(
              Object.entries(apiErrors).map(([field, msgs]) => [field, msgs[0]]),
            ),
          )
        }
      } else {
        notifications.show({ message: 'Something went wrong', color: 'red' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deletePayment(deleteTarget.payment_id)
      notifications.show({ message: 'Payment deleted', color: 'green' })
      setDeleteTarget(null)
      reload()
    } catch {
      notifications.show({ message: 'Failed to delete payment', color: 'red' })
    }
  }

  return (
    <>
      <CrudTable
        title="Payments"
        columns={columns}
        getRowId={(row) => row.payment_id}
        fetchPage={fetchPayments}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        searchPlaceholder="Search payments…"
        reloadKey={reloadKey}
      />

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? 'Edit payment' : 'New payment'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Debt"
            placeholder="Select a debt"
            data={debtOptions}
            searchable
            {...form.getInputProps('debt_id')}
          />
          <NumberInput
            label="Amount paid"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            mt="sm"
            {...form.getInputProps('paid_amount')}
          />
          <Select
            label="Payment type"
            data={paymentTypeOptions}
            mt="sm"
            {...form.getInputProps('payment_type')}
          />
          <TextInput
            label="Remarks"
            placeholder="Optional note"
            mt="sm"
            {...form.getInputProps('remarks')}
          />
          <MantineGroup justify="flex-end" mt="md">
            <Button variant="default" onClick={closeForm} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </MantineGroup>
        </form>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete payment"
      >
        <Text>
          Are you sure you want to delete this payment? The deducted amount will be
          restored to the debt balance.
        </Text>
        <MantineGroup justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </MantineGroup>
      </Modal>
    </>
  )
}
