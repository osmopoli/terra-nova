# Passation — finition front et responsive (Terra Nova, 24h by Webcup 2026)

Document de reprise pour un nouveau chat. Lire aussi `CLAUDE.md` (règles du projet, direction artistique, stack figée) : il fait foi.

## Mission

Tu es développeur front (HTML + CSS + JS sans build) au service du chef de projet (osmopoli). Il te signale **au fur et à mesure** des irrégularités d'interface, souvent avec une capture d'écran annotée (un cercle rouge sur la zone en cause), parfois une phrase courte (« descendre ça en bas », « aller à la ligne ici aussi », « rends-le arrondi »). À chaque signalement :

1. retrouver la page et le composant concernés (texte visible → `grep` dans `public/*.html`, `public/assets/js/*.js`, `public/assets/js/i18n.js`) ;
2. reproduire en local dans Chromium (voir « Outillage »), à 360 px et à 1280 px, FR puis AR ;
3. corriger de façon minimale et cohérente avec le reste de l'interface (même composant, mêmes jetons, mêmes espacements) ;
4. vérifier (capture avant / après, 0 erreur console, `scrollWidth` ≤ largeur, `npm run build` OK), pousser une branche `review/front-<sujet>`, ouvrir la PR, **joindre la capture après correction** dans la réponse ;
5. **ne fusionner qu'après un GO explicite** du chef de projet (« GO », « go merge #N »), puis réaligner la branche de session et lui demander de vérifier `/api/health` en prod.

Réponses en français, courtes, avec fichier:ligne. Plusieurs corrections peuvent s'enchaîner sur la même PR tant qu'elle n'est pas fusionnée (il arrive que le chef de projet ajuste sa demande après la première capture : par exemple l'encadré « adresse e-mail » a été déplacé sous le bouton, puis ses liens passés à la ligne, puis alignés sous la question, en trois commits sur la même PR).

## Règles à respecter mot pour mot

- Stack figée : pas de framework, pas d'étape de build front, pas de lib lourde ; Shoelace et Phosphor par CDN.
- Direction artistique « Future Teal » : nom toujours **Terra Nova**, pas d'orange, **aucune couleur codée en dur hors `theme.css`** (ni hex, ni rgb, ni oklch : utiliser les jetons, et `color-mix(in oklch, var(--iono) 8%, transparent)` pour une teinte dérivée), pas de bandeau envahissant (les alertes passent par la balise « Alertes » et le tiroir), pas d'effets de lettres ni de texte courbé.
- Mobile d'abord (360 px), focus visible, contraste AA, `prefers-reduced-motion` respecté ; mouvements < 300 ms, `scale(.97)` à l'appui, survols derrière `@media (hover:hover)`.
- Tout texte visible passe par une clé i18n dans les **4 langues** FR / EN / ES / AR (`NT.t(cle, vars, repli)` ; clés communes `ui.*` dans `public/assets/js/i18n.js`, clés de page dans le JS de la page). Propriétés logiques en CSS (`margin-inline-start`, `border-start-end-radius`…) pour l'arabe (RTL).
- Jamais toucher `GET /api/health`, aucun secret, pas d'identifiant de modèle dans les commits ou PR. Commits en français, au présent, courts.
- Branche de session : `claude/terra-nova-passation-amvxon`, gardée alignée sur `origin/main` après chaque fusion (`git checkout <branche> && git reset --hard origin/main && git push -u origin <branche>`). Branches de travail `review/front-<sujet>`. Ne jamais pousser ailleurs.

## Repères dans le code

