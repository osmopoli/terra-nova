import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { TitleSync } from './lib/title.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TitleSync />
    <App />
  </StrictMode>,
);
