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
- **Obligatoire en production** : définir `ADMIN_PASSWORD` et `AGENT_PASSWORD` dans Hodifly. Au démarrage, `ADMIN_PASSWORD` remplace le mot de passe
  du compte `admin@nova.test` et `AGENT_PASSWORD` celui de `agent@nova.test` et `social@nova.test` (comptes publiés ci-dessous, donc inutilisables
  tels quels sur la prod) ; les sessions ouvertes avec l'ancien mot de passe sont fermées. Les valeurs d'exemple `admin1234` / `agent1234` sont refusées
  en production. Le `grep` de la commande de build qui écrit le `.env` doit donc inclure `ADMIN_|AGENT_|DB_PATH|POLL_|DATA_ENCRYPTION_KEY`
  (ex. `printenv | grep -E '^(NODE_ENV|PORT|WEBCUP_|ADMIN_|AGENT_|DB_PATH|POLL_|DATA_ENCRYPTION_KEY)' > .env`).
- Base SQLite : `~/terranova-data/terranova.db`, hors du dossier de release, donc conservée entre deux déploiements (`DB_PATH` pour la déplacer). Aucune migration à lancer.
- Node 22.13 ou plus récent requis (`node:sqlite` sans option).
- Vague 13 (F69) : définir `DATA_ENCRYPTION_KEY` (longue valeur aléatoire, à ne jamais changer ensuite) pour chiffrer les données sensibles ; sans elle, une clé est créée dans `~/terranova-data/terranova.key` (à conserver avec la base). `NODE_ENV=production` active HSTS et `upgrade-insecure-requests`.
- **Clé de chiffrement et sauvegardes** : les téléphones et dossiers des habitants ne sont lisibles qu'avec la clé qui les a chiffrés.
  Ne jamais changer `DATA_ENCRYPTION_KEY` (ni l'ajouter après coup sur une base qui tournait avec `terranova.key`) sans réchiffrer
  la base ; sauvegarder `terranova.key` **avec** `terranova.db`. Au démarrage, le serveur relit un témoin chiffré dans la base : si la
  clé ne correspond plus, il affiche « clé de chiffrement différente de celle de la base » et s'arrête (code 1) au lieu de servir
  des profils illisibles. `CHIFFREMENT_IGNORER_TEMOIN=1` force le démarrage pour dépanner : les valeurs illisibles sont alors
  conservées telles quelles en base (jamais écrasées) et renvoyées vides à l'écran jusqu'au retour de la bonne clé.
- Surveillance : `GET /api/health` → `{"status":"ok","service":"terra-nova","database":"ok",…}` (inchangé) ; vague 15 : niveau de charge public sur `GET /api/charge` (`normal` / `forte` / `critique`) et en-tête `X-Charge` sur chaque réponse de l'API.
- Vague 17 (F85-F87), variables facultatives (valeurs par défaut sûres) : `SAUVEGARDES_DIR` (dossier des sauvegardes, défaut `~/terranova-data/sauvegardes`), `SAUVEGARDES_GARDER` (sauvegardes automatiques gardées, 7), `URGENCE_DELAI_MINUTES` (délai de prise en charge avant escalade, 5), `INTEGRITE_INTERVALLE_HEURES` (contrôle d’intégrité, 6), `ANOMALIE_SEUIL_SURVEILLE` / `_ELEVE` / `_CRITIQUE` (30 / 60 / 85), `ANOMALIE_RAFALE_MINUTE` (240), `TZ_VILLE` (fuseau des heures affichées et des habitudes de connexion, `Indian/Mayotte`). Pour les utiliser en production, ajouter leurs préfixes au `grep` du `.env`. Les sauvegardes ne contiennent jamais la clé de chiffrement : la conserver à part.
- Vague 15 (F77, F78) : seuils réglables sans toucher au code (`CHARGE_LAG_FORTE`=120 ms, `CHARGE_LAG_CRITIQUE`=350 ms, `CHARGE_EN_COURS_FORTE`, `CHARGE_PAR_IP`=8, `CHARGE_DELAI_MAX`=15000 ms…) ; `CHARGE_CACHE=0` désactive la mémoïsation (mesure « sans cache »).

## Test de charge (vague 15)
```bash
node tools/charge.js --url http://localhost:3000 --clients 100 --duree 30            # aucune dépendance
node tools/charge.js --clients 40 --duree 10 --meme-ip                                 # tous derrière une seule adresse
```
Résultats mesurés (avant / après) dans [`docs/RENDU-JURY.md`](docs/RENDU-JURY.md#mesures-de-tenue-en-charge-f77-f78). `--ecritures 0.005` ajoute des dépôts de demandes : à ne pas utiliser sur la base de production.

## Comptes de démonstration (créés au premier démarrage)

| Profil | E-mail | Mot de passe |
|---|---|---|
| Citoyen | `citoyen@nova.test` | `Citoyen2026` |
| Agent municipal | `agent@nova.test` | défini par `AGENT_PASSWORD` (fourni par l'équipe) |
| Administrateur | `admin@nova.test` | défini par `ADMIN_PASSWORD` (fourni par l'équipe) |

Autres habitants : `marc@`, `amina@`, `jean@nova.test` (mot de passe `Citoyen2026`). Vague 13 : agent habilité aux données réservées `social@nova.test` (mot de passe `AGENT_PASSWORD`) ; nouvel arrivant sans e-mail `TN-100001` (ou `06 39 48 21 77`) / code `482915`.
Comptes d'équipe supplémentaires possibles via `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `AGENT_EMAIL` / `AGENT_PASSWORD` dans `.env`. En production, ces
mêmes `ADMIN_PASSWORD` / `AGENT_PASSWORD` remplacent les mots de passe des comptes de démo admin et agents (voir Déploiement HODI).
Réinitialiser les données de démonstration : connecté en admin, `POST /api/demo/reinitialiser` (ou console : `NT.store.reset()`).

## Architecture

- `server.js` — Express : API, fichiers statiques, polling de l'API Webcup.
- `src/db.js` — schéma SQLite : `users` (identifiants scrypt + rôle), `sessions`, `docs` (documents métier JSON), `securite` (anti-intrusion), `api_requests` / `api_state` (API Webcup).
- `src/auth.js` — sessions par cookie httpOnly, hachage scrypt, rôles, verrouillage progressif après échecs (F37).
- `src/modules/participation.js` — consultations, avis (un par habitant), projets et idées (F65-F68), droits contrôlés par le serveur.
- `src/modules/api.js` — `GET /api/etat` (tout ce que le profil a le droit de voir), écritures `POST/PATCH /api/docs/:collection` contrôlées par règle (un citoyen ne voit et ne modifie que ses données ; seuls agents / admins traitent les demandes, diffusent les alertes, changent l'état des services ; seul l'admin change un rôle), soutiens (F52), contributions données (F51), indicateurs (F50), flux Webcup pour les agents (D19, clé jamais exposée).
- Vague 14 : `src/modules/officiel.js` (message officiel du Haut Conseil, F73), `associations.js` (associations partenaires, F74), `doublons.js` (demandes semblables TF-IDF, rattachement, réponse commune, F75), `avis-services.js` (avis après un service, reçu COM-xxxx, F76).
- Vague 16 : `src/modules/formulaires.js` (jetons signés, champ piège, vérification humaine, idempotence et demandes en double, F81-F82), `accuses.js` (accusé de réception vérifiable, F83), `echanges.js` (réponses des agents et fil d’échanges, F84) ; côté navigateur `formulaires.js`, `accuse.js`, `echanges.js`, `agent-robots.js` et `assets/css/vague16.css`.

- Vague 15 : `src/charge.js` (mesure de la charge, délestage 503 + `Retry-After` du non essentiel, file équitable par IP, délai maximal, mémoïsation des lectures chaudes invalidée à chaque écriture, mode dégradé forcé par l'admin, F77/F78), `src/modules/priorites.js` (priorité des dossiers calculée et corrigeable, F80), `src/seed-vague15.js` ; navigateur : `assets/js/resilience.js` (avis calme, recul exponentiel, brouillons, nouveaux essais), `sw.js` (copie hors connexion, réseau d'abord), `assets/js/sujets.js` (tri par sujet, F79), `assets/js/agent-priorites.js`, `assets/js/agent-plateforme.js` ; `tools/charge.js` (test de charge).
- Vague 17 : `src/modules/integrite.js` (registre d’audit scellé SHA-256 + HMAC, contrôles de cohérence et réparations, F85), `anomalies.js` (habitudes, score de risque, mot de passe redemandé, ralentissement, sessions fermées, « C’était moi », F85), `src/incidents.js`, `urgences.js` (urgence médicale, escalade, F86), `sauvegardes.js` (VACUUM INTO, test de restauration, F87), `exports.js` (exports pseudonymisés, modèles, F88), `src/seed-vague17.js` ; navigateur : `veille.js` (balise « Alertes » : urgences, activité inhabituelle, fenêtre de confirmation du mot de passe), `urgence-medicale.js`, `agent-urgences.js`, `agent-incidents.js`, `admin-sauvegardes.js`, `agent-exports.js`, `assets/css/vague17.css`.
- `src/webcup.js` — interroge l'API toutes les `POLL_INTERVAL_SECONDS` (dédoublonnage sur `request_code`).
- `public/assets/js/store.js` — client du serveur, même interface pour toutes les pages (`NT.store`, `NT.auth`, `NT.demandes`…).
- `data/demo-seed.json` — données de démonstration (dates relatives).

## Couverture des demandes

Le détail « où et comment le montrer au jury » est dans [`docs/RENDU-JURY.md`](docs/RENDU-JURY.md).

| Thème | Demandes | Pages |
|---|---|---|
| Accueil, services, navigation | D05, D07, D15, F27, F28, F32, F38 | `index`, `services` |
| Comptes, rôles, sécurité | D01, D02, D03, D08, D09, D12, F33, F34, F35, F37, F53, F54 | `inscription`, `connexion`, `espace`, `compte`, `admin-comptes` |
| Demandes citoyennes | D04, D11, D16, F25, F26, F49 | `demande`, `suivi`, `espace` |
| Espace agents | D17, D19, F22, F47, F48, F50 | `agent`, `agent-tableau`, `agent-demandes`, `agent-journal` |
| Alertes et annonces | D06, D18, F29, F30, F31 | `annonces`, `agent-alertes` |
| Rendez-vous, transports, carte | F36, F39, F40, F45, F46 | `rendez-vous`, `transports`, `carte` |
| Participation, données | F51, F52, F55, F56, F65, F66, F67, F68 | `soutenir`, `participer`, `donnees`, `espace`, `mes-informations`, `recapitulatif` |
| Accessibilité, langues, langage clair | D13, D14, D20, F21, F23, F24, F41, F42, F43, F44 | toutes (panneau ♿, touche `?`, `aide`) |
| Légèreté, appareils peu puissants, version simple | F61, F62 | panneau ♿, pied de page, `/simple` (`src/modules/simple.js`) |
| Sobriété numérique | F57, F58, F59, F60 | `sobriete`, panneau ♿ (« Mode connexion lente »), `index` (images WebP), `src/statique.js` |
| État des services (désactivation admin, avant toute démarche) | F63, F64 | `agent-alertes`, `services`, `demande`, `rendez-vous` |

| Sécurité numérique, données réservées (vague 13) | F69, F70 | toutes (en-têtes, anti-CSRF, débit), `securite`, `agent-securite`, `admin-comptes` |
| Nouveaux arrivants (vague 13) | F71, F72 | `bienvenue`, `agent-accueil`, `connexion`, `index` |
| Message officiel du Haut Conseil (vague 14) | F73 | balise « Alertes » + tiroir (toutes les pages), `index`, `annonces`, `agent-alertes`, `/simple` |
| Associations partenaires (vague 14) | F74 | `services#associations`, fiche d'un service, `carte` |
| Demandes semblables, attention (vague 14) | F75 | `agent-demandes` |
| Avis après un service (vague 14) | F76 | `suivi`, `rendez-vous`, `services`, `espace` |
| Formulaires protégés contre les robots, envois sans doublon (vague 16) | F81, F82 | tous les formulaires publics, `agent-securite` |
| Accusé de réception vérifiable (vague 16) | F83 | `demande`, `accuse`, `verifier-accuse`, `suivi`, `espace` |
| Réponses des agents, fil d’échanges (vague 16) | F84 | `agent-demandes`, `agent`, `suivi` |

| Surcharge et affluence : l'essentiel reste disponible (vague 15) | F77, F78 | toutes (pied de page, tiroir « Alertes », brouillons, nouveaux essais, hors connexion), `agent-plateforme`, `tools/charge.js` |
| Trier et filtrer par sujet (vague 15) | F79 | `suivi`, `espace#historique`, `soutenir` |
| Dossiers prioritaires des agents (vague 15) | F80 | `agent-demandes`, `agent`, `agent-journal` |

| Centre de cybersécurité : intégrité, activité inhabituelle, incidents (vague 17) | F85 | `agent-securite`, `securite`, balise « Alertes » (toutes les pages) |
| Signalement d’urgence médicale (vague 17) | F86 | `demande`, `urgence`, `suivi`, `agent`, `agent-demandes` |
| Sauvegardes vérifiées (vague 17) | F87 | `admin-sauvegardes` |
| Exports des données de suivi (vague 17) | F88 | `agent-exports` |
