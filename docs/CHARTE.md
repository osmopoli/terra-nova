# Charte Nova Terra

Source de vérité technique : les tokens de `client/src/index.css`. Ce document explique leurs choix ; s'il diverge du CSS, le CSS fait foi.

## Intention

Nova Terra est une ville neuve, sur une terre neuve : on y arrive par l'espace (parcours d'arrivée), puis on s'y installe.
Trois ambiances, un seul vocabulaire de tokens :

| Ambiance | Où | Caractère |
|---|---|---|
| **Arrivée** | accueil visiteur, connexion | nuit spatiale, lueur cyan, éclat rose : le voyage |
| **Citoyen** | espace connecté par défaut | lagon et sable : clair, chaleureux, aéré, rayons généreux |
| **Agent** | agents et administrateurs (`data-space="agent"`) | outil de travail : indigo froid, fonds neutres, rayons serrés, ombres plates, densité |

L'ambiance agent redéfinit les **mêmes variables** sous `[data-space="agent"]` (posé par `Layout` selon `user.role`) :
un composant écrit avec `bg-primary`, `rounded-card`, `shadow-card` s'adapte tout seul aux deux espaces.

## Palette et contrastes (WCAG AA ≥ 4,5:1 pour le texte)

### Citoyen (valeurs par défaut)

| Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `ink` | `#16242f` | texte principal | 15,8 sur `surface`, 14,3 sur `canvas` |
| `ink-muted` | `#4f5d68` | texte secondaire | 6,8 sur `surface`, 5,9 sur `mist` |
| `surface` | `#ffffff` | cartes, en-tête | |
| `canvas` | `#f6f3ec` | fond de page (sable) | |
| `mist` | `#e9f1ef` | fonds discrets, onglets | |
| `line` | `#d6dfdc` | bordures, séparateurs | décoratif |
| `primary` | `#0b6a6b` | actions, liens (lagon) | texte blanc 6,4 ; sur `canvas` 5,8 |
| `primary-strong` | `#074b4e` | survol / actif | texte blanc 9,9 |
| `accent` | `#f08a4b` | latérite : pastilles, illustrations | texte `ink` 6,4 (jamais de texte blanc dessus) |
| `success` | `#1d6b3a` | validé, réalisé | 6,5 sur `surface` |
| `warning` | `#8a4b00` | en attente, attention | 6,8 sur `surface` |
| `danger` | `#b42318` | erreur, refus | 6,6 sur `surface` |

### Agent (`[data-space="agent"]`)

| Token | Valeur | Contraste vérifié |
|---|---|---|
| `ink` | `#0f1729` | 17,9 sur `surface`, 16,1 sur `canvas` |
| `ink-muted` | `#475467` | 7,7 sur `surface`, 6,3 sur `mist` |
| `canvas` | `#f1f3f7` | |
| `mist` | `#e4e8ef` | |
| `line` | `#d0d5dd` | décoratif |
| `primary` | `#3046b0` | texte blanc 8,0 ; sur `canvas` 7,2 |
| `primary-strong` | `#1f2f80` | texte blanc 11,8 |

`surface`, `accent`, `success`, `warning`, `danger` sont communs (≥ 5,9 sur `canvas` agent).

### Arrivée (parcours spatial)

`space` `#02040a`, `space-panel` `#07101c`, `star` `#edf6ff` (18,8 sur `space`), `star-muted` `#b7c7d8` (11,1 sur `space-panel`),
`glow` `#79e6ff` (13,3 sur `space-panel` ; texte `space` dessus 14,2), `flare` `#ff4d97` (décoratif).

## Typographies

- **Space Grotesk** (`font-display`, 500/700) : titres, nom de la ville, chiffres clés. Géométrique, un peu « ingénierie spatiale ».
- **Public Sans** (`font-sans`, 400 à 700) : tout le reste. Police conçue pour les services publics, très lisible en petit corps.
- Chargées depuis Google Fonts (`display=swap`), repli `system-ui`.
- Citoyen : corps `text-base`, titres `text-2xl` à `text-4xl`. Agent : corps `text-sm` dans les tableaux et listes, titres `text-xl` maximum.

## Rayons et ombres

| Token | Citoyen | Agent |
|---|---|---|
| `rounded-card` | 20px | 8px |
| `rounded-control` | 12px | 6px |
| `shadow-card` | douce, diffuse | trait de 1-2px |
| `shadow-pop` | menus, dialogues | idem, plus courte |

## Boutons

- **Principal** : `rounded-control bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong` (agent : `px-3 py-2 text-sm`).
- **Secondaire** : `rounded-control border border-line bg-surface text-ink hover:bg-mist`.
- **Danger** : `rounded-control bg-danger text-white` ; réservé aux actions irréversibles, toujours avec confirmation.
- Cible tactile ≥ 44px côté citoyen. Focus visible : contour 3px `primary` (global, `index.css`).
- Désactivé : `disabled:opacity-60`, jamais seul porteur de l'information.

## Cartes et listes

- **Carte citoyen** : `rounded-card bg-surface p-5 shadow-card sm:p-8`, un titre `font-display`, une action principale maximum.
- **Ligne agent** : `border-b border-line px-3 py-2 text-sm` dans un conteneur `rounded-card bg-surface shadow-card` ;
  statuts en pastilles `rounded-full px-2 text-xs font-semibold` avec `bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-danger/10 text-danger`.
- Fond de page `bg-canvas`, jamais de carte sur fond `surface` sans bordure `line`.

## Icône et PWA

`client/public/icon.svg` : planète sable sur fond lagon, horizon `primary-strong`, anneau `accent` et une étoile.
`theme-color` `#0b6a6b`, fond de lancement `#f6f3ec`.

## Références

- Système de design de l'État (DSFR) : rigueur des contrastes et de l'accessibilité pour un service public.
- GOV.UK Design System : boutons sobres, une action principale par écran.
- Linear, outils back-office : densité et rayons serrés pour l'espace agent.
- Le parcours d'arrivée existant (WEBC-17) : palette spatiale conservée telle quelle.
