# Terra Nova · Plateforme citoyenne (24H By Webcup)

Node.js 22 + Express + MySQL (`mysql2`), rendu HTML côté serveur.

## Démarrer

```bash
npm install
cp .env.example .env     # puis collez votre WEBCUP_API_KEY et vos accès MySQL
docker compose up -d     # (optionnel) MySQL 8.4 local, accès = valeurs DB_* du .env
npm start                # http://localhost:3000
npm test                 # tests d'intégration sur la base DB_TEST_NAME (vidée à chaque lancement)
```

## Base de données (MySQL 8 / MariaDB 10.6+)

- Connexion : `DATABASE_URL` (`mysql://user:mdp@hôte:3306/base`) ou `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Au démarrage, `src/db.js` crée la base si possible, puis les tables manquantes (`CREATE TABLE IF NOT EXISTS`, utf8mb4, InnoDB), puis les comptes et contenus de départ (`src/seed.js`). Aucune commande de migration à lancer.
- Dates stockées en UTC, affichées à l'heure de La Réunion.
- `GET /api/health` → `200 {"status":"ok","database":"up"}`, ou `503` si MySQL est injoignable.
- Tables : `users`, `sessions`, `messages`, `services`, `news`, `api_requests`, `api_state`, `api_events`.

Sans clé, l'app charge `data/initial-requests.json` (export de la vague 0) pour que l'espace agents fonctionne quand même.

Comptes créés au premier démarrage (à changer dans `.env`) :
- admin@terranova.fr / admin1234 (administrateur)
- agent@terranova.fr / agent1234 (agent municipal)

## Couverture des demandes

| Code | Demande | Où |
|---|---|---|
| D01 | Création de compte | `src/modules/accounts.js` → `/inscription` |
| D03 | Connexion + espace personnel | `accounts.js`, `espace.js` → `/connexion`, `/espace` |
| D04 | Contacter la mairie + confirmation | `contact.js` → `/contact`, numéro de suivi TN-… |
| D05 | Présentation des services | `services.js` → `/services`, recherche, fiche détaillée |
| D06 | Publications de la ville | `news.js` → `/actualites`, filtres, publication agents |
| D07 | Page d'accueil hiérarchisée | `home.js` → `/` |
| D08 | Profils citoyen / agent / admin | `auth.js`, `admin.js` → `/admin` |
| D09 | Contrôle d'accès | `requireRole()` dans `auth.js` : 403 pour les citoyens sur `/agent`, `/admin`, `/api/*`, publication |
| D19 | Espace agents + données API Nova Terra | `agent.js`, `public/agent.js` → `/agent` |
| F22 | Vue des demandes des habitants avec état | `agent.js` → `/agent?filtre=action` |

## API Webcup

- `src/webcup.js` interroge l'API toutes les `POLL_INTERVAL_SECONDS` (borné à 15-30, défaut 20) avec l'en-tête `X-Webcup-Api-Key`. La clé ne quitte jamais le serveur.
- Chaque nouveauté est journalisée dans `api_events` : nouvelle demande, contenu modifié (hors champs XP qui varient avec le temps), changement de vague.
- L'onglet **Veille API** (`/veille`, agents/admin, `src/modules/veille.js` + `public/veille.js`) relit ce journal toutes les 30 s via `/api/webcup/events` et signale les nouveautés non vues (badge « Nouveau », compteur dans le titre de l'onglet).
- Dédoublonnage sur `request_code` (table `api_requests`). Aucun nombre ni rythme de vagues n'est codé en dur.
- `GET /api/webcup/requests` (agents/admin, `?only_new=true` en option) renvoie les demandes, la session (vague courante, `minutes_until_next_wave` recalculé, `next_wave_at`) et `is_new` par demande ; si le timer a pris du retard, une synchro est relancée avant de répondre. `POST /api/webcup/requests/seen` (`{ codes?: string[] }`) retire l'indicateur « nouvelle ».
- Le navigateur interroge `/api/webcup/state` (agents/admin) et affiche un badge « Nouveau » sur chaque demande apparue depuis la dernière visite.
- Les agents peuvent cocher « Fait » pour suivre l'avancement de l'équipe.

## Ajouter une demande d'une nouvelle vague

1. Créez `src/modules/<nom>.js` qui exporte un `express.Router()`.
2. Ajoutez son nom dans la liste de `server.js`.
3. Protégez les routes sensibles avec `requireRole('agent', 'admin')` ou `requireRole('admin')`.
4. Si besoin, ajoutez la table dans `SCHEMA` de `src/db.js` (`CREATE TABLE IF NOT EXISTS`, syntaxe MySQL) et utilisez `db.all` / `db.get` / `db.run` (asynchrones) dans des routes enveloppées par `ah()` (`src/async.js`).
