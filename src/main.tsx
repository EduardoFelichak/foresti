import React from 'react'
import ReactDOM from 'react-dom/client'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
