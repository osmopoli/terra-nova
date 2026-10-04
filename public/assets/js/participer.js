/* Vague 12 — Participer : consultations du Haut Conseil (F65), avis consultatifs sur les projets (F66),
   projets de la ville (F67) et idées des habitants (F68).
   Lecture : GET /api/participation (ce que le profil peut voir). Écritures contrôlées par le serveur (src/modules/participation.js).
   Aussi chargé par espace.html : NT.participation.espace() affiche « Ma participation » (reçus d'avis, idées). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {
      'par.q.Centre': 'Centre', 'par.q.Nord': 'Nord', 'par.q.Sud': 'Sud', 'par.q.Est': 'Est', 'par.q.Ouest': 'Ouest',
      'par.titre': 'Participer à la vie de Terra Nova', 'par.sommaire': 'Sur cette page', 'par.consultations': 'Consultations', 'par.projets': 'Projets de la ville', 'par.idees': 'Proposer une idée',
      'par.ouvertes': 'En cours', 'par.terminees': 'Terminées : résultats et décisions', 'par.aucuneOuverte': 'Aucune consultation en cours pour le moment.', 'par.aucuneTerminee': 'Aucune consultation terminée.',
      'par.consultatifT': 'Avis consultatif, pas un vote officiel.', 'par.consultatifCourt': 'Avis consultatif, pas un vote officiel',
      'par.type.decision': 'Décision de la ville', 'par.type.projet': 'Avis sur un projet',
      'par.etat.ouverte': 'Ouverte', 'par.etat.close': 'Close · décision attendue', 'par.etat.decidee': 'Décision publiée',
      'par.question': 'La question', 'par.contexte': 'Pour comprendre', 'par.decideur': 'Qui décide', 'par.echeance': 'Date limite', 'par.quartierConcerne': 'Quartier concerné', 'par.participation': 'Participation', 'par.projetLie': 'Projet concerné',
      'par.joursRestants': '{d} · plus que {n} jours', 'par.jourRestant': '{d} · dernier jour', 'par.termineeLe': 'Terminée le {d}',
      'par.nParticipants': '{n} habitants ont donné leur avis', 'par.nParticipant1': '1 habitant a donné son avis', 'par.nParticipant0': 'Personne n’a encore donné son avis',
      'par.toutLaVille': 'Toute la ville',
      'par.opt.favorable': 'Favorable', 'par.opt.mitige': 'Mitigé', 'par.opt.defavorable': 'Défavorable',
      'par.votreReponse': 'Votre réponse', 'par.com': 'Commentaire (facultatif)', 'par.comAide': 'Ce que vous voulez que les décideurs sachent. 500 caractères maximum. Lu sans votre nom.',
      'par.envoyerAvis': 'Envoyer mon avis', 'par.enregistrerModif': 'Enregistrer la modification', 'par.modifier': 'Modifier mon avis', 'par.annuler': 'Annuler',
      'par.rappelForm': 'Vous pourrez modifier votre avis jusqu’à la date limite.', 'par.choisir': 'Choisissez une réponse avant d’envoyer.',
      'par.recuT': 'Votre avis est enregistré', 'par.recuNum': 'Numéro de reçu', 'par.recuDate': 'Date', 'par.recuModifie': 'modifié le {d}', 'par.recuReponse': 'Votre réponse', 'par.recuCom': 'Votre commentaire',
      'par.recuModifiable': 'Vous pouvez le modifier jusqu’au {d}. Il est aussi visible dans votre espace, avec une notification dans votre cloche.',
      'par.recuFige': 'La consultation est close : votre avis ne peut plus être modifié.',
      'par.okAvis': 'Avis {id} enregistré. Une notification a été ajoutée à votre cloche.', 'par.okModif': 'Avis {id} modifié : votre nouvelle réponse remplace la précédente.',
      'par.connexionAvis': 'Se connecter pour donner mon avis', 'par.personnelAvis': 'Le personnel municipal ne donne pas d’avis : il suit les réponses et publie la décision.',
      'par.resultats': 'Résultats', 'par.resultatsProvisoires': 'Résultats provisoires (visibles par le personnel uniquement jusqu’à la clôture)', 'par.nAvis': '{n} avis · {p} %',
      'par.resultatsCaches': 'Les résultats seront publiés à la clôture, pour que chacun réponde librement.',
      'par.decisionDe': 'Décision du {qui}', 'par.publieeLe': 'Publiée le {d} par {p}', 'par.priseEnCompte': 'Comment vos avis ont été pris en compte',
      'par.attente': 'Le {qui} prépare sa décision. Vous serez prévenu dès sa publication.',
      'par.commentaires': 'Commentaires des habitants ({n})', 'par.aucunCom': 'Aucun commentaire.',
      'par.clore': 'Clore la consultation', 'par.cloreConfirm': 'Clore cette consultation ? Les habitants ne pourront plus donner ni modifier leur avis.', 'par.close': 'Consultation close, les participants sont prévenus.',
      'par.publierT': 'Publier la décision', 'par.decisionTexte': 'Décision finale', 'par.decisionAide': 'Ce qui est décidé, en phrases simples.', 'par.priseAide': 'Ce que les avis ont changé : chiffres clés, remarques retenues, ce qui n’a pas pu l’être et pourquoi.',
      'par.publier': 'Publier et prévenir les participants', 'par.publiee': 'Décision publiée, les participants sont prévenus.',
      'par.nouvelle': 'Ouvrir une nouvelle consultation', 'par.nouvelleD': 'Réservé aux agents et administrateurs. L’ouverture est inscrite au journal.',
      'par.f.type': 'Type de consultation', 'par.f.projet': 'Projet concerné', 'par.f.aucunProjet': 'Aucun', 'par.f.titre': 'Titre court', 'par.f.question': 'Question posée aux habitants', 'par.f.contexte': 'Contexte (pour comprendre sans connaissance technique)',
      'par.f.options': 'Réponses possibles (une par ligne, de 2 à 6)', 'par.f.optionsAide': 'Pour un avis sur un projet, les réponses sont : favorable, mitigé, défavorable.', 'par.f.quartier': 'Quartier concerné', 'par.f.decideur': 'Qui décide',
      'par.f.echeance': 'Date limite', 'par.f.ouvrir': 'Ouvrir la consultation', 'par.f.ok': 'Consultation {id} ouverte.',
      'par.quartier': 'Quartier', 'par.statut': 'État du projet', 'par.tousQuartiers': 'Tous les quartiers', 'par.tousStatuts': 'Tous les états',
      'par.p.etude': 'À l’étude', 'par.p.travaux': 'En travaux', 'par.p.termine': 'Terminé',
      'par.nProjets': '{n} projets', 'par.nProjet1': '1 projet', 'par.aucunProjet': 'Aucun projet ne correspond. Essayez un autre quartier ou un autre état.',
      'par.avancement': 'Avancement', 'par.avancementDe': 'Avancement : {n} %', 'par.budget': 'Budget', 'par.prochaine': 'Prochaine étape', 'par.debut': 'Début', 'par.finPrevue': 'Fin prévue', 'par.finLe': 'Terminé le', 'par.maj': 'Dernière mise à jour',
      'par.donnerAvis': 'Donner mon avis', 'par.voirDecision': 'Voir la décision', 'par.voirResultats': 'Voir les résultats', 'par.historique': 'Historique ({n} étapes)',
      'par.majProjet': 'Mettre à jour l’avancement', 'par.f.avancement': 'Avancement (%)', 'par.f.prochaine': 'Prochaine étape', 'par.f.note': 'Ce qui a changé (visible par les habitants)', 'par.f.enregistrer': 'Enregistrer', 'par.projetMaj': 'Projet mis à jour.',
      'par.mesIdees': 'Mes idées', 'par.ideesRecues': 'Idées reçues à traiter', 'par.ideesPubliques': 'Idées déjà étudiées',
      'par.i.titre': 'Titre de votre idée', 'par.i.titreAide': 'En quelques mots. Exemple : « Des bancs à l’ombre au parc ».', 'par.i.description': 'Description', 'par.i.descriptionAide': 'Ce que vous proposez et pourquoi (20 caractères minimum).',
      'par.i.quartier': 'Quartier concerné', 'par.i.categorie': 'Catégorie', 'par.i.envoyer': 'Envoyer mon idée',
      'par.c.cadre': 'Cadre de vie', 'par.c.mobilite': 'Déplacements', 'par.c.environnement': 'Environnement', 'par.c.culture': 'Culture et loisirs', 'par.c.solidarite': 'Solidarité', 'par.c.numerique': 'Numérique', 'par.c.autre': 'Autre',
      'par.s.recue': 'Reçue', 'par.s.etude': 'À l’étude', 'par.s.retenue': 'Retenue', 'par.s.non_retenue': 'Non retenue',
      'par.errTitre': 'Donnez un titre à votre idée (5 caractères minimum).', 'par.errDescription': 'Décrivez votre idée en quelques phrases (20 caractères minimum).', 'par.resume1': 'Un point à corriger :', 'par.resumeN': '{n} points à corriger :',
      'par.okIdeeT': 'Votre idée est enregistrée', 'par.okIdeeNum': 'Numéro de suivi', 'par.okIdeeSuite': 'Prochaine étape : le Service Projets l’étudie. Vous serez prévenu à chaque changement de statut.', 'par.okIdeeOu': 'Elle apparaît dans « Mes idées » ci-dessous et dans votre espace.',
      'par.connexionIdee': 'Connectez-vous avec un compte habitant pour proposer une idée et suivre sa réponse.', 'par.seConnecter': 'Se connecter', 'par.creer': 'Créer un compte',
      'par.aucuneIdee': 'Vous n’avez pas encore proposé d’idée.', 'par.aucuneIdeeRecue': 'Aucune idée reçue.', 'par.aucuneIdeePublique': 'Aucune idée étudiée pour l’instant.',
      'par.reponseVille': 'Réponse de la ville', 'par.pourquoiNon': 'Pourquoi elle n’est pas retenue', 'par.envoyeeLe': 'Envoyée le {d}', 'par.par': 'par {p}', 'par.auteur': 'Proposée par {p}',
      'par.suiteIdee': 'Prochaine étape : décision du Service Projets', 'par.i.statut': 'Nouveau statut', 'par.i.motif': 'Message à l’habitant', 'par.i.motifAide': 'Obligatoire si l’idée n’est pas retenue : expliquez pourquoi.',
      'par.i.traiter': 'Enregistrer et prévenir l’habitant', 'par.i.errMotif': 'Expliquez à l’habitant pourquoi son idée n’est pas retenue (10 caractères minimum).', 'par.i.ok': 'Idée {id} : statut enregistré, l’habitant est prévenu.',
      'par.erreur': 'L’action n’a pas pu être enregistrée. Réessayez.',
      'par.esp.titre': 'Ma participation', 'par.esp.d': 'Vos avis aux consultations et vos idées, avec leur reçu et leur suivi.', 'par.esp.avis': 'Mes avis', 'par.esp.idees': 'Mes idées',
      'par.esp.aucunAvis': 'Vous n’avez encore donné aucun avis.', 'par.esp.aucuneIdee': 'Vous n’avez encore proposé aucune idée.', 'par.esp.voir': 'Tout voir dans Participer'
    },
    en: {
      'par.q.Centre': 'Centre', 'par.q.Nord': 'North', 'par.q.Sud': 'South', 'par.q.Est': 'East', 'par.q.Ouest': 'West',
      'par.titre': 'Take part in Terra Nova life', 'par.sous': 'Give your opinion on the city’s decisions and projects, follow the works in your neighbourhood and suggest your ideas. Each contribution gives you a receipt and an answer.',
      'par.sommaire': 'On this page', 'par.consultations': 'Consultations', 'par.projets': 'City projects', 'par.idees': 'Suggest an idea',
      'par.consultationsD': 'Some city decisions are submitted to residents’ opinion before being taken. Read the question, choose an answer and follow the decision.',
      'par.consultatifD': 'Your opinion informs the decision; the body named on each consultation decides, then explains how opinions were taken into account.',
      'par.ouvertes': 'Open now', 'par.terminees': 'Finished: results and decisions', 'par.aucuneOuverte': 'No open consultation at the moment.', 'par.aucuneTerminee': 'No finished consultation.',
      'par.consultatifT': 'Advisory opinion, not an official vote.', 'par.consultatifCourt': 'Advisory opinion, not an official vote',
      'par.type.decision': 'City decision', 'par.type.projet': 'Opinion on a project',
      'par.etat.ouverte': 'Open', 'par.etat.close': 'Closed · decision pending', 'par.etat.decidee': 'Decision published',
      'par.question': 'The question', 'par.contexte': 'Background', 'par.decideur': 'Who decides', 'par.echeance': 'Deadline', 'par.quartierConcerne': 'Area concerned', 'par.participation': 'Participation', 'par.projetLie': 'Related project',
      'par.joursRestants': '{d} · {n} days left', 'par.jourRestant': '{d} · last day', 'par.termineeLe': 'Ended on {d}',
      'par.nParticipants': '{n} residents gave their opinion', 'par.nParticipant1': '1 resident gave their opinion', 'par.nParticipant0': 'Nobody has given an opinion yet',
      'par.toutLaVille': 'Whole city',
      'par.opt.favorable': 'In favour', 'par.opt.mitige': 'Mixed', 'par.opt.defavorable': 'Against',
      'par.votreReponse': 'Your answer', 'par.com': 'Comment (optional)', 'par.comAide': 'What you want decision-makers to know. 500 characters maximum. Read without your name.',
      'par.envoyerAvis': 'Send my opinion', 'par.enregistrerModif': 'Save the change', 'par.modifier': 'Change my opinion', 'par.annuler': 'Cancel',
      'par.rappelForm': 'You can change your opinion until the deadline.', 'par.choisir': 'Choose an answer before sending.',
      'par.recuT': 'Your opinion is recorded', 'par.recuNum': 'Receipt number', 'par.recuDate': 'Date', 'par.recuModifie': 'changed on {d}', 'par.recuReponse': 'Your answer', 'par.recuCom': 'Your comment',
      'par.recuModifiable': 'You can change it until {d}. It is also shown in your space, with a notification in your bell.',
      'par.recuFige': 'The consultation is closed: your opinion can no longer be changed.',
      'par.okAvis': 'Opinion {id} recorded. A notification was added to your bell.', 'par.okModif': 'Opinion {id} changed: your new answer replaces the previous one.',
      'par.connexionAvis': 'Log in to give my opinion', 'par.personnelAvis': 'Municipal staff do not give opinions: they follow the answers and publish the decision.',
      'par.resultats': 'Results', 'par.resultatsProvisoires': 'Provisional results (visible to staff only until closing)', 'par.nAvis': '{n} opinions · {p} %',
      'par.resultatsCaches': 'Results will be published at closing, so that everyone answers freely.',
      'par.decisionDe': 'Decision of the {qui}', 'par.publieeLe': 'Published on {d} by {p}', 'par.priseEnCompte': 'How your opinions were taken into account',
      'par.attente': 'The {qui} is preparing its decision. You will be told as soon as it is published.',
      'par.commentaires': 'Residents’ comments ({n})', 'par.aucunCom': 'No comment.',
      'par.clore': 'Close the consultation', 'par.cloreConfirm': 'Close this consultation? Residents will no longer be able to give or change their opinion.', 'par.close': 'Consultation closed, participants have been told.',
      'par.publierT': 'Publish the decision', 'par.decisionTexte': 'Final decision', 'par.decisionAide': 'What is decided, in simple sentences.', 'par.priseAide': 'What the opinions changed: key figures, remarks kept, what could not be and why.',
      'par.publier': 'Publish and tell participants', 'par.publiee': 'Decision published, participants have been told.',
      'par.nouvelle': 'Open a new consultation', 'par.nouvelleD': 'For agents and administrators only. Opening is recorded in the audit log.',
      'par.f.type': 'Type of consultation', 'par.f.projet': 'Related project', 'par.f.aucunProjet': 'None', 'par.f.titre': 'Short title', 'par.f.question': 'Question asked to residents', 'par.f.contexte': 'Background (understandable without technical knowledge)',
      'par.f.options': 'Possible answers (one per line, 2 to 6)', 'par.f.optionsAide': 'For an opinion on a project, answers are: in favour, mixed, against.', 'par.f.quartier': 'Area concerned', 'par.f.decideur': 'Who decides',
      'par.f.echeance': 'Deadline', 'par.f.ouvrir': 'Open the consultation', 'par.f.ok': 'Consultation {id} opened.',
      'par.projetsD': 'Terra Nova’s works and projects, explained simply: where they stand, how much they cost and what comes next.', 'par.quartier': 'Neighbourhood', 'par.statut': 'Project status', 'par.tousQuartiers': 'All neighbourhoods', 'par.tousStatuts': 'All statuses',
      'par.p.etude': 'Under study', 'par.p.travaux': 'Works in progress', 'par.p.termine': 'Completed',
      'par.nProjets': '{n} projects', 'par.nProjet1': '1 project', 'par.aucunProjet': 'No project matches. Try another neighbourhood or status.',
      'par.avancement': 'Progress', 'par.avancementDe': 'Progress: {n} %', 'par.budget': 'Budget', 'par.prochaine': 'Next step', 'par.debut': 'Start', 'par.finPrevue': 'Planned end', 'par.finLe': 'Completed on', 'par.maj': 'Last update',
      'par.donnerAvis': 'Give my opinion', 'par.voirDecision': 'See the decision', 'par.voirResultats': 'See the results', 'par.historique': 'History ({n} steps)',
      'par.majProjet': 'Update progress', 'par.f.avancement': 'Progress (%)', 'par.f.prochaine': 'Next step', 'par.f.note': 'What changed (visible to residents)', 'par.f.enregistrer': 'Save', 'par.projetMaj': 'Project updated.',
      'par.ideesD': 'An idea to improve life in the colony? Send it to the Projects Department: you get a tracking number and an answer, even if it is not selected.', 'par.mesIdees': 'My ideas', 'par.ideesRecues': 'Ideas received to process', 'par.ideesRecuesD': 'Change the status of each idea: the resident is told and the action is recorded in the log.',
      'par.ideesPubliques': 'Ideas already studied', 'par.ideesPubliquesD': 'No names or contact details: only the title and the city’s answer are public.',
      'par.i.titre': 'Title of your idea', 'par.i.titreAide': 'In a few words. Example: “Shaded benches in the park”.', 'par.i.description': 'Description', 'par.i.descriptionAide': 'What you suggest and why (20 characters minimum).',
      'par.i.quartier': 'Area concerned', 'par.i.categorie': 'Category', 'par.i.envoyer': 'Send my idea',
      'par.c.cadre': 'Living environment', 'par.c.mobilite': 'Getting around', 'par.c.environnement': 'Environment', 'par.c.culture': 'Culture and leisure', 'par.c.solidarite': 'Solidarity', 'par.c.numerique': 'Digital', 'par.c.autre': 'Other',
      'par.s.recue': 'Received', 'par.s.etude': 'Under study', 'par.s.retenue': 'Selected', 'par.s.non_retenue': 'Not selected',
      'par.errTitre': 'Give your idea a title (5 characters minimum).', 'par.errDescription': 'Describe your idea in a few sentences (20 characters minimum).', 'par.resume1': 'One point to fix:', 'par.resumeN': '{n} points to fix:',
      'par.okIdeeT': 'Your idea is recorded', 'par.okIdeeNum': 'Tracking number', 'par.okIdeeSuite': 'Next step: the Projects Department studies it. You will be told at each status change.', 'par.okIdeeOu': 'It appears in “My ideas” below and in your space.',
      'par.connexionIdee': 'Log in with a resident account to suggest an idea and follow its answer.', 'par.seConnecter': 'Log in', 'par.creer': 'Create an account',
      'par.aucuneIdee': 'You have not suggested any idea yet.', 'par.aucuneIdeeRecue': 'No idea received.', 'par.aucuneIdeePublique': 'No idea studied yet.',
      'par.reponseVille': 'The city’s answer', 'par.pourquoiNon': 'Why it is not selected', 'par.envoyeeLe': 'Sent on {d}', 'par.par': 'by {p}', 'par.auteur': 'Suggested by {p}',
      'par.suiteIdee': 'Next step: decision of the Projects Department', 'par.i.statut': 'New status', 'par.i.motif': 'Message to the resident', 'par.i.motifAide': 'Required if the idea is not selected: explain why.',
      'par.i.traiter': 'Save and tell the resident', 'par.i.errMotif': 'Explain to the resident why their idea is not selected (10 characters minimum).', 'par.i.ok': 'Idea {id}: status saved, the resident has been told.',
      'par.erreur': 'The action could not be saved. Please try again.',
      'par.esp.titre': 'My participation', 'par.esp.d': 'Your opinions in consultations and your ideas, with their receipt and follow-up.', 'par.esp.avis': 'My opinions', 'par.esp.idees': 'My ideas',
      'par.esp.aucunAvis': 'You have not given any opinion yet.', 'par.esp.aucuneIdee': 'You have not suggested any idea yet.', 'par.esp.voir': 'See everything in Take part'
    },
    es: {
      'par.q.Centre': 'Centro', 'par.q.Nord': 'Norte', 'par.q.Sud': 'Sur', 'par.q.Est': 'Este', 'par.q.Ouest': 'Oeste',
      'par.titre': 'Participar en la vida de Terra Nova', 'par.sous': 'Dé su opinión sobre las decisiones y los proyectos de la ciudad, siga las obras de su barrio y proponga sus ideas. Cada participación le da un recibo y una respuesta.',
      'par.sommaire': 'En esta página', 'par.consultations': 'Consultas', 'par.projets': 'Proyectos de la ciudad', 'par.idees': 'Proponer una idea',
      'par.consultationsD': 'Algunas decisiones de la ciudad se someten a la opinión de los vecinos antes de tomarse. Lea la pregunta, elija una respuesta y siga la decisión.',
      'par.consultatifD': 'Su opinión orienta la decisión; decide el órgano indicado en cada consulta, que luego explica cómo se tuvieron en cuenta las opiniones.',
      'par.ouvertes': 'Abiertas', 'par.terminees': 'Terminadas: resultados y decisiones', 'par.aucuneOuverte': 'No hay ninguna consulta abierta por ahora.', 'par.aucuneTerminee': 'Ninguna consulta terminada.',
      'par.consultatifT': 'Opinión consultiva, no es una votación oficial.', 'par.consultatifCourt': 'Opinión consultiva, no es una votación oficial',
      'par.type.decision': 'Decisión de la ciudad', 'par.type.projet': 'Opinión sobre un proyecto',
      'par.etat.ouverte': 'Abierta', 'par.etat.close': 'Cerrada · decisión pendiente', 'par.etat.decidee': 'Decisión publicada',
      'par.question': 'La pregunta', 'par.contexte': 'Para entender', 'par.decideur': 'Quién decide', 'par.echeance': 'Fecha límite', 'par.quartierConcerne': 'Barrio afectado', 'par.participation': 'Participación', 'par.projetLie': 'Proyecto relacionado',
      'par.joursRestants': '{d} · quedan {n} días', 'par.jourRestant': '{d} · último día', 'par.termineeLe': 'Terminada el {d}',
      'par.nParticipants': '{n} vecinos dieron su opinión', 'par.nParticipant1': '1 vecino dio su opinión', 'par.nParticipant0': 'Nadie ha dado su opinión todavía',
      'par.toutLaVille': 'Toda la ciudad',
      'par.opt.favorable': 'A favor', 'par.opt.mitige': 'Dudoso', 'par.opt.defavorable': 'En contra',
      'par.votreReponse': 'Su respuesta', 'par.com': 'Comentario (opcional)', 'par.comAide': 'Lo que quiere que sepan quienes deciden. 500 caracteres como máximo. Se lee sin su nombre.',
      'par.envoyerAvis': 'Enviar mi opinión', 'par.enregistrerModif': 'Guardar el cambio', 'par.modifier': 'Cambiar mi opinión', 'par.annuler': 'Cancelar',
      'par.rappelForm': 'Podrá cambiar su opinión hasta la fecha límite.', 'par.choisir': 'Elija una respuesta antes de enviar.',
      'par.recuT': 'Su opinión está registrada', 'par.recuNum': 'Número de recibo', 'par.recuDate': 'Fecha', 'par.recuModifie': 'modificada el {d}', 'par.recuReponse': 'Su respuesta', 'par.recuCom': 'Su comentario',
      'par.recuModifiable': 'Puede cambiarla hasta el {d}. También aparece en su espacio, con una notificación en la campana.',
      'par.recuFige': 'La consulta está cerrada: su opinión ya no se puede cambiar.',
      'par.okAvis': 'Opinión {id} registrada. Se añadió una notificación a su campana.', 'par.okModif': 'Opinión {id} modificada: su nueva respuesta sustituye a la anterior.',
      'par.connexionAvis': 'Iniciar sesión para opinar', 'par.personnelAvis': 'El personal municipal no opina: sigue las respuestas y publica la decisión.',
      'par.resultats': 'Resultados', 'par.resultatsProvisoires': 'Resultados provisionales (solo visibles para el personal hasta el cierre)', 'par.nAvis': '{n} opiniones · {p} %',
      'par.resultatsCaches': 'Los resultados se publicarán al cierre, para que todos respondan libremente.',
      'par.decisionDe': 'Decisión del {qui}', 'par.publieeLe': 'Publicada el {d} por {p}', 'par.priseEnCompte': 'Cómo se tuvieron en cuenta sus opiniones',
      'par.attente': 'El {qui} prepara su decisión. Se le avisará en cuanto se publique.',
      'par.commentaires': 'Comentarios de los vecinos ({n})', 'par.aucunCom': 'Ningún comentario.',
      'par.clore': 'Cerrar la consulta', 'par.cloreConfirm': '¿Cerrar esta consulta? Los vecinos ya no podrán dar ni cambiar su opinión.', 'par.close': 'Consulta cerrada, los participantes han sido avisados.',
      'par.publierT': 'Publicar la decisión', 'par.decisionTexte': 'Decisión final', 'par.decisionAide': 'Lo que se decide, con frases sencillas.', 'par.priseAide': 'Lo que cambiaron las opiniones: cifras clave, observaciones aceptadas, lo que no se pudo y por qué.',
      'par.publier': 'Publicar y avisar a los participantes', 'par.publiee': 'Decisión publicada, los participantes han sido avisados.',
      'par.nouvelle': 'Abrir una nueva consulta', 'par.nouvelleD': 'Solo para agentes y administradores. La apertura queda en el registro.',
      'par.f.type': 'Tipo de consulta', 'par.f.projet': 'Proyecto relacionado', 'par.f.aucunProjet': 'Ninguno', 'par.f.titre': 'Título corto', 'par.f.question': 'Pregunta a los vecinos', 'par.f.contexte': 'Contexto (comprensible sin conocimientos técnicos)',
      'par.f.options': 'Respuestas posibles (una por línea, de 2 a 6)', 'par.f.optionsAide': 'Para una opinión sobre un proyecto, las respuestas son: a favor, dudoso, en contra.', 'par.f.quartier': 'Barrio afectado', 'par.f.decideur': 'Quién decide',
      'par.f.echeance': 'Fecha límite', 'par.f.ouvrir': 'Abrir la consulta', 'par.f.ok': 'Consulta {id} abierta.',
      'par.projetsD': 'Las obras y los proyectos de Terra Nova, explicados con sencillez: en qué punto están, cuánto cuestan y qué viene después.', 'par.quartier': 'Barrio', 'par.statut': 'Estado del proyecto', 'par.tousQuartiers': 'Todos los barrios', 'par.tousStatuts': 'Todos los estados',
      'par.p.etude': 'En estudio', 'par.p.travaux': 'En obras', 'par.p.termine': 'Terminado',
      'par.nProjets': '{n} proyectos', 'par.nProjet1': '1 proyecto', 'par.aucunProjet': 'Ningún proyecto coincide. Pruebe otro barrio u otro estado.',
      'par.avancement': 'Avance', 'par.avancementDe': 'Avance: {n} %', 'par.budget': 'Presupuesto', 'par.prochaine': 'Próxima etapa', 'par.debut': 'Inicio', 'par.finPrevue': 'Fin prevista', 'par.finLe': 'Terminado el', 'par.maj': 'Última actualización',
      'par.donnerAvis': 'Dar mi opinión', 'par.voirDecision': 'Ver la decisión', 'par.voirResultats': 'Ver los resultados', 'par.historique': 'Historial ({n} etapas)',
      'par.majProjet': 'Actualizar el avance', 'par.f.avancement': 'Avance (%)', 'par.f.prochaine': 'Próxima etapa', 'par.f.note': 'Qué ha cambiado (visible para los vecinos)', 'par.f.enregistrer': 'Guardar', 'par.projetMaj': 'Proyecto actualizado.',
      'par.ideesD': '¿Una idea para mejorar la vida en la colonia? Envíela al Servicio de Proyectos: recibirá un número de seguimiento y una respuesta, aunque no se acepte.', 'par.mesIdees': 'Mis ideas', 'par.ideesRecues': 'Ideas recibidas por tratar', 'par.ideesRecuesD': 'Cambie el estado de cada idea: el vecino recibe un aviso y la acción queda en el registro.',
      'par.ideesPubliques': 'Ideas ya estudiadas', 'par.ideesPubliquesD': 'Sin nombre ni datos de contacto: solo el título y la respuesta de la ciudad son públicos.',
      'par.i.titre': 'Título de su idea', 'par.i.titreAide': 'En pocas palabras. Ejemplo: «Bancos a la sombra en el parque».', 'par.i.description': 'Descripción', 'par.i.descriptionAide': 'Lo que propone y por qué (20 caracteres como mínimo).',
      'par.i.quartier': 'Barrio afectado', 'par.i.categorie': 'Categoría', 'par.i.envoyer': 'Enviar mi idea',
      'par.c.cadre': 'Entorno de vida', 'par.c.mobilite': 'Desplazamientos', 'par.c.environnement': 'Medio ambiente', 'par.c.culture': 'Cultura y ocio', 'par.c.solidarite': 'Solidaridad', 'par.c.numerique': 'Digital', 'par.c.autre': 'Otro',
      'par.s.recue': 'Recibida', 'par.s.etude': 'En estudio', 'par.s.retenue': 'Aceptada', 'par.s.non_retenue': 'No aceptada',
      'par.errTitre': 'Dé un título a su idea (5 caracteres como mínimo).', 'par.errDescription': 'Describa su idea en unas frases (20 caracteres como mínimo).', 'par.resume1': 'Un punto por corregir:', 'par.resumeN': '{n} puntos por corregir:',
      'par.okIdeeT': 'Su idea está registrada', 'par.okIdeeNum': 'Número de seguimiento', 'par.okIdeeSuite': 'Próxima etapa: el Servicio de Proyectos la estudia. Se le avisará en cada cambio de estado.', 'par.okIdeeOu': 'Aparece en «Mis ideas» más abajo y en su espacio.',
      'par.connexionIdee': 'Inicie sesión con una cuenta de vecino para proponer una idea y seguir su respuesta.', 'par.seConnecter': 'Iniciar sesión', 'par.creer': 'Crear una cuenta',
      'par.aucuneIdee': 'Todavía no ha propuesto ninguna idea.', 'par.aucuneIdeeRecue': 'Ninguna idea recibida.', 'par.aucuneIdeePublique': 'Ninguna idea estudiada por ahora.',
      'par.reponseVille': 'Respuesta de la ciudad', 'par.pourquoiNon': 'Por qué no se acepta', 'par.envoyeeLe': 'Enviada el {d}', 'par.par': 'por {p}', 'par.auteur': 'Propuesta por {p}',
      'par.suiteIdee': 'Próxima etapa: decisión del Servicio de Proyectos', 'par.i.statut': 'Nuevo estado', 'par.i.motif': 'Mensaje al vecino', 'par.i.motifAide': 'Obligatorio si la idea no se acepta: explique por qué.',
      'par.i.traiter': 'Guardar y avisar al vecino', 'par.i.errMotif': 'Explique al vecino por qué su idea no se acepta (10 caracteres como mínimo).', 'par.i.ok': 'Idea {id}: estado guardado, el vecino ha sido avisado.',
      'par.erreur': 'No se pudo guardar la acción. Inténtelo de nuevo.',
      'par.esp.titre': 'Mi participación', 'par.esp.d': 'Sus opiniones en las consultas y sus ideas, con su recibo y su seguimiento.', 'par.esp.avis': 'Mis opiniones', 'par.esp.idees': 'Mis ideas',
      'par.esp.aucunAvis': 'Todavía no ha dado ninguna opinión.', 'par.esp.aucuneIdee': 'Todavía no ha propuesto ninguna idea.', 'par.esp.voir': 'Ver todo en Participar'
    },
    ar: {
      'par.q.Centre': 'الوسط', 'par.q.Nord': 'الشمال', 'par.q.Sud': 'الجنوب', 'par.q.Est': 'الشرق', 'par.q.Ouest': 'الغرب',
      'par.titre': 'شارك في حياة تيرا نوفا', 'par.sous': 'أبدِ رأيك في قرارات المدينة ومشاريعها، وتابع أشغال حيّك، واقترح أفكارك. كل مشاركة تمنحك إيصالاً وردّاً.',
      'par.sommaire': 'في هذه الصفحة', 'par.consultations': 'الاستشارات', 'par.projets': 'مشاريع المدينة', 'par.idees': 'اقترح فكرة',
      'par.consultationsD': 'تُعرض بعض قرارات المدينة على رأي السكان قبل اتخاذها. اقرأ السؤال، واختر إجابة، وتابع القرار.',
      'par.consultatifD': 'رأيك ينير القرار؛ والجهة المذكورة في كل استشارة هي التي تقرر، ثم تشرح كيف أُخذت الآراء بعين الاعتبار.',
      'par.ouvertes': 'جارية', 'par.terminees': 'منتهية: النتائج والقرارات', 'par.aucuneOuverte': 'لا توجد استشارة جارية حالياً.', 'par.aucuneTerminee': 'لا توجد استشارة منتهية.',
      'par.consultatifT': 'رأي استشاري، وليس تصويتاً رسمياً.', 'par.consultatifCourt': 'رأي استشاري، وليس تصويتاً رسمياً',
      'par.type.decision': 'قرار المدينة', 'par.type.projet': 'رأي في مشروع',
      'par.etat.ouverte': 'مفتوحة', 'par.etat.close': 'مغلقة · في انتظار القرار', 'par.etat.decidee': 'تم نشر القرار',
      'par.question': 'السؤال', 'par.contexte': 'للفهم', 'par.decideur': 'من يقرر', 'par.echeance': 'آخر أجل', 'par.quartierConcerne': 'الحي المعني', 'par.participation': 'المشاركة', 'par.projetLie': 'المشروع المعني',
      'par.joursRestants': '{d} · بقي {n} يوماً', 'par.jourRestant': '{d} · اليوم الأخير', 'par.termineeLe': 'انتهت في {d}',
      'par.nParticipants': '{n} من السكان أبدوا رأيهم', 'par.nParticipant1': 'ساكن واحد أبدى رأيه', 'par.nParticipant0': 'لم يُبدِ أحد رأيه بعد',
      'par.toutLaVille': 'المدينة كلها',
      'par.opt.favorable': 'مؤيد', 'par.opt.mitige': 'متردد', 'par.opt.defavorable': 'معارض',
      'par.votreReponse': 'إجابتك', 'par.com': 'تعليق (اختياري)', 'par.comAide': 'ما تريد أن يعرفه أصحاب القرار. 500 حرف كحد أقصى. يُقرأ دون اسمك.',
      'par.envoyerAvis': 'إرسال رأيي', 'par.enregistrerModif': 'حفظ التعديل', 'par.modifier': 'تعديل رأيي', 'par.annuler': 'إلغاء',
      'par.rappelForm': 'يمكنك تعديل رأيك حتى آخر أجل.', 'par.choisir': 'اختر إجابة قبل الإرسال.',
      'par.recuT': 'تم تسجيل رأيك', 'par.recuNum': 'رقم الإيصال', 'par.recuDate': 'التاريخ', 'par.recuModifie': 'عُدّل في {d}', 'par.recuReponse': 'إجابتك', 'par.recuCom': 'تعليقك',
      'par.recuModifiable': 'يمكنك تعديله حتى {d}. يظهر أيضاً في فضائك، مع إشعار في الجرس.',
      'par.recuFige': 'الاستشارة مغلقة: لم يعد بالإمكان تعديل رأيك.',
      'par.okAvis': 'تم تسجيل الرأي {id}. أُضيف إشعار إلى الجرس.', 'par.okModif': 'تم تعديل الرأي {id}: إجابتك الجديدة تحل محل السابقة.',
      'par.connexionAvis': 'سجّل الدخول لإبداء رأيك', 'par.personnelAvis': 'موظفو البلدية لا يُبدون رأياً: يتابعون الإجابات وينشرون القرار.',
      'par.resultats': 'النتائج', 'par.resultatsProvisoires': 'نتائج مؤقتة (مرئية للموظفين فقط حتى الإغلاق)', 'par.nAvis': '{n} رأي · {p} %',
      'par.resultatsCaches': 'ستُنشر النتائج عند الإغلاق، ليجيب الجميع بحرية.',
      'par.decisionDe': 'قرار {qui}', 'par.publieeLe': 'نُشر في {d} من طرف {p}', 'par.priseEnCompte': 'كيف أُخذت آراؤكم بعين الاعتبار',
      'par.attente': '{qui} يُعدّ قراره. ستُبلَّغ فور نشره.',
      'par.commentaires': 'تعليقات السكان ({n})', 'par.aucunCom': 'لا توجد تعليقات.',
      'par.clore': 'إغلاق الاستشارة', 'par.cloreConfirm': 'إغلاق هذه الاستشارة؟ لن يتمكن السكان من إبداء رأيهم أو تعديله.', 'par.close': 'أُغلقت الاستشارة، وتم إبلاغ المشاركين.',
      'par.publierT': 'نشر القرار', 'par.decisionTexte': 'القرار النهائي', 'par.decisionAide': 'ما تقرر، بجمل بسيطة.', 'par.priseAide': 'ما غيّرته الآراء: أرقام أساسية، ملاحظات أُخذ بها، ما تعذّر ولماذا.',
      'par.publier': 'نشر القرار وإبلاغ المشاركين', 'par.publiee': 'نُشر القرار، وتم إبلاغ المشاركين.',
      'par.nouvelle': 'فتح استشارة جديدة', 'par.nouvelleD': 'مخصص للأعوان والمسؤولين. يُسجَّل الفتح في السجل.',
      'par.f.type': 'نوع الاستشارة', 'par.f.projet': 'المشروع المعني', 'par.f.aucunProjet': 'لا شيء', 'par.f.titre': 'عنوان قصير', 'par.f.question': 'السؤال المطروح على السكان', 'par.f.contexte': 'السياق (مفهوم دون معرفة تقنية)',
      'par.f.options': 'الإجابات الممكنة (واحدة في كل سطر، من 2 إلى 6)', 'par.f.optionsAide': 'للرأي في مشروع، الإجابات هي: مؤيد، متردد، معارض.', 'par.f.quartier': 'الحي المعني', 'par.f.decideur': 'من يقرر',
      'par.f.echeance': 'آخر أجل', 'par.f.ouvrir': 'فتح الاستشارة', 'par.f.ok': 'فُتحت الاستشارة {id}.',
      'par.projetsD': 'أشغال ومشاريع تيرا نوفا، بشرح بسيط: أين وصلت، وكم تكلف، وما الخطوة التالية.', 'par.quartier': 'الحي', 'par.statut': 'حالة المشروع', 'par.tousQuartiers': 'كل الأحياء', 'par.tousStatuts': 'كل الحالات',
      'par.p.etude': 'قيد الدراسة', 'par.p.travaux': 'قيد الإنجاز', 'par.p.termine': 'منتهٍ',
      'par.nProjets': '{n} مشاريع', 'par.nProjet1': 'مشروع واحد', 'par.aucunProjet': 'لا يوجد مشروع مطابق. جرّب حياً أو حالة أخرى.',
      'par.avancement': 'نسبة التقدم', 'par.avancementDe': 'نسبة التقدم: {n} %', 'par.budget': 'الميزانية', 'par.prochaine': 'الخطوة التالية', 'par.debut': 'البداية', 'par.finPrevue': 'النهاية المتوقعة', 'par.finLe': 'انتهى في', 'par.maj': 'آخر تحديث',
      'par.donnerAvis': 'إبداء رأيي', 'par.voirDecision': 'عرض القرار', 'par.voirResultats': 'عرض النتائج', 'par.historique': 'السجل ({n} مراحل)',
      'par.majProjet': 'تحديث نسبة التقدم', 'par.f.avancement': 'نسبة التقدم (%)', 'par.f.prochaine': 'الخطوة التالية', 'par.f.note': 'ما الذي تغيّر (مرئي للسكان)', 'par.f.enregistrer': 'حفظ', 'par.projetMaj': 'تم تحديث المشروع.',
      'par.ideesD': 'لديك فكرة لتحسين الحياة في المستعمرة؟ أرسلها إلى مصلحة المشاريع: ستحصل على رقم متابعة وردّ، حتى لو لم تُعتمد.', 'par.mesIdees': 'أفكاري', 'par.ideesRecues': 'أفكار واردة للمعالجة', 'par.ideesRecuesD': 'غيّر حالة كل فكرة: يُبلَّغ الساكن ويُسجَّل الإجراء في السجل.',
      'par.ideesPubliques': 'أفكار تمت دراستها', 'par.ideesPubliquesD': 'دون اسم أو معلومات اتصال: العنوان وردّ المدينة فقط علنيان.',
      'par.i.titre': 'عنوان فكرتك', 'par.i.titreAide': 'في كلمات قليلة. مثال: «مقاعد في الظل في الحديقة».', 'par.i.description': 'الوصف', 'par.i.descriptionAide': 'ما تقترحه ولماذا (20 حرفاً على الأقل).',
      'par.i.quartier': 'الحي المعني', 'par.i.categorie': 'الفئة', 'par.i.envoyer': 'إرسال فكرتي',
      'par.c.cadre': 'إطار العيش', 'par.c.mobilite': 'التنقل', 'par.c.environnement': 'البيئة', 'par.c.culture': 'الثقافة والترفيه', 'par.c.solidarite': 'التضامن', 'par.c.numerique': 'الرقمي', 'par.c.autre': 'أخرى',
      'par.s.recue': 'مستلمة', 'par.s.etude': 'قيد الدراسة', 'par.s.retenue': 'معتمدة', 'par.s.non_retenue': 'غير معتمدة',
      'par.errTitre': 'أعطِ فكرتك عنواناً (5 أحرف على الأقل).', 'par.errDescription': 'صف فكرتك في بضع جمل (20 حرفاً على الأقل).', 'par.resume1': 'نقطة واحدة للتصحيح:', 'par.resumeN': '{n} نقاط للتصحيح:',
      'par.okIdeeT': 'تم تسجيل فكرتك', 'par.okIdeeNum': 'رقم المتابعة', 'par.okIdeeSuite': 'الخطوة التالية: تدرسها مصلحة المشاريع. ستُبلَّغ عند كل تغيير في الحالة.', 'par.okIdeeOu': 'تظهر في «أفكاري» أدناه وفي فضائك.',
      'par.connexionIdee': 'سجّل الدخول بحساب ساكن لاقتراح فكرة ومتابعة الرد عليها.', 'par.seConnecter': 'تسجيل الدخول', 'par.creer': 'إنشاء حساب',
      'par.aucuneIdee': 'لم تقترح أي فكرة بعد.', 'par.aucuneIdeeRecue': 'لا توجد أفكار واردة.', 'par.aucuneIdeePublique': 'لا توجد أفكار مدروسة حالياً.',
      'par.reponseVille': 'ردّ المدينة', 'par.pourquoiNon': 'لماذا لم تُعتمد', 'par.envoyeeLe': 'أُرسلت في {d}', 'par.par': 'من طرف {p}', 'par.auteur': 'اقترحها {p}',
      'par.suiteIdee': 'الخطوة التالية: قرار مصلحة المشاريع', 'par.i.statut': 'الحالة الجديدة', 'par.i.motif': 'رسالة إلى الساكن', 'par.i.motifAide': 'إلزامي إذا لم تُعتمد الفكرة: اشرح السبب.',
      'par.i.traiter': 'حفظ وإبلاغ الساكن', 'par.i.errMotif': 'اشرح للساكن لماذا لم تُعتمد فكرته (10 أحرف على الأقل).', 'par.i.ok': 'الفكرة {id}: حُفظت الحالة وتم إبلاغ الساكن.',
      'par.erreur': 'تعذّر حفظ الإجراء. أعد المحاولة.',
      'par.esp.titre': 'مشاركتي', 'par.esp.d': 'آراؤك في الاستشارات وأفكارك، مع الإيصال والمتابعة.', 'par.esp.avis': 'آرائي', 'par.esp.idees': 'أفكاري',
      'par.esp.aucunAvis': 'لم تُبدِ أي رأي بعد.', 'par.esp.aucuneIdee': 'لم تقترح أي فكرة بعد.', 'par.esp.voir': 'عرض الكل في صفحة شارك'
    }
  });

  const L = (cle, vars) => NT.t(cle, vars);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const J = 864e5;
  const ETAT_CLASSE = { ouverte: 'en_cours', close: 'recue', decidee: 'traitee' };
  const PROJET_CLASSE = { etude: 'recue', travaux: 'en_cours', termine: 'traitee' };
  const IDEE_CLASSE = { recue: 'recue', etude: 'en_cours', retenue: 'traitee', non_retenue: 'cloturee' };
  const CATEGORIES = ['cadre', 'mobilite', 'environnement', 'culture', 'solidarite', 'numerique', 'autre'];
  const pastille = (classe, texte) => `<span class="statut statut-${E(classe)}">${E(texte)}</span>`;
  const quartierLbl = q => (!q || q === 'Toute la ville' ? L('par.toutLaVille') : NT.t('par.q.' + q, null, q));   // nom du quartier traduit, valeur brute en repli
  const optionLbl = (c, id) => { const o = (c.options || []).find(x => x.id === id); return c.type === 'projet' ? L('par.opt.' + id) : (o ? o.libelle : id); };
  const locale = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const euros = n => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
  const charger = () => { const r = NT.api('GET', '/api/participation'); return r.statut === 200 && r.donnees ? r.donnees : { consultations: [], projets: [], ideesPubliques: [], mesIdees: [], ideesRecues: [] }; };
  const erreurApi = r => (r.donnees && r.donnees.erreur) || L('par.erreur');

  /* ---------- Reçu d'un avis (page Participer et espace) ---------- */
  function recu(c, a) {
    const ouverte = c.etat === 'ouverte';
    return `<div class="recu-par" id="recu-${E(c.id)}" tabindex="-1">
      <p class="recu-titre"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i> <strong>${E(L('par.recuT'))}</strong></p>
      <dl class="recu-lignes">
        <div><dt>${E(L('par.recuNum'))}</dt><dd class="numero">${E(a.id)}</dd></div>
        <div><dt>${E(L('par.recuDate'))}</dt><dd>${E(NT.ui.dateHeure(a.cree))}${a.modifications ? ' · ' + E(L('par.recuModifie', { d: NT.ui.dateHeure(a.maj) })) : ''}</dd></div>
        <div><dt>${E(L('par.recuReponse'))}</dt><dd><strong>${E(optionLbl(c, a.option))}</strong></dd></div>
        ${a.commentaire ? `<div><dt>${E(L('par.recuCom'))}</dt><dd>${E(a.commentaire)}</dd></div>` : ''}
      </dl>
      <p class="doux">${E(ouverte ? L('par.recuModifiable', { d: NT.ui.date(c.echeance) }) : L('par.recuFige'))}</p>
    </div>`;
  }

  NT.participation = {
    /* « Ma participation » dans espace.html */
    espace(zone) {
      if (!zone) return;
      const r = NT.api('GET', '/api/participation/moi');
      if (r.statut !== 200 || !r.donnees) return;
      const { avis, idees } = r.donnees;
      zone.hidden = false;
      $('#liste-mes-avis', zone).innerHTML = avis.length ? avis.map(a => {
        const c = a.consultation || { id: a.consultationId, titre: a.consultationId, etat: 'close', type: 'decision', options: [] };
        const rep = c.type === 'projet' ? L('par.opt.' + a.option) : a.reponse;
        return `<li class="ligne-part"><div><a href="participer.html#${E(c.id)}"><strong>${E(c.titre)}</strong></a>
          <p class="doux">${E(a.id)} · ${E(NT.ui.date(a.cree))} · ${E(L('par.recuReponse'))} : <strong>${E(rep)}</strong></p></div>
          ${pastille(ETAT_CLASSE[c.etat], L('par.etat.' + c.etat))}</li>`;
      }).join('') : `<li class="vide">${E(L('par.esp.aucunAvis'))}</li>`;
      $('#liste-mes-idees-esp', zone).innerHTML = idees.length ? idees.map(i => `<li class="ligne-part"><div><a href="participer.html#${E(i.id)}"><strong>${E(i.titre)}</strong></a>
          <p class="doux">${E(i.id)} · ${E(NT.ui.date(i.cree))}${i.motif ? ' · ' + E(i.motif) : ''}</p></div>${pastille(IDEE_CLASSE[i.statut], L('par.s.' + i.statut))}</li>`).join('')
        : `<li class="vide">${E(L('par.esp.aucuneIdee'))}</li>`;
    }
  };

  NT.pret(() => {
    if (document.body.dataset.page !== 'participer') return;
    const u = NT.auth.utilisateur();
    const citoyen = !!u && u.role === 'citoyen';
    const staff = !!u && (u.role === 'agent' || u.role === 'admin');
    let D = charger();
    const enEdition = new Set();     // consultations dont l'habitant modifie son avis
    const brouillons = {};           // commentaires en cours de saisie (conservés au redessin)

    /* ---------- Consultations ---------- */
    function resultats(c) {
      if (!c.resultats) return c.etat === 'ouverte' ? `<p class="doux petit"><i class="ph ph-eye-slash" aria-hidden="true"></i> ${E(L('par.resultatsCaches'))}</p>` : '';
      const total = c.resultats.reduce((n, r) => n + r.n, 0);
      return `<div class="resultats-par"><h5>${E(c.etat === 'ouverte' ? L('par.resultatsProvisoires') : L('par.resultats'))}</h5>
        <ul class="barres">${c.resultats.map(r => { const p = total ? Math.round((r.n / total) * 100) : 0; return `<li>
          <div class="barre-tete"><span>${E(optionLbl(c, r.option))}</span><span class="doux">${E(L('par.nAvis', { n: r.n, p }))}</span></div>
          <div class="barre" aria-hidden="true"><span style="width:${p}%"></span></div></li>`; }).join('')}</ul></div>`;
    }
    function formulaireAvis(c) {
      const a = c.monAvis;
      const choisi = a ? a.option : '';
      const com = brouillons[c.id] !== undefined ? brouillons[c.id] : (a ? a.commentaire : '');
      return `<form class="form-avis" data-id="${E(c.id)}" novalidate>
        <fieldset><legend>${E(L('par.votreReponse'))}</legend>
          <div class="choix-liste">${c.options.map(o => `<label class="choix-par"><input type="radio" name="opt-${E(c.id)}" value="${E(o.id)}" ${o.id === choisi ? 'checked' : ''}><span>${E(optionLbl(c, o.id))}</span></label>`).join('')}</div>
        </fieldset>
        <div class="champ"><label for="com-${E(c.id)}">${E(L('par.com'))}</label>
          <textarea id="com-${E(c.id)}" data-brouillon="${E(c.id)}" maxlength="500" rows="3" aria-describedby="comaide-${E(c.id)}">${E(com)}</textarea>
          <p class="aide" id="comaide-${E(c.id)}">${E(L('par.comAide'))}</p></div>
        <p class="doux petit"><i class="ph ph-scales" aria-hidden="true"></i> ${E(L('par.consultatifCourt'))}. ${E(L('par.rappelForm'))}</p>
        <div class="ligne-actions"><button class="btn btn-primaire" type="submit"><i class="ph-duotone ph-paper-plane-tilt" aria-hidden="true"></i> ${E(a ? L('par.enregistrerModif') : L('par.envoyerAvis'))}</button>
          ${a ? `<button class="btn" type="button" data-annuler="${E(c.id)}">${E(L('par.annuler'))}</button>` : ''}</div>
      </form>`;
    }
    function actionsPersonnel(c) {
      let h = '';
      if (c.commentaires) h += `<details class="details-par"><summary>${E(L('par.commentaires', { n: c.commentaires.length }))}</summary>
        ${c.commentaires.length ? `<ul class="coms-par">${c.commentaires.map(x => `<li><span class="doux">${E(optionLbl(c, x.option))} · ${E(NT.ui.date(x.date))}</span><p>${E(x.commentaire)}</p></li>`).join('')}</ul>` : `<p class="doux">${E(L('par.aucunCom'))}</p>`}</details>`;
      if (c.etat === 'ouverte') h += `<div class="ligne-actions"><button class="btn" type="button" data-clore="${E(c.id)}"><i class="ph-duotone ph-lock-simple" aria-hidden="true"></i> ${E(L('par.clore'))}</button></div>`;
      if (c.etat === 'close') h += `<form class="form-decision gestion-par" data-id="${E(c.id)}" novalidate><h5>${E(L('par.publierT'))}</h5>
        <div class="champ"><label for="dec-${E(c.id)}">${E(L('par.decisionTexte'))}</label><textarea id="dec-${E(c.id)}" rows="3" maxlength="2000" aria-describedby="decaide-${E(c.id)}"></textarea><p class="aide" id="decaide-${E(c.id)}">${E(L('par.decisionAide'))}</p></div>
        <div class="champ"><label for="pec-${E(c.id)}">${E(L('par.priseEnCompte'))}</label><textarea id="pec-${E(c.id)}" rows="3" maxlength="2000" aria-describedby="pecaide-${E(c.id)}"></textarea><p class="aide" id="pecaide-${E(c.id)}">${E(L('par.priseAide'))}</p></div>
        <button class="btn btn-primaire" type="submit"><i class="ph-duotone ph-gavel" aria-hidden="true"></i> ${E(L('par.publier'))}</button></form>`;
      return h;
    }
    function carteConsultation(c) {
      const projet = c.projetId ? D.projets.find(p => p.id === c.projetId) : null;
      const reste = Math.ceil((Date.parse(c.echeance) - Date.now()) / J);
      const echeance = c.etat === 'ouverte' ? (reste <= 1 ? L('par.jourRestant', { d: NT.ui.date(c.echeance) }) : L('par.joursRestants', { d: NT.ui.date(c.echeance), n: reste }))
        : L('par.termineeLe', { d: NT.ui.date(c.clotureLe || c.echeance) });
      const n = c.participants;
      let zoneHabitant = '';
      if (citoyen) {
        if (c.monAvis) zoneHabitant += recu(c, c.monAvis);
        if (c.etat === 'ouverte') zoneHabitant += !c.monAvis || enEdition.has(c.id) ? formulaireAvis(c)
          : `<div class="ligne-actions"><button class="btn" type="button" data-modifier="${E(c.id)}"><i class="ph-duotone ph-pencil-simple" aria-hidden="true"></i> ${E(L('par.modifier'))}</button></div>`;
      } else if (!u && c.etat === 'ouverte') {
        zoneHabitant = `<div class="ligne-actions"><a class="btn btn-primaire" href="connexion.html?retour=${encodeURIComponent('participer.html#' + c.id)}"><i class="ph-duotone ph-sign-in" aria-hidden="true"></i> ${E(L('par.connexionAvis'))}</a></div>`;
      } else if (staff && c.etat === 'ouverte') {
        zoneHabitant = `<p class="doux petit">${E(L('par.personnelAvis'))}</p>`;
      }
      const decision = c.decision ? `<div class="decision-par"><h5><i class="ph-duotone ph-gavel" aria-hidden="true"></i> ${E(L('par.decisionDe', { qui: c.decideur }))}</h5>
          <p class="doux petit">${E(L('par.publieeLe', { d: NT.ui.date(c.decision.date), p: c.decision.par }))}</p><p>${E(c.decision.texte)}</p>
          <h5><i class="ph-duotone ph-arrows-merge" aria-hidden="true"></i> ${E(L('par.priseEnCompte'))}</h5><p>${E(c.decision.priseEnCompte)}</p></div>`
        : c.etat === 'close' ? `<p class="attente-par"><i class="ph-duotone ph-hourglass-medium" aria-hidden="true"></i> ${E(L('par.attente', { qui: c.decideur }))}</p>` : '';
      return `<li><article class="carte-par" id="${E(c.id)}" aria-labelledby="t-${E(c.id)}">
        <div class="tete-par"><div><span class="surtitre-par"><i class="ph-duotone ${c.type === 'projet' ? 'ph-crane' : 'ph-bank'}" aria-hidden="true"></i>${E(L('par.type.' + c.type))} · ${E(c.id)}</span>
          <h4 id="t-${E(c.id)}">${E(c.titre)}</h4></div>${pastille(ETAT_CLASSE[c.etat], L('par.etat.' + c.etat))}</div>
        <p class="question-par"><span class="doux">${E(L('par.question'))}</span><strong>${E(c.question)}</strong></p>
        <p class="contexte-par"><span class="doux">${E(L('par.contexte'))} · </span>${E(c.contexte)}</p>
        <dl class="faits-par">
          <div><dt>${E(L('par.decideur'))}</dt><dd>${E(c.decideur)}</dd></div>
          <div><dt>${E(L('par.echeance'))}</dt><dd>${E(echeance)}</dd></div>
          <div><dt>${E(L('par.quartierConcerne'))}</dt><dd>${E(quartierLbl(c.quartier))}</dd></div>
          <div><dt>${E(L('par.participation'))}</dt><dd>${E(n === 0 ? L('par.nParticipant0') : n === 1 ? L('par.nParticipant1') : L('par.nParticipants', { n }))}</dd></div>
          ${projet ? `<div><dt>${E(L('par.projetLie'))}</dt><dd><a href="#${E(projet.id)}">${E(projet.titre)}</a></dd></div>` : ''}
        </dl>
        <p class="mention-par"><i class="ph-duotone ph-scales" aria-hidden="true"></i>${E(L('par.consultatifCourt'))}</p>
        ${zoneHabitant}${resultats(c)}${decision}${staff ? actionsPersonnel(c) : ''}
      </article></li>`;
    }
    function rendreConsultations() {
      const ouvertes = D.consultations.filter(c => c.etat === 'ouverte');
      const terminees = D.consultations.filter(c => c.etat !== 'ouverte');
      $('#liste-ouvertes').innerHTML = ouvertes.length ? ouvertes.map(carteConsultation).join('') : `<li class="vide">${E(L('par.aucuneOuverte'))}</li>`;
      $('#liste-terminees').innerHTML = terminees.length ? terminees.map(carteConsultation).join('') : `<li class="vide">${E(L('par.aucuneTerminee'))}</li>`;
    }

    /* Création d'une consultation (personnel) */
    function rendreGestion() {
      if (!staff) return;
      const demain = new Date(Date.now() + J).toISOString().slice(0, 10);
      const dans14 = new Date(Date.now() + 14 * J).toISOString().slice(0, 10);
      $('#gestion-consultation').innerHTML = `<details class="details-par gestion-par" id="bloc-nouvelle"><summary><i class="ph-duotone ph-plus-circle" aria-hidden="true"></i> ${E(L('par.nouvelle'))}</summary>
        <p class="doux petit">${E(L('par.nouvelleD'))}</p>
        <form id="form-consult" novalidate>
          <div class="resume-erreurs" id="err-consult" role="alert"></div>
          <div class="grille-champs">
            <div class="champ"><label for="nc-type">${E(L('par.f.type'))}</label><select id="nc-type"><option value="decision">${E(L('par.type.decision'))}</option><option value="projet">${E(L('par.type.projet'))}</option></select></div>
            <div class="champ"><label for="nc-projet">${E(L('par.f.projet'))}</label><select id="nc-projet"><option value="">${E(L('par.f.aucunProjet'))}</option>${D.projets.map(p => `<option value="${E(p.id)}">${E(p.titre)}</option>`).join('')}</select></div>
          </div>
          <div class="champ"><label for="nc-titre">${E(L('par.f.titre'))}</label><input id="nc-titre" maxlength="160" autocomplete="off"></div>
          <div class="champ"><label for="nc-question">${E(L('par.f.question'))}</label><input id="nc-question" maxlength="300" autocomplete="off"></div>
          <div class="champ"><label for="nc-contexte">${E(L('par.f.contexte'))}</label><textarea id="nc-contexte" rows="3" maxlength="3000"></textarea></div>
          <div class="champ" id="champ-options"><label for="nc-options">${E(L('par.f.options'))}</label><textarea id="nc-options" rows="4" aria-describedby="nc-options-aide"></textarea><p class="aide" id="nc-options-aide">${E(L('par.f.optionsAide'))}</p></div>
          <div class="grille-champs">
            <div class="champ"><label for="nc-quartier">${E(L('par.f.quartier'))}</label><select id="nc-quartier"><option value="Toute la ville">${E(L('par.toutLaVille'))}</option>${NT.QUARTIERS.map(q => `<option value="${E(q)}">${E(quartierLbl(q))}</option>`).join('')}</select></div>
            <div class="champ"><label for="nc-decideur">${E(L('par.f.decideur'))}</label><input id="nc-decideur" value="Haut Conseil de la Ville" maxlength="120"></div>
            <div class="champ"><label for="nc-echeance">${E(L('par.f.echeance'))}</label><input id="nc-echeance" type="date" min="${demain}" value="${dans14}"></div>
          </div>
          <button class="btn btn-primaire" type="submit"><i class="ph-duotone ph-megaphone" aria-hidden="true"></i> ${E(L('par.f.ouvrir'))}</button>
        </form></details>`;
      $('#nc-type').addEventListener('change', e => { $('#nc-options').disabled = e.target.value === 'projet'; });
      $('#form-consult').addEventListener('submit', e => {
        e.preventDefault();
        const corps = { type: $('#nc-type').value, projetId: $('#nc-projet').value, titre: $('#nc-titre').value, question: $('#nc-question').value, contexte: $('#nc-contexte').value,
          options: $('#nc-options').value.split('\n').map(s => s.trim()).filter(Boolean), quartier: $('#nc-quartier').value, decideur: $('#nc-decideur').value,
          echeance: $('#nc-echeance').value ? new Date($('#nc-echeance').value + 'T23:59').toISOString() : '' };
        const r = NT.api('POST', '/api/consultations', corps);
        if (r.statut !== 200) { $('#err-consult').innerHTML = `<p><strong>${E(erreurApi(r))}</strong></p>`; return; }
        NT.ui.toast(L('par.f.ok', { id: r.donnees.id }), 'success');
        tout(r.donnees.id);
      });
    }

    /* ---------- Projets ---------- */
    function carteProjet(p) {
      const termine = p.statut === 'termine';
      const liens = (p.consultations || []).map(c => `<a class="btn ${c.etat === 'ouverte' ? 'btn-primaire' : ''}" href="#${E(c.id)}"><i class="ph-duotone ${c.etat === 'ouverte' ? 'ph-chat-circle-text' : 'ph-gavel'}" aria-hidden="true"></i> ${E(c.etat === 'ouverte' ? L('par.donnerAvis') : c.etat === 'decidee' ? L('par.voirDecision') : L('par.voirResultats'))}</a>`).join('');
      const s = p.serviceId && NT.services && NT.services.get ? NT.services.get(p.serviceId) : null;
      return `<li><article class="carte-par" id="${E(p.id)}" aria-labelledby="t-${E(p.id)}">
        <div class="tete-par"><div><span class="surtitre-par"><i class="ph ph-map-pin" aria-hidden="true"></i>${E(quartierLbl(p.quartier))}${s ? ' · ' + E(NT.i18n.choisir(s.nom)) : ''}</span>
          <h3 id="t-${E(p.id)}">${E(p.titre)}</h3></div>${pastille(PROJET_CLASSE[p.statut], L('par.p.' + p.statut))}</div>
        <p>${E(p.resume)}</p>
        <div class="avancement-par"><div class="barre-tete"><span>${E(L('par.avancement'))}</span><strong>${E(p.avancement)} %</strong></div>
          <div class="barre" role="progressbar" aria-valuenow="${E(p.avancement)}" aria-valuemin="0" aria-valuemax="100" aria-label="${E(L('par.avancementDe', { n: p.avancement }))}"><span style="width:${Number(p.avancement) || 0}%"></span></div></div>
        <dl class="faits-par">
          <div><dt>${E(L('par.budget'))}</dt><dd>${E(euros(p.budget))}</dd></div>
          <div class="large"><dt>${E(L('par.prochaine'))}</dt><dd>${E(p.prochaineEtape)}</dd></div>
          <div><dt>${E(L('par.debut'))}</dt><dd>${E(NT.ui.date(p.debut))}</dd></div>
          <div><dt>${E(termine ? L('par.finLe') : L('par.finPrevue'))}</dt><dd>${E(NT.ui.date(p.finPrevue))}</dd></div>
          <div><dt>${E(L('par.maj'))}</dt><dd>${E(NT.ui.depuis(p.majLe || p.cree))}</dd></div>
        </dl>
        ${liens ? `<div class="ligne-actions">${liens}</div>` : ''}
        <details class="details-par"><summary>${E(L('par.historique', { n: (p.historique || []).length }))}</summary>
          <ol class="etapes">${(p.historique || []).slice().reverse().map(h => `<li class="faite"><strong>${E(NT.ui.date(h.date))}</strong> · ${E(L('par.p.' + h.statut))} · ${E(h.avancement)} %<br><span>${E(h.note)}</span> <span class="doux">${E(L('par.par', { p: h.par }))}</span></li>`).join('')}</ol></details>
        ${staff ? `<details class="details-par gestion-par"><summary><i class="ph-duotone ph-pencil-simple" aria-hidden="true"></i> ${E(L('par.majProjet'))}</summary>
          <form class="form-projet" data-id="${E(p.id)}" novalidate><div class="grille-champs">
            <div class="champ"><label for="ps-${E(p.id)}">${E(L('par.statut'))}</label><select id="ps-${E(p.id)}">${['etude', 'travaux', 'termine'].map(k => `<option value="${k}" ${k === p.statut ? 'selected' : ''}>${E(L('par.p.' + k))}</option>`).join('')}</select></div>
            <div class="champ"><label for="pa-${E(p.id)}">${E(L('par.f.avancement'))}</label><input id="pa-${E(p.id)}" type="number" min="0" max="100" step="5" value="${E(p.avancement)}" inputmode="numeric"></div></div>
            <div class="champ"><label for="pe-${E(p.id)}">${E(L('par.f.prochaine'))}</label><input id="pe-${E(p.id)}" maxlength="300" value="${E(p.prochaineEtape)}"></div>
            <div class="champ"><label for="pn-${E(p.id)}">${E(L('par.f.note'))}</label><textarea id="pn-${E(p.id)}" rows="2" maxlength="500"></textarea></div>
            <button class="btn btn-primaire" type="submit">${E(L('par.f.enregistrer'))}</button></form></details>` : ''}
      </article></li>`;
    }
    function rendreProjets() {
      const q = $('#f-quartier').value, s = $('#f-statut').value;
      const l = D.projets.filter(p => (!q || p.quartier === q) && (!s || p.statut === s));
      $('#liste-projets').innerHTML = l.length ? l.map(carteProjet).join('') : `<li class="vide">${E(L('par.aucunProjet'))}</li>`;
      $('#resultat-projets').textContent = l.length === 1 ? L('par.nProjet1') : L('par.nProjets', { n: l.length });
    }

    /* ---------- Idées ---------- */
    function suiviIdee(i) {
      const final = i.statut === 'retenue' || i.statut === 'non_retenue';
      return `<ol class="etapes">${(i.historique || []).map(h => `<li class="faite"><strong>${E(L('par.s.' + h.statut))}</strong> · ${E(NT.ui.date(h.date))}${h.note ? `<br><span>${E(h.note)}</span>` : ''} <span class="doux">${E(L('par.par', { p: h.par }))}</span></li>`).join('')}
        ${final ? '' : `<li><span class="doux">${E(L('par.suiteIdee'))}</span></li>`}</ol>`;
    }
    function carteIdee(i, avecForm) {
      const motif = i.motif ? `<div class="reponse-par"><strong>${E(i.statut === 'non_retenue' ? L('par.pourquoiNon') : L('par.reponseVille'))}</strong><p>${E(i.motif)}</p></div>` : '';
      return `<li><article class="carte-par" id="${E(i.id)}" aria-labelledby="t-${E(i.id)}">
        <div class="tete-par"><div><span class="surtitre-par"><i class="ph-duotone ph-lightbulb-filament" aria-hidden="true"></i>${E(i.id)} · ${E(L('par.c.' + i.categorie))} · ${E(quartierLbl(i.quartier))}</span>
          <h4 id="t-${E(i.id)}">${E(i.titre)}</h4></div>${pastille(IDEE_CLASSE[i.statut], L('par.s.' + i.statut))}</div>
        <p class="doux petit">${E(L('par.envoyeeLe', { d: NT.ui.date(i.cree) }))}${avecForm && i.auteur ? ' · ' + E(L('par.auteur', { p: i.auteur })) : ''}</p>
        <p class="texte-par">${E(i.description)}</p>${motif}${suiviIdee(i)}
        ${avecForm ? `<form class="form-idee-statut gestion-par" data-id="${E(i.id)}" novalidate><div class="grille-champs">
          <div class="champ"><label for="is-${E(i.id)}">${E(L('par.i.statut'))}</label><select id="is-${E(i.id)}">${['recue', 'etude', 'retenue', 'non_retenue'].map(k => `<option value="${k}" ${k === i.statut ? 'selected' : ''}>${E(L('par.s.' + k))}</option>`).join('')}</select></div></div>
          <div class="champ"><label for="im-${E(i.id)}">${E(L('par.i.motif'))}</label><textarea id="im-${E(i.id)}" rows="2" maxlength="1000" aria-describedby="imaide-${E(i.id)}"></textarea><p class="aide" id="imaide-${E(i.id)}">${E(L('par.i.motifAide'))}</p></div>
          <button class="btn btn-primaire" type="submit">${E(L('par.i.traiter'))}</button></form>` : ''}
      </article></li>`;
    }
    function rendreFormIdee() {
      const zone = $('#zone-idee');
      if (staff) { zone.innerHTML = ''; return; }
      if (!u) {
        zone.innerHTML = `<div class="note-par"><p><i class="ph-duotone ph-info" aria-hidden="true"></i> ${E(L('par.connexionIdee'))}</p>
          <p class="ligne-actions"><a class="btn btn-primaire" href="connexion.html?retour=${encodeURIComponent('participer.html#idees')}">${E(L('par.seConnecter'))}</a><a class="btn" href="inscription.html">${E(L('par.creer'))}</a></p></div>`;
        return;
      }
      zone.innerHTML = `<div id="confirmation-idee" tabindex="-1"></div>
        <form id="form-idee" class="panneau form-idee" novalidate>
          <div class="resume-erreurs" id="resume-idee"></div>
          <div class="champ"><label for="i-titre">${E(L('par.i.titre'))}</label><input id="i-titre" maxlength="120" autocomplete="off" aria-describedby="i-titre-aide"><p class="aide" id="i-titre-aide">${E(L('par.i.titreAide'))}</p></div>
          <div class="champ"><label for="i-description">${E(L('par.i.description'))}</label><textarea id="i-description" rows="4" maxlength="2000" aria-describedby="i-description-aide"></textarea><p class="aide" id="i-description-aide">${E(L('par.i.descriptionAide'))}</p></div>
          <div class="grille-champs">
            <div class="champ"><label for="i-quartier">${E(L('par.i.quartier'))}</label><select id="i-quartier"><option value="Toute la ville">${E(L('par.toutLaVille'))}</option>${NT.QUARTIERS.map(q => `<option value="${E(q)}" ${q === u.quartier ? 'selected' : ''}>${E(quartierLbl(q))}</option>`).join('')}</select></div>
            <div class="champ"><label for="i-categorie">${E(L('par.i.categorie'))}</label><select id="i-categorie">${CATEGORIES.map(c => `<option value="${c}">${E(L('par.c.' + c))}</option>`).join('')}</select></div>
          </div>
          <button class="btn btn-primaire" type="submit"><i class="ph-duotone ph-paper-plane-tilt" aria-hidden="true"></i> ${E(L('par.i.envoyer'))}</button>
        </form>`;
      $('#form-idee').addEventListener('submit', envoyerIdee);
    }
    function poserErreurs(form, erreurs) {
      form.querySelectorAll('[aria-invalid]').forEach(el => { el.removeAttribute('aria-invalid'); el.setAttribute('aria-describedby', el.id + '-aide'); });
      form.querySelectorAll('.erreur[data-erreur]').forEach(p => p.remove());
      const resume = form.querySelector('.resume-erreurs');
      resume.innerHTML = '';
      if (!erreurs.length) return;
      erreurs.forEach(x => {
        const c = document.getElementById(x.id);
        c.setAttribute('aria-invalid', 'true');
        c.setAttribute('aria-describedby', `${x.id}-aide err-${x.id}`);
        const p = Object.assign(document.createElement('p'), { className: 'erreur', id: 'err-' + x.id, textContent: x.msg });
        p.dataset.erreur = '1';
        c.closest('.champ').append(p);
      });
      const n = erreurs.length;
      resume.innerHTML = `<p><strong>${E(n > 1 ? L('par.resumeN', { n }) : L('par.resume1'))}</strong></p><ul>${erreurs.map(x => `<li><a href="#${E(x.id)}">${E(x.msg)}</a></li>`).join('')}</ul>`;
      document.getElementById(erreurs[0].id).focus();
    }
    function envoyerIdee(e) {
      e.preventDefault();
      const form = e.target;
      const titre = $('#i-titre').value.trim(), description = $('#i-description').value.trim();
      const erreurs = [];
      if (titre.length < 5) erreurs.push({ id: 'i-titre', msg: L('par.errTitre') });
      if (description.length < 20) erreurs.push({ id: 'i-description', msg: L('par.errDescription') });
      poserErreurs(form, erreurs);
      if (erreurs.length) return;
      const r = NT.api('POST', '/api/idees', { titre, description, quartier: $('#i-quartier').value, categorie: $('#i-categorie').value });
      if (r.statut !== 200 || !r.donnees || !r.donnees.id) { poserErreurs(form, [{ id: 'i-description', msg: erreurApi(r) }]); return; }
      const i = r.donnees;
      form.reset();
      D = charger(); rendreIdees();
      const zone = $('#confirmation-idee');
      zone.innerHTML = `<div class="recu-par"><p class="recu-titre"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i> <strong>${E(L('par.okIdeeT'))}</strong></p>
        <dl class="recu-lignes"><div><dt>${E(L('par.okIdeeNum'))}</dt><dd class="numero">${E(i.id)}</dd></div><div><dt>${E(L('par.recuDate'))}</dt><dd>${E(NT.ui.dateHeure(i.cree))}</dd></div></dl>
        <p>${E(L('par.okIdeeSuite'))}</p><p class="doux">${E(L('par.okIdeeOu'))}</p></div>`;
      zone.focus({ preventScroll: true }); zone.scrollIntoView({ block: 'center' });
      NT.ui.annoncer(L('par.okIdeeT') + ' — ' + i.id);
    }
    function rendreIdees() {
      if (citoyen) {
        $('#mes-idees').hidden = false;
        $('#liste-mes-idees').innerHTML = D.mesIdees.length ? D.mesIdees.map(i => carteIdee(i, false)).join('') : `<li class="vide">${E(L('par.aucuneIdee'))}</li>`;
      }
      if (staff) {
        $('#idees-recues').hidden = false;
        $('#liste-idees-recues').innerHTML = D.ideesRecues.length ? D.ideesRecues.map(i => carteIdee(i, true)).join('') : `<li class="vide">${E(L('par.aucuneIdeeRecue'))}</li>`;
      }
      $('#liste-idees-publiques').innerHTML = D.ideesPubliques.length ? D.ideesPubliques.map(i => `<li class="ligne-part"><div><strong>${E(i.titre)}</strong>
          <p class="doux">${E(L('par.c.' + i.categorie))} · ${E(quartierLbl(i.quartier))}</p>${i.motif ? `<p class="petit">${E(i.motif)}</p>` : ''}</div>${pastille(IDEE_CLASSE[i.statut], L('par.s.' + i.statut))}</li>`).join('')
        : `<li class="vide">${E(L('par.aucuneIdeePublique'))}</li>`;
    }

    /* ---------- Rendu complet et cible (#CON-…, #PRJ-…, #IDE-…) ---------- */
    function cibler(id, focus) {
      document.querySelectorAll('.carte-par.cible').forEach(x => x.classList.remove('cible'));
      const el = id && document.getElementById(id);
      if (!el || !el.classList.contains('carte-par')) return;
      el.classList.add('cible');
      el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('calme') ? 'auto' : 'smooth' });
      if (focus) { const t = document.getElementById('t-' + id); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }
    }
    function tout(cible) {
      D = charger();
      rendreConsultations(); rendreProjets(); rendreIdees();
      if (cible) cibler(cible, true);
    }

    // Filtres des projets
    $('#f-quartier').innerHTML = `<option value="">${E(L('par.tousQuartiers'))}</option>` + NT.QUARTIERS.map(q => `<option value="${E(q)}">${E(quartierLbl(q))}</option>`).join('');
    $('#f-statut').innerHTML = `<option value="">${E(L('par.tousStatuts'))}</option>` + ['etude', 'travaux', 'termine'].map(k => `<option value="${k}">${E(L('par.p.' + k))}</option>`).join('');
    $('#f-quartier').addEventListener('change', rendreProjets);
    $('#f-statut').addEventListener('change', rendreProjets);

    // Brouillons de commentaire conservés au redessin
    document.addEventListener('input', e => { const b = e.target.closest && e.target.closest('[data-brouillon]'); if (b) brouillons[b.dataset.brouillon] = b.value; });

    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('[data-modifier],[data-annuler],[data-clore]');
      if (!t) return;
      if (t.dataset.modifier) { enEdition.add(t.dataset.modifier); rendreConsultations(); const r = document.querySelector(`.form-avis[data-id="${CSS.escape(t.dataset.modifier)}"] input:checked`); if (r) r.focus(); return; }
      if (t.dataset.annuler) { enEdition.delete(t.dataset.annuler); delete brouillons[t.dataset.annuler]; rendreConsultations(); const b = document.querySelector(`[data-modifier="${CSS.escape(t.dataset.annuler)}"]`); if (b) b.focus(); return; }
      if (t.dataset.clore) {
        if (!confirm(L('par.cloreConfirm'))) return;
        const r = NT.api('POST', '/api/consultations/' + encodeURIComponent(t.dataset.clore) + '/clore');
        if (r.statut !== 200) { NT.ui.toast(erreurApi(r), 'danger'); return; }
        NT.ui.toast(L('par.close'), 'success');
        tout(t.dataset.clore);
      }
    });

    document.addEventListener('submit', e => {
      const f = e.target;
      // Avis d'un habitant (création ou modification)
      if (f.classList.contains('form-avis')) {
        e.preventDefault();
        const id = f.dataset.id;
        const choix = f.querySelector('input[type=radio]:checked');
        f.querySelectorAll('.erreur[data-erreur]').forEach(p => p.remove());
        if (!choix) {
          const p = Object.assign(document.createElement('p'), { className: 'erreur', textContent: L('par.choisir') });
          p.dataset.erreur = '1'; p.setAttribute('role', 'alert');
          f.querySelector('fieldset').append(p); f.querySelector('input[type=radio]').focus(); return;
        }
        const r = NT.api('POST', '/api/consultations/' + encodeURIComponent(id) + '/avis', { option: choix.value, commentaire: f.querySelector('textarea').value.trim() });
        if (r.statut !== 200 || !r.donnees || !r.donnees.ok) { NT.ui.toast(erreurApi(r), 'danger'); if (r.statut === 409) tout(id); return; }
        enEdition.delete(id); delete brouillons[id];
        tout();
        const msg = r.donnees.modifie ? L('par.okModif', { id: r.donnees.avis.id }) : L('par.okAvis', { id: r.donnees.avis.id });
        NT.ui.toast(msg, 'success');
        const recuEl = document.getElementById('recu-' + id);
        if (recuEl) { recuEl.focus({ preventScroll: true }); recuEl.scrollIntoView({ block: 'center' }); }
        return;
      }
      // Décision (personnel)
      if (f.classList.contains('form-decision')) {
        e.preventDefault();
        const id = f.dataset.id;
        const r = NT.api('POST', '/api/consultations/' + encodeURIComponent(id) + '/decision', { decision: $('#dec-' + CSS.escape(id)).value, priseEnCompte: $('#pec-' + CSS.escape(id)).value });
        if (r.statut !== 200) { NT.ui.toast(erreurApi(r), 'danger'); return; }
        NT.ui.toast(L('par.publiee'), 'success');
        tout(id);
        return;
      }
      // Avancement d'un projet (personnel)
      if (f.classList.contains('form-projet')) {
        e.preventDefault();
        const id = f.dataset.id;
        const r = NT.api('PATCH', '/api/projets/' + encodeURIComponent(id), { statut: $('#ps-' + CSS.escape(id)).value, avancement: $('#pa-' + CSS.escape(id)).value,
          prochaineEtape: $('#pe-' + CSS.escape(id)).value, note: $('#pn-' + CSS.escape(id)).value });
        if (r.statut !== 200) { NT.ui.toast(erreurApi(r), 'danger'); return; }
        NT.ui.toast(L('par.projetMaj'), 'success');
        tout(id);
        return;
      }
      // Traitement d'une idée (personnel)
      if (f.classList.contains('form-idee-statut')) {
        e.preventDefault();
        const id = f.dataset.id;
        const statut = $('#is-' + CSS.escape(id)).value;
        const champ = $('#im-' + CSS.escape(id));
        const motif = champ.value.trim();
        f.querySelectorAll('.erreur[data-erreur]').forEach(p => p.remove());
        champ.removeAttribute('aria-invalid');
        if (statut === 'non_retenue' && motif.length < 10) {
          const p = Object.assign(document.createElement('p'), { className: 'erreur', id: 'err-im-' + id, textContent: L('par.i.errMotif') });
          p.dataset.erreur = '1'; p.setAttribute('role', 'alert');
          champ.setAttribute('aria-invalid', 'true'); champ.setAttribute('aria-describedby', `imaide-${id} err-im-${id}`);
          champ.closest('.champ').append(p); champ.focus(); return;
        }
        const r = NT.api('PATCH', '/api/idees/' + encodeURIComponent(id), { statut, motif });
        if (r.statut !== 200) { NT.ui.toast(erreurApi(r), 'danger'); return; }
        NT.ui.toast(L('par.i.ok', { id }), 'success');
        tout(id);
      }
    });

    window.addEventListener('hashchange', () => cibler(location.hash.slice(1), true));

    rendreGestion();
    rendreFormIdee();
    rendreConsultations(); rendreProjets(); rendreIdees();
    if (location.hash.length > 1) setTimeout(() => cibler(decodeURIComponent(location.hash.slice(1)), false), 50);
  });
})();
