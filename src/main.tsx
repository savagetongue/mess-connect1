import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import '@/App.css'
import { router } from '@/router';
import '@/lib/i18n'; // Initialize i18next
import { Skeleton } from './components/ui/skeleton';
import { I18nProvider } from './components/I18nProvider';
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><Skeleton className="h-full w-full" /></div>}>
      <ErrorBoundary>
        <I18nProvider>
          <RouterProvider router={router} />
        </I18nProvider>
      </ErrorBoundary>
    </Suspense>
  </StrictMode>,
)