- Une page = `public/<page>.html` + `public/assets/js/<page>.js` + `public/assets/css/<page>.css`. Pages : accueil `index.html`, `services.html` (fiches `.sv-carte`, associations dans `#associations`), `carte.html`, `annonces.html`, `participer.html`, `transports.html`, `soutenir.html`, `aide.html`, `donnees.html`, `sobriete.html`, `recherche.html`, `urgence.html`, comptes (`connexion.html`, `inscription.html`, `bienvenue.html` = inscription sans e-mail, `compte.html`, `mes-informations.html`, `securite.html`), habitant (`espace.html` avec onglets `espace-onglets.js`, `suivi.html`, `demande.html`, `rendez-vous.html`, `recapitulatif.html`, `accuse.html`), partenaires (`partenaires.html`, `partenaire.html`), agents et admin (`agent*.html`, `admin-*.html`).
- `public/assets/css/theme.css` : jetons. Couleurs `--nuit`, `--nuit-2`, `--verre`, `--givre` (texte), `--brume` (texte doux), `--iono` (primaire sarcelle), `--iono-fonce`, `--sur-iono`, `--corail` (erreur), `--calme` (bleu « traité »), `--soleil` (ambre, à éviter), `--trait`, `--trait-2` (liserés), `--lueur`. Surfaces `--surface-1` (cartes), `--surface-2` (contrôles), `--liseré`, `--ombre`, `--ombre-flottante` (en-tête, fenêtres, barre mobile seulement). Rayons `--r-s` (contrôles), `--r`, `--r-l` (cartes), `--r-xl` (grandes surfaces), `99px` pour les pilules. Tailles `--t-xs` → `--t-2xl`, hauteur de contrôle `--h-outil`. Courbes `--ease-out`, `--ease-in-out`.
- Points de rupture déjà en usage : 420, 480, 560, 640, 720, 760, 900 px (et `52rem`). Réutiliser ceux de la feuille concernée plutôt qu'en créer.
- Modes posés sur `<html>` : `.leger` (connexion lente), `.econome` (appareil peu puissant), `.calme` (mouvement réduit), `.grand` (texte agrandi), `.contraste`, `.souligne`, `.essentiel` ; `[dir="rtl"]` en arabe. Les feuilles doivent tenir dans tous.
- `public/assets/js/ui.js` : en-tête, navigation, balise Alertes, tiroir, barre au pouce mobile (`.barre-pouce`), accessibilité. Aides `NT.ui.echap` (échapper toute donnée injectée en HTML, texte et attributs), `NT.ui.annoncer` (lecteur d'écran), `NT.ui.toast`, `NT.ui.date` / `dateHeure` / `depuis`, `NT.ui.statut`, `NT.ui.param`, `$` / `$$`. `public/assets/js/store.js` : seul client de l'API (`NT.store`, `NT.auth`). Composants partagés dans `theme.css` : `.btn`, `.btn-primaire`, `.note-info` (encadré d'information) et sa variante `.note-lien` (icône + question + liens à la ligne), `.doux`, `.statut`.
- `public/assets/js/langage-clair.js` : « Expliquer plus simplement » sur les paragraphes administratifs (jamais sur une carte-lien : exclusion déjà en place).

## Irrégularités déjà connues, non corrigées (à proposer si le chef de projet les confirme)

- `accueil.css` et `comptes.css` : environ 80 `oklch(…)` codés en dur hors `theme.css` (survols, dégradés du hero, ombres). À passer en jetons ou `color-mix`, feuille par feuille.
- `carte.html` : la zone N3 / Est utilise l'ambre `--soleil` ; à 360 px la feuille repliée ne laisse qu'environ 120 px de carte.
- `espace.html` : la barre d'onglets défile horizontalement à 360 px (774 px pour 4 onglets) avec un fondu au bord ; un passage à la ligne serait peut-être préférable.
- Arabe : le contenu de démonstration (`data/demo-seed.json`) reste en français, limite du modèle de données, pas un bug d'interface.
- Clés i18n orphelines `c.con.demoTitre`, `c.con.demoAide`, `c.con.utiliser`, `c.con.utiliserAria`.

## Corrections déjà faites cette nuit (modèles à suivre)

- Favicon arrondi (rayon 25 %), généré par ImageMagick depuis `logo-embleme-192.webp` (#97).
- « Expliquer plus simplement » retiré des cartes-liens de l'accueil et des listes (il tombait hors de la carte et recouvrait la liste des services) (#105).
- Encadré « Vous avez une adresse e-mail ? » du formulaire sans e-mail : même composant que sur `inscription.html` (`.note-info.note-lien`), placé sous le bouton, liens à la ligne alignés sous la question, question à côté de l'icône sur mobile (#105).
- Carte : boussole à gauche en arabe (#85). Barre d'onglets de Mon espace : fondu au bord quand elle déborde (#100). Raccourci Ctrl+K rendu au navigateur, « / » seul ouvre la recherche (#100).

## Outillage

- Serveur : `PORT=3150 DB_PATH=/tmp/claude-0/…/scratchpad/db-ui.db node server.js` (base neuve = données de démo). Comptes : `citoyen@nova.test`, `agent@nova.test` / `Agent2026`, `admin@nova.test` / `Admin2026`, partenaires `lumen@nova.test` et `velo@nova.test` / `Partenaire2026`. Arrêter avec `fuser -k 3150/tcp`, **jamais `pkill -f`** (tue le shell de l'outil).
- Chromium : Playwright global (`NODE_PATH=$(npm root -g)`, lancer avec `env -u HTTPS_PROXY -u HTTP_PROXY node script.js`). Les CDN sont inaccessibles depuis le conteneur : `ctx.route(/https:\/\//, r => r.abort())`, donc pas d'icônes Phosphor ni de police Inter dans les captures locales (les largeurs de texte diffèrent légèrement de la prod). Langue : `localStorage.setItem('nt:langue', JSON.stringify('ar'))` en `addInitScript`. Capture d'un composant : `(await page.$('#form-sans')).screenshot({ path })`. Mesures utiles : `getBoundingClientRect()` des éléments, `document.documentElement.scrollWidth > innerWidth`, `page.on('pageerror')`, `page.on('console')` (ignorer les échecs CDN).
- Envoyer les captures au chef de projet avec l'outil de fichiers (rendu dans le chat), avant / après si utile.
- Fusion : `git fetch origin main <branche> && git merge-tree --write-tree origin/main origin/<branche>` pour vérifier, puis outil GitHub `merge_pull_request` avec `expectedHeadSha` et `merge_method: merge` sur GO. Corps de PR : Quoi / Comment / Vérifié, terminé par « 🤖 Generated with Claude Code » et l'URL de session.
- `main` bouge souvent (le collègue dinc59 fusionne ses vagues lui-même) : refaire `git fetch` avant chaque branche et chaque fusion.

## Contexte annexe (autre chantier, hors mission front)

Une revue sécurité des vagues 19-21 du collègue (`main` `879d1be`) a produit un rapport back : 4 importants (routes personnelles en 401 pendant un incident et copie hors connexion effacée par le service worker ; correctif cache #102 incomplet, même ETag pour Brotli et gzip dans `src/statique.js` ; crise de démo F101 perdue après « Réinitialiser la démo » ; `/api/officiels` plus classé essentiel dans `src/charge.js:39`) et 5 mineurs. Le rapport front correspondant était en cours. Ce chantier est traité dans l'autre chat ; ne pas le mélanger avec les retouches d'interface demandées ici, sauf si le chef de projet le demande.
