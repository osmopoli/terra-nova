/* Terra Nova — vague 20 (F99) : vérification des offres des partenaires (agents) et gestion des partenaires (administrateur).
   Pour chaque proposition : ce qui change par rapport à la version publiée (champ par champ), « Vérifier et publier » ou
   « Demander une correction » (motif envoyé au partenaire). Offres publiées : retirer / remettre en ligne avec un motif.
   Administrateur : créer et valider un partenaire, rattacher un compte existant, suspendre / réactiver. Tout est journalisé. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ap.titre': 'Offres des partenaires', 'nav.partenairesAgent': 'Partenaires', 'ap.intro': 'Rien n’est visible des habitants tant qu’un agent n’a pas vérifié l’offre. Vérifiez le texte, les conditions, le prix et le contact, puis publiez ou demandez une correction.',
      'ap.attente': 'À vérifier', 'ap.publiees': 'Publiées', 'ap.partenaires': 'Partenaires et comptes', 'ap.aucuneAttente': 'Aucune offre à vérifier.', 'ap.aucunePubliee': 'Aucune offre publiée.',
      'ap.nouvelle': 'Nouvelle offre', 'ap.modif': 'Modification d’une offre publiée', 'ap.soumise': 'Proposée par {p} le {d}', 'ap.changements': 'Ce qui change', 'ap.avant': 'Version publiée', 'ap.apres': 'Proposition',
      'ap.motif': 'Message au partenaire', 'ap.motifAide': 'Obligatoire pour demander une correction : dites précisément quoi corriger.', 'ap.publier': 'Vérifier et publier', 'ap.refuser': 'Demander une correction', 'ap.publieOk': 'Offre publiée : les habitants la voient.', 'ap.refuseOk': 'Correction demandée au partenaire.',
      'ap.retirer': 'Retirer de la plateforme', 'ap.remettre': 'Remettre en ligne', 'ap.retiree': 'Retirée', 'ap.retireOk': 'C’est fait : le partenaire est prévenu.', 'ap.verifieePar': 'Vérifiée par {p} le {d}',
      'ap.c.titre': 'Titre', 'ap.c.description': 'Description', 'ap.c.public': 'Pour qui', 'ap.c.conditions': 'Conditions', 'ap.c.quartier': 'Quartier', 'ap.c.lieu': 'Lieu', 'ap.c.horaires': 'Horaires', 'ap.c.capacite': 'Places', 'ap.c.prix': 'Prix', 'ap.c.action': 'Action',
      'ap.c.lien': 'Lien', 'ap.c.tel': 'Téléphone', 'ap.c.email': 'E-mail', 'ap.c.serviceId': 'Service lié', 'ap.c.motsCles': 'Mots-clés', 'ap.gratuit': 'Gratuit', 'ap.dispo': 'Disponibilité : {d}',
      'ap.actif': 'Actif', 'ap.suspendu': 'Suspendu', 'ap.comptes': 'Comptes partenaires', 'ap.aucunCompte': 'Aucun compte rattaché.', 'ap.offresN': '{n} offre(s)', 'ap.suspendre': 'Suspendre', 'ap.reactiver': 'Réactiver', 'ap.motifStatut': 'Motif',
      'ap.lier': 'Rattacher un compte existant (e-mail)', 'ap.lierBtn': 'Rattacher', 'ap.lierOk': 'Compte rattaché : la personne est prévenue.', 'ap.retirerCompte': 'Retirer', 'ap.creer': 'Créer et valider un partenaire', 'ap.nom': 'Nom de la structure', 'ap.domaine': 'Domaine (ex. numérique, mobilité, santé)',
      'ap.description': 'Description courte', 'ap.tel': 'Téléphone', 'ap.email': 'E-mail', 'ap.creerBtn': 'Créer le partenaire', 'ap.creeOk': 'Partenaire créé et validé.', 'ap.adminSeul': 'Seul l’administrateur crée les partenaires et rattache les comptes.', 'ap.erreur': 'Corrigez : {e}' },
    en: { 'ap.titre': 'Partner offers', 'nav.partenairesAgent': 'Partners', 'ap.intro': 'Nothing is visible to residents until a staff member has checked the offer. Check the text, conditions, price and contact, then publish or ask for a correction.',
      'ap.attente': 'To check', 'ap.publiees': 'Published', 'ap.partenaires': 'Partners and accounts', 'ap.aucuneAttente': 'No offer to check.', 'ap.aucunePubliee': 'No published offer.',
      'ap.nouvelle': 'New offer', 'ap.modif': 'Change to a published offer', 'ap.soumise': 'Proposed by {p} on {d}', 'ap.changements': 'What changes', 'ap.avant': 'Published version', 'ap.apres': 'Proposal',
      'ap.motif': 'Message to the partner', 'ap.motifAide': 'Required to ask for a correction: say exactly what to fix.', 'ap.publier': 'Check and publish', 'ap.refuser': 'Ask for a correction', 'ap.publieOk': 'Offer published: residents can see it.', 'ap.refuseOk': 'Correction requested from the partner.',
      'ap.retirer': 'Remove from the platform', 'ap.remettre': 'Put back online', 'ap.retiree': 'Removed', 'ap.retireOk': 'Done: the partner is notified.', 'ap.verifieePar': 'Checked by {p} on {d}',
      'ap.c.titre': 'Title', 'ap.c.description': 'Description', 'ap.c.public': 'For whom', 'ap.c.conditions': 'Conditions', 'ap.c.quartier': 'District', 'ap.c.lieu': 'Place', 'ap.c.horaires': 'Times', 'ap.c.capacite': 'Places', 'ap.c.prix': 'Price', 'ap.c.action': 'Action',
      'ap.c.lien': 'Link', 'ap.c.tel': 'Phone', 'ap.c.email': 'E-mail', 'ap.c.serviceId': 'Linked service', 'ap.c.motsCles': 'Keywords', 'ap.gratuit': 'Free', 'ap.dispo': 'Availability: {d}',
      'ap.actif': 'Active', 'ap.suspendu': 'Suspended', 'ap.comptes': 'Partner accounts', 'ap.aucunCompte': 'No linked account.', 'ap.offresN': '{n} offer(s)', 'ap.suspendre': 'Suspend', 'ap.reactiver': 'Reactivate', 'ap.motifStatut': 'Reason',
      'ap.lier': 'Link an existing account (e-mail)', 'ap.lierBtn': 'Link', 'ap.lierOk': 'Account linked: the person is notified.', 'ap.retirerCompte': 'Remove', 'ap.creer': 'Create and approve a partner', 'ap.nom': 'Organisation name', 'ap.domaine': 'Field (e.g. digital, mobility, health)',
      'ap.description': 'Short description', 'ap.tel': 'Phone', 'ap.email': 'E-mail', 'ap.creerBtn': 'Create the partner', 'ap.creeOk': 'Partner created and approved.', 'ap.adminSeul': 'Only the administrator creates partners and links accounts.', 'ap.erreur': 'Please fix: {e}' },
    es: { 'ap.titre': 'Ofertas de los socios', 'nav.partenairesAgent': 'Socios', 'ap.intro': 'Nada es visible para los habitantes hasta que un agente verifica la oferta. Revise el texto, las condiciones, el precio y el contacto, y publique o pida una corrección.',
      'ap.attente': 'Por verificar', 'ap.publiees': 'Publicadas', 'ap.partenaires': 'Socios y cuentas', 'ap.aucuneAttente': 'Ninguna oferta por verificar.', 'ap.aucunePubliee': 'Ninguna oferta publicada.',
      'ap.nouvelle': 'Oferta nueva', 'ap.modif': 'Modificación de una oferta publicada', 'ap.soumise': 'Propuesta por {p} el {d}', 'ap.changements': 'Qué cambia', 'ap.avant': 'Versión publicada', 'ap.apres': 'Propuesta',
      'ap.motif': 'Mensaje al socio', 'ap.motifAide': 'Obligatorio para pedir una corrección: diga exactamente qué corregir.', 'ap.publier': 'Verificar y publicar', 'ap.refuser': 'Pedir una corrección', 'ap.publieOk': 'Oferta publicada: los habitantes la ven.', 'ap.refuseOk': 'Corrección pedida al socio.',
      'ap.retirer': 'Retirar de la plataforma', 'ap.remettre': 'Volver a publicar', 'ap.retiree': 'Retirada', 'ap.retireOk': 'Hecho: se avisa al socio.', 'ap.verifieePar': 'Verificada por {p} el {d}',
      'ap.c.titre': 'Título', 'ap.c.description': 'Descripción', 'ap.c.public': 'Para quién', 'ap.c.conditions': 'Condiciones', 'ap.c.quartier': 'Barrio', 'ap.c.lieu': 'Lugar', 'ap.c.horaires': 'Horarios', 'ap.c.capacite': 'Plazas', 'ap.c.prix': 'Precio', 'ap.c.action': 'Acción',
      'ap.c.lien': 'Enlace', 'ap.c.tel': 'Teléfono', 'ap.c.email': 'Correo', 'ap.c.serviceId': 'Servicio vinculado', 'ap.c.motsCles': 'Palabras clave', 'ap.gratuit': 'Gratis', 'ap.dispo': 'Disponibilidad: {d}',
      'ap.actif': 'Activo', 'ap.suspendu': 'Suspendido', 'ap.comptes': 'Cuentas de socio', 'ap.aucunCompte': 'Ninguna cuenta vinculada.', 'ap.offresN': '{n} oferta(s)', 'ap.suspendre': 'Suspender', 'ap.reactiver': 'Reactivar', 'ap.motifStatut': 'Motivo',
      'ap.lier': 'Vincular una cuenta existente (correo)', 'ap.lierBtn': 'Vincular', 'ap.lierOk': 'Cuenta vinculada: se avisa a la persona.', 'ap.retirerCompte': 'Quitar', 'ap.creer': 'Crear y validar un socio', 'ap.nom': 'Nombre de la entidad', 'ap.domaine': 'Ámbito (p. ej. digital, movilidad, salud)',
      'ap.description': 'Descripción breve', 'ap.tel': 'Teléfono', 'ap.email': 'Correo', 'ap.creerBtn': 'Crear el socio', 'ap.creeOk': 'Socio creado y validado.', 'ap.adminSeul': 'Solo el administrador crea socios y vincula cuentas.', 'ap.erreur': 'Corrija: {e}' },
    ar: { 'ap.titre': 'عروض الشركاء', 'nav.partenairesAgent': 'الشركاء', 'ap.intro': 'لا يظهر شيء للسكان قبل أن يتحقق موظف من العرض. تحقق من النص والشروط والسعر ووسيلة التواصل، ثم انشر أو اطلب تصحيحاً.',
      'ap.attente': 'للتحقق', 'ap.publiees': 'المنشورة', 'ap.partenaires': 'الشركاء والحسابات', 'ap.aucuneAttente': 'لا توجد عروض للتحقق.', 'ap.aucunePubliee': 'لا توجد عروض منشورة.',
      'ap.nouvelle': 'عرض جديد', 'ap.modif': 'تعديل عرض منشور', 'ap.soumise': 'اقترحه {p} في {d}', 'ap.changements': 'ما الذي يتغير', 'ap.avant': 'النسخة المنشورة', 'ap.apres': 'المقترح',
      'ap.motif': 'رسالة إلى الشريك', 'ap.motifAide': 'إلزامي لطلب تصحيح: حدّد بدقة ما يجب تصحيحه.', 'ap.publier': 'التحقق والنشر', 'ap.refuser': 'طلب تصحيح', 'ap.publieOk': 'تم نشر العرض: يراه السكان.', 'ap.refuseOk': 'تم طلب التصحيح من الشريك.',
      'ap.retirer': 'سحب من المنصة', 'ap.remettre': 'إعادة النشر', 'ap.retiree': 'مسحوب', 'ap.retireOk': 'تم: تم تنبيه الشريك.', 'ap.verifieePar': 'تحقق منه {p} في {d}',
      'ap.c.titre': 'العنوان', 'ap.c.description': 'الوصف', 'ap.c.public': 'لمن', 'ap.c.conditions': 'الشروط', 'ap.c.quartier': 'الحي', 'ap.c.lieu': 'المكان', 'ap.c.horaires': 'الأوقات', 'ap.c.capacite': 'الأماكن', 'ap.c.prix': 'السعر', 'ap.c.action': 'الإجراء',
      'ap.c.lien': 'الرابط', 'ap.c.tel': 'الهاتف', 'ap.c.email': 'البريد', 'ap.c.serviceId': 'الخدمة المرتبطة', 'ap.c.motsCles': 'كلمات مفتاحية', 'ap.gratuit': 'مجاني', 'ap.dispo': 'التوفر: {d}',
      'ap.actif': 'نشط', 'ap.suspendu': 'معلّق', 'ap.comptes': 'حسابات الشريك', 'ap.aucunCompte': 'لا يوجد حساب مرتبط.', 'ap.offresN': '{n} عرض', 'ap.suspendre': 'تعليق', 'ap.reactiver': 'إعادة التفعيل', 'ap.motifStatut': 'السبب',
      'ap.lier': 'ربط حساب موجود (البريد)', 'ap.lierBtn': 'ربط', 'ap.lierOk': 'تم ربط الحساب: تم تنبيه الشخص.', 'ap.retirerCompte': 'إزالة', 'ap.creer': 'إنشاء شريك والمصادقة عليه', 'ap.nom': 'اسم الهيئة', 'ap.domaine': 'المجال (مثلاً الرقمي، التنقل، الصحة)',
      'ap.description': 'وصف قصير', 'ap.tel': 'الهاتف', 'ap.email': 'البريد', 'ap.creerBtn': 'إنشاء الشريك', 'ap.creeOk': 'تم إنشاء الشريك والمصادقة عليه.', 'ap.adminSeul': 'وحده المسؤول ينشئ الشركاء ويربط الحسابات.', 'ap.erreur': 'يرجى التصحيح: {e}' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  let D = null;
  const CHAMPS = ['titre', 'description', 'public', 'conditions', 'quartier', 'lieu', 'horaires', 'capacite', 'prix', 'action', 'lien', 'tel', 'email', 'serviceId', 'motsCles'];
  const nomSvc = (id) => { const s = D.services.find((x) => x.id === id); return s ? (s.nom[NT.i18n.langue] || s.nom.fr) : id; };
  const val = (c, k) => (k === 'prix' ? (c.gratuit ? t('ap.gratuit') : c.prix) : k === 'serviceId' ? (c.serviceId ? nomSvc(c.serviceId) : '') : k === 'capacite' ? (c.capacite == null ? '' : String(c.capacite)) : c[k] || '');

  function charger() {
    const r = NT.api('GET', '/api/partenaires/moderation');
    if (r.statut !== 200) { $('ap-attente').innerHTML = `<p class="vide">${E((r.donnees && r.donnees.erreur) || '')}</p>`; return; }
    D = r.donnees; rendre();
  }
  function diff(o) {
    const a = o.publiee || {}, b = o.proposition || {};
    const lignes = CHAMPS.filter((k) => !o.publiee || val(a, k) !== val(b, k)).filter((k) => val(b, k) || val(a, k));
    return `<div class="table-defile"><table class="ap-diff"><caption class="sr-only">${E(t('ap.changements'))}</caption><thead><tr><th scope="col">${E(t('ap.changements'))}</th>${o.publiee ? `<th scope="col">${E(t('ap.avant'))}</th>` : ''}<th scope="col">${E(t('ap.apres'))}</th></tr></thead>
      <tbody>${lignes.map((k) => `<tr><th scope="row">${E(t('ap.c.' + k))}</th>${o.publiee ? `<td lang="fr"><del>${E(val(a, k))}</del></td>` : ''}<td lang="fr">${o.publiee ? `<ins>${E(val(b, k))}</ins>` : E(val(b, k))}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function attente(o) {
    const m = o.moderation || {};
    return `<article class="ap-carte" id="ap-${E(o.id)}"><h3 lang="fr">${E(o.proposition.titre)}</h3>
      <p class="doux"><span class="v20-badge">${E(o.publiee ? t('ap.modif') : t('ap.nouvelle'))}</span> ${E(o.partenaire ? o.partenaire.nom : '')} · ${E(t('ap.soumise', { p: m.soumisPar || '', d: NT.ui.dateHeure(m.soumisLe || o.maj) }))}</p>
      ${diff(o)}
      <form class="ap-mod" data-ap-mod="${E(o.id)}"><div class="champ"><label for="ap-m-${E(o.id)}">${E(t('ap.motif'))}</label><input id="ap-m-${E(o.id)}" maxlength="300" aria-describedby="ap-ma-${E(o.id)}"><p class="aide" id="ap-ma-${E(o.id)}">${E(t('ap.motifAide'))}</p></div>
        <div class="ep-boutons"><button class="btn btn-primaire" type="submit" value="publier"><i class="ph ph-seal-check" aria-hidden="true"></i>${E(t('ap.publier'))}</button><button class="btn" type="submit" value="refuser"><i class="ph ph-arrow-u-up-left" aria-hidden="true"></i>${E(t('ap.refuser'))}</button></div></form></article>`;
  }
  function publiee(o) {
    const d = o.disponibilite || {};
    return `<article class="ap-carte ap-publiee${o.retiree ? ' ap-retiree' : ''}"><h3 lang="fr">${E(o.publiee.titre)}</h3>
      <p class="doux">${E(o.partenaire ? o.partenaire.nom : '')} · ${E(t('ap.dispo', { d: d.statut || '' }))}${o.retiree ? ` · <strong>${E(t('ap.retiree'))}</strong>` : ''}${o.verification ? ' · ' + E(t('ap.verifieePar', { p: o.verification.par, d: NT.ui.date(o.verification.le) })) : ''}</p>
      <form class="ap-retrait" data-ap-retrait="${E(o.id)}" data-retiree="${o.retiree ? '1' : ''}"><div class="champ"><label for="ap-r-${E(o.id)}">${E(t('ap.motif'))}</label><input id="ap-r-${E(o.id)}" maxlength="300"></div>
        <button class="btn" type="submit">${E(o.retiree ? t('ap.remettre') : t('ap.retirer'))}</button></form></article>`;
  }
  function partenaire(p) {
    return `<article class="ap-carte"><h3>${E(p.nom)} <span class="statut ${p.statut === 'actif' ? 'statut-ok' : 'statut-incident'}">${E(t('ap.' + p.statut))}</span></h3>
      <p class="doux">${E(p.domaine || '')} · ${E(t('ap.offresN', { n: p.offres }))}${p.contact && (p.contact.tel || p.contact.email) ? ' · ' + E([p.contact.tel, p.contact.email].filter(Boolean).join(' · ')) : ''}</p>
      <p><strong>${E(t('ap.comptes'))}</strong></p>${p.comptes.length ? `<ul class="ap-comptes">${p.comptes.map((c) => `<li>${E(c.nom)} · ${E(c.email)}${D.estAdmin ? ` <button type="button" class="lien-bouton" data-ap-delier="${E(p.id)}" data-email="${E(c.email)}">${E(t('ap.retirerCompte'))}</button>` : ''}</li>`).join('')}</ul>` : `<p class="doux">${E(t('ap.aucunCompte'))}</p>`}
      ${D.estAdmin ? `<form class="ap-lier" data-ap-lier="${E(p.id)}"><div class="champ"><label for="ap-l-${E(p.id)}">${E(t('ap.lier'))}</label><input id="ap-l-${E(p.id)}" type="email" autocomplete="off"></div><button class="btn" type="submit">${E(t('ap.lierBtn'))}</button></form>
      <form class="ap-statut" data-ap-statut="${E(p.id)}" data-cible="${p.statut === 'actif' ? 'suspendu' : 'actif'}"><div class="champ"><label for="ap-s-${E(p.id)}">${E(t('ap.motifStatut'))}</label><input id="ap-s-${E(p.id)}" maxlength="200"></div><button class="btn" type="submit">${E(t(p.statut === 'actif' ? 'ap.suspendre' : 'ap.reactiver'))}</button></form>` : ''}</article>`;
  }
  function rendre() {
    $('ap-attente').innerHTML = D.enAttente.length ? D.enAttente.map(attente).join('') : `<p class="vide">${E(t('ap.aucuneAttente'))}</p>`;
    $('ap-publiees').innerHTML = D.publiees.length ? D.publiees.map(publiee).join('') : `<p class="vide">${E(t('ap.aucunePubliee'))}</p>`;
    $('ap-partenaires').innerHTML = D.partenaires.map(partenaire).join('') + (D.estAdmin ? `<form class="ap-creer ag-bloc" id="ap-creer"><h3>${E(t('ap.creer'))}</h3><div class="ep-grille">
      <div class="champ"><label for="ap-c-nom">${E(t('ap.nom'))}</label><input id="ap-c-nom" maxlength="80" required></div><div class="champ"><label for="ap-c-domaine">${E(t('ap.domaine'))}</label><input id="ap-c-domaine" maxlength="60"></div>
      <div class="champ"><label for="ap-c-desc">${E(t('ap.description'))}</label><input id="ap-c-desc" maxlength="400"></div><div class="champ"><label for="ap-c-tel">${E(t('ap.tel'))}</label><input id="ap-c-tel" type="tel" maxlength="30"></div>
      <div class="champ"><label for="ap-c-email">${E(t('ap.email'))}</label><input id="ap-c-email" type="email" maxlength="120"></div></div><button class="btn btn-primaire" type="submit">${E(t('ap.creerBtn'))}</button></form>` : `<p class="doux">${E(t('ap.adminSeul'))}</p>`);
  }
  const reponse = (r, ok, focus) => { if (r.statut !== 200) { NT.ui.toast(t('ap.erreur', { e: (r.donnees && r.donnees.erreur) || r.statut }), 'danger', 8000); if (focus) focus.focus(); return false; } NT.ui.toast(ok, 'success', 6000); charger(); if (window.NT.v20lire) window.NT.v20lire(); return true; };
  document.addEventListener('submit', (e) => {
    const f = e.target; e.preventDefault();
    if (f.dataset.apMod) { const d = (e.submitter && e.submitter.value) || 'publier'; const champ = f.querySelector('input'); if (reponse(NT.api('POST', '/api/partenaires/offres/' + encodeURIComponent(f.dataset.apMod) + '/moderer', { decision: d, motif: champ.value }), t(d === 'publier' ? 'ap.publieOk' : 'ap.refuseOk'), champ)) { $('ap-t-attente').setAttribute('tabindex', '-1'); $('ap-t-attente').focus(); } return; }
    if (f.dataset.apRetrait) { const champ = f.querySelector('input'); reponse(NT.api('POST', '/api/partenaires/offres/' + encodeURIComponent(f.dataset.apRetrait) + '/retirer', { motif: champ.value, retiree: !f.dataset.retiree }), t('ap.retireOk'), champ); return; }
    if (f.dataset.apLier) { const champ = f.querySelector('input'); reponse(NT.api('POST', '/api/partenaires/' + encodeURIComponent(f.dataset.apLier) + '/comptes', { email: champ.value }), t('ap.lierOk'), champ); return; }
    if (f.dataset.apStatut) { const champ = f.querySelector('input'); reponse(NT.api('PATCH', '/api/partenaires/' + encodeURIComponent(f.dataset.apStatut), { statut: f.dataset.cible, motif: champ.value }), t('ap.retireOk'), champ); return; }
    if (f.id === 'ap-creer') reponse(NT.api('POST', '/api/partenaires', { nom: $('ap-c-nom').value, domaine: $('ap-c-domaine').value, description: $('ap-c-desc').value, contact: { tel: $('ap-c-tel').value, email: $('ap-c-email').value } }), t('ap.creeOk'), $('ap-c-nom'));
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-ap-delier]'); if (!b) return;
    reponse(NT.api('POST', '/api/partenaires/' + encodeURIComponent(b.dataset.apDelier) + '/comptes', { email: b.dataset.email, retirer: true }), t('ap.retireOk'));
  });
  if (document.readyState === 'complete') charger(); else document.addEventListener('DOMContentLoaded', charger);
})();
