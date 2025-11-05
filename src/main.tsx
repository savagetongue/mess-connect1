import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import { router } from '@/router';
import '@/lib/i18n'; // Initialize i18next
import { Skeleton } from './components/ui/skeleton';
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><Skeleton className="h-full w-full" /></div>}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </Suspense>
  </StrictMode>,
)