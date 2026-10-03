# Charte Terra Nova — « Future Teal »

Source de vérité technique : les tokens de `client/src/index.css`. Ce document explique leurs choix ; s'il diverge du CSS, le CSS fait foi.

## Intention

Terra Nova est une ville neuve, sur une terre neuve : on y arrive par l'espace (parcours d'arrivée), puis on s'y installe.
Direction artistique **Future Teal** (thème shadcn / tweakcn adapté) : thème sombre, fond sarcelle profond, tout en bleu et
sarcelle, primaire sarcelle lumineux, police Inter, rayons 0.5rem, ombres douces, quelques étoiles discrètes en fond.

Règles de la DA :

- tout bleu / sarcelle, avec un violet « aurore » en accent : **aucun orange**, pas de planète orange ;
- pas d'effet de texte qui se décrypte ou de lettres qui arrivent, pas de texte courbé, pas d'image pixelisée ;
- alertes et bannières sobres (fond `mist`, pas de couleur criarde) ;
- le nom s'écrit **Terra Nova**, toujours précédé de l'emblème dans l'en-tête.

Trois ambiances, un seul vocabulaire de tokens :

| Ambiance | Où | Caractère |
|---|---|---|
| **Arrivée** | accueil visiteur, connexion, 404 | galaxie NGC 4639 (Hubble), fond `space`, lueur sarcelle |
| **Citoyen** | espace connecté par défaut | ciel sarcelle étoilé (`.ciel`), cartes `surface` cerclées d'un trait `line`, aéré |
| **Agent** | agents et administrateurs (`data-space="agent"`) | même famille sarcelle, fond panneau, rayons serrés, ombres plates, densité |

L'ambiance agent redéfinit les **mêmes variables** sous `[data-space="agent"]` (posé par `Layout` selon `user.role`
et par `AgentLayout`) : un composant écrit avec `bg-primary`, `rounded-card`, `shadow-card` s'adapte tout seul.

## Palette et contrastes (WCAG AA ≥ 4,5:1 pour le texte, ≥ 3:1 pour les contours de contrôles)

Valeurs en oklch dans le CSS ; équivalent sRGB indicatif entre parenthèses. Ratios calculés (formule WCAG 2.x).

| Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `ink` | `oklch(0.9396 0.0097 204.91)` (#e4edee) | texte principal | 15,8 sur `surface`, 16,7 sur `canvas`, 14,6 sur `mist` |
| `ink-muted` | `oklch(0.72 0.03 199.2)` (#90abac) | texte secondaire | 7,7 sur `surface`, 8,1 sur `canvas`, 7,1 sur `mist` |
| `surface` | `oklch(0.1788 0.0202 201.33)` (#061415) | cartes, en-tête | |
| `canvas` | `oklch(0.1396 0.0155 195.52)` (#030b0b) | fond de page (sarcelle profond) | |
| `mist` | `oklch(0.215 0.025 200)` (#0a1d1e) | fonds discrets dans une carte, onglets, alertes | |
| `line` | `oklch(0.2397 0.0193 201.59)` (#142223) | séparateurs, trait des cartes | décoratif (1,1), jamais seul contour d'un contrôle |
| `line-strong` | `oklch(0.55 0.03 200)` (#5d7778) | contour des champs et boutons secondaires | 3,9 sur `surface`, 4,1 sur `canvas`, 3,6 sur `mist` (≥ 3:1) |
| `primary` | `oklch(0.704 0.14 182.5)` (#00bba7) | actions, liens, focus | texte `on-primary` dessus 8,2 ; en texte 7,7 sur `surface` |
| `primary-strong` | `oklch(0.8 0.12 182.5)` (#4fd7c4) | survol / actif (plus lumineux en thème sombre) | texte `on-primary` 11,2 |
| `on-primary` | `oklch(0.1396 0.0155 195.52)` | texte sur fond plein (primary, accent, success, danger, glow) | jamais de texte blanc sur primary |
| `accent` | `oklch(0.7217 0.1638 297.08)` (#b18cfe) | violet aurore : pastille « nouveau », liseré | texte `on-primary` 7,6 ; en texte 7,2 sur `surface` |
| `accent-strong` | `oklch(0.8 0.11 297)` (#c5affc) | texte ou pictogramme violet | 9,8 sur `surface`, 9,0 sur `mist` |
| `success` | `oklch(0.67 0.1336 230.04)` (#00a3d7) | validé, traité (bleu, distinct du primaire) | 6,5 sur `surface` ; 5,7 sur `success/10` ; texte `on-primary` 6,8 |
| `warning` | `oklch(0.8614 0.1165 74.23)` (#ffc677) | en attente, attention | 12,2 sur `surface` ; 10,0 sur `warning/10` |
| `danger` | `oklch(0.6593 0.2097 25.01)` (#f84b4b) | erreur, refus | 5,5 sur `surface`, 5,1 sur `mist` ; 5,0 sur `danger/10` ; texte `on-primary` 5,8 |

### Agent (`[data-space="agent"]`)

Couleurs communes ; seul le fond change : `canvas` = `oklch(0.1604 0.0209 201.08)` (#031011, panneau).
`ink` 16,2, `ink-muted` 7,9, `primary` 8,0 et `line-strong` 4,0 sur ce fond.

### Arrivée (parcours spatial)

`space` = `canvas`, `space-panel` = panneau, `star` = `ink`, `star-muted` = `ink-muted`, `glow` = `primary`
(texte `on-primary` dessus 8,2), `flare` = `accent` (décor : barre de chargement sarcelle → violet).

### Contraste élevé (`data-contrast="high"`, WEBC-19)

Noir et blanc, comme le mode contraste de la maquette : `ink` / `ink-muted` `#ffffff` sur `surface` / `canvas` / `mist` `#000000` (21:1),
`primary` `#9ff0ff` (16,4 sur noir, texte noir dessus), `accent` `#d6c8ff` (13,6), `success` `#9fd8ff` (13,7), `warning` `#ffe08a` (16,3),
`danger` `#ffa3a3` (11,0). Bordures et traits blancs, ombres remplacées par un contour 2px, ciel étoilé et galaxie masqués,
liens soulignés, focus 4px. Tous les ratios ≥ 7:1.

## Information non portée par la couleur seule (WCAG 1.4.1)

La couleur renforce, elle ne porte jamais seule une information :

- **Statuts** (demandes, alertes, services) : toujours un libellé texte issu de `GET /api/meta`, plus une pastille de forme
  (`rounded-full`) ; la couleur n'est qu'un renfort. Agent : nouveau = `bg-accent`, en cours = `bg-primary`, traité = `bg-success`,
  texte `on-primary`.
- **Erreurs** : message texte obligatoire, préfixé « Erreur : » ou d'un pictogramme ; le champ porte `aria-invalid="true"`
  (bordure `danger` épaissie à 2px, appliquée par `index.css`).
- **Liens** : dans `main` et `footer`, tout lien texte est souligné en permanence (`index.css`) ; le survol épaissit le trait.
  Les liens-boutons (fond plein) et la navigation d'en-tête en sont exclus (l'entrée active y est soulignée).
- **Contours de contrôles** : `border-line-strong` (≥ 3:1), jamais `border-line` ni une opacité réduite.

## Typographie

- **Inter** (`font-sans` et `font-display`, 400 à 800) : titres en 700, interface en 400 à 600. Chargée depuis Google Fonts
  sans bloquer le rendu (`preload` + `media="print"` basculé au chargement, `display=swap`), repli `system-ui`.
- Nom de la ville dans l'en-tête : capitales, 700, interlettrage 0,16em, précédé de l'emblème.
- Citoyen : corps `text-base`, titres `text-2xl` à `text-4xl`. Agent : corps `text-sm` dans les tableaux et listes, titres `text-xl` maximum.

## Rayons et ombres

| Token | Citoyen | Agent |
|---|---|---|
| `rounded-card` | 0.75rem | 0.5rem |
| `rounded-control` | 0.5rem | 0.375rem |
| `shadow-card` | trait `line` 1px + ombre douce | trait `line` 1px seul |
| `shadow-pop` | trait `line-strong` + ombre longue | idem, plus courte |

## Mouvement

- Transitions de couleur seulement sur les contrôles : 150 ms, `--ease-out` = `cubic-bezier(.23, 1, .32, 1)`.
- Pas d'animation gratuite ; le seul mouvement est le voyage du parcours d'arrivée (déclenché par l'utilisateur, annulable).
- `prefers-reduced-motion: reduce` coupe animations et transitions (`index.css`).

## Boutons

- **Principal** : `rounded-control bg-primary px-5 py-3 font-semibold text-on-primary hover:bg-primary-strong` (agent : `px-3 py-2 text-sm`).
- **Secondaire** : `rounded-control border border-line-strong bg-surface text-ink hover:bg-mist`.
- **Danger** : `rounded-control bg-danger text-on-primary` ; réservé aux actions irréversibles, toujours avec confirmation.
- Cible tactile ≥ 44px côté citoyen. Focus visible : contour 3px `primary` (global, `index.css`).
- Désactivé : `disabled:opacity-60`, jamais seul porteur de l'information.

## Cartes et listes

- **Carte citoyen** : `rounded-card bg-surface p-5 shadow-card sm:p-8` (le trait `line` est dans `shadow-card`), une action principale maximum.
- **Ligne agent** : `border-b border-line px-3 py-2 text-sm` dans un conteneur `rounded-card bg-surface shadow-card` ;
  statuts en pastilles `rounded-full px-2 text-xs font-semibold` avec `bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-danger/10 text-danger`.
- Fond de page : `.ciel` (citoyen) ou `bg-canvas` (agent).

## Version légère (connexion lente, appareil modeste)

Bouton « Version légère » à côté des préférences d’affichage (`lib/lightMode.js`, attribut `data-light="on"` sur `<html>`).
Mêmes couleurs, mêmes informations et actions ; on retire seulement ce qui coûte :

- polices de l’appareil (`system-ui`) : Inter n’est pas téléchargée (`index.html`) ;
- ni ombre, ni flou (`backdrop-filter`), ni animation, ni transition, ni ciel étoilé `.ciel` (`index.css`, bloc hors `@layer`) ;
- galaxie (`GalaxyImage`) non affichée et non téléchargée ; le voyage animé est sauté (l’emblème reste) ;
- accueil, annuaire et fiche service en listes texte sur une colonne (horaires, contact, démarches d’abord) ;
- rafraîchissement automatique 4 fois moins fréquent.

Activation automatique (message unique) si l’appareil signale l’économie de données ou une connexion 2g.
Un nouveau composant décoratif doit se masquer avec `useLightMode()`.

## Logo, images, icône et PWA

- **Emblème** (`client/src/assets/logo-embleme-96.webp` et `-192.webp`) : silhouette utilisée comme masque CSS (`.logo-embleme`),
  remplie d'un dégradé `ink` → `primary` (blanc en contraste élevé). Décoratif (`aria-hidden`), le nom à côté est du vrai texte
  (composant `Brand`).
- **Galaxie NGC 4639** (Hubble, `galaxie-480/800/1280.webp`, composant `GalaxyImage`) : visuel du parcours d'arrivée, en WebP avec `srcset`,
  `alt` vide (décor), masquée en contraste élevé.
- `client/public/icon.svg` et `icon-maskable.svg` : emblème en dégradé sarcelle sur fond `surface`.
  `theme-color` et fond de lancement `#030b0b`.

## Références

- Maquette Terra Nova « Future Teal » (`terra-nova-repo/public/assets/css/theme.css`) : tokens d'origine.
- Système de design de l'État (DSFR) : rigueur des contrastes et de l'accessibilité pour un service public.
- GOV.UK Design System : boutons sobres, une action principale par écran.
- Linear, outils back-office : densité et rayons serrés pour l'espace agent.
