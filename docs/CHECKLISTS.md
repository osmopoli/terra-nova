# Checklists Webcup 2026

## Veille (vendredi soir) : poste prêt à coder

À faire par chacun des 3 membres :

- [ ] Node.js 22 installé (`node -v`), npm 10, Git configuré (`git config user.name` / `user.email`).
- [ ] Accès en écriture au dépôt GitHub du projet (invitation acceptée).
- [ ] `gh auth login` fait, `gh auth status` OK.
- [ ] Compte Multica actif et membre de l'espace « Pandore ».
- [ ] Multica Desktop configuré (`~/.multica/desktop.json` sans BOM ni `/` final), runtime visible et en ligne.
- [ ] `GH_TOKEN` (jeton limité au dépôt) dans le `custom_env` des agents qui ouvrent des PR.
- [ ] Le starter tourne en local : `npm install`, `npm run migrate`, `npm run dev`, connexion avec le compte démo.
- [ ] Chargeur, multiprise, câble réseau si possible, casque.

Chef de projet en plus :

- [ ] Accès cPanel HODI de l'équipe, base MySQL créée, utilisateur lié à la base avec tous les privilèges.
- [ ] Projet Hodifly créé sur le nouveau dépôt, variables d'environnement saisies, premier déploiement OK, `/api/health` OK.
- [ ] Dans le terminal cPanel : `~/.bashrc` contient le PATH Node 22 et l'alias `app`.
- [ ] Projet Multica « Webcup 2026 » prêt : squad, tâche de cadrage H+0, autopilot de point d'étape.

## H+0 : lancement

- [ ] Lire le sujet ensemble (15 min max). Noter les éléments imposés et les critères.
- [ ] Remplir la tâche de cadrage : problème, utilisateur cible, parcours critique en 5 étapes max, hors périmètre.
- [ ] Product Guardian découpe en tâches P0 (parcours critique) puis P1 (bonus).
- [ ] Designer / DA lance la direction artistique (H+0 à H+1).
- [ ] Personnaliser le starter (nom, constantes, icône) dans une première PR.

## Rythme

- Point d'étape toutes les 2 h (autopilot Product Guardian + 5 min entre humains).
- H+12 : le parcours critique doit fonctionner en prod, même moche. Sinon on coupe du périmètre.
- H+18 : gel des nouvelles fonctionnalités. Uniquement finition, bugs, contenu, design.
- Dormir par roulement : jamais les 3 en même temps, jamais personne plus de 6 h sans pause.

## H+20 : rendu (ne pas attendre H+23)

- [ ] Parcours critique rejoué en prod, à 360 px et sur desktop, sans erreur console.
- [ ] Données de démo réalistes en prod (`node ace db:seed`), aucun texte de test visible.
- [ ] Comptes de démo notés et testés.
- [ ] Fiche du dashboard Webcup remplie : concept, technologies, infos de test, identifiants de démo.
- [ ] Captures d'écran propres.
- [ ] Vidéo de démo (facultative) : 1 à 2 min, parcours critique.
- [ ] `/api/health` OK, pas de page blanche, 404 propre, favicon et titre corrects.
- [ ] Dernière PR mergée et déployée au moins 1 h avant la fin (les accès serveur sont coupés à H+24).
