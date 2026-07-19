import { ReadOnlyTable, type ReadOnlyTableColumn } from '../components/ReadOnlyTable'
import { fetchPaymentHistories } from '../api/paymentHistories'
import type { PaymentHistory } from '../types/paymentHistory'
import type { Debt } from '../types/debt'

function debtLabel(debt: Debt): string {
  const debtor = debt.debtor_user
    ? `${debt.debtor_user.first_name} ${debt.debtor_user.last_name}`
    : debt.debtor_contact
      ? `${debt.debtor_contact.first_name} ${debt.debtor_contact.last_name}`
      : 'Unknown debtor'

  return `${debtor} — ₱${debt.remaining_amount} remaining`
}

const columns: ReadOnlyTableColumn<PaymentHistory>[] = [
  {
    key: 'debt',
    label: 'Debt',
    render: (row) => (row.debt ? debtLabel(row.debt) : '—'),
  },
  {
    key: 'paid_amount',
    label: 'Amount paid',
    render: (row) => `₱${row.paid_amount}`,
  },
  { key: 'payment_type', label: 'Type' },
  {
    key: 'remaining_amount',
    label: 'Remaining after',
    render: (row) => `₱${row.remaining_amount}`,
  },
  {
    key: 'created_at',
    label: 'Date',
    render: (row) => new Date(row.created_at).toLocaleString(),
  },
  { key: 'remarks', label: 'Remarks', render: (row) => row.remarks ?? '—' },
]

export function HistoryPage() {
  return (
    <ReadOnlyTable
      title="Payment history"
      columns={columns}
      getRowId={(row) => row.history_id}
      fetchPage={fetchPaymentHistories}
      searchPlaceholder="Search history…"
    />
  )
}
