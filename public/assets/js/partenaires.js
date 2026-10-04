/* Terra Nova — vague 20 (F99, Coordination Solidaire) : page habitants « Offres des partenaires ».
   GET /api/partenaires/offres : offres vérifiées par la ville (rien d'autre n'est visible). Pour chaque offre : badge de
   disponibilité (même langage que l'état des services F63/F64 : Disponible / Complet / Suspendu, avec la prochaine date),
   l'essentiel (pour qui, conditions, où, quand, prix), la prochaine action possible (Réserver, S'inscrire sur liste
   d'attente, Envoyer une demande, Contacter, Voir une alternative) et « Proposé par …, vérifié par la ville ». */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'pa.titre': 'Offres des partenaires', 'pa.intro': 'Des associations et structures partenaires proposent leurs services. Voyez tout de suite ce qui est disponible, ce qui ne l’est pas, et ce que vous pouvez faire.',
      'pa.filtrer': 'Filtrer les offres', 'pa.rechercher': 'Rechercher', 'pa.dispo': 'Disponibilité', 'pa.quartier': 'Quartier', 'pa.partenaire': 'Partenaire', 'pa.prix': 'Prix', 'pa.toutes': 'Toutes', 'pa.tous': 'Tous',
      'pa.gratuit': 'Gratuit', 'pa.payant': 'Payant', 'pa.d.disponible': 'Disponible', 'pa.d.complet': 'Complet', 'pa.d.suspendu': 'Suspendu', 'pa.nb0': 'Aucune offre ne correspond à vos critères.', 'pa.nb1': '1 offre.', 'pa.nbN': '{n} offres.',
      'pa.places': '{n} place(s) restante(s)', 'pa.prochaine': 'Prochaine session : {d}', 'pa.reprise': 'Reprise prévue : {d}', 'pa.dt.public': 'Pour qui', 'pa.dt.conditions': 'Conditions', 'pa.dt.lieu': 'Où', 'pa.dt.horaires': 'Quand', 'pa.dt.prix': 'Prix', 'pa.dt.service': 'Service de la ville',
      'pa.par': 'Proposé par {p}, vérifié par la ville le {d}', 'pa.toute': 'Toute la ville', 'pa.q': 'Quartier {q}',
      'pa.a.reserver': 'Réserver', 'pa.a.attente': 'S’inscrire sur liste d’attente', 'pa.a.demande': 'Envoyer une demande', 'pa.a.contacter': 'Contacter', 'pa.a.lien': 'Réserver sur le site du partenaire', 'pa.a.alternative': 'Voir une alternative',
      'pa.connexion': 'Se connecter pour {a}', 'pa.message': 'Message pour le partenaire (facultatif)', 'pa.partage': 'Partager mon adresse e-mail avec le partenaire pour qu’il me réponde directement', 'pa.confirmer': 'Confirmer', 'pa.annuler': 'Annuler',
      'pa.envoye': 'C’est envoyé : {p} vous répondra par la plateforme (numéro {id}).', 'pa.ma.reservation': 'Votre réservation {id}', 'pa.ma.attente': 'Votre inscription sur liste d’attente {id}', 'pa.ma.demande': 'Votre demande {id}',
      'pa.st.envoyee': 'envoyée, en attente de réponse', 'pa.st.acceptee': 'acceptée', 'pa.st.refusee': 'non retenue', 'pa.st.terminee': 'terminée', 'pa.annulerDemande': 'Annuler ma demande', 'pa.annulee': 'Demande annulée.',
      'pa.alternatives': 'Alternatives disponibles', 'pa.voirService': 'Voir le service de la ville', 'pa.personnel': 'Les réservations sont faites par les habitants.', 'pa.vous': 'Vous gérez cette offre (espace partenaire).',
      'pa.note': 'Chaque offre est proposée par un partenaire et vérifiée par la ville avant d’être publiée. La ville ne vend rien : les prix sont ceux du partenaire.', 'pa.versionFr': 'Texte rédigé par le partenaire, en français.', 'pa.externe': '(site extérieur)' },
    en: { 'pa.titre': 'Partner offers', 'pa.intro': 'Partner associations and organisations offer their services. See right away what is available, what is not, and what you can do.',
      'pa.filtrer': 'Filter offers', 'pa.rechercher': 'Search', 'pa.dispo': 'Availability', 'pa.quartier': 'District', 'pa.partenaire': 'Partner', 'pa.prix': 'Price', 'pa.toutes': 'All', 'pa.tous': 'All',
      'pa.gratuit': 'Free', 'pa.payant': 'Paid', 'pa.d.disponible': 'Available', 'pa.d.complet': 'Full', 'pa.d.suspendu': 'Suspended', 'pa.nb0': 'No offer matches your criteria.', 'pa.nb1': '1 offer.', 'pa.nbN': '{n} offers.',
      'pa.places': '{n} place(s) left', 'pa.prochaine': 'Next session: {d}', 'pa.reprise': 'Expected to resume: {d}', 'pa.dt.public': 'For whom', 'pa.dt.conditions': 'Conditions', 'pa.dt.lieu': 'Where', 'pa.dt.horaires': 'When', 'pa.dt.prix': 'Price', 'pa.dt.service': 'City service',
      'pa.par': 'Offered by {p}, checked by the city on {d}', 'pa.toute': 'Whole city', 'pa.q': '{q} district',
      'pa.a.reserver': 'Book', 'pa.a.attente': 'Join the waiting list', 'pa.a.demande': 'Send a request', 'pa.a.contacter': 'Contact', 'pa.a.lien': 'Book on the partner’s website', 'pa.a.alternative': 'See an alternative',
      'pa.connexion': 'Sign in to {a}', 'pa.message': 'Message for the partner (optional)', 'pa.partage': 'Share my e-mail address with the partner so they can reply directly', 'pa.confirmer': 'Confirm', 'pa.annuler': 'Cancel',
      'pa.envoye': 'Sent: {p} will reply through the platform (number {id}).', 'pa.ma.reservation': 'Your booking {id}', 'pa.ma.attente': 'Your waiting list entry {id}', 'pa.ma.demande': 'Your request {id}',
      'pa.st.envoyee': 'sent, awaiting reply', 'pa.st.acceptee': 'accepted', 'pa.st.refusee': 'not accepted', 'pa.st.terminee': 'completed', 'pa.annulerDemande': 'Cancel my request', 'pa.annulee': 'Request cancelled.',
      'pa.alternatives': 'Available alternatives', 'pa.voirService': 'See the city service', 'pa.personnel': 'Bookings are made by residents.', 'pa.vous': 'You manage this offer (partner area).',
      'pa.note': 'Each offer comes from a partner and is checked by the city before being published. The city sells nothing: prices are the partner’s.', 'pa.versionFr': 'Text written by the partner, in French.', 'pa.externe': '(external website)' },
    es: { 'pa.titre': 'Ofertas de los socios', 'pa.intro': 'Asociaciones y entidades socias ofrecen sus servicios. Vea enseguida lo que está disponible, lo que no y lo que puede hacer.',
      'pa.filtrer': 'Filtrar las ofertas', 'pa.rechercher': 'Buscar', 'pa.dispo': 'Disponibilidad', 'pa.quartier': 'Barrio', 'pa.partenaire': 'Socio', 'pa.prix': 'Precio', 'pa.toutes': 'Todas', 'pa.tous': 'Todos',
      'pa.gratuit': 'Gratis', 'pa.payant': 'De pago', 'pa.d.disponible': 'Disponible', 'pa.d.complet': 'Completo', 'pa.d.suspendu': 'Suspendido', 'pa.nb0': 'Ninguna oferta corresponde a sus criterios.', 'pa.nb1': '1 oferta.', 'pa.nbN': '{n} ofertas.',
      'pa.places': 'Quedan {n} plaza(s)', 'pa.prochaine': 'Próxima sesión: {d}', 'pa.reprise': 'Reanudación prevista: {d}', 'pa.dt.public': 'Para quién', 'pa.dt.conditions': 'Condiciones', 'pa.dt.lieu': 'Dónde', 'pa.dt.horaires': 'Cuándo', 'pa.dt.prix': 'Precio', 'pa.dt.service': 'Servicio municipal',
      'pa.par': 'Propuesto por {p}, verificado por el ayuntamiento el {d}', 'pa.toute': 'Toda la ciudad', 'pa.q': 'Barrio {q}',
      'pa.a.reserver': 'Reservar', 'pa.a.attente': 'Apuntarse en lista de espera', 'pa.a.demande': 'Enviar una solicitud', 'pa.a.contacter': 'Contactar', 'pa.a.lien': 'Reservar en la web del socio', 'pa.a.alternative': 'Ver una alternativa',
      'pa.connexion': 'Iniciar sesión para {a}', 'pa.message': 'Mensaje para el socio (opcional)', 'pa.partage': 'Compartir mi correo con el socio para que me responda directamente', 'pa.confirmer': 'Confirmar', 'pa.annuler': 'Cancelar',
      'pa.envoye': 'Enviado: {p} le responderá por la plataforma (número {id}).', 'pa.ma.reservation': 'Su reserva {id}', 'pa.ma.attente': 'Su inscripción en lista de espera {id}', 'pa.ma.demande': 'Su solicitud {id}',
      'pa.st.envoyee': 'enviada, esperando respuesta', 'pa.st.acceptee': 'aceptada', 'pa.st.refusee': 'no aceptada', 'pa.st.terminee': 'terminada', 'pa.annulerDemande': 'Anular mi solicitud', 'pa.annulee': 'Solicitud anulada.',
      'pa.alternatives': 'Alternativas disponibles', 'pa.voirService': 'Ver el servicio municipal', 'pa.personnel': 'Las reservas las hacen los habitantes.', 'pa.vous': 'Usted gestiona esta oferta (espacio socio).',
      'pa.note': 'Cada oferta la propone un socio y la verifica el ayuntamiento antes de publicarla. El ayuntamiento no vende nada: los precios son los del socio.', 'pa.versionFr': 'Texto redactado por el socio, en francés.', 'pa.externe': '(sitio externo)' },
    ar: { 'pa.titre': 'عروض الشركاء', 'pa.intro': 'تقدم جمعيات وهيئات شريكة خدماتها. اعرف فوراً ما هو متاح وما ليس متاحاً وما يمكنك فعله.',
      'pa.filtrer': 'تصفية العروض', 'pa.rechercher': 'بحث', 'pa.dispo': 'التوفر', 'pa.quartier': 'الحي', 'pa.partenaire': 'الشريك', 'pa.prix': 'السعر', 'pa.toutes': 'الكل', 'pa.tous': 'الكل',
      'pa.gratuit': 'مجاني', 'pa.payant': 'مدفوع', 'pa.d.disponible': 'متاح', 'pa.d.complet': 'مكتمل', 'pa.d.suspendu': 'معلّق', 'pa.nb0': 'لا يوجد عرض يطابق معاييرك.', 'pa.nb1': 'عرض واحد.', 'pa.nbN': '{n} عروض.',
      'pa.places': 'تبقى {n} أماكن', 'pa.prochaine': 'الحصة القادمة: {d}', 'pa.reprise': 'الاستئناف المتوقع: {d}', 'pa.dt.public': 'لمن', 'pa.dt.conditions': 'الشروط', 'pa.dt.lieu': 'أين', 'pa.dt.horaires': 'متى', 'pa.dt.prix': 'السعر', 'pa.dt.service': 'خدمة المدينة',
      'pa.par': 'يقدمه {p}، تحققت منه المدينة في {d}', 'pa.toute': 'كل المدينة', 'pa.q': 'حي {q}',
      'pa.a.reserver': 'حجز', 'pa.a.attente': 'التسجيل في قائمة الانتظار', 'pa.a.demande': 'إرسال طلب', 'pa.a.contacter': 'التواصل', 'pa.a.lien': 'الحجز على موقع الشريك', 'pa.a.alternative': 'عرض بديل',
      'pa.connexion': 'سجّل الدخول لـ{a}', 'pa.message': 'رسالة إلى الشريك (اختياري)', 'pa.partage': 'مشاركة بريدي الإلكتروني مع الشريك ليرد مباشرة', 'pa.confirmer': 'تأكيد', 'pa.annuler': 'إلغاء',
      'pa.envoye': 'تم الإرسال: سيرد عليك {p} عبر المنصة (الرقم {id}).', 'pa.ma.reservation': 'حجزك {id}', 'pa.ma.attente': 'تسجيلك في قائمة الانتظار {id}', 'pa.ma.demande': 'طلبك {id}',
      'pa.st.envoyee': 'مرسل، بانتظار الرد', 'pa.st.acceptee': 'مقبول', 'pa.st.refusee': 'غير مقبول', 'pa.st.terminee': 'منتهٍ', 'pa.annulerDemande': 'إلغاء طلبي', 'pa.annulee': 'تم إلغاء الطلب.',
      'pa.alternatives': 'بدائل متاحة', 'pa.voirService': 'عرض خدمة المدينة', 'pa.personnel': 'الحجوزات يقوم بها السكان.', 'pa.vous': 'أنت تدير هذا العرض (فضاء الشريك).',
      'pa.note': 'كل عرض يقدمه شريك وتتحقق منه المدينة قبل نشره. المدينة لا تبيع شيئاً: الأسعار هي أسعار الشريك.', 'pa.versionFr': 'نص كتبه الشريك بالفرنسية.', 'pa.externe': '(موقع خارجي)' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  const u = NT.auth.utilisateur();
  let D = null;
  const LOC = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const jour = (iso) => (iso ? new Date(String(iso).slice(0, 10) + 'T12:00:00Z').toLocaleDateString(LOC(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) : '');
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const NIVEAU = { disponible: ['disponible', 'ph-check-circle'], complet: ['perturbe', 'ph-hourglass-medium'], suspendu: ['indisponible', 'ph-pause-circle'] };
  const ICONE_A = { reserver: 'ph-calendar-plus', attente: 'ph-list-plus', demande: 'ph-paper-plane-tilt', contacter: 'ph-phone', lien: 'ph-arrow-square-out', alternative: 'ph-signpost' };
  const nomSvc = (id) => { const s = NT.services && NT.services.get ? NT.services.get(id) : null; return s ? (s.nom[NT.i18n.langue] || s.nom.fr) : id; };

  function charger() {
    const r = NT.api('GET', '/api/partenaires/offres');
    D = r.statut === 200 ? r.donnees : { offres: [], partenaires: [] };
    // compte partenaire : son propre identifiant (pour « c'est vous » sur ses offres) vient de son espace, l'API publique ne l'expose pas
    D.monPartenaire = D.estPartenaire ? (((NT.api('GET', '/api/partenaires/moi').donnees || {}).partenaire || {}).id || '') : '';
  }
  function filtres() {
    $('pa-dispo').innerHTML = `<option value="">${E(t('pa.toutes'))}</option>` + ['disponible', 'complet', 'suspendu'].map((d) => `<option value="${d}">${E(t('pa.d.' + d))}</option>`).join('');
    $('pa-quartier').innerHTML = `<option value="">${E(t('pa.tous'))}</option>` + NT.QUARTIERS.map((q) => `<option value="${q}">${E(NT.t('tr.q.' + q, null, q))}</option>`).join('');
    $('pa-partenaire').innerHTML = `<option value="">${E(t('pa.tous'))}</option>` + D.partenaires.map((p) => `<option value="${E(p.id)}">${E(p.nom)}</option>`).join('');
    $('pa-prix').innerHTML = `<option value="">${E(t('pa.tous'))}</option><option value="gratuit">${E(t('pa.gratuit'))}</option><option value="payant">${E(t('pa.payant'))}</option>`;
    $('pa-filtres').addEventListener('input', rendre); $('pa-filtres').addEventListener('change', rendre);
    $('pa-filtres').addEventListener('submit', (e) => e.preventDefault());
  }
  function etatTexte(o) {
    const d = o.disponibilite;
    if (d.statut === 'suspendu') return d.prochaineDate ? t('pa.reprise', { d: jour(d.prochaineDate) }) : '';
    if (d.statut === 'complet') return d.prochaineDate ? t('pa.prochaine', { d: jour(d.prochaineDate) }) : '';
    return d.placesRestantes != null ? t('pa.places', { n: d.placesRestantes }) : '';
  }
  function action(o) {
    const a = o.actionPossible, lib = t('pa.a.' + a), ic = `<i class="ph ${ICONE_A[a]}" aria-hidden="true"></i>`;
    if (o.maDemande && ['envoyee', 'acceptee'].includes(o.maDemande.statut)) return '';
    if (a === 'contacter') return [o.tel ? `<a class="btn btn-primaire" href="tel:${E(o.tel.replace(/[^\d+]/g, ''))}">${ic}${E(lib)} · ${E(o.tel)}</a>` : '', o.email ? `<a class="btn" href="mailto:${E(o.email)}"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${E(o.email)}</a>` : ''].join('');
    if (a === 'lien') return `<a class="btn btn-primaire" href="${E(o.lien)}" rel="noopener noreferrer">${ic}${E(lib)} <span class="sr-only">${E(t('pa.externe'))}</span></a>`;
    if (a === 'alternative') return `<a class="btn btn-primaire" href="#alt-${E(o.id)}" data-pa-alt="${E(o.id)}">${ic}${E(lib)}</a>`;
    if (!u) return `<a class="btn btn-primaire" href="connexion.html?retour=${encodeURIComponent('partenaires.html#' + o.id)}">${ic}${E(t('pa.connexion', { a: lib.toLowerCase() }))}</a>`;
    if (u.role !== 'citoyen') return `<p class="doux">${E(t('pa.personnel'))}</p>`;
    if (D.monPartenaire && o.partenaire && D.monPartenaire === o.partenaire.id) return `<p class="doux">${E(t('pa.vous'))}</p>`;
    return `<button type="button" class="btn btn-primaire" data-pa-ouvrir="${E(o.id)}" aria-expanded="false" aria-controls="pa-f-${E(o.id)}">${ic}${E(lib)}</button>
      <form class="pa-form" id="pa-f-${E(o.id)}" data-pa-form="${E(o.id)}" hidden>
        <div class="champ"><label for="pa-m-${E(o.id)}">${E(t('pa.message'))}</label><textarea id="pa-m-${E(o.id)}" maxlength="500" rows="2"></textarea></div>
        <label class="pa-case"><input type="checkbox" id="pa-p-${E(o.id)}"> ${E(t('pa.partage'))}</label>
        <div class="pa-boutons"><button class="btn btn-primaire" type="submit">${E(t('pa.confirmer'))} · ${E(lib)}</button><button class="btn" type="button" data-pa-fermer="${E(o.id)}">${E(t('pa.annuler'))}</button></div></form>`;
  }
  function carte(o) {
    const n = NIVEAU[o.disponibilite.statut], et = etatTexte(o);
    const md = o.maDemande;
    const alt = o.actionPossible === 'alternative' || o.disponibilite.statut !== 'disponible';
    return `<li class="pa-carte pa-${E(o.disponibilite.statut)}" id="${E(o.id)}" tabindex="-1">
      <div class="pa-tete"><h2 lang="fr">${E(o.titre)}</h2><span class="niveau-svc niveau-svc-${n[0]}"><i class="ph ${n[1]}" aria-hidden="true"></i>${E(t('pa.d.' + o.disponibilite.statut))}</span></div>
      ${et ? `<p class="pa-etat">${E(et)}${o.disponibilite.note ? ' · <span lang="fr">' + E(o.disponibilite.note) + '</span>' : ''}</p>` : ''}
      <p class="pa-desc" lang="fr">${E(o.description)}</p>
      <dl class="pa-infos">
        ${o.public ? `<div><dt>${E(t('pa.dt.public'))}</dt><dd lang="fr">${E(o.public)}</dd></div>` : ''}
        ${o.conditions ? `<div><dt>${E(t('pa.dt.conditions'))}</dt><dd lang="fr">${E(o.conditions)}</dd></div>` : ''}
        <div><dt>${E(t('pa.dt.lieu'))}</dt><dd>${E(o.quartier === 'Toute la ville' ? t('pa.toute') : t('pa.q', { q: NT.t('tr.q.' + o.quartier, null, o.quartier) }))}${o.lieu ? ` · <span lang="fr">${E(o.lieu)}</span>` : ''}</dd></div>
        ${o.horaires ? `<div><dt>${E(t('pa.dt.horaires'))}</dt><dd lang="fr">${E(o.horaires)}</dd></div>` : ''}
        <div><dt>${E(t('pa.dt.prix'))}</dt><dd>${o.gratuit ? E(t('pa.gratuit')) : `<span lang="fr">${E(o.prix)}</span>`}</dd></div>
        ${o.serviceId ? `<div><dt>${E(t('pa.dt.service'))}</dt><dd><a href="services.html#${E(o.serviceId)}">${E(nomSvc(o.serviceId))}</a></dd></div>` : ''}
      </dl>
      ${md ? `<p class="pa-ma pa-ma-${E(md.statut)}"><i class="ph-duotone ph-ticket" aria-hidden="true"></i><span><strong>${E(t('pa.ma.' + md.type, { id: md.id }))}</strong> : ${E(t('pa.st.' + md.statut))}${md.reponse ? ` — <span lang="fr">« ${E(md.reponse)} »</span>` : ''}
        ${['envoyee', 'acceptee'].includes(md.statut) ? `<button type="button" class="lien-bouton" data-pa-annuler="${E(md.id)}">${E(t('pa.annulerDemande'))}</button>` : ''}</span></p>` : ''}
      <div class="pa-actions">${action(o)}</div>
      ${alt && (o.alternatives.length || o.serviceId) ? `<div class="pa-alt" id="alt-${E(o.id)}"><p><strong>${E(t('pa.alternatives'))}</strong></p><ul>${o.alternatives.map((a) => `<li><a href="#${E(a.id)}" data-pa-aller="${E(a.id)}" lang="fr">${E(a.titre)}</a> · ${E(a.partenaire)}</li>`).join('')}
        ${o.serviceId ? `<li><a href="services.html#${E(o.serviceId)}">${E(t('pa.voirService'))} : ${E(nomSvc(o.serviceId))}</a></li>` : ''}</ul></div>` : ''}
      <p class="pa-verifie"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i>${E(t('pa.par', { p: o.partenaire.nom, d: NT.ui.date(o.verifiee.le) }))}${NT.i18n.langue !== 'fr' ? ` <span class="doux">· ${E(t('pa.versionFr'))}</span>` : ''}</p>
    </li>`;
  }
  function rendre() {
    const q = norm($('pa-q').value), d = $('pa-dispo').value, qu = $('pa-quartier').value, p = $('pa-partenaire').value, px = $('pa-prix').value;
    const l = D.offres.filter((o) => (!q || norm([o.titre, o.description, o.public, o.motsCles, o.partenaire.nom, o.lieu].join(' ')).includes(q)) && (!d || o.disponibilite.statut === d)
      && (!qu || o.quartier === qu || o.quartier === 'Toute la ville') && (!p || o.partenaire.id === p) && (!px || (px === 'gratuit' ? o.gratuit : !o.gratuit)));
    $('pa-liste').innerHTML = l.map(carte).join('');
    $('pa-nb').textContent = !l.length ? t('pa.nb0') : l.length === 1 ? t('pa.nb1') : t('pa.nbN', { n: l.length });
  }
  function aller(id) { const c = document.getElementById(id); if (!c) return; c.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); c.focus({ preventScroll: true }); c.classList.add('pa-cible'); setTimeout(() => c.classList.remove('pa-cible'), 1600); }

  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-pa-ouvrir],[data-pa-fermer],[data-pa-annuler],[data-pa-aller],[data-pa-alt]'); if (!b) return;
    if (b.dataset.paOuvrir) { const f = $('pa-f-' + b.dataset.paOuvrir); f.hidden = false; b.setAttribute('aria-expanded', 'true'); f.querySelector('textarea').focus(); }
    else if (b.dataset.paFermer) { const f = $('pa-f-' + b.dataset.paFermer); f.hidden = true; const o = document.querySelector(`[data-pa-ouvrir="${b.dataset.paFermer}"]`); o.setAttribute('aria-expanded', 'false'); o.focus(); }
    else if (b.dataset.paAnnuler) { const r = NT.api('POST', '/api/partenaires/demandes/' + encodeURIComponent(b.dataset.paAnnuler) + '/annuler', {}); if (r.statut === 200) { NT.ui.toast(t('pa.annulee'), 'success'); const id = b.closest('.pa-carte').id; charger(); rendre(); aller(id); } else NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); }
    else if (b.dataset.paAller) { e.preventDefault(); aller(b.dataset.paAller); history.replaceState(null, '', '#' + b.dataset.paAller); }
    else if (b.dataset.paAlt) { e.preventDefault(); const z = $('alt-' + b.dataset.paAlt); if (z) { z.setAttribute('tabindex', '-1'); z.focus(); z.scrollIntoView({ block: 'center' }); } }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-pa-form]'); if (!f) return;
    e.preventDefault();
    const id = f.dataset.paForm;
    const r = NT.api('POST', '/api/partenaires/offres/' + encodeURIComponent(id) + '/demande', { message: $('pa-m-' + id).value, partageEmail: $('pa-p-' + id).checked });
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger', 8000); return; }
    const o = D.offres.find((x) => x.id === id);
    NT.ui.toast(t('pa.envoye', { p: o.partenaire.nom, id: r.donnees.demande.id }), 'success', 9000);
    charger(); rendre(); aller(id);
  });

  function demarrer() {
    charger(); filtres(); rendre();
    if (location.hash) setTimeout(() => aller(decodeURIComponent(location.hash.slice(1))), 150);
  }
  if (document.readyState === 'complete') demarrer(); else document.addEventListener('DOMContentLoaded', demarrer);
})();
