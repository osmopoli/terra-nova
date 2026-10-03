# Terra Nova — plateforme de la ville (24h By Webcup 2026)

**État : maquette de design, sans base de données ni backend.** Les contenus (services, annonces) sont des exemples dans `assets/js/donnees.js`. Le formulaire de contact simule l'envoi : aucun message n'est transmis. La clé API n'est jamais placée dans le HTML ou le JavaScript client.

Prévisualiser : `node serve.js` puis http://localhost:5180

## Parcours d'entrée immersif
- `index.html` : arrivée dans le système de Terra Nova.
- Clic sur « Initier l’approche » : voyage de 3 secondes avec un vaisseau.
- `connexion.html` : identification citoyenne simulée, sans envoi de données.
- `app.html` : portail des habitants d’origine, ouvert après la connexion.

## Pages et demandes visées
| Page | Demande API | Ce qui est montré |
|---|---|---|
| `app.html` | D07 | Hero « hublot », accès rapides, services, dernières annonces, appel au contact |
| `services.html` | D05 | Recherche, filtres par thème, fiche détaillée en tiroir (lieu, horaires, démarches) |
| `annonces.html` | D06 | Liste filtrable, lecture en tiroir, copie du lien |
| `contact.html` | D04 | Choix du service, validation, état d'envoi, reçu avec numéro de suivi |

Lien direct vers une fiche : `services.html#sante`, `annonces.html#a2`. Service présélectionné : `contact.html?service=habitat`.

## Structure
- `assets/css/nova.css` — système de design (couleurs, typographie, composants, animations).
- `assets/js/nova.js` — en-tête/pied, tiroir, filtres, formulaire, toasts, animations.
- `assets/js/donnees.js` — contenus d'exemple (6 catégories de services proposées par l'équipe).
- `assets/terra-nova/backgrounds/` — visuels recadrés en haute définition depuis le PDF du sujet (pages 1 et 6), sans texte.
- `_v1-clair/` — première version claire, archivée.
- `maquette-v2.html` — maquette d'accueil autonome (étape précédente).

## Direction artistique (v3, inspirée du kit NeonAI)
- Coque d'application : barre latérale avec indicateur actif qui glisse entre les pages, barre haute (fil d'Ariane, heure locale, état), navigation basse sur mobile.
- Palette de commandes **Ctrl + K** : pages, services, annonces (recherche sans accents, clavier, aucune animation car action fréquente).
- Couleurs : fond `#03070C`, panneaux `#0B1118`, accent lime néon `#B4F04A` (seul accent), pêche `#FFB48A` pour la planète.
- Police : Plus Jakarta Sans (celle du kit).
- Visuels : recadrages haute définition du PDF du sujet (`colonie-dome`, `planete-horizon`, `planete-orbite`).
- Accessibilité : contraste ≥ 4.5:1, cibles ≥ 44 px, focus visible, lien d'évitement, `prefers-reduced-motion`.

## Animations (et pourquoi)
- Transitions entre pages (View Transitions) : la coque reste en place, l'indicateur du menu glisse.
- Première visite de la session : la fenêtre s'ouvre, l'orbite lime se trace, les widgets se posent.
- Parallaxe de l'image et lueur lime qui suit le pointeur sur les cartes : souris uniquement.
- Tiroir de détail (droite / bas sur mobile), filtres avec réorganisation animée, bouton d'envoi à états, reçu, toasts.
- Archives : `_v1-clair/` (version claire), `_v2-nuit/` (version nuit précédente).

