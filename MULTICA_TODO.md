# Todo Multica · Terra Nova (24H By Webcup)

Format : une issue par bloc. Champs : `role` (Lead / Backend / Frontend / QA / Docs), `priority` (urgent / high / medium / low, tirée de difficulty_level et xp_total), `status` (todo / in_review / done).
Le squelette livré couvre déjà les 10 demandes de la vague 0 : leurs issues sont en `in_review` (à vérifier et peaufiner), pas à refaire.

---

## T00 · Mettre en ligne le socle
- role: Lead
- priority: urgent
- status: todo
- description: Créer le dépôt GitHub, pousser le code, ajouter WEBCUP_API_KEY dans les variables d'environnement de l'hébergeur, déployer.
- acceptance:
  - Le dépôt contient le code sans `.env` ni base SQLite.
  - L'URL publique répond et `/agent` affiche la session API réelle (pas le message « clé absente »).
  - Les mots de passe admin et agent par défaut sont changés.

## T01 · Surveiller les vagues de l'API
- role: Lead
- priority: urgent
- status: todo
- description: Garder `/agent` ouvert, et pour chaque demande marquée « Nouveau », créer une issue sur le modèle ci-dessous (code, rôle, priorité par difficulty_level, critères tirés de message_public).
- acceptance:
  - Chaque request_code visible dans l'API a une issue Multica.
  - Les demandes Difficile/Expert sont attribuées en premier.

## D19 · Espace de travail agents + données API Terra Nova (750 XP, Difficile)
- role: Backend + Frontend
- priority: urgent
- status: in_review
- files: src/modules/agent.js, src/webcup.js, public/agent.js
- acceptance:
  - `/agent` est distinct de `/espace` et refusé (403) à un citoyen.
  - La session API (vague, prochaine vague, dernière synchro) et toutes les demandes s'affichent, triées par difficulté puis XP.
  - Une nouvelle demande apparaît sans recharger la page, avec un badge « Nouveau ».
  - La clé API n'apparaît dans aucune réponse envoyée au navigateur.

## D08 · Distinguer citoyens, agents et administrateurs (500 XP, Moyenne)
- role: Backend
- priority: high
- status: in_review
- files: src/auth.js, src/modules/admin.js
- acceptance:
  - Chaque compte a un rôle visible dans l'en-tête.
  - Un admin change le rôle d'un compte depuis `/admin` ; l'utilisateur est déconnecté et revient avec ses nouveaux droits.
  - L'inscription publique crée toujours un citoyen.

## D09 · Limiter les accès selon le profil (500 XP, Moyenne)
- role: Backend + QA
- priority: high
- status: in_review
- files: src/auth.js (requireRole)
- acceptance:
  - Citoyen : 403 sur `/agent`, `/admin`, `/actualites/publier`, `/api/webcup/*`.
  - Agent : 403 sur `/admin`.
  - Anonyme : redirection vers `/connexion` (401 sur l'API).
  - Les menus n'affichent que les liens autorisés.

## D07 · Page d'accueil hiérarchisée (500 XP, Moyenne)
- role: Frontend
- priority: high
- status: in_review
- files: src/modules/home.js, public/style.css
- acceptance:
  - Le titre dit où l'on est, les actions principales (compte, contact) sont visibles sans défiler.
  - Accès rapide aux services, aux actualités et à l'espace personnel.
  - Lisible sur mobile (360 px).

## D01 · Créer un compte habitant (250 XP, Facile)
- role: Backend + Frontend
- priority: medium
- status: in_review
- files: src/modules/accounts.js
- acceptance:
  - Formulaire nom / e-mail / mot de passe avec messages d'erreur clairs.
  - Mot de passe haché (scrypt), e-mail unique.
  - Après inscription, l'habitant arrive connecté dans son espace.

## D03 · Se connecter à son espace personnel (250 XP, Facile)
- role: Backend + Frontend
- priority: medium
- status: in_review
- files: src/modules/accounts.js, src/modules/espace.js
- acceptance:
  - Connexion / déconnexion fonctionnelles, session de 7 jours.
  - `/espace` affiche nom, e-mail, profil et la liste des démarches de l'habitant avec leur état.

## F22 · Vue des demandes des habitants pour les agents (250 XP, Facile)
- role: Frontend
- priority: medium
- status: in_review
- files: src/modules/agent.js
- acceptance:
  - Les messages D04 arrivent dans `/agent` avec un état (Reçue / En cours / Traitée).
  - Filtre par défaut « À traiter » ; les demandes qui attendent une action sont marquées visuellement.
  - L'agent change l'état et ajoute une réponse visible par l'habitant dans `/espace`.

## D04 · Contacter les services municipaux (250 XP, Facile)
- role: Backend + Frontend
- priority: medium
- status: in_review
- files: src/modules/contact.js
- acceptance:
  - Formulaire accessible connecté ou non, champs pré-remplis si connecté.
  - Page de confirmation avec numéro de suivi TN-AAAA-XXXXXX.

## D05 · Présenter les services municipaux (250 XP, Facile)
- role: Frontend + Docs
- priority: medium
- status: in_review
- files: src/modules/services.js, src/seed.js
- acceptance:
  - Liste des services avec recherche, fiche détaillée (horaires, contact) et bouton « Contacter ce service ».

## D06 · Publications de la ville (250 XP, Facile)
- role: Frontend
- priority: medium
- status: in_review
- files: src/modules/news.js
- acceptance:
  - Liste filtrable par catégorie, page de détail.
  - Seuls agents et admins peuvent publier.

## Q01 · Recette complète avant chaque vague
- role: QA
- priority: high
- status: todo
- acceptance:
  - Parcours citoyen : inscription, contact, suivi dans l'espace.
  - Parcours agent : traitement d'une demande, suivi de l'API.
  - Parcours admin : changement de rôle.
  - Aucun lien mort, rendu correct sur mobile.

## DOC1 · Documentation et présentation finale
- role: Docs
- priority: low
- status: todo
- acceptance:
  - README à jour avec la table de couverture des demandes (code → page).
  - Captures des écrans principaux pour le jury.

---

### Modèle pour les demandes des prochaines vagues

```
## <request_code> · <titre court> (<xp_total> XP, <difficulty>)
- role: <Backend | Frontend | ...>
- priority: <urgent si difficulty_level >= 3, high si 2, medium si 1>
- status: todo
- description: <message_public>
- files: src/modules/<nom>.js
- acceptance:
  - <ce que le demandeur doit pouvoir faire, une ligne par besoin>
```
