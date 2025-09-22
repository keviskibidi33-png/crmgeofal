
import 'bootstrap/dist/css/bootstrap.min.css';
import './global-font.css';
import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      keepPreviousData: true,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
