import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import RouteAnnouncer from './components/RouteAnnouncer.jsx';
import { TitleSync } from './lib/title.js';
import { FocusSync } from './lib/focus.js';
import { applyTextSize, getTextSize } from './lib/textSize.js';
import { getHighContrast, setContrastAttribute } from './lib/contrast.js';
import { getLiteMode, setLiteAttribute } from './lib/lite.js';

// Taille du texte mémorisée appliquée avant le premier rendu (pas de saut visuel).
applyTextSize(getTextSize());

// Contraste appliqué avant le premier rendu (pas de flash), sans figer le choix :
// tant que l'utilisateur n'a rien choisi, la préférence système reste suivie.
setContrastAttribute(getHighContrast());

// Version allégée appliquée avant le premier rendu : aucune image décorative ni police chargée inutilement.
setLiteAttribute(getLiteMode());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TitleSync />
    <FocusSync />
    <App />
    <RouteAnnouncer />
  </StrictMode>,
);
