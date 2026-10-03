import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import RouteAnnouncer from './components/RouteAnnouncer.jsx';
import { TitleSync } from './lib/title.js';
import { FocusSync } from './lib/focus.js';
import { applyTextSize, getTextSize } from './lib/textSize.js';
import { getHighContrast, setContrastAttribute } from './lib/contrast.js';
import { isLightMode, setLightAttribute } from './lib/lightMode.js';

// Taille du texte mémorisée appliquée avant le premier rendu (pas de saut visuel).
applyTextSize(getTextSize());

// Contraste appliqué avant le premier rendu (pas de flash), sans figer le choix :
// tant que l'utilisateur n'a rien choisi, la préférence système reste suivie.
setContrastAttribute(getHighContrast());

// Version légère (choix mémorisé ou connexion lente détectée) appliquée avant le premier rendu.
setLightAttribute(isLightMode());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TitleSync />
    <FocusSync />
    <App />
    <RouteAnnouncer />
  </StrictMode>,
);
