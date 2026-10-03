import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { TitleSync } from './lib/title.js';
import { applyTextSize, getTextSize } from './lib/textSize.js';

// Taille du texte mémorisée appliquée avant le premier rendu (pas de saut visuel).
applyTextSize(getTextSize());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TitleSync />
    <App />
  </StrictMode>,
);
