# Nova Terra (24h by Webcup 2026)

Plateforme municipale de la ville fictive **Nova Terra** (citoyens, agents municipaux, administrateurs), réalisée pendant le
**24h by Webcup 2026**. API AdonisJS 6 + MySQL, front React 19 / Vite 7 / Tailwind 4, PWA, déploiement HODI (Hodifly / Passenger).

Conventions d'équipe et règles des agents : **[`CLAUDE.md`](CLAUDE.md)**. Checklists : [`docs/CHECKLISTS.md`](docs/CHECKLISTS.md).
Charte graphique : [`docs/CHARTE.md`](docs/CHARTE.md).

## Production

- Application : **https://keepitsimple.mayotte.webcup.hodi.cloud**
- Contrôle : `https://keepitsimple.mayotte.webcup.hodi.cloud/api/health` doit répondre `{"status":"ok", ..., "database":"ok"}`.

## Comptes de démo

Un compte par rôle, créés (ou mis à jour) par `node ace db:seed` (`server/database/seeders/demo_seeder.ts`) :

| Rôle | E-mail |
|---|---|
| Citoyen | `citoyen@novaterra.test` |
| Agent municipal | `agent@novaterra.test` |
| Administrateur | `admin@novaterra.test` |

Mot de passe commun : valeur de la variable d'environnement `DEMO_PASSWORD` (8 caractères minimum), jamais écrite dans le dépôt ;
il est communiqué au jury par la fiche du dashboard Webcup. Le rôle est renvoyé par `GET /api/me` (`role`), la liste par `GET /api/meta` (`roles`).

## Architecture

```
client/   React 19 + Vite 7 + Tailwind 4 (SPA + PWA)
  src/pages/           écrans (accueil, arrivée immersive, annuaire des services, contact, espace agent, 404…)
  src/components/      composants partagés (Layout, Field, écrans d'authentification et de profil…)
  src/api/client.js    client HTTP (token Bearer, préfixe /api)
  src/lib/             mini-routeur (History API), constantes d'affichage
  src/index.css        tokens de design (couleurs, polices, espacements) : seule source du style
  public/              manifest PWA et icône
server/   AdonisJS 6 + Lucid + VineJS, MySQL, Node 22
  start/routes.ts               routes /api + fallback SPA
  app/constants/domain.ts       constantes métier, exposées au front par GET /api/meta
  app/controllers/              un contrôleur par ressource
  app/validators/               validation VineJS de chaque entrée
  app/middleware/               auth (token d'accès) et role (citoyen / agent / admin)
  app/services/webcup_sync.ts   synchro de l'API Webcup (clé côté serveur uniquement)
  database/migrations/          schéma MySQL
  database/seeders/             comptes de démo, annuaire des services
  tests/functional/             tests API (Japa)
  loader.cjs                    point d'entrée Passenger (pont ESM)
```

En production, AdonisJS sert à la fois l'API (`/api/*`) et le build React : toute route hors `/api` renvoie le front (fallback SPA).

Accès par profil : middleware `role` (`server/app/middleware/role_middleware.ts`), profils autorisés dans `ACCESS`
(`server/app/constants/domain.ts`). `/api/agent/*` : agent et admin ; `/api/admin/*` : admin seul. 401 sans token, 403 `{ error }` sinon.

Synchro Webcup : le serveur interroge l'API toutes les 20 s avec `WEBCUP_API_KEY` (jamais exposée au navigateur), dédoublonne sur
`request_code` et stocke les demandes (`webcup_requests`). Routes : `GET /api/agent/webcup/requests[?onlyNew=true]`,
`POST /api/agent/webcup/requests/seen` (`{ codes?: string[] }`) et `POST /api/admin/webcup/refresh` (admin).
Back-office agents (WEBC-12) : page `/agent` (layout `AgentLayout`), rafraîchie au rythme de la synchro.

Annuaire des services (WEBC-7) : `GET /api/services` et `GET /api/services/:slug`, publics, en lecture seule.

## Fonctionnalités

Chaque demande Webcup a un code (D…, F…) et une tâche `WEBC-n` (branche et PR portent le même identifiant).
État au 3 octobre 2026, 15 h UTC : **en prod** = mergé sur `main` et déployé ; **en revue** = PR ouverte, pas encore en prod.
À tenir à jour au fil des merges : seules les lignes « en prod » vont dans la fiche du dashboard Webcup.

