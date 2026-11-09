import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomeRedirect, RequirePage } from './components/RequirePage'
import { RolesPage } from './pages/RolesPage'
import { PagesPage } from './pages/PagesPage'
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
import { AchievementsPage } from './pages/AchievementsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          {/* Each guarded route is only reachable when the user's role is assigned that page. */}
          <Route element={<RequirePage path="/dashboard" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<RequirePage path="/history" />}>
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          <Route element={<RequirePage path="/schedule" />}>
            <Route path="/schedule" element={<SchedulePage />} />
          </Route>
          <Route element={<RequirePage path="/roles" />}>
            <Route path="/roles" element={<RolesPage />} />
          </Route>
          <Route element={<RequirePage path="/pages" />}>
            <Route path="/pages" element={<PagesPage />} />
          </Route>
          <Route element={<RequirePage path="/users" />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
          <Route element={<RequirePage path="/contacts" />}>
            <Route path="/contacts" element={<ContactsPage />} />
          </Route>
          <Route element={<RequirePage path="/groups" />}>
            <Route path="/groups" element={<GroupsPage />} />
          </Route>
          <Route element={<RequirePage path="/group-members" />}>
            <Route path="/group-members" element={<GroupMembersPage />} />
          </Route>
          <Route element={<RequirePage path="/group-expenses" />}>
            <Route path="/group-expenses" element={<GroupExpensesPage />} />
          </Route>
          <Route element={<RequirePage path="/debts" />}>
            <Route path="/debts" element={<DebtsPage />} />
          </Route>
          <Route element={<RequirePage path="/debts/bulk-assign" />}>
            <Route path="/debts/bulk-assign" element={<BulkDebtAssignPage />} />
          </Route>
          <Route element={<RequirePage path="/payments" />}>
            <Route path="/payments" element={<PaymentsPage />} />
          </Route>
          <Route element={<RequirePage path="/notifications" />}>
            <Route
              path="/notifications"
              element={<ComingSoonPage title="Notifications" />}
            />
          </Route>
          <Route element={<RequirePage path="/achievements" />}>
            <Route path="/achievements" element={<AchievementsPage />} />
          </Route>
          <Route element={<RequirePage path="/logs" />}>
            <Route path="/logs" element={<LogsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
