# Passation — revue continue de `main` (Terra Nova, 24h by Webcup 2026)

Document de reprise pour un nouveau chat. Lire aussi `CLAUDE.md` (règles du projet, DA, stack figée) : il fait foi.

## Rôle attendu

Relecteur et intégrateur pour le chef de projet (osmopoli). Le collègue dinc59 développe par « vagues » et fusionne lui-même ses PR sur `main`, chaque fusion redéploie la prod (Hodifly). Le travail consiste à :

1. revoir ce qui arrive sur `main` (sécurité d'abord, puis parcours critiques, cohérence, rendu) ;
2. proposer des lots de correction en PR séparées (`review/back-<sujet>`, `review/front-<sujet>`), un agent par lot en parallèle ;
3. **ne jamais fusionner sans un GO explicite du chef de projet** (il écrit « GO merge #N ») ; après fusion, lui demander de vérifier `/api/health` en prod ;
4. répondre en français, court, avec fichier:ligne.

Contraintes à respecter mot pour mot : stack figée (Node 22 + Express 4 + `node:sqlite`, front sans build), jamais toucher `GET /api/health`, aucun secret dans le code ou une PR, `WEBCUP_API_KEY` côté serveur seulement, pas de `npm audit fix --force`, DA « Future Teal » (toujours « Terra Nova », pas d'orange, couleurs uniquement par jetons de `theme.css`, pas de bandeau envahissant), 4 langues FR/EN/ES/AR, mobile 360 px. Pas d'identifiant de modèle dans les commits ou PR.

Branche de session : développer et pousser sur `claude/terra-nova-passation-amvxon` (gardée alignée sur `origin/main` après chaque fusion : `git checkout <branche> && git reset --hard origin/main && git push -u origin <branche>`). Les branches `review/*` servent aux PR. Ne jamais pousser ailleurs.

## État au moment de la passation (4 octobre, ~08:10 Mayotte)

- `main` = `879d1be`. Dernière prod validée par le chef de projet (health OK) : `0b6b139`. Depuis, dinc59 a fusionné seul 4 PR non revues : #102 (correctif cache « URGENT », `src/statique.js`), #103 vague 19, #104 vague 20, #106 vague 21. Environ 8 000 lignes, 20 nouveaux fichiers front, 9 nouveaux modules back.
- Aucune PR ouverte. Les 22 PR anciennes (base d'avant la bascule du 3 octobre) ont été fermées avec un commentaire « Obsolète ».
- Fusionnées cette session (avec GO) : #79, #83 (blocage F37 par appareil et non par réseau), #85 (boussole carte en arabe), #86 #88 #89 (traductions ES/AR), #87 (3 brèches vague 17), #90 #93 (perf statiques, CSS non bloquantes, par le collègue), #97 (favicon arrondi), #100 #101 (revue vague 18 front/back), #105 (encadré « adresse e-mail », plus de « Expliquer » sur les cartes-liens).

## Revue en cours : vagues 19-21 + correctif #102 (sur `879d1be`)

Vérifié par moi : `npm run build` OK, `node tools/test-orientation.js` 72/72, aucune interdiction DA (grep « Nova Terra », orange), `/api/health` intact. Balayage Chromium (37 pages + 6 nouvelles, 4 profils, FR + AR, 360/1280) : premiers 59 chargements sans XSS, débordement ni erreur console ; balayage complet à refaire (voir méthode).

### Rapport back (agent), à transformer en lot `review/back-vagues-19-21`

Bloquant : aucun.

Important :
1. `src/continuite.js:115-141` + `public/sw.js:87` — pendant un incident (réel ou simulé), `req.user` est forcé à `null` : `/api/essentiel/moi` répond 401 au lieu de 503 « incident », et le service worker, sur 401, supprime la copie personnelle hors connexion. Preuve : `POST /api/continuite/simuler {"mode":"base"}` (admin) puis `GET /api/essentiel/moi` en citoyen → 401. Correctif : dans `secours()`, répondre 503 `{ok:false, incident:true}` pour cette route, ou dans `sw.js` ne vider PERSO sur 401 que si le corps ne porte pas `incident:true`.
2. `src/statique.js:103,111,119` — #102 incomplet : même ETag pour les corps Brotli / gzip / identité. Les pages et fichiers sans `?v=` restent en `no-cache` donc stockables par un cache partagé qui ignore `Vary` ; à la revalidation le serveur répond 304 à un `If-None-Match` posé sur un corps d'un autre encodage (le symptôme HODI « page sans styles »). Preuve : `GET /assets/css/theme.css` avec `Accept-Encoding: br|gzip|identity` → même ETag ; client gzip + ETag « br » → 304. Correctif : ETag suffixé par l'encodage (`-br`, `-gz`, `-id`), comparé après le choix d'encodage.
3. `src/modules/crise.js:226`, `server.js:56` — la crise de démo (F101) ne revient pas après « Réinitialiser la démo » : la réinitialisation vide `officiels` mais pas le garde `vague21-crise` de la collection `essentiel`. Preuve : réinitialiser puis `GET /api/crises` → `[]`. Correctif : ressemer si le message gardé a disparu (`docs.get(COL, g.crise)` absent), ou supprimer le garde dans le hook de réinitialisation.
4. `src/charge.js:39` — un commentaire « vague 19 » a avalé la regex `/^\/api\/officiels(\/[^/]+\/compris)?$/` : `/api/officiels` n'est plus classé « essentiel » (vérif : `node -e 'require("./src/charge").classe({path:"/api/officiels",method:"GET"})'` → `normal`). Correctif : remettre la regex avant le commentaire.

Mineur :
5. `src/modules/veille-securite.js:110-112` — `POST /api/veille-securite/vu` insère tout id conforme à la regex sans vérifier son existence (300 par appel) : filtrer sur les ids collectés.
6. `src/modules/mobilite.js:149-159` — le renouvellement d'une interruption de démo envoie une notification « Ligne rétablie » à chaque cycle, contrairement au commentaire : renouveler avant la branche `terminee` ou poser `notifie.fin=true`.
7. `src/continuite.js:41` — `estErreurBase` teste `/sqlite|database/i` sur le message de toute erreur : ne tester que `err.code`.
8. `src/seed-vague20.js:70` — comptes partenaires `lumen@` / `velo@nova.test`, mot de passe `Partenaire2026`, créés aussi en prod : à documenter dans `docs/RENDU-JURY.md` (ou désactiver quand `ADMIN_PASSWORD` est défini, comme les autres comptes de démo).
9. `src/modules/essentiel.js:142-157` — deux compressions Brotli par appel `/essentiel`, mémoïsable ; le mappage `/favicon.ico` de `statique.js` est rendu mort (sans conséquence).

RAS vérifié par l'agent : rôles (anonyme 401, citoyen 403 sur partenaires/crises/mobilité/usage/veille/continuité ; écritures crise réservées agent/admin), espace partenaire cloisonné (un partenaire ne voit ni ne modifie les offres ou demandes d'un autre, `userId` retiré), entrées bornées et paramétrées, `__proto__` → 400, CSRF et jetons anti-robot actifs même en incident, données personnelles masquées dans usage/veille, ordre des middlewares, `setInterval` en `unref()`, aucune dépendance ni secret, build OK.

### Rapport front (agent) : en cours au moment de la passation

Périmètre : vague 19 (`essentiel.js`, `continuite.js`, `sobriete`, `sw.js`, `icones.css`, `annonces-allege.js`), vague 20 (`mobilite.js`, `agent-mobilite`, `agent-usage`, `agent-partenaires`, `partenaires.html`, `partenaire.html`, `espace-partenaire.js`, `vague20.css`), vague 21 (`agent-crise.js`, côté habitant), modifications `ui.js`, `store.js`, `i18n.js`, `theme.css`, `services.js`, `transports.js`. Priorités : XSS (échappement `NT.ui.echap`), erreurs JS, DA (couleurs hors `theme.css`, bandeaux de crise envahissants), i18n 4 langues, accessibilité, 360 px, redirections par rôle. Relancer cette revue si le rapport n'a pas été transmis dans le chat précédent.

## Décisions laissées au chef de projet (non urgentes)

- Débit `recherche` + assistant : 120 requêtes/min/IP (`src/bouclier.js`). Monter à 300 si la salle du jury partage une connexion.
- « Questions sans réponse » (F91) : un mot inconnu isolé (≤ 3 mots, un seul inconnu) est gardé pour rester apprenable (`zorglub`), donc un nom seul tapé dans la recherche reste visible des agents. Version stricte = retirer l'exception dans `src/orientation/moteur.js` (`anonymiser`).
- Mineurs vague 17 non traités : couleurs codées en dur dans le HTML exporté, noms non masqués dans le texte libre pseudonymisé, comparaison de code non constante, en-têtes de pays falsifiables, spam possible sur les alertes urgence anonymes.
- Produit : énumération de téléphone à l'inscription sans e-mail, notation `service:<id>` sans démarche, téléphone masqué renvoyé à la connexion, pas de plafond global sur les essais de code à 6 chiffres.
- DA : ~80 `oklch()` codés en dur hors `theme.css` (surtout `accueil.css`, `comptes.css`), ambre `--soleil` sur la carte N3/Est, contradiction `plan-fusion-main` dans `docs/PLAN-FUSION.md`, clés i18n orphelines `c.con.demo*`.
- Contenu : la démo (`data/demo-seed.json`) reste en français en arabe, limite du modèle de données.

## Méthode et outillage

- Lancer : `PORT=3150 DB_PATH=/tmp/<base>.db node server.js` (base neuve = seed de démo chargé ; comptes `citoyen@nova.test`, `agent@nova.test` / `Agent2026`, `admin@nova.test` / `Admin2026`, partenaires `lumen@` et `velo@nova.test` / `Partenaire2026`). Arrêter avec `fuser -k <port>/tcp`, **jamais `pkill -f`** (tue le shell de l'outil).
- Formulaires protégés (vague 16) : `GET /api/formulaires/jeton?f=<nom>` puis en-tête `x-tn-jeton` ≥ 3 s après, plus `x-tn-signaux` ; anti-CSRF : en-tête `Origin` de la même origine. Connexion : `POST /api/auth/connecter` (200 avec `{ok:false, restantes…}` en échec).
- Chromium : Playwright global (`NODE_PATH=$(npm root -g)`, `env -u HTTPS_PROXY -u HTTP_PROXY node script.js`), CDN inaccessibles depuis le conteneur (`ctx.route(/https:\/\//, r => r.abort())`), langue forcée par `localStorage.setItem('nt:langue', JSON.stringify('ar'))` en `addInitScript`. Balayage utile : toutes les pages `public/*.html` × profils (anonyme, citoyen, agent, admin) × FR/AR × 360/1280, avec un compte citoyen dont le nom est une charge XSS, en relevant `window.__xss`, `scrollWidth > largeur`, erreurs console hors CDN, et l'URL finale (redirections par rôle).
- Mergeabilité : `git fetch origin main <branche> && git merge-tree --write-tree origin/main origin/<branche>` ; fusion par l'outil GitHub `merge_pull_request` avec `expectedHeadSha` et `merge_method: merge`. Vérifier avant que plusieurs PR ouvertes fusionnent ensemble (worktree temporaire, `npm run build`).
- Agents : un agent back et un agent front en parallèle, chacun dans son worktree, qui poussent une branche `review/*` sans créer la PR (la PR est créée et fusionnée par la session principale sur GO). Corps de PR : Quoi / Important / Mineur / Vérifié, terminé par la ligne « Generated with Claude Code » et l'URL de session.
- Prod : HODI via Passenger (`tools/loader.cjs`), `req.ip` = vraie IP client (`trust proxy` déjà réglé), base dans `~/terranova-data/terranova.db`. L'URL de prod est inaccessible depuis le conteneur : demander au chef de projet (PowerShell `Invoke-RestMethod`) pour toute vérification prod.

## Prochaines étapes proposées

1. Récupérer le rapport front des vagues 19-21 (ou le relancer), finir le balayage Chromium complet.
2. Sur GO : lot `review/back-vagues-19-21` (points 1 à 4 au minimum, 5 à 9 si le temps le permet) et lot `review/front-vagues-19-21` selon le rapport front.
3. Vérifier en prod avec le chef de projet le correctif #102 (pages avec styles après vidage du cache) et `/api/health` après chaque fusion.
4. Rester à l'écoute des nouvelles vagues du collègue : il fusionne seul, chaque vague doit être revue après coup.
