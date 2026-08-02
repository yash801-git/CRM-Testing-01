import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider'
import { initPixel } from './utils/pixel'
import { initGoogleTag } from './utils/google-tag'

// Initialize Meta Pixel and Google Tag as early as possible
initPixel();
initGoogleTag();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
