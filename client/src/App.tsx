import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RolesPage } from './pages/RolesPage'
import { ContactsPage } from './pages/ContactsPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { GroupsPage } from './pages/GroupsPage'
import { DebtsPage } from './pages/DebtsPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { SchedulePage } from './pages/SchedulePage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<ComingSoonPage title="History" />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route
          path="/group-members"
          element={<ComingSoonPage title="Group members" />}
        />
        <Route
          path="/group-expenses"
          element={<ComingSoonPage title="Group expenses" />}
        />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route
          path="/notifications"
          element={<ComingSoonPage title="Notifications" />}
        />
        <Route path="/logs" element={<ComingSoonPage title="Logs" />} />
      </Route>
    </Routes>
  )
}

export default App
