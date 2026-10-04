/* Terra Nova — F76 : « Donner mon avis » après avoir utilisé un service.
   Note de 1 à 5 + commentaire facultatif, reçu COM-xxxx affiché tout de suite (numéro, date, statut), un seul avis par
   démarche terminée (modifiable, même numéro). Le serveur vérifie la démarche, masque les coordonnées et prévient l'habitant
   quand le service répond. Chargé dans <head> (après store.js) par services.html, suivi.html, rendez-vous.html et espace.html :
   - NT.avisService.blocService(zone, serviceId) : moyenne, répartition, commentaires publics récents, « Donner mon avis » ;
   - NT.avisService.panneauDemande(zone, demande) : sur le suivi d'une demande traitée ;
   - NT.avisService.espace(zone) : « Mes avis sur les services » (statut publié / réponse du service / non publié) ;
   - NT.avisService.agents(zone) : avis à traiter, réponse et modération (agents / admins) ;
   - tout bouton [data-av-donner] (procedure, service, libellé) ouvre le formulaire dans une fenêtre. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'av.rdvCourt': 'Rendez-vous', 'av.donner': 'Donner mon avis', 'av.modifier': 'Modifier mon avis', 'av.titreDlg': 'Votre avis sur « {s} »', 'av.note': 'Votre note', 'av.n1': 'Très mauvais', 'av.n2': 'Mauvais', 'av.n3': 'Correct', 'av.n4': 'Bien', 'av.n5': 'Très bien',
      'av.commentaire': 'Votre commentaire (facultatif)', 'av.commentaireAide': 'Qu’est-ce qui s’est bien passé, que faudrait-il améliorer ? Publié sans votre nom ; les e-mails et numéros de téléphone sont masqués.',
      'av.envoyer': 'Envoyer mon avis', 'av.eNote': 'Choisissez une note de 1 à 5.', 'av.annuler': 'Annuler', 'av.fermer': 'Fermer',
      'av.recuTitre': 'Votre avis est enregistré', 'av.recuModif': 'Votre avis est modifié', 'av.numero': 'Numéro de reçu', 'av.date': 'Date', 'av.statut': 'Statut', 'av.suite': 'Vous le retrouvez dans « Mon espace » ; vous serez prévenu si le service vous répond.', 'av.voirMes': 'Voir mes avis',
      'av.masqueInfo': 'Des coordonnées ont été masquées dans votre commentaire.',
      'av.s.publie': 'Publié', 'av.s.repondu': 'Réponse du service', 'av.s.masque': 'Non publié',
      'av.surCinq': '{n} sur 5', 'av.nbAvis': '{n} avis', 'av.aucun': 'Pas encore d’avis sur ce service.', 'av.titreService': 'Avis des habitants', 'av.recents': 'Commentaires récents',
      'av.reponseDe': 'Réponse du service', 'av.unHabitant': 'Un habitant', 'av.aEvaluer': 'Vos démarches terminées avec ce service', 'av.utilise': 'J’ai utilisé ce service : donner mon avis',
      'av.connexion': 'Connectez-vous pour donner votre avis', 'av.mesTitre': 'Mes avis sur les services', 'av.mesD': 'Après une démarche terminée, votre avis aide la ville à s’améliorer. Chaque avis a un reçu.',
      'av.mesAucun': 'Vous n’avez pas encore donné d’avis.', 'av.aFaire': 'À évaluer', 'av.demande': 'Demande {id}', 'av.rdv': 'Rendez-vous du {d}', 'av.service': 'Utilisation du service',
      'av.motif': 'Motif', 'av.votreAvisDemande': 'Votre avis sur cette démarche', 'av.votreAvisD': 'Votre demande est terminée : dites-nous comment cela s’est passé (2 minutes).',
      'av.agTitre': 'Avis des habitants à traiter', 'av.agD': 'Répondez aux habitants (ils sont prévenus) et retirez de la publication un commentaire inadapté, avec un motif.',
      'av.agFiltre': 'Afficher', 'av.agSans': 'Sans réponse', 'av.agTous': 'Tous', 'av.agMasques': 'Non publiés', 'av.agAucun': 'Aucun avis dans cette liste.', 'av.agRepondre': 'Répondre', 'av.agReponse': 'Réponse du service (publique)',
      'av.agPublier': 'Publier la réponse', 'av.agMasquer': 'Ne pas publier', 'av.agMotif': 'Motif (montré à l’habitant)', 'av.agRepublier': 'Republier', 'av.agOk': 'Réponse publiée : l’habitant est prévenu.', 'av.agModOk': 'Publication mise à jour.', 'av.par': 'par {n}' },
    en: { 'av.rdvCourt': 'Appointment', 'av.donner': 'Give my feedback', 'av.modifier': 'Edit my feedback', 'av.titreDlg': 'Your feedback on “{s}”', 'av.note': 'Your rating', 'av.n1': 'Very poor', 'av.n2': 'Poor', 'av.n3': 'Fair', 'av.n4': 'Good', 'av.n5': 'Very good',
      'av.commentaire': 'Your comment (optional)', 'av.commentaireAide': 'What went well, what should improve? Published without your name; e-mails and phone numbers are hidden.',
      'av.envoyer': 'Send my feedback', 'av.eNote': 'Choose a rating from 1 to 5.', 'av.annuler': 'Cancel', 'av.fermer': 'Close',
      'av.recuTitre': 'Your feedback is recorded', 'av.recuModif': 'Your feedback is updated', 'av.numero': 'Receipt number', 'av.date': 'Date', 'av.statut': 'Status', 'av.suite': 'You will find it in “My space”; you will be notified if the service replies.', 'av.voirMes': 'See my feedback',
      'av.masqueInfo': 'Contact details were hidden in your comment.',
      'av.s.publie': 'Published', 'av.s.repondu': 'Service replied', 'av.s.masque': 'Not published',
      'av.surCinq': '{n} out of 5', 'av.nbAvis': '{n} reviews', 'av.aucun': 'No feedback on this service yet.', 'av.titreService': 'Residents’ feedback', 'av.recents': 'Recent comments',
      'av.reponseDe': 'Service reply', 'av.unHabitant': 'A resident', 'av.aEvaluer': 'Your completed procedures with this service', 'av.utilise': 'I used this service: give my feedback',
      'av.connexion': 'Log in to give your feedback', 'av.mesTitre': 'My feedback on services', 'av.mesD': 'After a completed procedure, your feedback helps the city improve. Each review has a receipt.',
      'av.mesAucun': 'You have not given any feedback yet.', 'av.aFaire': 'To review', 'av.demande': 'Request {id}', 'av.rdv': 'Appointment on {d}', 'av.service': 'Use of the service',
      'av.motif': 'Reason', 'av.votreAvisDemande': 'Your feedback on this procedure', 'av.votreAvisD': 'Your request is completed: tell us how it went (2 minutes).',
      'av.agTitre': 'Residents’ feedback to handle', 'av.agD': 'Reply to residents (they are notified) and withdraw an inappropriate comment from publication, with a reason.',
      'av.agFiltre': 'Show', 'av.agSans': 'Without reply', 'av.agTous': 'All', 'av.agMasques': 'Not published', 'av.agAucun': 'No feedback in this list.', 'av.agRepondre': 'Reply', 'av.agReponse': 'Service reply (public)',
      'av.agPublier': 'Publish the reply', 'av.agMasquer': 'Do not publish', 'av.agMotif': 'Reason (shown to the resident)', 'av.agRepublier': 'Publish again', 'av.agOk': 'Reply published: the resident is notified.', 'av.agModOk': 'Publication updated.', 'av.par': 'by {n}' },
    es: { 'av.rdvCourt': 'Cita', 'av.donner': 'Dar mi opinión', 'av.modifier': 'Modificar mi opinión', 'av.titreDlg': 'Su opinión sobre «{s}»', 'av.note': 'Su nota', 'av.n1': 'Muy mal', 'av.n2': 'Mal', 'av.n3': 'Correcto', 'av.n4': 'Bien', 'av.n5': 'Muy bien',
      'av.commentaire': 'Su comentario (opcional)', 'av.commentaireAide': '¿Qué salió bien, qué habría que mejorar? Se publica sin su nombre; los correos y teléfonos se ocultan.',
      'av.envoyer': 'Enviar mi opinión', 'av.eNote': 'Elija una nota de 1 a 5.', 'av.annuler': 'Cancelar', 'av.fermer': 'Cerrar',
      'av.recuTitre': 'Su opinión está registrada', 'av.recuModif': 'Su opinión está modificada', 'av.numero': 'Número de recibo', 'av.date': 'Fecha', 'av.statut': 'Estado', 'av.suite': 'La encontrará en «Mi espacio»; se le avisará si el servicio responde.', 'av.voirMes': 'Ver mis opiniones',
      'av.masqueInfo': 'Se han ocultado datos de contacto en su comentario.',
      'av.s.publie': 'Publicada', 'av.s.repondu': 'Respuesta del servicio', 'av.s.masque': 'No publicada',
      'av.surCinq': '{n} de 5', 'av.nbAvis': '{n} opiniones', 'av.aucun': 'Aún no hay opiniones sobre este servicio.', 'av.titreService': 'Opiniones de los habitantes', 'av.recents': 'Comentarios recientes',
      'av.reponseDe': 'Respuesta del servicio', 'av.unHabitant': 'Un habitante', 'av.aEvaluer': 'Sus trámites terminados con este servicio', 'av.utilise': 'He usado este servicio: dar mi opinión',
      'av.connexion': 'Inicie sesión para dar su opinión', 'av.mesTitre': 'Mis opiniones sobre los servicios', 'av.mesD': 'Tras un trámite terminado, su opinión ayuda a mejorar. Cada opinión tiene un recibo.',
      'av.mesAucun': 'Aún no ha dado ninguna opinión.', 'av.aFaire': 'Por valorar', 'av.demande': 'Solicitud {id}', 'av.rdv': 'Cita del {d}', 'av.service': 'Uso del servicio',
      'av.motif': 'Motivo', 'av.votreAvisDemande': 'Su opinión sobre este trámite', 'av.votreAvisD': 'Su solicitud está terminada: cuéntenos cómo fue (2 minutos).',
      'av.agTitre': 'Opiniones de los habitantes por tratar', 'av.agD': 'Responda a los habitantes (se les avisa) y retire de la publicación un comentario inadecuado, con un motivo.',
      'av.agFiltre': 'Mostrar', 'av.agSans': 'Sin respuesta', 'av.agTous': 'Todas', 'av.agMasques': 'No publicadas', 'av.agAucun': 'Ninguna opinión en esta lista.', 'av.agRepondre': 'Responder', 'av.agReponse': 'Respuesta del servicio (pública)',
      'av.agPublier': 'Publicar la respuesta', 'av.agMasquer': 'No publicar', 'av.agMotif': 'Motivo (se muestra al habitante)', 'av.agRepublier': 'Volver a publicar', 'av.agOk': 'Respuesta publicada: se ha avisado al habitante.', 'av.agModOk': 'Publicación actualizada.', 'av.par': 'por {n}' },
    ar: { 'av.rdvCourt': 'موعد', 'av.donner': 'إبداء رأيي', 'av.modifier': 'تعديل رأيي', 'av.titreDlg': 'رأيك في «{s}»', 'av.note': 'تقييمك', 'av.n1': 'سيئ جداً', 'av.n2': 'سيئ', 'av.n3': 'مقبول', 'av.n4': 'جيد', 'av.n5': 'جيد جداً',
      'av.commentaire': 'تعليقك (اختياري)', 'av.commentaireAide': 'ما الذي سار جيداً، وما الذي يجب تحسينه؟ يُنشر بدون اسمك؛ تُخفى عناوين البريد وأرقام الهاتف.',
      'av.envoyer': 'إرسال رأيي', 'av.eNote': 'اختر تقييماً من 1 إلى 5.', 'av.annuler': 'إلغاء', 'av.fermer': 'إغلاق',
      'av.recuTitre': 'تم تسجيل رأيك', 'av.recuModif': 'تم تعديل رأيك', 'av.numero': 'رقم الإيصال', 'av.date': 'التاريخ', 'av.statut': 'الحالة', 'av.suite': 'تجده في «فضائي»؛ وسيتم إعلامك إذا ردّت الخدمة.', 'av.voirMes': 'عرض آرائي',
      'av.masqueInfo': 'أُخفيت بيانات اتصال في تعليقك.',
      'av.s.publie': 'منشور', 'av.s.repondu': 'ردّ الخدمة', 'av.s.masque': 'غير منشور',
      'av.surCinq': '{n} من 5', 'av.nbAvis': '{n} آراء', 'av.aucun': 'لا توجد آراء حول هذه الخدمة بعد.', 'av.titreService': 'آراء السكان', 'av.recents': 'تعليقات حديثة',
      'av.reponseDe': 'ردّ الخدمة', 'av.unHabitant': 'أحد السكان', 'av.aEvaluer': 'إجراءاتك المنتهية مع هذه الخدمة', 'av.utilise': 'استعملت هذه الخدمة: إبداء رأيي',
      'av.connexion': 'سجّل الدخول لإبداء رأيك', 'av.mesTitre': 'آرائي حول الخدمات', 'av.mesD': 'بعد إجراء منتهٍ، يساعد رأيك المدينة على التحسن. لكل رأي إيصال.',
      'av.mesAucun': 'لم تُبدِ أي رأي بعد.', 'av.aFaire': 'للتقييم', 'av.demande': 'الطلب {id}', 'av.rdv': 'موعد {d}', 'av.service': 'استعمال الخدمة',
      'av.motif': 'السبب', 'av.votreAvisDemande': 'رأيك في هذا الإجراء', 'av.votreAvisD': 'انتهى طلبك: أخبرنا كيف جرى الأمر (دقيقتان).',
      'av.agTitre': 'آراء السكان للمعالجة', 'av.agD': 'ردّ على السكان (يتم إعلامهم) واسحب من النشر تعليقاً غير لائق مع ذكر السبب.',
      'av.agFiltre': 'عرض', 'av.agSans': 'بدون رد', 'av.agTous': 'الكل', 'av.agMasques': 'غير منشورة', 'av.agAucun': 'لا توجد آراء في هذه القائمة.', 'av.agRepondre': 'الرد', 'av.agReponse': 'ردّ الخدمة (علني)',
      'av.agPublier': 'نشر الرد', 'av.agMasquer': 'عدم النشر', 'av.agMotif': 'السبب (يُعرض على الساكن)', 'av.agRepublier': 'إعادة النشر', 'av.agOk': 'نُشر الرد: تم إعلام الساكن.', 'av.agModOk': 'تم تحديث النشر.', 'av.par': 'بواسطة {n}' }
  });

  const t = (k, v) => NT.t(k, v);
  const e = s => NT.ui.echap(s);
  const nomService = id => { const s = NT.services.get(id); return s ? NT.i18n.choisir(s.nom) : id; };
  const ICONE_STATUT = { publie: 'ph-check-circle', repondu: 'ph-chat-circle-text', masque: 'ph-eye-slash' };
  const AV = (NT.avisService = {});

  AV.etoiles = n => `<span class="etoiles" role="img" aria-label="${e(t('av.surCinq', { n: String(n).replace('.', NT.i18n.langue === 'en' ? '.' : ',') }))}">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= Math.round(n) ? 'ph-duotone ph-star' : 'ph ph-star vide-et'}" aria-hidden="true"></i>`).join('')}</span>`;
  AV.statut = s => `<span class="av-statut av-statut-${e(s)}"><i class="ph ${ICONE_STATUT[s] || 'ph-circle'}" aria-hidden="true"></i>${e(t('av.s.' + s))}</span>`;
  const libelleDemarche = a => {
    const [type, ref] = String(a.procedure || '').split(':');
    if (type === 'demande') return t('av.demande', { id: ref }) + (a.procedureLibelle || a.libelle ? ' · ' + (a.procedureLibelle || a.libelle) : '');
    if (type === 'rdv') return (a.date ? t('av.rdv', { d: NT.ui.date(a.date) }) : t('av.rdvCourt')) + (a.libelle || a.procedureLibelle ? ' · ' + (a.libelle || a.procedureLibelle) : '');
    return t('av.service');
  };

  let resume = null;
  AV.badgeMoyenne = id => {
    if (!resume) { const r = NT.api('GET', '/api/avis-services/resume'); resume = r.statut === 200 ? r.donnees : {}; }
    const s = resume[id];
    return s && s.nombre ? `<span class="av-badge">${AV.etoiles(s.moyenne)} <strong>${e(String(s.moyenne).replace('.', ','))}</strong> <span class="doux">(${e(t('av.nbAvis', { n: s.nombre }))})</span></span>` : '';
  };

  /* ---------- Formulaire (note + commentaire) puis reçu ---------- */
  let compteur = 0;
  AV.formulaire = (zone, o) => {
    const id = 'av' + (++compteur), avant = o.avis || null;
    zone.innerHTML = `<form class="av-form" novalidate>
      <fieldset class="av-note-choix" aria-describedby="${id}-err"><legend>${e(t('av.note'))}</legend>
        ${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="${id}-note" value="${n}" ${avant && avant.note === n ? 'checked' : ''}><i class="ph-duotone ph-star" aria-hidden="true"></i><span>${n} · ${e(t('av.n' + n))}</span></label>`).join('')}
      </fieldset>
      <p class="erreur" id="${id}-err" hidden></p>
      <div class="champ"><label for="${id}-com">${e(t('av.commentaire'))}</label>
        <textarea id="${id}-com" maxlength="800" style="min-height:5rem" aria-describedby="${id}-aide">${e(avant ? avant.commentaire : '')}</textarea>
        <span class="aide" id="${id}-aide">${e(t('av.commentaireAide'))}</span></div>
      <button type="submit" class="btn btn-primaire"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${e(t('av.envoyer'))}</button>
    </form>`;
    const f = zone.querySelector('form');
    const allumer = () => { const v = +((f.querySelector('input:checked') || {}).value || 0); f.querySelectorAll('.av-note-choix label').forEach((l, i) => l.classList.toggle('allume', i < v)); };
    f.addEventListener('change', () => { allumer(); f.querySelector('#' + id + '-err').hidden = true; });
    allumer();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      const c = f.querySelector('input:checked');
      if (!c) { const er = f.querySelector('#' + id + '-err'); er.textContent = t('av.eNote'); er.hidden = false; f.querySelector('input[type=radio]').focus(); return; }
      const r = NT.api('POST', '/api/avis-services', { procedure: o.procedure, note: +c.value, commentaire: f.querySelector('textarea').value });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); return; }
      resume = null;
      AV.recu(zone, r.donnees);
      if (o.apres) o.apres(r.donnees);
    });
  };
  AV.recu = (zone, rep) => {
    const a = rep.avis;
    zone.innerHTML = `<div class="av-recu" role="status" tabindex="-1">
      <p style="margin:0 0 .5rem"><i class="ph-duotone ph-check-circle" aria-hidden="true" style="color:var(--calme)"></i> <strong>${e(t(rep.modifie ? 'av.recuModif' : 'av.recuTitre'))}</strong></p>
      <dl class="dm-fiche"><dt>${e(t('av.numero'))}</dt><dd><span class="av-num">${e(a.id)}</span></dd>
        <dt>${e(t('av.date'))}</dt><dd>${e(NT.ui.dateHeure(a.maj))}</dd>
        <dt>${e(t('av.note'))}</dt><dd>${AV.etoiles(a.note)}</dd>
        <dt>${e(t('av.statut'))}</dt><dd>${AV.statut(a.statut)}</dd></dl>
      ${rep.masque ? `<p class="doux" style="margin:.5rem 0 0">${e(t('av.masqueInfo'))}</p>` : ''}
      <p style="margin:.6rem 0 0">${e(t('av.suite'))}</p>
      <p style="margin:.6rem 0 0"><a href="espace.html#mes-avis-services">${e(t('av.voirMes'))} →</a></p></div>`;
    const r = zone.querySelector('.av-recu'); r.focus();
    NT.ui.annoncer(t(rep.modifie ? 'av.recuModif' : 'av.recuTitre') + ' — ' + a.id);
  };
  // Fenêtre « Donner mon avis » (depuis un rendez-vous passé, une fiche de service, l'espace citoyen)
  AV.ouvrir = (o, declencheur) => {
    let dlg = document.getElementById('av-dlg');
    if (!dlg) { dlg = document.createElement('sl-dialog'); dlg.id = 'av-dlg'; dlg.style.setProperty('--width', 'min(34rem, 100vw)'); document.body.append(dlg); }
    dlg.label = t('av.titreDlg', { s: nomService(o.serviceId) });
    dlg.innerHTML = `<p class="doux" style="margin-top:0">${e(libelleDemarche(o))}</p><div class="av-dlg-zone"></div><sl-button slot="footer" class="av-fermer">${e(t('av.fermer'))}</sl-button>`;
    AV.formulaire(dlg.querySelector('.av-dlg-zone'), o);
    dlg.querySelector('.av-fermer').addEventListener('click', () => dlg.hide());
    dlg.addEventListener('sl-after-hide', ev => { if (ev.target !== dlg) return; if (o.apres) o.apres(); if (declencheur && document.body.contains(declencheur)) declencheur.focus(); }, { once: true });
    customElements.whenDefined('sl-dialog').then(() => dlg.show());
  };
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-av-donner]'); if (!b) return;
    let avis = null; try { avis = b.dataset.avAvis ? JSON.parse(b.dataset.avAvis) : null; } catch (x) { avis = null; }
    AV.ouvrir({ procedure: b.dataset.avDonner, serviceId: b.dataset.avService, libelle: b.dataset.avLibelle || '', date: b.dataset.avDate || '', avis, apres: AV._apres }, b);
  });
  const bouton = (d, avis) => `<button type="button" class="btn${avis ? '' : ' btn-primaire'}" data-av-donner="${e(d.procedure)}" data-av-service="${e(d.serviceId)}" data-av-libelle="${e(d.libelle || d.procedureLibelle || '')}" data-av-date="${e(d.date || '')}"${avis ? ` data-av-avis="${e(JSON.stringify({ note: avis.note, commentaire: avis.commentaire }))}"` : ''}><i class="ph ph-star" aria-hidden="true"></i>${e(t(avis ? 'av.modifier' : 'av.donner'))}</button>`;
  AV.bouton = bouton;
  // Bouton pour une démarche précise (ex. rendez-vous passé) : « Donner mon avis » ou « Modifier mon avis » si déjà donné
  let mesCache = null;
  AV.boutonPour = procedure => {
    if (!NT.auth.aRole('citoyen')) return '';
    if (!mesCache) { const r = NT.api('GET', '/api/avis-services/moi'); mesCache = r.statut === 200 ? r.donnees : { demarches: [], avis: [] }; }
    const d = mesCache.demarches.find(x => x.procedure === procedure);
    if (!d) return '';
    return bouton(d, mesCache.avis.find(a => a.procedure === procedure) || null);
  };
  AV.oublier = () => { mesCache = null; };

  const ligneAvis = (a, opts) => `<li>
    <div class="ligne entre"><span>${AV.etoiles(a.note)} ${opts && opts.public ? `<span class="av-meta">${e(t('av.unHabitant'))} · ${e(NT.ui.date(a.date))}</span>` : `<strong class="av-num" style="font-size:.95rem">${e(a.id)}</strong>`}</span>${opts && opts.public ? '' : AV.statut(a.statut)}</div>
    ${opts && !opts.public ? `<p class="av-meta">${e(nomService(a.serviceId))} · ${e(libelleDemarche(a))} · ${e(NT.ui.dateHeure(a.maj))}</p>` : ''}
    ${a.commentaire ? `<p>${e(a.commentaire)}</p>` : ''}
    ${a.statut === 'masque' && a.motifModeration ? `<p class="av-meta">${e(t('av.motif'))} : ${e(a.motifModeration)}</p>` : ''}
    ${a.reponse ? `<p class="av-reponse"><strong>${e(t('av.reponseDe'))}</strong>${a.reponse.par ? ` <span class="av-meta">${e(t('av.par', { n: a.reponse.service || '' }))} · ${e(NT.ui.date(a.reponse.date))}</span>` : ''}<br>${e(a.reponse.texte)}</p>` : ''}
    ${opts && opts.modifiable ? `<p style="margin-top:.5rem">${bouton(a, a)}</p>` : ''}
  </li>`;

  /* ---------- Fiche d'un service ---------- */
  AV.blocService = (zone, serviceId) => {
    if (!zone) return;
    const r = NT.api('GET', '/api/avis-services/service/' + encodeURIComponent(serviceId));
    if (r.statut !== 200) { zone.innerHTML = ''; return; }
    const d = r.donnees, u = NT.auth.utilisateur();
    const total = d.repartition.reduce((a, b) => a + b, 0) || 1;
    let actions = '';
    if (!u) actions = `<p><a class="btn" href="connexion.html?retour=${encodeURIComponent('services.html#' + serviceId)}"><i class="ph ph-sign-in" aria-hidden="true"></i>${e(t('av.connexion'))}</a></p>`;
    else if (u.role === 'citoyen') {
      const aEval = d.aEvaluer || [], mes = d.mesAvis || [];
      actions = (aEval.length ? `<h4 class="as-h4">${e(t('av.aEvaluer'))}</h4><ul class="av-liste">${aEval.map(x => `<li><div class="ligne entre"><span>${e(libelleDemarche(x))}</span>${bouton(x)}</div></li>`).join('')}</ul>` : '')
        + (mes.length ? `<h4 class="as-h4">${e(t('av.mesTitre'))}</h4><ul class="av-liste">${mes.map(a => ligneAvis(a, { modifiable: true })).join('')}</ul>` : '')
        + (!mes.length && !aEval.length ? `<p style="margin-top:.7rem">${bouton({ procedure: 'service:' + serviceId, serviceId })}</p>` : '');
    } else actions = `<p><a href="services.html#av-h-agents" data-av-agents>${e(t('av.agTitre'))} →</a></p>`;
    zone.innerHTML = `<section class="av-service" aria-labelledby="av-h-${e(serviceId)}"><h3 class="sv-h3" id="av-h-${e(serviceId)}">${e(t('av.titreService'))}</h3>
      ${d.nombre ? `<div class="av-resume"><span class="av-moyenne">${e(String(d.moyenne).replace('.', ','))}</span>${AV.etoiles(d.moyenne)}<span class="doux">${e(t('av.nbAvis', { n: d.nombre }))}</span></div>
        <ul class="av-barres">${[5, 4, 3, 2, 1].map(n => `<li><span>${n} ★</span><span class="barre"><span style="width:${Math.round(100 * d.repartition[n - 1] / total)}%"></span></span><span>${d.repartition[n - 1]}</span></li>`).join('')}</ul>
        ${d.recents.length ? `<h4 class="as-h4">${e(t('av.recents'))}</h4><ul class="av-liste">${d.recents.map(a => ligneAvis(a, { public: true })).join('')}</ul>` : ''}`
        : `<p class="doux">${e(t('av.aucun'))}</p>`}
      ${actions}</section>`;
    AV._apres = () => AV.blocService(zone, serviceId);
  };

  /* ---------- Suivi d'une demande traitée ---------- */
  AV.panneauDemande = (zone, dem) => {
    const u = NT.auth.utilisateur();
    if (!zone || !u || u.role !== 'citoyen' || dem.userId !== u.id || !['traitee', 'cloturee'].includes(dem.statut) || !dem.serviceId) return;
    const r = NT.api('GET', '/api/avis-services/moi');
    if (r.statut !== 200) return;
    const proc = 'demande:' + dem.id, avis = r.donnees.avis.find(a => a.procedure === proc);
    zone.innerHTML = `<section class="panneau dm-panneau" style="margin-top:1.5rem" aria-labelledby="h-avis-dem">
      <h2 id="h-avis-dem" style="font-size:1.2rem"><i class="ph-duotone ph-star" aria-hidden="true"></i> ${e(t('av.votreAvisDemande'))}</h2>
      <div class="av-zone-dem"></div></section>`;
    const z = zone.querySelector('.av-zone-dem');
    if (avis) z.innerHTML = `<ul class="av-liste">${ligneAvis(avis, { modifiable: true })}</ul>`;
    else { z.innerHTML = `<p class="doux" style="margin-top:0">${e(t('av.votreAvisD'))}</p><div></div>`; AV.formulaire(z.lastElementChild, { procedure: proc, serviceId: dem.serviceId }); }
    AV._apres = () => AV.panneauDemande(zone, dem);
  };

  /* ---------- Espace citoyen : mes avis et démarches à évaluer ---------- */
  AV.espace = zone => {
    if (!zone) return;
    const r = NT.api('GET', '/api/avis-services/moi');
    if (r.statut !== 200) return;
    const d = r.donnees;
    zone.hidden = false;
    zone.innerHTML = `<div class="titre-section"><div><h2 id="t-mes-avis">${e(t('av.mesTitre'))}</h2><p>${e(t('av.mesD'))}</p></div></div>
      <div class="grille-2">
        <div><h3>${e(t('av.aFaire'))} (${d.aEvaluer.length})</h3>${d.aEvaluer.length ? `<ul class="av-liste">${d.aEvaluer.map(x => `<li><strong>${e(nomService(x.serviceId))}</strong><p class="av-meta">${e(libelleDemarche(x))}</p><p style="margin-top:.5rem">${bouton(x)}</p></li>`).join('')}</ul>` : `<p class="doux">—</p>`}</div>
        <div><h3>${e(t('av.mesTitre'))} (${d.avis.length})</h3>${d.avis.length ? `<ul class="av-liste">${d.avis.map(a => ligneAvis(a, { modifiable: true })).join('')}</ul>` : `<p class="vide">${e(t('av.mesAucun'))}</p>`}</div>
      </div>`;
    AV._apres = () => AV.espace(zone);
  };

  /* ---------- Agents : répondre et modérer ---------- */
  AV.agents = zone => {
    if (!zone || !NT.auth.aRole('agent', 'admin')) return;
    let filtre = 'sans';
    zone.hidden = false;
    const rendre = () => {
      const r = NT.api('GET', '/api/avis-services');
      const tous = r.statut === 200 ? r.donnees : [];
      const l = tous.filter(a => (filtre === 'sans' ? !a.reponse && a.statut !== 'masque' : filtre === 'masques' ? a.statut === 'masque' : true));
      const n = tous.filter(a => !a.reponse && a.statut !== 'masque').length;
      zone.innerHTML = `<h2 id="av-h-agents"><i class="ph-duotone ph-chat-circle-text" aria-hidden="true"></i> ${e(t('av.agTitre'))} <span class="pastille-n">${n}</span></h2>
        <p class="doux">${e(t('av.agD'))}</p>
        <div class="sv-filtres" role="group" aria-label="${e(t('av.agFiltre'))}"><span class="sv-boutons">${[['sans', 'av.agSans'], ['tous', 'av.agTous'], ['masques', 'av.agMasques']].map(([k, c]) => `<button type="button" class="sv-filtre" data-av-filtre="${k}" aria-pressed="${filtre === k}">${e(t(c))}</button>`).join('')}</span></div>
        ${l.length ? `<ul class="av-liste" style="margin-top:.8rem">${l.slice(0, 20).map(a => `<li data-av-id="${e(a.id)}">
          <div class="ligne entre"><span>${AV.etoiles(a.note)} <strong>${e(a.id)}</strong> · ${e(nomService(a.serviceId))}</span>${AV.statut(a.statutHabitant)}</div>
          <p class="av-meta">${e(a.auteur)} · ${e(libelleDemarche(a))} · ${e(NT.ui.dateHeure(a.maj))}</p>
          ${a.commentaire ? `<p>${e(a.commentaire)}</p>` : ''}
          ${a.reponse ? `<p class="av-reponse"><strong>${e(t('av.reponseDe'))}</strong> <span class="av-meta">${e(t('av.par', { n: a.reponse.par }))}</span><br>${e(a.reponse.texte)}</p>` : ''}
          <details style="margin-top:.5rem"><summary>${e(t('av.agRepondre'))}</summary>
            <div class="champ"><label for="rep-${e(a.id)}">${e(t('av.agReponse'))}</label><textarea id="rep-${e(a.id)}" maxlength="1000" style="min-height:4rem">${e(a.reponse ? a.reponse.texte : '')}</textarea></div>
            <button type="button" class="btn btn-primaire" data-av-rep="${e(a.id)}"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${e(t('av.agPublier'))}</button>
            ${a.statut === 'masque' ? `<button type="button" class="btn" data-av-mod="${e(a.id)}" data-statut="publie">${e(t('av.agRepublier'))}</button>`
              : `<div class="champ"><label for="mot-${e(a.id)}">${e(t('av.agMotif'))}</label><input id="mot-${e(a.id)}" maxlength="300"></div><button type="button" class="btn btn-danger" data-av-mod="${e(a.id)}" data-statut="masque"><i class="ph ph-eye-slash" aria-hidden="true"></i>${e(t('av.agMasquer'))}</button>`}
          </details></li>`).join('')}</ul>` : `<p class="vide">${e(t('av.agAucun'))}</p>`}`;
    };
    zone.addEventListener('click', ev => {
      const f = ev.target.closest('[data-av-filtre]'); if (f) { filtre = f.dataset.avFiltre; rendre(); zone.querySelector(`[data-av-filtre="${filtre}"]`).focus(); return; }
      const b = ev.target.closest('[data-av-rep]');
      if (b) { const r = NT.api('POST', '/api/avis-services/' + encodeURIComponent(b.dataset.avRep) + '/repondre', { reponse: zone.querySelector('#rep-' + CSS.escape(b.dataset.avRep)).value }); if (r.statut !== 200) return NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); NT.ui.toast(t('av.agOk'), 'success'); resume = null; rendre(); return; }
      const m = ev.target.closest('[data-av-mod]');
      if (m) { const mot = zone.querySelector('#mot-' + CSS.escape(m.dataset.avMod)); const r = NT.api('POST', '/api/avis-services/' + encodeURIComponent(m.dataset.avMod) + '/moderer', { statut: m.dataset.statut, motif: mot ? mot.value : '' }); if (r.statut !== 200) return NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); NT.ui.toast(t('av.agModOk'), 'success'); resume = null; rendre(); }
    });
    rendre();
  };

  NT.pret(() => {
    AV.agents(document.getElementById('sv-avis-agents'));
    AV.espace(document.getElementById('mes-avis-services'));
    const cible = { '#av-h-agents': 'av-h-agents', '#mes-avis-services': 't-mes-avis' }[location.hash];
    if (cible) requestAnimationFrame(() => { const h = document.getElementById(cible); if (h) { h.setAttribute('tabindex', '-1'); h.scrollIntoView(); h.focus({ preventScroll: true }); } });
    document.addEventListener('click', ev => { if (ev.target.closest('[data-av-agents]')) { const d = document.getElementById('sv-detail'); if (d && d.open) d.hide(); } });
  });
})();
