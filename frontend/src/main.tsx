import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { CategoriesProvider } from './lib/categories'
import { ContactProvider } from './store/contact'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ContactProvider>
        <CategoriesProvider>
          <App />
        </CategoriesProvider>
      </ContactProvider>
    </BrowserRouter>
  </StrictMode>,
)
