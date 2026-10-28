import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import { ContactProvider } from './context/ContactContext'
import { ContentProvider } from './context/ContentContext'
import { DivisionProvider } from './context/DivisionContext'
import './index.css'
// HashRouter = links work everywhere (Live Server, any static host, page refresh) without server setup.
createRoot(document.getElementById('root')).render(<ErrorBoundary><HashRouter><DivisionProvider><ContentProvider><ContactProvider><App /></ContactProvider></ContentProvider></DivisionProvider></HashRouter></ErrorBoundary>)
