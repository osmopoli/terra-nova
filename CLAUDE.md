# Conventions du projet (lu automatiquement par les agents)

Projet d'équipe pour le **24h by Webcup 2026** (3-4 octobre, Mayotte). Ce fichier fait foi.
Le chef de projet a validé (3 octobre, soir) la **maquette Terra Nova** comme application de production :
l'ancienne base React + AdonisJS reste dans l'historique git, elle n'est plus développée.

## Stack figée (ne pas changer sans validation du chef de projet)

| Couche | Choix |
|---|---|
| Serveur | Node.js 22 (≥ 22.13) + Express 4 (`server.js`, `src/`) |
| Base | SQLite intégré à Node (`node:sqlite`), aucune dépendance native |
| Front | HTML + CSS + JavaScript sans build (`public/`), Shoelace et Phosphor par CDN |
| Langues | FR / EN / ES / AR (`public/assets/js/i18n.js`) |
| Hébergement | HODI, déployé par Hodifly (Passenger, `server/build/loader.cjs`) à chaque push sur `main` |

Interdits absolus :
- changer de framework, ajouter une étape de build front ou une lib lourde sans validation ;
- supprimer ou modifier `GET /api/health` (surveillance de la prod) ;
- secret, clé ou token dans le code, une PR ou un commentaire Multica (`.env` uniquement) ;
- exposer `WEBCUP_API_KEY` au navigateur : l'API Webcup est interrogée par le serveur seulement ;
- `npm audit fix --force`.

## Architecture

- `server.js` : Express, ordre des middlewares, polling Webcup. `src/db.js` : schéma SQLite (tables créées avec
  `CREATE TABLE IF NOT EXISTS` au démarrage, **pas de migration à lancer**). Les données métier sont des documents JSON
  (table `docs`, collections) manipulés par `src/donnees.js`.
- `src/modules/api.js` : `GET /api/etat` (tout ce que le profil a le droit de voir) et écritures
  `POST/PATCH /api/docs/:collection` contrôlées par règle de rôle. Nouveau module = un fichier dans `src/modules/`
  monté dans `server.js`.
- `src/auth.js` (sessions cookie httpOnly, scrypt, rôles citoyen / agent / admin), `src/renfort.js` (clés d'accès,
  deux étapes, appareils), `src/statique.js` (compression, cache).
- `public/assets/js/store.js` : seul client de l'API côté navigateur (`NT.store`, `NT.auth`…). `ui.js` : en-tête, balise
  Alertes, tiroir, accessibilité, mode léger. Une page = `public/<page>.html` + `assets/js/<page>.js` + `assets/css/<page>.css`.
- `data/demo-seed.json` : données de démonstration (dates relatives), chargées si la base est vide.

## Direction artistique (validée, ne pas dériver)

- Nom : toujours **Terra Nova** (jamais « Nova Terra »), logo à côté du nom.
- Thème « Future Teal » : fond sarcelle sombre, accents bleu / sarcelle, police Inter. Tokens dans
  `public/assets/css/theme.css` : aucune couleur codée en dur dans les autres feuilles.
- Interdits : orange, images pixelisées, effets de lettres qui se décryptent ou de texte courbé, bandeaux d'alerte
  envahissants (les alertes passent par la balise lumineuse « Alertes » et le tiroir).
- Mobile d'abord (360 px), focus visible, contraste AA, `prefers-reduced-motion` respecté, textes traduits dans les 4 langues.

## Ajouter une demande Webcup (vague suivante)

1. Lire la demande (`/agent`, données de l'API). Vérifier dans `docs/RENDU-JURY.md` qu'elle n'est pas déjà couverte.
2. Implémenter dans la page qui sert l'usage (pas de page fourre-tout), réutiliser `NT.store` et les composants de `ui.js`.
3. Ajouter la ligne de la demande dans `docs/RENDU-JURY.md` (où et comment la montrer au jury) et dans le tableau du README.
4. Vérifier : `npm start`, parcours au clavier, 360 px, FR + AR (sens de lecture), puis `npm run build` doit réussir.

## Git et PR

- Une tâche Multica = une branche `WEBC-12-courte-description` = une PR `WEBC-12: verbe + objet`, description avec `Closes WEBC-12`.
- Commits en français, au présent, courts. Pas de commit direct sur `main`.
- **Merge : uniquement PR Guardian ou le chef de projet.** Chaque merge sur `main` redéploie la prod.

## Déploiement HODI

Commande de build Hodifly (inchangée) : `npm ci && npm run build && cd server/build && npm ci --omit=dev && printenv … > .env`.
`npm run build` (`tools/build-hodi.js`) copie l'application dans `server/build/` avec `tools/loader.cjs`.
La base de production vit dans `~/terranova-data/terranova.db` (hors du dossier de release, conservée entre deux
déploiements) ; `DB_PATH` peut la déplacer. Aucune migration ni seed à lancer : tout est fait au démarrage.
