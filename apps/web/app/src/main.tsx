import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { ClerkProvider } from '@clerk/clerk-react'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!CLERK_PUBLISHABLE_KEY) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
        <StrictMode>
            <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
                <RouterProvider router={router} />
            </ClerkProvider>
        </StrictMode>,
    )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log)
