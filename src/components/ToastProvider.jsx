import { Toaster } from "react-hot-toast";

/**
 * ToastProvider - Wrapper component for react-hot-toast
 * Provides consistent toast notifications across the app
 */
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: 'var(--card-bg, #1e1e2e)',
          color: 'var(--text-color, #e0e0e0)',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        // Success toast specific styles
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
        },
        // Error toast specific styles
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
        // Loading toast specific styles
        loading: {
          style: {
            border: '1px solid rgba(59, 130, 246, 0.3)',
          },
        },
      }}
      // Custom animation
      gutter={12}
    />
  );
};

export default ToastProvider;
