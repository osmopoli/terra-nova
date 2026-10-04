/* Terra Nova — vague 20 (F99) : « Espace partenaire » (compte rattaché à un partenaire par l'administrateur).
   Proposer une offre ou une modification (→ vérification par un agent avant publication ; la version publiée reste en ligne),
   changer la disponibilité tout de suite (disponible / complet / suspendu, prochaine date, places restantes), répondre aux
   réservations et listes d'attente des habitants (prénom, initiale et quartier seulement). Droits contrôlés par le serveur. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ep.titre': 'Espace partenaire', 'ep.intro': 'Proposez vos offres aux habitants. Chaque nouvelle offre ou modification est vérifiée par la ville avant d’être publiée ; la disponibilité change tout de suite.',
      'ep.refus': 'Cet espace est réservé aux comptes des partenaires de la ville.', 'ep.devenir': 'Votre structure veut proposer ses services ? Écrivez à la Coordination Solidaire.', 'ep.ecrire': 'Écrire à la ville',
      'ep.suspendu': 'Votre structure est suspendue par la ville : vous ne pouvez rien publier pour le moment.', 'ep.mesOffres': 'Mes offres', 'ep.nouvelle': 'Proposer une nouvelle offre', 'ep.modifierT': 'Modifier « {t} »', 'ep.demandes': 'Demandes des habitants',
      'ep.m.publiee': 'Publiée — vérifiée par la ville le {d}', 'ep.m.en_attente': 'En attente de vérification par la ville', 'ep.m.enAttenteMaj': 'Modification en attente de vérification (la version publiée reste en ligne)', 'ep.m.refusee': 'À corriger : {m}',
      'ep.voirPublique': 'Voir comme un habitant', 'ep.modifier': 'Modifier l’offre', 'ep.dispo': 'Disponibilité (changée tout de suite)', 'ep.statut': 'État', 'ep.d.disponible': 'Disponible', 'ep.d.complet': 'Complet', 'ep.d.suspendu': 'Suspendu',
      'ep.reprise': 'Prochaine date (reprise ou prochaine session)', 'ep.places': 'Places restantes (vide = sans limite)', 'ep.note': 'Information courte pour les habitants', 'ep.majDispo': 'Mettre à jour la disponibilité', 'ep.dispoOk': 'Disponibilité mise à jour : les habitants la voient déjà.',
      'ep.f.titre': 'Titre de l’offre', 'ep.f.description': 'Description (ce que la personne obtient)', 'ep.f.public': 'Pour qui', 'ep.f.conditions': 'Conditions', 'ep.f.quartier': 'Quartier', 'ep.f.lieu': 'Lieu', 'ep.f.horaires': 'Jours et horaires',
      'ep.f.capacite': 'Nombre de places (vide = sans limite)', 'ep.f.gratuit': 'Gratuit', 'ep.f.prix': 'Prix (si payant)', 'ep.f.action': 'Comment les habitants en profitent', 'ep.a.reserver': 'Réservation dans la plateforme', 'ep.a.demande': 'Demande dans la plateforme',
      'ep.a.contact': 'Par téléphone ou e-mail', 'ep.a.lien': 'Sur notre site (lien https://)', 'ep.f.lien': 'Lien de réservation (https://…)', 'ep.f.tel': 'Téléphone', 'ep.f.email': 'E-mail', 'ep.f.service': 'Service de la ville le plus proche', 'ep.f.aucun': 'Aucun',
      'ep.f.motsCles': 'Mots-clés pour la recherche', 'ep.envoyer': 'Envoyer à la ville pour vérification', 'ep.annuler': 'Annuler', 'ep.envoye': 'Envoyé : la ville vérifie votre offre avant de la publier.', 'ep.toute': 'Toute la ville',
      'ep.aucuneOffre': 'Vous n’avez pas encore d’offre.', 'ep.aucuneDemande': 'Aucune demande pour le moment.', 'ep.c.num': 'Numéro', 'ep.c.offre': 'Offre', 'ep.c.type': 'Type', 'ep.c.habitant': 'Habitant', 'ep.c.message': 'Message', 'ep.c.statut': 'Statut', 'ep.c.reponse': 'Votre réponse',
      'ep.t.reservation': 'Réservation', 'ep.t.attente': 'Liste d’attente', 'ep.t.demande': 'Demande', 'ep.s.envoyee': 'À traiter', 'ep.s.acceptee': 'Acceptée', 'ep.s.refusee': 'Refusée', 'ep.s.terminee': 'Terminée', 'ep.s.annulee': 'Annulée par l’habitant',
      'ep.accepter': 'Accepter', 'ep.refuser': 'Refuser', 'ep.terminer': 'Terminée', 'ep.repondre': 'Message à l’habitant', 'ep.reponseOk': 'Réponse envoyée : l’habitant est prévenu.', 'ep.emailPartage': 'E-mail partagé : {e}', 'ep.erreur': 'Corrigez : {e}' },
    en: { 'ep.titre': 'Partner area', 'ep.intro': 'Offer your services to residents. Every new offer or change is checked by the city before it is published; availability changes immediately.',
      'ep.refus': 'This area is for the city’s partner accounts.', 'ep.devenir': 'Does your organisation want to offer its services? Write to the Solidarity Coordination.', 'ep.ecrire': 'Write to the city',
      'ep.suspendu': 'Your organisation is suspended by the city: you cannot publish anything for now.', 'ep.mesOffres': 'My offers', 'ep.nouvelle': 'Propose a new offer', 'ep.modifierT': 'Edit “{t}”', 'ep.demandes': 'Residents’ requests',
      'ep.m.publiee': 'Published — checked by the city on {d}', 'ep.m.en_attente': 'Waiting for the city’s check', 'ep.m.enAttenteMaj': 'Change waiting for the city’s check (the published version stays online)', 'ep.m.refusee': 'To correct: {m}',
      'ep.voirPublique': 'See as a resident', 'ep.modifier': 'Edit the offer', 'ep.dispo': 'Availability (changed immediately)', 'ep.statut': 'Status', 'ep.d.disponible': 'Available', 'ep.d.complet': 'Full', 'ep.d.suspendu': 'Suspended',
      'ep.reprise': 'Next date (resumption or next session)', 'ep.places': 'Places left (empty = no limit)', 'ep.note': 'Short note for residents', 'ep.majDispo': 'Update availability', 'ep.dispoOk': 'Availability updated: residents already see it.',
      'ep.f.titre': 'Offer title', 'ep.f.description': 'Description (what the person gets)', 'ep.f.public': 'For whom', 'ep.f.conditions': 'Conditions', 'ep.f.quartier': 'District', 'ep.f.lieu': 'Place', 'ep.f.horaires': 'Days and times',
      'ep.f.capacite': 'Number of places (empty = no limit)', 'ep.f.gratuit': 'Free', 'ep.f.prix': 'Price (if paid)', 'ep.f.action': 'How residents take it up', 'ep.a.reserver': 'Booking in the platform', 'ep.a.demande': 'Request in the platform',
      'ep.a.contact': 'By phone or e-mail', 'ep.a.lien': 'On our website (https:// link)', 'ep.f.lien': 'Booking link (https://…)', 'ep.f.tel': 'Phone', 'ep.f.email': 'E-mail', 'ep.f.service': 'Closest city service', 'ep.f.aucun': 'None',
      'ep.f.motsCles': 'Search keywords', 'ep.envoyer': 'Send to the city for checking', 'ep.annuler': 'Cancel', 'ep.envoye': 'Sent: the city checks your offer before publishing it.', 'ep.toute': 'Whole city',
      'ep.aucuneOffre': 'You have no offer yet.', 'ep.aucuneDemande': 'No request for now.', 'ep.c.num': 'Number', 'ep.c.offre': 'Offer', 'ep.c.type': 'Type', 'ep.c.habitant': 'Resident', 'ep.c.message': 'Message', 'ep.c.statut': 'Status', 'ep.c.reponse': 'Your reply',
      'ep.t.reservation': 'Booking', 'ep.t.attente': 'Waiting list', 'ep.t.demande': 'Request', 'ep.s.envoyee': 'To handle', 'ep.s.acceptee': 'Accepted', 'ep.s.refusee': 'Declined', 'ep.s.terminee': 'Completed', 'ep.s.annulee': 'Cancelled by the resident',
      'ep.accepter': 'Accept', 'ep.refuser': 'Decline', 'ep.terminer': 'Completed', 'ep.repondre': 'Message to the resident', 'ep.reponseOk': 'Reply sent: the resident is notified.', 'ep.emailPartage': 'Shared e-mail: {e}', 'ep.erreur': 'Please fix: {e}' },
    es: { 'ep.titre': 'Espacio socio', 'ep.intro': 'Ofrezca sus servicios a los habitantes. Cada oferta nueva o modificación la verifica el ayuntamiento antes de publicarla; la disponibilidad cambia al instante.',
      'ep.refus': 'Este espacio está reservado a las cuentas de los socios del ayuntamiento.', 'ep.devenir': '¿Su entidad quiere ofrecer sus servicios? Escriba a la Coordinación Solidaria.', 'ep.ecrire': 'Escribir al ayuntamiento',
      'ep.suspendu': 'Su entidad está suspendida por el ayuntamiento: no puede publicar nada por ahora.', 'ep.mesOffres': 'Mis ofertas', 'ep.nouvelle': 'Proponer una oferta nueva', 'ep.modifierT': 'Modificar «{t}»', 'ep.demandes': 'Solicitudes de los habitantes',
      'ep.m.publiee': 'Publicada — verificada por el ayuntamiento el {d}', 'ep.m.en_attente': 'Pendiente de verificación por el ayuntamiento', 'ep.m.enAttenteMaj': 'Modificación pendiente de verificación (la versión publicada sigue en línea)', 'ep.m.refusee': 'Por corregir: {m}',
      'ep.voirPublique': 'Ver como un habitante', 'ep.modifier': 'Modificar la oferta', 'ep.dispo': 'Disponibilidad (cambia al instante)', 'ep.statut': 'Estado', 'ep.d.disponible': 'Disponible', 'ep.d.complet': 'Completo', 'ep.d.suspendu': 'Suspendido',
      'ep.reprise': 'Próxima fecha (reanudación o próxima sesión)', 'ep.places': 'Plazas restantes (vacío = sin límite)', 'ep.note': 'Información breve para los habitantes', 'ep.majDispo': 'Actualizar la disponibilidad', 'ep.dispoOk': 'Disponibilidad actualizada: los habitantes ya la ven.',
      'ep.f.titre': 'Título de la oferta', 'ep.f.description': 'Descripción (lo que obtiene la persona)', 'ep.f.public': 'Para quién', 'ep.f.conditions': 'Condiciones', 'ep.f.quartier': 'Barrio', 'ep.f.lieu': 'Lugar', 'ep.f.horaires': 'Días y horarios',
      'ep.f.capacite': 'Número de plazas (vacío = sin límite)', 'ep.f.gratuit': 'Gratis', 'ep.f.prix': 'Precio (si es de pago)', 'ep.f.action': 'Cómo la aprovechan los habitantes', 'ep.a.reserver': 'Reserva en la plataforma', 'ep.a.demande': 'Solicitud en la plataforma',
      'ep.a.contact': 'Por teléfono o correo', 'ep.a.lien': 'En nuestra web (enlace https://)', 'ep.f.lien': 'Enlace de reserva (https://…)', 'ep.f.tel': 'Teléfono', 'ep.f.email': 'Correo', 'ep.f.service': 'Servicio municipal más cercano', 'ep.f.aucun': 'Ninguno',
      'ep.f.motsCles': 'Palabras clave para la búsqueda', 'ep.envoyer': 'Enviar al ayuntamiento para verificar', 'ep.annuler': 'Cancelar', 'ep.envoye': 'Enviado: el ayuntamiento verifica su oferta antes de publicarla.', 'ep.toute': 'Toda la ciudad',
      'ep.aucuneOffre': 'Aún no tiene ofertas.', 'ep.aucuneDemande': 'Ninguna solicitud por ahora.', 'ep.c.num': 'Número', 'ep.c.offre': 'Oferta', 'ep.c.type': 'Tipo', 'ep.c.habitant': 'Habitante', 'ep.c.message': 'Mensaje', 'ep.c.statut': 'Estado', 'ep.c.reponse': 'Su respuesta',
      'ep.t.reservation': 'Reserva', 'ep.t.attente': 'Lista de espera', 'ep.t.demande': 'Solicitud', 'ep.s.envoyee': 'Por tratar', 'ep.s.acceptee': 'Aceptada', 'ep.s.refusee': 'Rechazada', 'ep.s.terminee': 'Terminada', 'ep.s.annulee': 'Anulada por el habitante',
      'ep.accepter': 'Aceptar', 'ep.refuser': 'Rechazar', 'ep.terminer': 'Terminada', 'ep.repondre': 'Mensaje al habitante', 'ep.reponseOk': 'Respuesta enviada: se avisa al habitante.', 'ep.emailPartage': 'Correo compartido: {e}', 'ep.erreur': 'Corrija: {e}' },
    ar: { 'ep.titre': 'فضاء الشريك', 'ep.intro': 'اعرض خدماتك على السكان. كل عرض جديد أو تعديل تتحقق منه المدينة قبل نشره؛ التوفر يتغير فوراً.',
      'ep.refus': 'هذا الفضاء مخصص لحسابات شركاء المدينة.', 'ep.devenir': 'هل تريد هيئتك تقديم خدماتها؟ راسل التنسيق التضامني.', 'ep.ecrire': 'مراسلة المدينة',
      'ep.suspendu': 'هيئتك معلّقة من طرف المدينة: لا يمكنك نشر أي شيء حالياً.', 'ep.mesOffres': 'عروضي', 'ep.nouvelle': 'اقتراح عرض جديد', 'ep.modifierT': 'تعديل «{t}»', 'ep.demandes': 'طلبات السكان',
      'ep.m.publiee': 'منشور — تحققت منه المدينة في {d}', 'ep.m.en_attente': 'بانتظار تحقق المدينة', 'ep.m.enAttenteMaj': 'تعديل بانتظار التحقق (تبقى النسخة المنشورة متاحة)', 'ep.m.refusee': 'للتصحيح: {m}',
      'ep.voirPublique': 'العرض كما يراه الساكن', 'ep.modifier': 'تعديل العرض', 'ep.dispo': 'التوفر (يتغير فوراً)', 'ep.statut': 'الحالة', 'ep.d.disponible': 'متاح', 'ep.d.complet': 'مكتمل', 'ep.d.suspendu': 'معلّق',
      'ep.reprise': 'التاريخ القادم (الاستئناف أو الحصة القادمة)', 'ep.places': 'الأماكن المتبقية (فارغ = بلا حد)', 'ep.note': 'معلومة قصيرة للسكان', 'ep.majDispo': 'تحديث التوفر', 'ep.dispoOk': 'تم تحديث التوفر: يراه السكان الآن.',
      'ep.f.titre': 'عنوان العرض', 'ep.f.description': 'الوصف (ما يحصل عليه الشخص)', 'ep.f.public': 'لمن', 'ep.f.conditions': 'الشروط', 'ep.f.quartier': 'الحي', 'ep.f.lieu': 'المكان', 'ep.f.horaires': 'الأيام والأوقات',
      'ep.f.capacite': 'عدد الأماكن (فارغ = بلا حد)', 'ep.f.gratuit': 'مجاني', 'ep.f.prix': 'السعر (إن كان مدفوعاً)', 'ep.f.action': 'كيف يستفيد السكان', 'ep.a.reserver': 'حجز عبر المنصة', 'ep.a.demande': 'طلب عبر المنصة',
      'ep.a.contact': 'بالهاتف أو البريد', 'ep.a.lien': 'على موقعنا (رابط https://)', 'ep.f.lien': 'رابط الحجز (https://…)', 'ep.f.tel': 'الهاتف', 'ep.f.email': 'البريد الإلكتروني', 'ep.f.service': 'أقرب خدمة للمدينة', 'ep.f.aucun': 'لا شيء',
      'ep.f.motsCles': 'كلمات مفتاحية للبحث', 'ep.envoyer': 'إرسال إلى المدينة للتحقق', 'ep.annuler': 'إلغاء', 'ep.envoye': 'تم الإرسال: تتحقق المدينة من عرضك قبل نشره.', 'ep.toute': 'كل المدينة',
      'ep.aucuneOffre': 'ليس لديك عرض بعد.', 'ep.aucuneDemande': 'لا توجد طلبات حالياً.', 'ep.c.num': 'الرقم', 'ep.c.offre': 'العرض', 'ep.c.type': 'النوع', 'ep.c.habitant': 'الساكن', 'ep.c.message': 'الرسالة', 'ep.c.statut': 'الحالة', 'ep.c.reponse': 'ردّك',
      'ep.t.reservation': 'حجز', 'ep.t.attente': 'قائمة انتظار', 'ep.t.demande': 'طلب', 'ep.s.envoyee': 'للمعالجة', 'ep.s.acceptee': 'مقبول', 'ep.s.refusee': 'مرفوض', 'ep.s.terminee': 'منتهٍ', 'ep.s.annulee': 'ألغاه الساكن',
      'ep.accepter': 'قبول', 'ep.refuser': 'رفض', 'ep.terminer': 'منتهٍ', 'ep.repondre': 'رسالة إلى الساكن', 'ep.reponseOk': 'تم إرسال الرد: تم تنبيه الساكن.', 'ep.emailPartage': 'البريد المشترك: {e}', 'ep.erreur': 'يرجى التصحيح: {e}' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  let D = null, edition = null;
  const nomSvc = (s) => (s.nom && (s.nom[NT.i18n.langue] || s.nom.fr)) || s.id;

  function charger() {
    const r = NT.api('GET', '/api/partenaires/moi');
    if (r.statut !== 200) {
      $('ep-zone').innerHTML = `<div class="etat-svc etat-svc-indisponible" role="group"><i class="ph-duotone ph-lock" aria-hidden="true"></i><div><p class="etat-svc-titre">${E(r.statut === 403 && /suspendu/.test((r.donnees || {}).erreur || '') ? t('ep.suspendu') : t('ep.refus'))}</p>
        <p>${E(t('ep.devenir'))}</p><div class="etat-svc-actions"><a class="btn btn-primaire" href="demande.html?type=contact&amp;service=social"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${E(t('ep.ecrire'))}</a></div></div></div>`;
      return;
    }
    D = r.donnees;
    rendre();
  }
  function statutModeration(o) {
    const m = o.moderation || {};
    if (m.statut === 'refusee') return `<p class="ep-mod ep-mod-refusee"><i class="ph-duotone ph-warning" aria-hidden="true"></i>${E(t('ep.m.refusee', { m: m.motif }))}</p>`;
    if (m.statut === 'en_attente') return `<p class="ep-mod ep-mod-attente"><i class="ph-duotone ph-hourglass" aria-hidden="true"></i>${E(o.publiee ? t('ep.m.enAttenteMaj') : t('ep.m.en_attente'))}</p>`;
    return o.publiee ? `<p class="ep-mod ep-mod-publiee"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i>${E(t('ep.m.publiee', { d: NT.ui.date((o.verification || {}).le || o.maj) }))}</p>` : '';
  }
  function carteOffre(o) {
    const c = o.proposition && (o.moderation || {}).statut !== 'publiee' ? o.proposition : o.publiee || o.proposition || {};
    const d = o.disponibilite || {};
    return `<article class="ep-offre" id="ep-${E(o.id)}"><h3 lang="fr">${E(c.titre)}</h3>${statutModeration(o)}
      <form class="ep-dispo" data-ep-dispo="${E(o.id)}"><fieldset><legend>${E(t('ep.dispo'))}</legend>
        <div class="ep-dispo-grille"><div class="champ"><label for="ep-ds-${E(o.id)}">${E(t('ep.statut'))}</label><select id="ep-ds-${E(o.id)}" name="statut">${['disponible', 'complet', 'suspendu'].map((s) => `<option value="${s}"${s === d.statut ? ' selected' : ''}>${E(t('ep.d.' + s))}</option>`).join('')}</select></div>
        <div class="champ"><label for="ep-dd-${E(o.id)}">${E(t('ep.reprise'))}</label><input type="date" id="ep-dd-${E(o.id)}" name="prochaineDate" value="${E(d.prochaineDate || '')}"></div>
        <div class="champ"><label for="ep-dp-${E(o.id)}">${E(t('ep.places'))}</label><input type="number" min="0" id="ep-dp-${E(o.id)}" name="placesRestantes" value="${d.placesRestantes == null ? '' : E(d.placesRestantes)}"></div>
        <div class="champ"><label for="ep-dn-${E(o.id)}">${E(t('ep.note'))}</label><input id="ep-dn-${E(o.id)}" name="note" maxlength="160" value="${E(d.note || '')}"></div></div>
        <button class="btn" type="submit"><i class="ph ph-arrows-clockwise" aria-hidden="true"></i>${E(t('ep.majDispo'))}</button></fieldset></form>
      <div class="ep-boutons"><button type="button" class="btn" data-ep-modifier="${E(o.id)}"><i class="ph ph-pencil-simple" aria-hidden="true"></i>${E(t('ep.modifier'))}</button>
        ${o.publiee ? `<a class="btn" href="partenaires.html#${E(o.id)}"><i class="ph ph-eye" aria-hidden="true"></i>${E(t('ep.voirPublique'))}</a>` : ''}</div></article>`;
  }
  function champ(id, cle, valeur, type, extra) { return `<div class="champ"><label for="ep-f-${id}">${E(t('ep.f.' + cle))}</label>${type === 'textarea' ? `<textarea id="ep-f-${id}" rows="3" maxlength="700">${E(valeur || '')}</textarea>` : `<input id="ep-f-${id}" type="${type || 'text'}" value="${E(valeur == null ? '' : valeur)}" ${extra || ''}>`}</div>`; }
  function formulaire(o) {
    edition = o || null;
    const c = o ? (o.proposition || o.publiee) : { quartier: 'Toute la ville', action: 'reserver', gratuit: true };
    return `<form id="ep-form" class="ep-form" novalidate><div class="am-erreur" id="ep-erreur" role="alert" tabindex="-1" hidden></div>
      ${champ('titre', 'titre', c.titre, 'text', 'maxlength="90" required')}${champ('description', 'description', c.description, 'textarea')}
      <div class="ep-grille">${champ('public', 'public', c.public, 'text', 'maxlength="200"')}${champ('conditions', 'conditions', c.conditions, 'text', 'maxlength="300"')}
        <div class="champ"><label for="ep-f-quartier">${E(t('ep.f.quartier'))}</label><select id="ep-f-quartier">${D.quartiers.map((q) => `<option value="${E(q)}"${q === c.quartier ? ' selected' : ''}>${E(q === 'Toute la ville' ? t('ep.toute') : NT.t('tr.q.' + q, null, q))}</option>`).join('')}</select></div>
        ${champ('lieu', 'lieu', c.lieu, 'text', 'maxlength="140"')}${champ('horaires', 'horaires', c.horaires, 'text', 'maxlength="160"')}${champ('capacite', 'capacite', c.capacite, 'number', 'min="0"')}</div>
      <div class="ep-grille"><label class="pa-case"><input type="checkbox" id="ep-f-gratuit" ${c.gratuit ? 'checked' : ''}> ${E(t('ep.f.gratuit'))}</label>${champ('prix', 'prix', c.prix, 'text', 'maxlength="60"')}</div>
      <div class="ep-grille"><div class="champ"><label for="ep-f-action">${E(t('ep.f.action'))}</label><select id="ep-f-action">${['reserver', 'demande', 'contact', 'lien'].map((a) => `<option value="${a}"${a === c.action ? ' selected' : ''}>${E(t('ep.a.' + a))}</option>`).join('')}</select></div>
        ${champ('lien', 'lien', c.lien, 'url', 'maxlength="300" placeholder="https://"')}${champ('tel', 'tel', c.tel, 'tel', 'maxlength="30"')}${champ('email', 'email', c.email, 'email', 'maxlength="120"')}
        <div class="champ"><label for="ep-f-service">${E(t('ep.f.service'))}</label><select id="ep-f-service"><option value="">${E(t('ep.f.aucun'))}</option>${D.services.map((s) => `<option value="${E(s.id)}"${s.id === c.serviceId ? ' selected' : ''}>${E(nomSvc(s))}</option>`).join('')}</select></div>
        ${champ('motsCles', 'motsCles', c.motsCles, 'text', 'maxlength="160"')}</div>
      <div class="ep-boutons"><button class="btn btn-primaire" type="submit"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${E(t('ep.envoyer'))}</button>${o ? `<button class="btn" type="button" id="ep-annuler">${E(t('ep.annuler'))}</button>` : ''}</div></form>`;
  }
  function demandes() {
    const l = D.demandes;
    if (!l.length) return `<p class="vide">${E(t('ep.aucuneDemande'))}</p>`;
    return `<ul class="ep-demandes">${l.map((d) => `<li class="ep-demande ep-d-${E(d.statut)}"><p><strong>${E(d.id)}</strong> · ${E(t('ep.t.' + d.type))} · <span lang="fr">${E(d.offreTitre)}</span> · <span class="statut ${d.statut === 'envoyee' ? 'statut-recue' : d.statut === 'refusee' || d.statut === 'annulee' ? 'statut-cloturee' : 'statut-traitee'}">${E(t('ep.s.' + d.statut))}</span></p>
      <p>${E(d.habitant.prenom)} ${E(d.habitant.initiale)}${d.habitant.quartier ? ' · ' + E(NT.t('tr.q.' + d.habitant.quartier, null, d.habitant.quartier)) : ''} · <span class="doux">${E(NT.ui.dateHeure(d.cree))}</span>${d.partageEmail ? ' · ' + E(t('ep.emailPartage', { e: d.partageEmail })) : ''}</p>
      ${d.message ? `<blockquote>${E(d.message)}</blockquote>` : ''}${d.reponse ? `<p class="doux">${E(t('ep.c.reponse'))} : ${E(d.reponse)}</p>` : ''}
      ${['envoyee', 'acceptee'].includes(d.statut) ? `<form class="ep-rep" data-ep-rep="${E(d.id)}"><div class="champ"><label for="ep-r-${E(d.id)}">${E(t('ep.repondre'))}</label><input id="ep-r-${E(d.id)}" maxlength="500"></div>
        <div class="ep-boutons">${d.statut === 'envoyee' ? `<button class="btn btn-primaire" type="submit" value="acceptee">${E(t('ep.accepter'))}</button><button class="btn" type="submit" value="refusee">${E(t('ep.refuser'))}</button>` : ''}<button class="btn" type="submit" value="terminee">${E(t('ep.terminer'))}</button></div></form>` : ''}</li>`).join('')}</ul>`;
  }
  function rendre() {
    const p = D.partenaire;
    $('ep-zone').innerHTML = `<p class="ep-nom"><i class="ph-duotone ph-handshake" aria-hidden="true"></i><strong>${E(p.nom)}</strong>${p.description ? ` · <span class="doux" lang="fr">${E(p.description)}</span>` : ''}</p>
      <section class="ag-bloc" aria-labelledby="ep-t-offres"><h2 id="ep-t-offres"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i>${E(t('ep.mesOffres'))}</h2>${D.offres.length ? D.offres.map(carteOffre).join('') : `<p class="vide">${E(t('ep.aucuneOffre'))}</p>`}</section>
      <section class="ag-bloc" aria-labelledby="ep-t-form" id="ep-section-form"><h2 id="ep-t-form"><i class="ph-duotone ph-plus-circle" aria-hidden="true"></i><span id="ep-form-titre">${E(t('ep.nouvelle'))}</span></h2><div id="ep-form-zone">${formulaire()}</div></section>
      <section class="ag-bloc" aria-labelledby="ep-t-dem" id="demandes"><h2 id="ep-t-dem"><i class="ph-duotone ph-tray" aria-hidden="true"></i>${E(t('ep.demandes'))}</h2>${demandes()}</section>`;
  }
  const v = (id) => $('ep-f-' + id).value;
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'ep-form') {
      e.preventDefault();
      const corps = { titre: v('titre'), description: v('description'), public: v('public'), conditions: v('conditions'), quartier: v('quartier'), lieu: v('lieu'), horaires: v('horaires'), capacite: v('capacite'),
        gratuit: $('ep-f-gratuit').checked, prix: $('ep-f-gratuit').checked ? '' : v('prix'), action: v('action'), lien: v('lien'), tel: v('tel'), email: v('email'), serviceId: v('service'), motsCles: v('motsCles') };
      const r = edition ? NT.api('PUT', '/api/partenaires/moi/offres/' + encodeURIComponent(edition.id), corps) : NT.api('POST', '/api/partenaires/moi/offres', corps);
      if (r.statut !== 200) { const z = $('ep-erreur'); z.hidden = false; z.textContent = t('ep.erreur', { e: (r.donnees && r.donnees.erreur) || r.statut }); z.focus(); return; }
      NT.ui.toast(t('ep.envoye'), 'success', 8000);
      charger(); const c = $('ep-' + r.donnees.id); if (c) { c.setAttribute('tabindex', '-1'); c.focus(); }
      return;
    }
    const dispo = f.closest('[data-ep-dispo]');
    if (dispo) {
      e.preventDefault();
      const r = NT.api('POST', '/api/partenaires/moi/offres/' + encodeURIComponent(dispo.dataset.epDispo) + '/disponibilite', { statut: dispo.statut.value, prochaineDate: dispo.prochaineDate.value, placesRestantes: dispo.placesRestantes.value, note: dispo.note.value });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger', 8000); return; }
      NT.ui.toast(t('ep.dispoOk'), 'success'); return;
    }
    const rep = f.closest('[data-ep-rep]');
    if (rep) {
      e.preventDefault();
      const statut = (e.submitter && e.submitter.value) || 'acceptee';
      const r = NT.api('POST', '/api/partenaires/moi/demandes/' + encodeURIComponent(rep.dataset.epRep), { statut, reponse: rep.querySelector('input').value });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger', 8000); rep.querySelector('input').focus(); return; }
      NT.ui.toast(t('ep.reponseOk'), 'success'); charger(); const s = $('ep-t-dem'); s.setAttribute('tabindex', '-1'); s.focus();
    }
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-ep-modifier],#ep-annuler'); if (!b) return;
    if (b.id === 'ep-annuler') { $('ep-form-zone').innerHTML = formulaire(); $('ep-form-titre').textContent = t('ep.nouvelle'); return; }
    const o = D.offres.find((x) => x.id === b.dataset.epModifier);
    $('ep-form-zone').innerHTML = formulaire(o);
    $('ep-form-titre').textContent = t('ep.modifierT', { t: (o.proposition || o.publiee).titre });
    $('ep-section-form').scrollIntoView({ block: 'start' }); $('ep-f-titre').focus();
  });
  if (document.readyState === 'complete') charger(); else document.addEventListener('DOMContentLoaded', charger);
})();
