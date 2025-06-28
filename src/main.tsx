
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Start the Express server in development mode
if (import.meta.env.DEV) {
  import('../server.ts').then(() => {
    console.log('Express server started in development mode');
  }).catch((error) => {
    console.error('Failed to start Express server:', error);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
