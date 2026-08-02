import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RolesPage } from './pages/RolesPage'
import { ContactsPage } from './pages/ContactsPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { GroupsPage } from './pages/GroupsPage'
import { GroupMembersPage } from './pages/GroupMembersPage'
import { GroupExpensesPage } from './pages/GroupExpensesPage'
import { DebtsPage } from './pages/DebtsPage'
import { BulkDebtAssignPage } from './pages/BulkDebtAssignPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { SchedulePage } from './pages/SchedulePage'
import { HistoryPage } from './pages/HistoryPage'
import { LogsPage } from './pages/LogsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/group-members" element={<GroupMembersPage />} />
          <Route path="/group-expenses" element={<GroupExpensesPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/debts/bulk-assign" element={<BulkDebtAssignPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route
            path="/notifications"
            element={<ComingSoonPage title="Notifications" />}
          />
          <Route path="/logs" element={<LogsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
