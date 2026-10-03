# Conventions du projet (lu automatiquement par les agents)

Projet d'équipe pour le **24h by Webcup 2026** (3-4 octobre, Mayotte). 24 h, 3 humains + agents Multica.
Ce fichier fait foi. En cas de doute : demander dans la tâche Multica, ne pas deviner.

## Stack figée (ne pas changer sans validation du chef de projet)

| Couche | Version |
|---|---|
| Front | React 19 + Vite 7 + Tailwind CSS 4 (`client/`) |
| Back | AdonisJS **6** + Lucid 21 + VineJS + auth `access_tokens` (`server/`) |
| Base | MySQL (MariaDB en local accepté) |
| Runtime | Node.js 22 |
| Hébergement | HODI, déployé par Hodifly (Passenger, `loader.cjs`) à chaque push sur `main` |

Interdits absolus :
- AdonisJS 7, `npm audit fix --force`, changement de framework ou ajout d'une lib lourde sans validation ;
- `response.redirect().back()` / `redirect('back')` : uniquement des chemins explicites ;
- `/spike` ou tout sous-chemin codé en dur dans les routes ;
- supprimer ou modifier `GET /api/health` (utilisé pour surveiller la prod) ;
- secret, mot de passe ou token dans le code, un commentaire Multica ou une PR (`.env` uniquement) ;
- `@faker-js/faker` reste forcé en `10.5.0` (overrides).

## Source de vérité unique

- **Constantes métier** : `server/app/constants/domain.ts` uniquement (clés ASCII snake_case, libellés pour l'UI).
  Elles sont exposées par `GET /api/meta` (ajouter la liste dans `META`). Le front ne les recopie jamais.
- **Design** : tokens dans `client/src/index.css` (`@theme`). Aucune couleur, police, rayon ou ombre codée en dur
  dans les composants : utiliser `bg-primary`, `text-ink`, `rounded-card`, etc.
- **Nommage des champs** : camelCase côté JSON/JS (`fullName`), snake_case en base (`full_name`), comme Lucid le fait.

## Git et PR

- Une tâche Multica = une branche = une PR. L'identifiant de la tâche (ex. `WEBC-12`, préfixe de l'espace Multica) est **dans le nom de branche
  et dans le titre de la PR**, et la description contient `Closes WEBC-12` : sinon la tâche ne se ferme pas.
- Branche : `WEBC-12-courte-description` (ou la branche `agent/...` créée par Multica, avec l'identifiant).
- Titre : `WEBC-12: verbe + objet` (ex. `WEBC-12: API création de réservation`).
- Commits en français, au présent, courts. Pas de commit direct sur `main`.
- PR petite (idéalement < 400 lignes), un seul sujet. Description : quoi, pourquoi, comment tester, captures si UI.
- **Merge : uniquement PR Guardian** (après verdict MERGER, remarques traitées, build et tests OK) ou le chef de projet.
  Aucun autre agent ne merge. Chaque merge sur `main` redéploie la prod : en cas de doute, ne pas merger.

## API

- Toutes les routes sous `/api` (`server/start/routes.ts`). Contrôleurs fins, validation VineJS systématique.
- Erreurs : 422 `{ errors: [{ field, message }] }` (validation), 401 sans token, 403/404/409 `{ error: "..." }`.
- Messages d'erreur en français, compréhensibles par un utilisateur.
- Toute nouvelle table = une migration Lucid. Ne jamais modifier une migration déjà mergée : en créer une nouvelle.
- Après merge d'une migration, prévenir le chef de projet : il lance `node ace migration:run --force` sur HODI.

## Front

- Mobile d'abord (tester à 360 px), puis desktop. Accessibilité : labels, focus visible, contraste AA.
- Routage : mini-routeur `client/src/lib/router.jsx` (pas de React Router sauf validation).
- Appels API uniquement via `client/src/api/client.js`.
- Textes de l'interface en français, ton cohérent avec la direction artistique. Pas d'emojis décoratifs ni de
  « texte d'IA » générique : chaque mot doit servir le sujet.

## Tests et vérification avant PR

- `cd server && npx tsc --noEmit && npx eslint . && node ace test` (base MySQL de test requise).
- `npm run build` à la racine doit passer.
- Vérifier le parcours touché dans le navigateur (360 px et desktop) et le dire dans la PR.

## Coordination des agents (Multica)

- Un agent ne travaille que sur la tâche qui lui est assignée et ne modifie pas le périmètre d'un autre.
- Pour commenter sans réveiller d'agent : `/note`. Ne mentionner un agent (@) que pour lui confier une action précise.
- Condition d'arrêt : après avoir livré (PR ouverte + commentaire de synthèse), l'agent s'arrête. Il ne relance pas
  un autre agent pour « vérifier » sauf si sa fiche le prévoit. Deux allers-retours sans progrès = demander à un humain.
- Bloqué (accès, décision produit, conflit) : passer la tâche en `blocked`, écrire la question en une phrase, s'arrêter.
- Ne jamais changer le statut, l'assignation ou la priorité d'une autre tâche sans demande d'un humain.