| Code | Fonctionnalité | Tâche | État |
|---|---|---|---|
| D01 | Création de compte citoyen | WEBC-4 | en prod |
| D03 | Connexion et espace personnel | WEBC-5 | en prod |
| D04 | Contacter les services municipaux | WEBC-6 | en prod |
| D05 | Annuaire des services municipaux | WEBC-7 | en prod |
| D06 | Actualités et annonces de la ville | WEBC-8 | en revue |
| D07 | Page d'accueil Nova Terra | WEBC-9 | en revue |
| D08 | Profils citoyen / agent / admin | WEBC-10 | en prod |
| D09 | Contrôle d'accès par profil | WEBC-11 | en prod |
| D11 | Suivi de mes démarches et de leur état | WEBC-21 | en revue |
| D12 | Parcours d'accueil à la première connexion | WEBC-22 | en revue |
| D14 | Choix de la langue de l'interface | WEBC-23 | en revue |
| D15 | Fil d'Ariane / repère de navigation | WEBC-24 | en prod |
| D16 | Confirmation claire après envoi d'une demande | WEBC-25 | en revue |
| D17 | Compteur des demandes en attente (agents) | WEBC-26 | en revue |
| D18 | Diffuser un message général à tous les habitants | WEBC-31 | en revue |
| D19 | Espace de travail des agents (données API) | WEBC-12 | en prod |
| F21 | Accessibilité lecteur d'écran | WEBC-18 | en prod |
| F22 | Vue agent des demandes des habitants | WEBC-13 | en revue |
| F23 | Mode contraste élevé | WEBC-19 | en revue |
| F24 | Agrandir la taille du texte | WEBC-20 | en revue |
| F25 | Signaler un problème avec sa localisation | WEBC-27 | en revue |
| F26 | Historique de mes demandes | WEBC-28 | en revue |
| F27 | Contenus des services multilingues | WEBC-29 | en revue |
| F28 | Mettre en avant les services prioritaires | WEBC-30 | en revue |
| F29 | Alerte crue ciblée sur le quartier sud | WEBC-32 | en revue |
| F30 | Être prévenu des annonces importantes | WEBC-33 | en revue |
| F31 | Alerte canicule avec recommandations pour personnes vulnérables | WEBC-34 | en revue |
| F32 | Recherche et filtre des services | WEBC-35 | en revue |

Socle (sans code Webcup) : synchro de l'API Webcup (WEBC-2), direction artistique Nova Terra (WEBC-3), finitions 404 / titres
d'onglet / manifest (WEBC-45), parcours d'arrivée immersif (WEBC-17), PWA (manifest + icône), `GET /api/health`, `GET /api/meta`.

## Installation locale

Prérequis : Node.js 22, npm 10, MySQL ou MariaDB.

```bash
npm install                       # installe aussi client/ et server/
cp server/.env.example server/.env
node server/ace.js generate:key   # remplit APP_KEY
# renseigner DB_*, WEBCUP_API_KEY et DEMO_PASSWORD dans server/.env
npm run migrate
npm run seed
npm run dev                       # front http://localhost:5173, API http://localhost:3333
```

Tests API : créer `server/.env.test` (copie de `.env` avec `NODE_ENV=test` et une base dédiée), puis :

```bash
cd server && NODE_ENV=test node ace migration:run && node ace test
```

## Variables d'environnement

Toutes sont listées dans `server/.env.example`, sans valeur réelle.

| Variable | Rôle |
|---|---|
| `NODE_ENV` | `development` en local, `production` sur HODI |
| `APP_KEY` | clé de chiffrement AdonisJS (32 caractères, `node ace generate:key`) |
| `APP_NAME` | nom du service renvoyé par `/api/health` |
| `HOST`, `PORT` | adresse d'écoute (`0.0.0.0` / `3333` sur HODI) |
| `LOG_LEVEL`, `TZ` | niveau de logs, fuseau (`UTC`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | connexion MySQL |
| `WEBCUP_API_KEY` | clé de l'API Webcup, utilisée uniquement par le serveur |
| `DEMO_PASSWORD` | mot de passe des comptes de démo, lu uniquement par le seeder |

## Déploiement HODI (Hodifly)

Projet Hodifly : dépôt GitHub, branche `main`, application Node (Passenger), Node 22, fichier de démarrage `loader.cjs`,
dossier de build `server/build`, déploiement automatique à chaque push sur `main`.

Commande de build :

```bash
NODE_ENV=development npm ci && NODE_ENV=development npm run build && cd server/build && NODE_ENV=production npm ci --omit=dev && printenv | grep -E '^(NODE_ENV|APP_KEY|APP_NAME|WEBCUP_API_KEY|DB_|PORT|HOST|LOG_LEVEL|TZ)' > .env
```

Variables Hodifly : `NODE_ENV=production`, `APP_KEY`, `APP_NAME`, `DB_HOST=localhost`, `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`,
`DB_DATABASE`, `PORT=3333`, `HOST=0.0.0.0`, `LOG_LEVEL=info`, `TZ=UTC`, `WEBCUP_API_KEY`.

Migrations et seeders en production (Terminal cPanel), après chaque merge qui ajoute une migration :

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH   # sinon le terminal utilise Node 10
cd "$(ls -dt ~/.hodifly/*/current | head -1)"            # dernière release déployée
node ace migration:run --force
read -rs DEMO_PASSWORD && export DEMO_PASSWORD           # saisi au clavier : ni dans l'historique, ni dans le dépôt
node ace db:seed                                         # comptes de démo + annuaire des services, rejouable
```

`DEMO_PASSWORD` n'est pas copié dans `server/build/.env` par la commande de build : il ne sert qu'au seed et se saisit dans le terminal.

Contrôle : `https://keepitsimple.mayotte.webcup.hodi.cloud/api/health` doit répondre `{"status":"ok", ..., "database":"ok"}`.

> Rester sur AdonisJS 6 : ne jamais lancer `npm audit fix --force`.
