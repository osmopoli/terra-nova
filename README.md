# Nova Terra (24h by Webcup 2026)

Squelette prêt à l'emploi pour le **24h by Webcup 2026** : API AdonisJS 6 + MySQL, front React 19 / Vite 7 / Tailwind 4,
comptes utilisateurs, PWA de base, déploiement HODI (Hodifly / Passenger). Le métier s'ajoute à H+0 selon le sujet.

Conventions d'équipe et règles des agents : **[`CLAUDE.md`](CLAUDE.md)**. Checklists : [`docs/CHECKLISTS.md`](docs/CHECKLISTS.md).

## Ce qui est déjà fait

| Élément | Où |
|---|---|
| `GET /api/health` (statut + base) | `server/start/routes.ts` |
| `GET /api/meta` (listes fermées pour les formulaires) | `server/app/constants/domain.ts` (`META`) |
| Inscription, connexion, déconnexion, profil (`/api/auth/*`, `/api/me`) | `server/app/controllers/` |
| Tokens d'accès (30 jours), mots de passe bcrypt | `server/config/auth.ts`, `hash.ts` |
| Comptes de démo pour le jury (`npm run seed`) | `server/database/seeders/demo_seeder.ts` |
| Front : accueil, connexion / inscription, profil, 404, mini-routeur, client API | `client/src/` |
| Tokens de design (couleurs, polices, rayons) | `client/src/index.css` |
| PWA : manifest + icône | `client/public/` |
| Fallback SPA (toute route hors `/api` renvoie le front) | `server/start/routes.ts` |
| Pont ESM pour Passenger | `server/loader.cjs` |
| Tests API (Japa) | `server/tests/functional/` |

Comptes de démo (un par rôle, créés par `node ace db:seed`) : `citoyen@novaterra.test` (citoyen), `agent@novaterra.test` (agent municipal),
`admin@novaterra.test` (administrateur). Mot de passe commun : variable d'environnement `DEMO_PASSWORD` (8 caractères minimum), à définir
dans `server/.env` ou au lancement : `DEMO_PASSWORD=... node ace db:seed`. Le rôle est renvoyé par `GET /api/me` (`role`) et la liste par `GET /api/meta` (`roles`).

## À personnaliser à H+0

1. Nom de l'app : `client/src/lib/constants.js` (`APP_NAME`), `client/index.html`, `client/public/manifest.webmanifest`, variable `APP_NAME` du serveur.
2. Constantes métier : `server/app/constants/domain.ts` (et `META` pour les exposer au front).
3. Migrations, modèles, contrôleurs, routes du sujet.
4. Direction artistique : tokens de `client/src/index.css`, icône `client/public/icon.svg`.

## Installation locale

Prérequis : Node.js 22, npm 10, MySQL ou MariaDB.

```bash
npm install                       # installe aussi client/ et server/
cp server/.env.example server/.env
node server/ace.js generate:key   # remplit APP_KEY
# renseigner DB_* dans server/.env
npm run migrate
npm run seed
npm run dev                       # front http://localhost:5173, API http://localhost:3333
```

Tests API : créer `server/.env.test` (copie de `.env` avec `NODE_ENV=test` et une base dédiée), puis :

```bash
cd server && NODE_ENV=test node ace migration:run && node ace test
```

## Déploiement HODI (Hodifly)

Projet Hodifly : dépôt GitHub, branche `main`, application Node (Passenger), Node 22, fichier de démarrage `loader.cjs`,
dossier de build `server/build`, déploiement automatique à chaque push.

Commande de build :

```bash
NODE_ENV=development npm ci && NODE_ENV=development npm run build && cd server/build && NODE_ENV=production npm ci --omit=dev && printenv | grep -E '^(NODE_ENV|APP_KEY|APP_NAME|WEBCUP_API_KEY|DB_|PORT|HOST|LOG_LEVEL|TZ)' > .env
```

Variables d'environnement Hodifly : `NODE_ENV=production`, `APP_KEY` (32 caractères), `APP_NAME`, `DB_HOST=localhost`,
`DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `PORT=3333`, `HOST=0.0.0.0`, `LOG_LEVEL=info`, `TZ=UTC`.

Migrations et seed en production (Terminal cPanel) :

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH     # sinon le terminal utilise Node 10
cd "$(ls -dt ~/.hodifly/*/current | head -1)"
node ace migration:run --force
node ace db:seed
```

Contrôle : `https://<domaine>/api/health` doit répondre `{"status":"ok", ..., "database":"ok"}`.

> Rester sur AdonisJS 6 : ne jamais lancer `npm audit fix --force`.
