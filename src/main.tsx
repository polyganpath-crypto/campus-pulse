import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { FirebaseProvider } from './context/FirebaseContext';
import './index.css';



// Intercept and cleanly handle Firebase Storage background retry limit errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const isStorageRetryError =
    reason?.code === 'storage/retry-limit-exceeded' ||
    reason?.code === 'storage/unknown' ||
    reason?.code === 'storage/object-not-found' ||
    (typeof reason?.message === 'string' &&
      (reason.message.includes('storage/retry-limit-exceeded') ||
       reason.message.includes('Firebase Storage: Max retry time') ||
       reason.message.includes('retry-limit-exceeded')));

  if (isStorageRetryError) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Gracefully intercepted Firebase Storage retry error:', reason?.message || reason);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </StrictMode>
);


