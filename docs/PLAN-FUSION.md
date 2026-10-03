# Plan de fusion vers `main` (Terra Nova)

Décision : la version rendue au jury est celle de `main` (React + AdonisJS). La DA reste « Future Teal ».
La maquette Express (`integration-maquette`, `deploiement-maquette`) ne sera pas fusionnée.
Elle sert de référence pour reprendre ce qui manque.

État au 3 octobre, vague 13 : 71 demandes visibles sur l'API Webcup.

Légende :
- ✅ : fusionnée sur `main` ;
- 🔄 : une branche existe, il reste à la relire et à la fusionner ;
- ❌ : rien n'est commencé.

## 1. Branches à relire et fusionner (🔄)

Ces branches existent déjà sur GitHub. Il faut les mettre à jour avec `main`, ouvrir ou relire leur PR, puis les fusionner.

| Demande | Sujet | Branche |
|---|---|---|
| D06 | Actualités et annonces | `WEBC-8-actualites` (vérifier si déjà fusionnée) |
| D11 | Suivi de mes démarches | `WEBC-21-suivi-demarches` |
| D13 | Glossaire, mots difficiles | `WEBC-64-glossaire` |
| D14 | Langue de l'interface | `WEBC-23-langue-interface` |
| D16 | Confirmation après envoi | `WEBC-25-confirmation-envoi` |
| D17 | Compteur des demandes en attente | `WEBC-26-compteur-attente` |
| F28 | Services prioritaires | `WEBC-30-services-prioritaires` |
| F29 | Alerte crue quartier sud | `WEBC-32-alerte-quartier` |
| F30 | Annonces importantes | `WEBC-33-annonces-importantes` |
| F31 | Alerte canicule | `WEBC-34-alerte-canicule` |
| F32 | Recherche et filtre des services | `WEBC-35-recherche-services` |
| F34 | Administration des comptes citoyens | `WEBC-57-comptes-citoyens-main` |
| F35 | Indications de première visite | `WEBC-58-indications-contextuelles` |
| F38, F64 | Service indisponible, état d'un service | `WEBC-61-statut-services` |
| F42 | Formulaires accessibles | `WEBC-67-a11y-formulaires` |
| F46 | Urgences et hôpitaux | `WEBC-73-urgences-sante` |
| F47, F48 | Traçabilité, « qui a modifié quoi » | `WEBC-75-historique-admin` (F47 : vérifier la couverture) |
| F51 | Utilisation des données | `WEBC-78-vos-donnees` |
| F54 | Connexion depuis un nouvel appareil | `WEBC-80-connexion-nouvel-appareil` |
| F55 | Export des données personnelles | `WEBC-82-export-donnees` |
| F56 | Récapitulatif des demandes | `WEBC-81-recapitulatif-demandes` |
| F58 | Sobriété côté serveur | `WEBC-88-sobriete-serveur` |
| F59, F62 | Connexion lente, version allégée | `WEBC-90-version-allegee` et `terra-nova-leger` (en garder une) |
| F60 | Images légères | `WEBC-85-alleger-images` |
| F63 | Désactiver un service | `WEBC-91-desactivation-service` |
| Nom | Nom du site « Terra Nova » | `nom-terra-nova` |

Elles touchent souvent les mêmes fichiers (`routes.ts`, `domain.ts`, navigation) : les fusionner une par une et mettre à jour les suivantes après chaque fusion.

## 2. Demandes sans branche (❌) : à développer

Chaque ligne = une branche et une PR, selon `CLAUDE.md`. La colonne « Référence » indique où la maquette Express traite déjà le sujet.

| Demande | XP | Sujet | Référence dans la maquette |
|---|---|---|---|
| D02 | 1020 | Connexion sans mot de passe (clé d'accès, WebAuthn) | `src/renfort.js`, `public/assets/js/connexion-forte.js` |
| F53 | 1020 | Vérification en deux étapes (code TOTP, codes de secours) | `src/renfort.js` |
| F69 | 1520 | Protéger les données sensibles contre une faille | à concevoir |
| F70 | 1140 | Données administratives réservées aux agents autorisés | à concevoir |
| F71 | 1140 | 500 arrivants sans e-mail et de langues différentes | à concevoir |
| F61 | 1080 | Rapide sur des appareils peu puissants | mode léger de la maquette (`NT.leger`) |
| F65 | 1110 | Soumettre des décisions à l'avis des habitants | à concevoir |
| F66 | 740 | Donner son avis sur un projet (sans vote officiel) | à concevoir |
| F67 | 740 | Consulter les projets en cours | à concevoir |
| F68 | 370 | Proposer des idées | à concevoir |
| F52 | 660 | Soutenir une demande déjà déposée | `public/soutenir.html` |
| F57 | 700 | Évaluer la performance environnementale | `src/modules/sobriete.js`, `public/sobriete.html` |
| F39 | 600 | Prendre rendez-vous avec un agent | `public/rendez-vous.html` |
| F40 | 300 | Rappel avant un rendez-vous | `public/rendez-vous.html` |
| F36 | 580 | Horaires et infos des transports | `public/transports.html` |
| F72 | 380 | Services utiles selon ma situation d'arrivant | à concevoir |

Les tickets Multica de ces demandes existent peut-être déjà sans branche : vérifier avant de commencer pour éviter un doublon.

## 3. Direction artistique « Future Teal »

`main` utilise déjà la base Future Teal (`client/src/index.css`). Il reste à aligner :

- [ ] tout en bleu et sarcelle : remplacer l'accent violet (`--color-accent`, `--color-flare`) par un bleu, jamais d'orange ;
- [ ] logo (emblème) affiché à côté de « Terra Nova » dans l'en-tête ;
- [ ] alertes générales : bouton lumineux et panneau latéral plutôt que bannière envahissante (à valider avec l'équipe, voir WEBC-31) ;
- [ ] image de la galaxie NGC 4639 en WebP ou AVIF (déjà en cours dans WEBC-85) ;
- [ ] pas de texte animé lettre par lettre ni de texte courbé.

## 4. Vérification avant chaque fusion

- `cd server && npx tsc --noEmit && npx eslint . && node ace test`
- `npm run build` à la racine
- parcours vérifié à 360 px et sur ordinateur
- mettre à jour le tableau des demandes dans `README.md`
