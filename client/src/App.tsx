import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RolesPage } from './pages/RolesPage'
import { ComingSoonPage } from './pages/ComingSoonPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ComingSoonPage title="Dashboard" />} />
        <Route path="/history" element={<ComingSoonPage title="History" />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/users" element={<ComingSoonPage title="Users" />} />
        <Route path="/contacts" element={<ComingSoonPage title="Contacts" />} />
        <Route path="/groups" element={<ComingSoonPage title="Groups" />} />
        <Route
          path="/group-members"
          element={<ComingSoonPage title="Group members" />}
        />
        <Route
          path="/group-expenses"
          element={<ComingSoonPage title="Group expenses" />}
        />
        <Route path="/debts" element={<ComingSoonPage title="Debts" />} />
        <Route path="/payments" element={<ComingSoonPage title="Payments" />} />
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
