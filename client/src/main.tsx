import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  fontFamily: 'Poppins, system-ui, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Poppins, system-ui, "Segoe UI", Roboto, sans-serif',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
