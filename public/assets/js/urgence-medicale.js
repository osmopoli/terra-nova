/* Terra Nova — vague 17 (F86) : écran « urgence médicale » côté habitant.
   - demande.html : choix explicite « Quelqu'un est en danger maintenant ? » et repérage des mots d'urgence pendant la saisie
     (4 langues) → écran clair : appeler le 15 / 112 d'abord (touche pour appeler), quoi faire en attendant, lieux de soins les
     plus proches ; l'envoi est enregistré comme URGENCE MÉDICALE par le serveur et la confirmation affiche le statut en direct ;
   - urgence.html?id=NT-xxxx (habitant connecté, ou visiteur avec le code de l'accusé de réception) : statut en direct ;
   - suivi.html?id=NT-xxxx : rappel et lien vers le statut en direct.
   La plateforme rappelle toujours qu'elle ne remplace pas les services d'urgence. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'um.titre': 'Urgence médicale : appelez d’abord les secours', 'um.sous': 'Si une vie est en danger, chaque minute compte : appelez maintenant.',
      'um.a15': 'Appeler le 15', 'um.a15d': 'SAMU, urgence médicale', 'um.a112': 'Appeler le 112', 'um.a112d': 'Toutes urgences, depuis tout téléphone',
      'um.nePasRemplacer': 'Terra Nova ne remplace pas les services d’urgence. Votre signalement est transmis aux agents de la mairie, mais seuls le 15 et le 112 envoient des secours.',
      'um.attente': 'En attendant les secours', 'um.c1': 'Restez auprès de la personne, parlez-lui et rassurez-la.', 'um.c2': 'Si elle ne répond pas mais respire : allongez-la sur le côté (position latérale de sécurité).',
      'um.c3': 'Si elle ne respire pas : suivez les consignes du 15 au téléphone (massage cardiaque).', 'um.c4': 'Ne lui donnez ni à boire ni à manger.', 'um.c5': 'Envoyez quelqu’un accueillir les secours, laissez la porte ouverte et votre téléphone libre.',
      'um.lieux': 'Lieux de soins les plus proches', 'um.h24': 'Ouvert 24h/24', 'um.appeler': 'Appeler', 'um.carte': 'Voir sur la carte',
      'um.statut': 'Statut de votre signalement {id}', 'um.direct': 'Mis à jour automatiquement toutes les 10 secondes.', 'um.priseEn': 'Pris en charge en {n} min',
      'um.escalade': 'Pas encore pris en charge : escaladé au responsable de garde.', 'um.attenteAgent': 'Les agents de garde sont alertés. Délai de prise en charge visé : {n} min.',
      'um.e.signalee': 'Signalée', 'um.e.prise_en_charge': 'Prise en charge par un agent', 'um.e.transmise': 'Transmise aux secours', 'um.e.close': 'Close',
      'um.lienVital': 'Quelqu’un est en danger maintenant (malaise, ne respire plus, saigne beaucoup…) ?', 'um.boutonVital': 'Urgence vitale',
      'um.propTitre': 'Cela ressemble à une urgence médicale', 'um.propTexte': 'Si quelqu’un est en danger, appelez d’abord le 15 ou le 112. Vous pouvez aussi envoyer ce signalement à la mairie comme urgence vitale.',
      'um.oui': 'Oui, c’est une urgence vitale', 'um.non': 'Non, ce n’est pas urgent', 'um.marque': 'Envoyé comme urgence vitale', 'um.retirer': 'Retirer',
      'um.enregistree': 'Votre signalement est enregistré comme URGENCE MÉDICALE', 'um.voirStatut': 'Voir le statut en direct', 'um.introuvable': 'Ce signalement d’urgence est introuvable ou le code ne correspond pas.',
      'um.suiviCarte': 'Cette demande est une urgence médicale', 'um.pageTitre': 'Urgence médicale' },
    en: { 'um.titre': 'Medical emergency: call emergency services first', 'um.sous': 'If a life is in danger, every minute counts: call now.',
      'um.a15': 'Call 15', 'um.a15d': 'SAMU, medical emergency', 'um.a112': 'Call 112', 'um.a112d': 'All emergencies, from any phone',
      'um.nePasRemplacer': 'Terra Nova does not replace emergency services. Your report is sent to city hall staff, but only 15 and 112 send help.',
      'um.attente': 'While waiting for help', 'um.c1': 'Stay with the person, talk to them and reassure them.', 'um.c2': 'If they do not respond but are breathing: lay them on their side (recovery position).',
      'um.c3': 'If they are not breathing: follow the instructions of 15 on the phone (chest compressions).', 'um.c4': 'Do not give them anything to drink or eat.', 'um.c5': 'Send someone to meet the rescuers, leave the door open and keep your phone free.',
      'um.lieux': 'Nearest care places', 'um.h24': 'Open 24/7', 'um.appeler': 'Call', 'um.carte': 'See on the map',
      'um.statut': 'Status of your report {id}', 'um.direct': 'Updated automatically every 10 seconds.', 'um.priseEn': 'Handled within {n} min',
      'um.escalade': 'Not yet handled: escalated to the duty manager.', 'um.attenteAgent': 'On-duty staff have been alerted. Target handling time: {n} min.',
      'um.e.signalee': 'Reported', 'um.e.prise_en_charge': 'Handled by a staff member', 'um.e.transmise': 'Passed to emergency services', 'um.e.close': 'Closed',
      'um.lienVital': 'Is someone in danger right now (collapsed, not breathing, bleeding heavily…)?', 'um.boutonVital': 'Life-threatening emergency',
      'um.propTitre': 'This looks like a medical emergency', 'um.propTexte': 'If someone is in danger, call 15 or 112 first. You can also send this report to city hall as a life-threatening emergency.',
      'um.oui': 'Yes, it is life-threatening', 'um.non': 'No, it is not urgent', 'um.marque': 'Sent as a life-threatening emergency', 'um.retirer': 'Remove',
      'um.enregistree': 'Your report is recorded as a MEDICAL EMERGENCY', 'um.voirStatut': 'See the live status', 'um.introuvable': 'This emergency report cannot be found or the code does not match.',
      'um.suiviCarte': 'This request is a medical emergency', 'um.pageTitre': 'Medical emergency' },
    es: { 'um.titre': 'Urgencia médica: llame primero a emergencias', 'um.sous': 'Si una vida está en peligro, cada minuto cuenta: llame ahora.',
      'um.a15': 'Llamar al 15', 'um.a15d': 'SAMU, urgencia médica', 'um.a112': 'Llamar al 112', 'um.a112d': 'Todas las urgencias, desde cualquier teléfono',
      'um.nePasRemplacer': 'Terra Nova no sustituye a los servicios de emergencia. Su aviso se transmite al personal del ayuntamiento, pero solo el 15 y el 112 envían ayuda.',
      'um.attente': 'Mientras llega la ayuda', 'um.c1': 'Quédese junto a la persona, háblele y tranquilícela.', 'um.c2': 'Si no responde pero respira: túmbela de lado (posición lateral de seguridad).',
      'um.c3': 'Si no respira: siga las instrucciones del 15 por teléfono (masaje cardíaco).', 'um.c4': 'No le dé de beber ni de comer.', 'um.c5': 'Envíe a alguien a recibir a los servicios de emergencia, deje la puerta abierta y el teléfono libre.',
      'um.lieux': 'Centros de salud más cercanos', 'um.h24': 'Abierto 24 h', 'um.appeler': 'Llamar', 'um.carte': 'Ver en el mapa',
      'um.statut': 'Estado de su aviso {id}', 'um.direct': 'Se actualiza automáticamente cada 10 segundos.', 'um.priseEn': 'Atendido en {n} min',
      'um.escalade': 'Aún no atendido: escalado al responsable de guardia.', 'um.attenteAgent': 'El personal de guardia ha sido alertado. Plazo de atención previsto: {n} min.',
      'um.e.signalee': 'Señalada', 'um.e.prise_en_charge': 'Atendida por un agente', 'um.e.transmise': 'Transmitida a emergencias', 'um.e.close': 'Cerrada',
      'um.lienVital': '¿Hay alguien en peligro ahora mismo (desmayo, no respira, sangra mucho…)?', 'um.boutonVital': 'Urgencia vital',
      'um.propTitre': 'Esto parece una urgencia médica', 'um.propTexte': 'Si alguien está en peligro, llame primero al 15 o al 112. También puede enviar este aviso al ayuntamiento como urgencia vital.',
      'um.oui': 'Sí, es una urgencia vital', 'um.non': 'No, no es urgente', 'um.marque': 'Enviado como urgencia vital', 'um.retirer': 'Quitar',
      'um.enregistree': 'Su aviso está registrado como URGENCIA MÉDICA', 'um.voirStatut': 'Ver el estado en directo', 'um.introuvable': 'No se encuentra este aviso de urgencia o el código no coincide.',
      'um.suiviCarte': 'Esta solicitud es una urgencia médica', 'um.pageTitre': 'Urgencia médica' },
    ar: { 'um.titre': 'حالة طبية طارئة: اتصل بالإسعاف أولاً', 'um.sous': 'إذا كانت حياة في خطر فكل دقيقة مهمة: اتصل الآن.',
      'um.a15': 'اتصل بالرقم 15', 'um.a15d': 'الإسعاف الطبي (SAMU)', 'um.a112': 'اتصل بالرقم 112', 'um.a112d': 'جميع حالات الطوارئ، من أي هاتف',
      'um.nePasRemplacer': 'تيرا نوفا لا تحل محل خدمات الطوارئ. يُرسل بلاغك إلى موظفي البلدية، لكن الرقمين 15 و112 وحدهما يرسلان المساعدة.',
      'um.attente': 'في انتظار الإسعاف', 'um.c1': 'ابقَ بجانب الشخص وتحدث إليه وطمئنه.', 'um.c2': 'إذا لم يستجب لكنه يتنفس: ضعه على جانبه (وضعية الأمان الجانبية).',
      'um.c3': 'إذا لم يكن يتنفس: اتبع تعليمات الرقم 15 عبر الهاتف (تدليك القلب).', 'um.c4': 'لا تعطه شيئاً ليشربه أو يأكله.', 'um.c5': 'أرسل شخصاً لاستقبال المسعفين، واترك الباب مفتوحاً وهاتفك متاحاً.',
      'um.lieux': 'أقرب أماكن العلاج', 'um.h24': 'مفتوح على مدار الساعة', 'um.appeler': 'اتصال', 'um.carte': 'عرض على الخريطة',
      'um.statut': 'حالة بلاغك {id}', 'um.direct': 'يُحدَّث تلقائياً كل 10 ثوانٍ.', 'um.priseEn': 'تم التكفل به خلال {n} دقيقة',
      'um.escalade': 'لم يتم التكفل به بعد: تم تصعيده إلى المسؤول المناوب.', 'um.attenteAgent': 'تم تنبيه الموظفين المناوبين. مدة التكفل المستهدفة: {n} دقيقة.',
      'um.e.signalee': 'تم الإبلاغ', 'um.e.prise_en_charge': 'تكفّل بها موظف', 'um.e.transmise': 'أُحيلت إلى الإسعاف', 'um.e.close': 'مغلقة',
      'um.lienVital': 'هل هناك شخص في خطر الآن (إغماء، لا يتنفس، نزيف شديد…)؟', 'um.boutonVital': 'حالة تهدد الحياة',
      'um.propTitre': 'يبدو أن هذه حالة طبية طارئة', 'um.propTexte': 'إذا كان شخص في خطر فاتصل أولاً بالرقم 15 أو 112. يمكنك أيضاً إرسال هذا البلاغ إلى البلدية كحالة تهدد الحياة.',
      'um.oui': 'نعم، حالة تهدد الحياة', 'um.non': 'لا، ليست عاجلة', 'um.marque': 'سيُرسل كحالة تهدد الحياة', 'um.retirer': 'إزالة',
      'um.enregistree': 'تم تسجيل بلاغك كحالة طبية طارئة', 'um.voirStatut': 'عرض الحالة مباشرة', 'um.introuvable': 'لم يُعثر على بلاغ الطوارئ هذا أو أن الرمز غير مطابق.',
      'um.suiviCarte': 'هذا الطلب حالة طبية طارئة', 'um.pageTitre': 'حالة طبية طارئة' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const sansAccent = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Même liste que le serveur (src/modules/urgences.js), version courte pour le repérage pendant la saisie
  const MOTS = ['urgence vitale', 'urgence medicale', 'malaise', 'inconscient', 'perte de connaissance', 'evanoui', 'ne respire plus', 'ne respire pas', 'respire mal', 'arret cardiaque', 'crise cardiaque',
    'infarctus', 'douleur thoracique', 'avc', 'convulsion', 'hemorragie', 'saigne beaucoup', 'overdose', 'etouffe', 'noyade', 'brulure grave', 'blesse grave', 'empoisonnement',
    'medical emergency', 'unconscious', 'not breathing', 'heart attack', 'cardiac arrest', 'chest pain', 'stroke', 'seizure', 'bleeding heavily', 'choking', 'drowning', 'collapsed', 'fainted',
    'urgencia medica', 'inconsciente', 'no respira', 'ataque al corazon', 'infarto', 'dolor en el pecho', 'convulsion', 'sangra mucho', 'sobredosis', 'se ahoga', 'desmayo'];
  const MOTS_AR = ['حالة طارئة', 'إسعاف', 'فاقد الوعي', 'لا يتنفس', 'نوبة قلبية', 'سكتة', 'ألم في الصدر', 'جلطة', 'تشنج', 'نزيف', 'اختناق', 'غرق', 'إغماء'];
  const detecter = (brut) => { const s = sansAccent(brut); return MOTS.some((m) => new RegExp(`(^|[^a-z0-9])${m}($|[^a-z0-9])`).test(s)) || MOTS_AR.some((m) => String(brut).includes(m)); };

  /* ---------- Écran d'urgence (réutilisé partout) ---------- */
  function lieuxHtml(l) {
    if (!l || !l.length) return '';
    return `<h3><i class="ph-duotone ph-map-pin" aria-hidden="true"></i> ${E(t('um.lieux'))}</h3><ul class="urg-lieux">${l.map((x) => `<li><div><strong>${E(x.nom)}</strong>
      <span class="doux">${E(x.adresse || '')}${x.h24 ? ' · ' + E(t('um.h24')) : x.horaires ? ' · ' + E(x.horaires) : ''}</span></div>
      <div class="liens">${x.tel ? `<a class="btn petit" href="tel:${E(String(x.tel).replace(/\s/g, ''))}"><i class="ph ph-phone" aria-hidden="true"></i>${E(t('um.appeler'))}</a>` : ''}<a class="btn petit" href="${E(x.lien)}">${E(t('um.carte'))}</a></div></li>`).join('')}</ul>`;
  }
  function statutHtml(s) {
    if (!s) return '';
    const ordre = ['signalee', 'prise_en_charge', 'transmise', 'close'];
    const i = ordre.indexOf(s.statut);
    const date = (st) => { const h = (s.historique || []).filter((x) => x.statut === st).pop(); return h ? NT.ui.dateHeure(h.date) : ''; };
    return `<div class="urg-statut" aria-live="polite"><h3>${E(t('um.statut', { id: s.id }))}</h3>
      <ol class="urg-etapes">${ordre.map((st, k) => `<li class="${k < i ? 'faite' : k === i ? (st === 'close' ? 'faite' : 'courante') : ''}"><i class="ph-duotone ${k <= i ? 'ph-check-circle' : 'ph-circle'}" aria-hidden="true"></i>
        <span>${E(t('um.e.' + st))}${k <= i && date(st) ? `<small>${E(date(st))}</small>` : ''}</span></li>`).join('')}</ol>
      ${s.priseEnCharge ? `<p><strong>${E(t('um.priseEn', { n: s.priseEnCharge.minutes }))}</strong></p>` : s.escalade ? `<p><strong>${E(t('um.escalade'))}</strong></p>` : `<p>${E(t('um.attenteAgent', { n: s.delaiMinutes || 5 }))}</p>`}
      ${s.statut !== 'close' ? `<p class="urg-direct"><i class="ph ph-arrows-clockwise" aria-hidden="true"></i> ${E(t('um.direct'))}</p>` : ''}</div>`;
  }
  function ecran(o) {
    o = o || {};
    return `<section class="urg-ecran" aria-labelledby="urg-titre" tabindex="-1">
      <h2 id="urg-titre"><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('um.titre'))}</h2>
      ${o.enregistree ? `<p><span class="urg-marque"><i class="ph ph-siren" aria-hidden="true"></i>${E(t('um.enregistree'))}</span></p>` : ''}
      <p style="margin:.2rem 0 0">${E(t('um.sous'))}</p>
      <div class="urg-appels"><a class="urg-appel" href="tel:15"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i><span>${E(t('um.a15'))}<small>${E(t('um.a15d'))}</small></span></a>
        <a class="urg-appel secondaire" href="tel:112"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i><span>${E(t('um.a112'))}<small>${E(t('um.a112d'))}</small></span></a></div>
      <p class="urg-avertissement"><i class="ph-duotone ph-info" aria-hidden="true"></i><span>${E(t('um.nePasRemplacer'))}</span></p>
      <div data-urg-statut>${statutHtml(o.statut)}</div>
      <h3><i class="ph-duotone ph-hand-heart" aria-hidden="true"></i> ${E(t('um.attente'))}</h3>
      <ol class="urg-consignes">${['c1', 'c2', 'c3', 'c4', 'c5'].map((c) => `<li>${E(t('um.' + c))}</li>`).join('')}</ol>
      <div data-urg-lieux>${lieuxHtml(o.lieux)}</div></section>`;
  }
  const quartierMoi = () => { const u = NT.auth.utilisateur(); return (u && u.quartier) || 'Centre'; };
  const pointsPour = (q) => { const r = NT.api('GET', '/api/urgences-points?quartier=' + encodeURIComponent(q || quartierMoi())); return r.statut === 200 ? r.donnees : []; };
  // Statut en direct : toutes les 10 s tant que l'urgence n'est pas close
  function suivre(zone, id, code) {
    const url = '/api/urgences/' + encodeURIComponent(id) + '/statut' + (code ? '?code=' + encodeURIComponent(code) : '');
    const maj = () => fetch(url, { cache: 'no-store', credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((s) => {
      if (!s) return;
      const z = zone.querySelector('[data-urg-statut]'); if (z) z.innerHTML = statutHtml(s);
      const l = zone.querySelector('[data-urg-lieux]'); if (l && !l.dataset.rempli && s.points) { l.innerHTML = lieuxHtml(s.points); l.dataset.rempli = '1'; }
      if (s.statut !== 'close' && !document.hidden) setTimeout(maj, 10000); else if (s.statut !== 'close') document.addEventListener('visibilitychange', function v() { if (!document.hidden) { document.removeEventListener('visibilitychange', v); maj(); } });
    }).catch(() => setTimeout(maj, 20000));
    maj();
  }
  NT.urgenceMed = { ecran, detecter, suivre };

  NT.pret(() => {
    const page = (location.pathname.split('/').pop() || 'index').replace(/.html$/, '');
    const param = (k) => new URLSearchParams(location.search).get(k);

    /* ---------- demande.html ---------- */
    if (page === 'demande' && document.getElementById('zone-formulaire')) {
      const zoneF = document.getElementById('zone-formulaire');
      let vital = false, refuse = false, dernier = null;
      const bandeau = document.createElement('div');
      bandeau.className = 'urg-lien-vital';
      const prop = document.createElement('section');
      prop.className = 'urg-proposition'; prop.hidden = true; prop.setAttribute('aria-live', 'polite');
      const guide = document.createElement('div'); guide.hidden = true;
      zoneF.prepend(bandeau, prop, guide);
      function rendre() {
        bandeau.innerHTML = vital
          ? `<p><span class="urg-marque"><i class="ph ph-siren" aria-hidden="true"></i>${E(t('um.marque'))}</span></p><button type="button" class="btn petit" data-urg="retirer">${E(t('um.retirer'))}</button>`
          : `<p>${E(t('um.lienVital'))}</p><button type="button" class="btn btn-danger petit" data-urg="vital"><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('um.boutonVital'))}</button>`;
      }
      function montrerGuide() { guide.innerHTML = ecran({ lieux: pointsPour() }); guide.hidden = false; prop.hidden = true; }
      rendre();
      zoneF.addEventListener('click', (e) => {
        const b = e.target.closest('[data-urg]'); if (!b) return;
        const a = b.dataset.urg;
        if (a === 'vital' || a === 'oui') { vital = true; rendre(); montrerGuide(); guide.querySelector('.urg-ecran').focus(); }
        if (a === 'retirer') { vital = false; rendre(); guide.hidden = true; }
        if (a === 'non') { refuse = true; prop.hidden = true; }
      });
      zoneF.addEventListener('input', (e) => {
        if (vital || refuse || !e.target.matches('textarea, input[type=text], input:not([type])')) return;
        const texte = [...zoneF.querySelectorAll('textarea, input[type=text], input:not([type])')].map((x) => x.value).join(' ');
        if (detecter(texte) && prop.hidden) {
          const ligne = document.getElementById('btn-envoyer') && document.getElementById('btn-envoyer').parentElement;
          if (ligne) ligne.before(prop);   // juste au-dessus du bouton d'envoi : visible pendant la saisie
          prop.innerHTML = `<h2><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('um.propTitre'))}</h2><p style="margin:0">${E(t('um.propTexte'))}</p>
            <div class="urg-appels"><a class="urg-appel" href="tel:15"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i><span>${E(t('um.a15'))}<small>${E(t('um.a15d'))}</small></span></a>
            <a class="urg-appel secondaire" href="tel:112"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i><span>${E(t('um.a112'))}<small>${E(t('um.a112d'))}</small></span></a></div>
            <div class="v17-boutons"><button type="button" class="btn btn-danger" data-urg="oui">${E(t('um.oui'))}</button><button type="button" class="btn" data-urg="non">${E(t('um.non'))}</button></div>`;
          prop.hidden = false;
        }
      });
      // L'envoi porte le choix « urgence vitale » ; le serveur décide et renvoie l'urgence enregistrée
      const creer = NT.demandes.creer;
      NT.demandes.creer = (data) => { const d = creer(vital ? Object.assign({}, data, { urgenceVitale: true }) : data); dernier = d; return d; };
      const conf = document.getElementById('confirmation');
      if (conf) new MutationObserver(() => {
        if (conf.hidden || !dernier || !dernier.urgenceMedicale || conf.querySelector('.urg-ecran')) return;
        const code = dernier.accuse && dernier.accuse.code;
        const z = document.createElement('div');
        z.innerHTML = ecran({ enregistree: true, statut: Object.assign({ id: dernier.id }, dernier.urgenceMedicale), lieux: pointsPour(dernier.quartier) });
        conf.prepend(z);
        suivre(z, dernier.id, code);
        document.title = t('um.pageTitre') + ' — Terra Nova';
      }).observe(conf, { attributes: true, attributeFilter: ['hidden'], childList: true });
    }

    /* ---------- urgence.html ---------- */
    if (page === 'urgence') {
      const zone = document.getElementById('urg-zone');
      const id = param('id'), code = param('code');
      if (!id) { zone.innerHTML = ecran({ lieux: pointsPour() }); return; }
      const r = NT.api('GET', '/api/urgences/' + encodeURIComponent(id) + '/statut' + (code ? '?code=' + encodeURIComponent(code) : ''));
      if (r.statut !== 200) { zone.innerHTML = `<p class="urg-avertissement"><i class="ph-duotone ph-info" aria-hidden="true"></i><span>${E(t('um.introuvable'))}</span></p>` + ecran({ lieux: pointsPour() }); return; }
      zone.innerHTML = ecran({ enregistree: true, statut: r.donnees, lieux: r.donnees.points });
      zone.querySelector('[data-urg-lieux]').dataset.rempli = '1';
      suivre(zone, id, code);
    }

    /* ---------- suivi.html : rappel en tête quand la demande ouverte est une urgence ---------- */
    if (page === 'suivi') {
      const id = param('id');
      const d = id && NT.store.find('demandes', id);
      if (!d || !d.urgenceMedicale) return;
      const main = document.getElementById('contenu');
      const c = document.createElement('section');
      c.className = 'v17-carte urgence';
      c.innerHTML = `<h3><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('um.suiviCarte'))} · ${E(t('um.e.' + d.urgenceMedicale.statut))}</h3>
        <p class="doux">${E(t('um.nePasRemplacer'))}</p><div class="v17-appel"><a class="btn btn-danger petit" href="tel:15">${E(t('um.a15'))}</a><a class="btn btn-danger petit" href="tel:112">${E(t('um.a112'))}</a>
        <a class="btn petit" href="urgence.html?id=${encodeURIComponent(d.id)}">${E(t('um.voirStatut'))}</a></div>`;
      const tete = main && main.querySelector('.titre-page');
      if (tete) tete.after(c); else if (main) main.prepend(c);
    }
  });
})();
