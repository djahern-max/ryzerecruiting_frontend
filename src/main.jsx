import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PostHogProvider } from 'posthog-js/react'
import './theme.css'
import App from './App.jsx'

const posthogOptions = {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  defaults: '2025-05-24',
  person_profiles: 'identified_only',
  loaded: (ph) => {
    if (import.meta.env.DEV) ph.opt_out_capturing() // no localhost noise in your data
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_KEY} options={posthogOptions}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)