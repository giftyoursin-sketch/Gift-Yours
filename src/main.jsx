import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Prevent mouse wheel from changing values in number inputs
document.addEventListener('wheel', (e) => {
  if (document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: false });
