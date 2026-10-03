# Terra Nova · Plateforme citoyenne (24H By Webcup 2026)

Node.js 22 + Express + SQLite intégré (`node:sqlite`). Le front (thème « Future Teal », FR / EN / ES / AR, accessible) est servi depuis `public/` ; toutes les données passent par l'API JSON du serveur, qui contrôle les droits de chaque profil.

## Démarrer

### Avec Docker (recommandé)
```bash
cp .env.example .env        # puis collez votre WEBCUP_API_KEY
docker compose up -d --build
```
→ http://localhost:3000 · la base SQLite est conservée dans le volume `terra-nova-data`.

### Sans Docker
```bash
npm install
cp .env.example .env        # puis collez votre WEBCUP_API_KEY
npm start                   # http://localhost:3000
```

Sans clé, l'espace agents charge `data/initial-requests.json` pour rester démontrable.

## Déploiement HODI (production)

Hodifly redéploie à chaque push sur `main` avec la commande de build du projet :
`npm ci && npm run build && cd server/build && npm ci --omit=dev && printenv … > .env`.

- `npm run build` (`tools/build-hodi.js`) prépare `server/build/` : `server.js`, `src/`, `public/`, données de démo et `loader.cjs` (point d'entrée Passenger, charge le `.env`).
- Variables Hodifly utiles : `NODE_ENV=production`, `WEBCUP_API_KEY`, `PORT`. Les variables `DB_*` MySQL de l'ancienne version ne servent plus.
- Base SQLite : `~/terranova-data/terranova.db`, hors du dossier de release, donc conservée entre deux déploiements (`DB_PATH` pour la déplacer). Aucune migration à lancer.
- Node 22.13 ou plus récent requis (`node:sqlite` sans option).
- Surveillance : `GET /api/health` → `{"status":"ok","service":"terra-nova","database":"ok",…}`.

## Comptes de démonstration (créés au premier démarrage)

| Profil | E-mail | Mot de passe |
|---|---|---|
| Citoyen | `citoyen@nova.test` | `Citoyen2026` |
| Agent municipal | `agent@nova.test` | `Agent2026` |
| Administrateur | `admin@nova.test` | `Admin2026` |

Autres habitants : `marc@`, `amina@`, `jean@nova.test` (mot de passe `Citoyen2026`). La page de connexion propose de pré-remplir ces comptes.
Comptes d'équipe supplémentaires possibles via `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `AGENT_EMAIL` / `AGENT_PASSWORD` dans `.env`.
Réinitialiser les données de démonstration : connecté en admin, `POST /api/demo/reinitialiser` (ou console : `NT.store.reset()`).

## Architecture

- `server.js` — Express : API, fichiers statiques, polling de l'API Webcup.
- `src/db.js` — schéma SQLite : `users` (identifiants scrypt + rôle), `sessions`, `docs` (documents métier JSON), `securite` (anti-intrusion), `api_requests` / `api_state` (API Webcup).
- `src/auth.js` — sessions par cookie httpOnly, hachage scrypt, rôles, verrouillage progressif après échecs (F37).
- `src/modules/api.js` — `GET /api/etat` (tout ce que le profil a le droit de voir), écritures `POST/PATCH /api/docs/:collection` contrôlées par règle (un citoyen ne voit et ne modifie que ses données ; seuls agents / admins traitent les demandes, diffusent les alertes, changent l'état des services ; seul l'admin change un rôle), soutiens (F52), contributions données (F51), indicateurs (F50), flux Webcup pour les agents (D19, clé jamais exposée).
- `src/webcup.js` — interroge l'API toutes les `POLL_INTERVAL_SECONDS` (dédoublonnage sur `request_code`).
- `public/assets/js/store.js` — client du serveur, même interface pour toutes les pages (`NT.store`, `NT.auth`, `NT.demandes`…).
- `data/demo-seed.json` — données de démonstration (dates relatives).

## Couverture des demandes (50)

Le détail « où et comment le montrer au jury » est dans [`docs/RENDU-JURY.md`](docs/RENDU-JURY.md).

| Thème | Demandes | Pages |
|---|---|---|
| Accueil, services, navigation | D05, D07, D15, F27, F28, F32, F38 | `index`, `services` |
| Comptes, rôles, sécurité | D01, D03, D08, D09, D12, F33, F34, F35, F37 | `inscription`, `connexion`, `espace`, `compte`, `admin-comptes` |
| Demandes citoyennes | D04, D11, D16, F25, F26, F49 | `demande`, `suivi`, `espace` |
| Espace agents | D17, D19, F22, F47, F48, F50 | `agent`, `agent-tableau`, `agent-demandes`, `agent-journal` |
| Alertes et annonces | D06, D18, F29, F30, F31 | `annonces`, `agent-alertes` |
| Rendez-vous, transports, carte | F36, F39, F40, F45, F46 | `rendez-vous`, `transports`, `carte` |
| Participation, données | F51, F52 | `soutenir`, `donnees` |
| Accessibilité, langues, langage clair | D13, D14, D20, F21, F23, F24, F41, F42, F43, F44 | toutes (panneau ♿, touche `?`, `aide`) |
| Légèreté, appareils peu puissants, version simple | F61, F62 | panneau ♿, pied de page, `/simple` (`src/modules/simple.js`) |
| État des services (désactivation admin, avant toute démarche) | F63, F64 | `agent-alertes`, `services`, `demande`, `rendez-vous` |
