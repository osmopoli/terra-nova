/* Terra Nova — F74 : associations partenaires.
   Une seule fiche donne tout : ce que l'association fait pour vous, ouverte maintenant / ferme à… / prochaine ouverture
   (calculé en direct, mis à jour chaque minute), adresse et repère sur la carte, téléphone, conditions, et les actions
   « Appeler », « Voir sur la carte », « Y aller en navette ». Agents et admins modifient les horaires (contrôlé par le serveur).
   Utilisé par services.html (liste filtrable + bloc dans la fiche d'un service) et carte.html (repères sur le plan). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'as.titre': 'Associations partenaires', 'as.intro': 'Des associations de Terra Nova qui aident gratuitement ou presque : leurs horaires, où les trouver et comment les joindre, sur une seule fiche.',
      'as.filtre': 'Elles vous aident pour :', 'as.toutes': 'Tout', 'as.ouvertes': 'Ouvertes maintenant', 'as.nb0': 'Aucune association ne correspond.', 'as.nb1': '1 association affichée.', 'as.nbN': '{n} associations affichées.',
      'as.th.alimentation': 'Alimentation', 'as.th.logement': 'Logement', 'as.th.sante': 'Santé, écoute', 'as.th.ecoute': 'Écoute', 'as.th.emploi': 'Emploi', 'as.th.numerique': 'Numérique', 'as.th.famille': 'Famille, enfants', 'as.th.papiers': 'Papiers, courriers',
      'as.ouvert': 'Ouverte maintenant', 'as.ferme': 'Fermée maintenant', 'as.fermeA': 'ferme à {h}', 'as.ouvreAuj': 'ouvre aujourd’hui à {h}', 'as.ouvreDem': 'ouvre demain à {h}', 'as.ouvreJour': 'ouvre {j} à {h}', 'as.bientot': 'ferme bientôt',
      'as.aide': 'Ce qu’elle fait pour vous', 'as.adresse': 'Adresse', 'as.horaires': 'Horaires', 'as.tel': 'Téléphone', 'as.conditions': 'Conditions', 'as.pmrNon': 'Accès limité pour les personnes à mobilité réduite : appelez avant de venir.',
      'as.appeler': 'Appeler', 'as.carte': 'Voir sur la carte', 'as.trajet': 'Y aller en navette', 'as.ecrire': 'Écrire', 'as.ferm': 'fermée', 'as.fiche': 'Voir la fiche', 'as.plus': 'Horaires et détails', 'as.aujourdhui': 'Aujourd’hui : {h}',
      'as.pourService': 'Associations partenaires qui peuvent aussi vous aider', 'as.info': 'Information', 'as.majLe': 'Horaires mis à jour {d}',
      'as.modifier': 'Modifier les horaires', 'as.dlgTitre': 'Horaires : {nom}', 'as.jour': 'Jour', 'as.ouvre': 'Ouverture', 'as.fermeture': 'Fermeture', 'as.ouverteCeJour': 'Ouverte',
      'as.infoLabel': 'Information ponctuelle (facultative)', 'as.infoAide': 'Par exemple « Fermée exceptionnellement lundi 11 novembre ». Affichée sur la fiche.',
      'as.enregistrer': 'Enregistrer les horaires', 'as.annuler': 'Annuler', 'as.ok': 'Horaires de « {nom} » enregistrés : ils sont à jour pour tous les habitants.', 'as.eHeure': 'Pour chaque jour ouvert, l’heure de fermeture doit être après l’heure d’ouverture.' },
    en: { 'as.titre': 'Partner associations', 'as.intro': 'Terra Nova associations that help for free or almost: their opening hours, where to find them and how to reach them, on one card.',
      'as.filtre': 'They help you with:', 'as.toutes': 'All', 'as.ouvertes': 'Open now', 'as.nb0': 'No association matches.', 'as.nb1': '1 association shown.', 'as.nbN': '{n} associations shown.',
      'as.th.alimentation': 'Food', 'as.th.logement': 'Housing', 'as.th.sante': 'Health, listening', 'as.th.ecoute': 'Listening', 'as.th.emploi': 'Jobs', 'as.th.numerique': 'Digital', 'as.th.famille': 'Family, children', 'as.th.papiers': 'Paperwork, letters',
      'as.ouvert': 'Open now', 'as.ferme': 'Closed now', 'as.fermeA': 'closes at {h}', 'as.ouvreAuj': 'opens today at {h}', 'as.ouvreDem': 'opens tomorrow at {h}', 'as.ouvreJour': 'opens {j} at {h}', 'as.bientot': 'closing soon',
      'as.aide': 'What it does for you', 'as.adresse': 'Address', 'as.horaires': 'Opening hours', 'as.tel': 'Phone', 'as.conditions': 'Conditions', 'as.pmrNon': 'Limited access for people with reduced mobility: please call before coming.',
      'as.appeler': 'Call', 'as.carte': 'See on the map', 'as.trajet': 'Go there by shuttle', 'as.ecrire': 'Write', 'as.ferm': 'closed', 'as.fiche': 'See the card', 'as.plus': 'Hours and details', 'as.aujourdhui': 'Today: {h}',
      'as.pourService': 'Partner associations that can also help you', 'as.info': 'Information', 'as.majLe': 'Hours updated {d}',
      'as.modifier': 'Edit opening hours', 'as.dlgTitre': 'Opening hours: {nom}', 'as.jour': 'Day', 'as.ouvre': 'Opens', 'as.fermeture': 'Closes', 'as.ouverteCeJour': 'Open',
      'as.infoLabel': 'One-off information (optional)', 'as.infoAide': 'For example “Exceptionally closed on Monday 11 November”. Shown on the card.',
      'as.enregistrer': 'Save the opening hours', 'as.annuler': 'Cancel', 'as.ok': 'Opening hours of “{nom}” saved: they are up to date for all residents.', 'as.eHeure': 'For each open day, the closing time must be after the opening time.' },
    es: { 'as.titre': 'Asociaciones colaboradoras', 'as.intro': 'Asociaciones de Terra Nova que ayudan gratis o casi: sus horarios, dónde encontrarlas y cómo contactarlas, en una sola ficha.',
      'as.filtre': 'Le ayudan con:', 'as.toutes': 'Todo', 'as.ouvertes': 'Abiertas ahora', 'as.nb0': 'Ninguna asociación coincide.', 'as.nb1': '1 asociación mostrada.', 'as.nbN': '{n} asociaciones mostradas.',
      'as.th.alimentation': 'Alimentación', 'as.th.logement': 'Vivienda', 'as.th.sante': 'Salud, escucha', 'as.th.ecoute': 'Escucha', 'as.th.emploi': 'Empleo', 'as.th.numerique': 'Digital', 'as.th.famille': 'Familia, niños', 'as.th.papiers': 'Papeles, cartas',
      'as.ouvert': 'Abierta ahora', 'as.ferme': 'Cerrada ahora', 'as.fermeA': 'cierra a las {h}', 'as.ouvreAuj': 'abre hoy a las {h}', 'as.ouvreDem': 'abre mañana a las {h}', 'as.ouvreJour': 'abre el {j} a las {h}', 'as.bientot': 'cierra pronto',
      'as.aide': 'Lo que hace por usted', 'as.adresse': 'Dirección', 'as.horaires': 'Horarios', 'as.tel': 'Teléfono', 'as.conditions': 'Condiciones', 'as.pmrNon': 'Acceso limitado para personas con movilidad reducida: llame antes de venir.',
      'as.appeler': 'Llamar', 'as.carte': 'Ver en el mapa', 'as.trajet': 'Ir en lanzadera', 'as.ecrire': 'Escribir', 'as.ferm': 'cerrada', 'as.fiche': 'Ver la ficha', 'as.plus': 'Horarios y detalles', 'as.aujourdhui': 'Hoy: {h}',
      'as.pourService': 'Asociaciones colaboradoras que también pueden ayudarle', 'as.info': 'Información', 'as.majLe': 'Horarios actualizados {d}',
      'as.modifier': 'Modificar los horarios', 'as.dlgTitre': 'Horarios: {nom}', 'as.jour': 'Día', 'as.ouvre': 'Apertura', 'as.fermeture': 'Cierre', 'as.ouverteCeJour': 'Abierta',
      'as.infoLabel': 'Información puntual (opcional)', 'as.infoAide': 'Por ejemplo «Cerrada excepcionalmente el lunes 11 de noviembre». Se muestra en la ficha.',
      'as.enregistrer': 'Guardar los horarios', 'as.annuler': 'Cancelar', 'as.ok': 'Horarios de «{nom}» guardados: están al día para todos los habitantes.', 'as.eHeure': 'Para cada día abierto, la hora de cierre debe ser posterior a la de apertura.' },
    ar: { 'as.titre': 'الجمعيات الشريكة', 'as.intro': 'جمعيات في تيرا نوفا تساعد مجاناً أو تقريباً: مواعيدها وأماكنها وطرق التواصل معها، في بطاقة واحدة.',
      'as.filtre': 'تساعدك في:', 'as.toutes': 'الكل', 'as.ouvertes': 'مفتوحة الآن', 'as.nb0': 'لا توجد جمعية مطابقة.', 'as.nb1': 'جمعية واحدة معروضة.', 'as.nbN': '{n} جمعيات معروضة.',
      'as.th.alimentation': 'الغذاء', 'as.th.logement': 'السكن', 'as.th.sante': 'الصحة والإصغاء', 'as.th.ecoute': 'الإصغاء', 'as.th.emploi': 'العمل', 'as.th.numerique': 'الرقمي', 'as.th.famille': 'الأسرة والأطفال', 'as.th.papiers': 'الوثائق والمراسلات',
      'as.ouvert': 'مفتوحة الآن', 'as.ferme': 'مغلقة الآن', 'as.fermeA': 'تغلق على {h}', 'as.ouvreAuj': 'تفتح اليوم على {h}', 'as.ouvreDem': 'تفتح غداً على {h}', 'as.ouvreJour': 'تفتح {j} على {h}', 'as.bientot': 'تغلق قريباً',
      'as.aide': 'ما تقدمه لك', 'as.adresse': 'العنوان', 'as.horaires': 'المواعيد', 'as.tel': 'الهاتف', 'as.conditions': 'الشروط', 'as.pmrNon': 'وصول محدود لذوي الحركة المحدودة: اتصل قبل المجيء.',
      'as.appeler': 'اتصال', 'as.carte': 'عرض على الخريطة', 'as.trajet': 'الذهاب بالحافلة', 'as.ecrire': 'مراسلة', 'as.ferm': 'مغلقة', 'as.fiche': 'عرض البطاقة', 'as.plus': 'المواعيد والتفاصيل', 'as.aujourdhui': 'اليوم: {h}',
      'as.pourService': 'جمعيات شريكة يمكنها مساعدتك أيضاً', 'as.info': 'معلومة', 'as.majLe': 'حُدّثت المواعيد {d}',
      'as.modifier': 'تعديل المواعيد', 'as.dlgTitre': 'المواعيد: {nom}', 'as.jour': 'اليوم', 'as.ouvre': 'الفتح', 'as.fermeture': 'الإغلاق', 'as.ouverteCeJour': 'مفتوحة',
      'as.infoLabel': 'معلومة ظرفية (اختيارية)', 'as.infoAide': 'مثلاً «مغلقة استثنائياً يوم الاثنين 11 نوفمبر». تُعرض في البطاقة.',
      'as.enregistrer': 'حفظ المواعيد', 'as.annuler': 'إلغاء', 'as.ok': 'حُفظت مواعيد «{nom}»: أصبحت محدثة لجميع السكان.', 'as.eHeure': 'لكل يوم مفتوح، يجب أن تكون ساعة الإغلاق بعد ساعة الفتح.' }
  });

  const t = (k, v) => NT.t(k, v);
  const e = s => NT.ui.echap(s);
  const LOC = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };
  const lang = () => NT.i18n.langue;
  const vm = s => { const p = String(s).split(':'); return (+p[0]) * 60 + (+p[1]); };
  const pad = n => String(n).padStart(2, '0');
  const heure = m => { const h = Math.floor(m / 60) % 24, mi = m % 60; return lang() === 'fr' ? h + 'h' + (mi ? pad(mi) : '') : pad(h) + ':' + pad(mi); };
  const jourNom = (d, court) => new Intl.DateTimeFormat(LOC[lang()] || 'fr-FR', { weekday: court ? 'short' : 'long' }).format(new Date(2024, 0, 7 + d));
  const ORDRE = [1, 2, 3, 4, 5, 6, 0];
  let cache = null;

  const A = (NT.assos = {});
  A.liste = (recharger) => {
    if (!cache || recharger) { const r = NT.api('GET', '/api/associations'); cache = r.statut === 200 ? r.donnees : []; }
    return cache.slice();
  };
  // Ouverte maintenant ? Sinon prochaine ouverture (aujourd'hui, demain ou tel jour)
  A.ouverture = (a, d) => {
    d = d || new Date();
    const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    for (const [jours, de, fin] of a.plages || []) if (jours.includes(day) && m >= vm(de) && m < vm(fin)) return { ouvert: true, fermeA: vm(fin), bientot: vm(fin) - m <= 45 };
    let best = null;
    for (let off = 0; off <= 7; off++) {
      const dj = (day + off) % 7;
      for (const [jours, de] of a.plages || []) {
        if (!jours.includes(dj)) continue;
        const abs = off * 1440 + vm(de);
        if (abs > m && (!best || abs < best.abs)) best = { abs, off, min: vm(de), jour: dj };
      }
    }
    return { ouvert: false, prochaine: best };
  };
  A.statut = a => {
    const o = A.ouverture(a);
    let detail = '';
    if (o.ouvert) detail = (o.bientot ? t('as.bientot') + ' · ' : '') + t('as.fermeA', { h: heure(o.fermeA) });
    else if (o.prochaine) { const p = o.prochaine, h = heure(p.min); detail = p.off === 0 ? t('as.ouvreAuj', { h }) : p.off === 1 ? t('as.ouvreDem', { h }) : t('as.ouvreJour', { j: jourNom(p.jour), h }); }
    return { ouvert: o.ouvert, txt: t(o.ouvert ? 'as.ouvert' : 'as.ferme'), detail };
  };
  // Horaires lisibles, jour par jour (lundi d'abord)
  A.horaires = a => ORDRE.map(j => {
    const p = (a.plages || []).filter(x => x[0].includes(j)).map(x => heure(vm(x[1])) + '–' + heure(vm(x[2])));
    return { jour: j, nom: jourNom(j), texte: p.length ? p.join(', ') : t('as.ferm') };
  });
  A.horairesCourts = a => A.horaires(a).filter(h => h.texte !== t('as.ferm')).map(h => jourNom(h.jour, true) + ' ' + h.texte).join(' · ');
  const choisir = o => (o && typeof o === 'object' && !Array.isArray(o) ? (o[lang()] || o.fr) : o);
  A.aide = a => choisir(a.aide) || [];
  const badge = a => { const s = A.statut(a); return `<span class="statut ${s.ouvert ? 'statut-ok' : 'statut-ferme'} as-st" data-as-st="${e(a.id)}"><i class="ph ${s.ouvert ? 'ph-door-open' : 'ph-door'}" aria-hidden="true"></i>${e(s.txt)}</span> <span class="as-detail" data-as-std="${e(a.id)}">${e(s.detail)}</span>`; };

  A.carte = (a, opts) => {
    const o = opts || {}, compact = !!o.compact, tel = 'tel:' + String(a.tel || '').replace(/[^\d+]/g, '');
    const auj = new Date().getDay(), hId = 'as-h-' + e(a.id) + (compact ? '-c' : '');
    const tete = `<div class="as-tete"><span class="icone-ronde" aria-hidden="true"><i class="ph-duotone ${e(a.icone || 'ph-hand-heart')}"></i></span>
        <div><h3 id="${hId}">${e(a.nom)}</h3><p class="as-etat">${badge(a)}</p></div></div>
      ${a.info ? `<p class="as-info"><i class="ph-duotone ph-info" aria-hidden="true"></i><span><strong>${e(t('as.info'))} :</strong> ${e(a.info)}</span></p>` : ''}`;
    const appeler = `<a class="btn btn-primaire" href="${e(tel)}"><i class="ph ph-phone-call" aria-hidden="true"></i>${e(t('as.appeler'))}<span class="sr-only"> ${e(a.nom)}</span></a>`;
    const voirCarte = `<a class="btn" href="carte.html?lieu=${encodeURIComponent(a.id)}"><i class="ph ph-map-pin" aria-hidden="true"></i>${e(t('as.carte'))}</a>`;
    const aide = `<h4 class="as-h4">${e(t('as.aide'))}</h4><ul class="as-aide">${A.aide(a).map(x => `<li>${e(x)}</li>`).join('')}</ul>`;
    if (compact) return `<article class="as-carte as-compact" aria-labelledby="${hId}">${tete}
      ${aide}
      <dl class="as-infos">
        <div><dt><i class="ph ph-map-pin" aria-hidden="true"></i>${e(t('as.adresse'))}</dt><dd>${e(a.adresse)}${a.pmr ? '' : `<br><small>${e(t('as.pmrNon'))}</small>`}</dd></div>
        <div><dt><i class="ph ph-phone" aria-hidden="true"></i>${e(t('as.tel'))}</dt><dd><a href="${e(tel)}">${e(a.tel)}</a></dd></div>
        <div><dt><i class="ph ph-clock" aria-hidden="true"></i>${e(t('as.horaires'))}</dt><dd>${e(A.horairesCourts(a))}</dd></div>
      </dl>
      <div class="ligne as-actions">${appeler}${voirCarte}
        <a class="btn" href="services.html#asso-${encodeURIComponent(a.id.replace(/^asso-/, ''))}" data-as-fiche><i class="ph ph-hand-heart" aria-hidden="true"></i>${e(t('as.fiche'))}</a></div>
    </article>`;
    // Fiche de la liste : l'essentiel d'abord (ce qu'elle fait, où, aujourd'hui, appeler), le détail se déplie
    const hAuj = A.horaires(a).find(h => h.jour === auj), pId = 'as-p-' + e(a.id);
    return `<article class="as-carte" id="asso-${e(a.id.replace(/^asso-/, ''))}" aria-labelledby="${hId}">${tete}
      <p class="as-resume">${A.aide(a).map(e).join(' · ')}</p>
      <ul class="as-cles">
        <li><i class="ph ph-map-pin" aria-hidden="true"></i><span><span class="sr-only">${e(t('as.adresse'))} : </span>${e(a.adresse)}</span></li>
        <li><i class="ph ph-clock" aria-hidden="true"></i><span>${e(t('as.aujourdhui', { h: hAuj ? hAuj.texte : t('as.ferm') }))}</span></li>
      </ul>
      <div class="ligne as-actions">${appeler}${voirCarte}</div>
      <button type="button" class="as-plus" aria-expanded="false" aria-controls="${pId}" data-as-plis>
        <span>${e(t('as.plus'))}<span class="sr-only"> : ${e(a.nom)}</span></span><i class="ph ph-caret-down" aria-hidden="true"></i></button>
      <div class="as-plis" id="${pId}" inert><div class="as-plis-in">
        <dl class="as-infos">
          <div><dt><i class="ph ph-phone" aria-hidden="true"></i>${e(t('as.tel'))}</dt><dd><a href="${e(tel)}">${e(a.tel)}</a></dd></div>
          <div><dt><i class="ph ph-clock" aria-hidden="true"></i>${e(t('as.horaires'))}</dt><dd><ul class="as-semaine">${A.horaires(a).map(h => `<li${h.jour === auj ? ' class="aujourdhui" aria-current="date"' : ''}><span>${e(h.nom)}</span><span>${e(h.texte)}</span></li>`).join('')}</ul></dd></div>
          ${choisir(a.conditions) ? `<div><dt><i class="ph ph-info" aria-hidden="true"></i>${e(t('as.conditions'))}</dt><dd>${e(choisir(a.conditions))}</dd></div>` : ''}
        </dl>
        ${a.pmr ? '' : `<p class="as-pmr"><i class="ph ph-wheelchair" aria-hidden="true"></i>${e(t('as.pmrNon'))}</p>`}
        ${a.arret || a.email ? `<div class="ligne as-actions as-actions-2">
          ${a.arret ? `<a class="btn" href="transports.html?de=gare&amp;vers=${encodeURIComponent(a.arret)}"><i class="ph ph-tram" aria-hidden="true"></i>${e(t('as.trajet'))}</a>` : ''}
          ${a.email ? `<a class="btn" href="mailto:${e(a.email)}"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${e(t('as.ecrire'))}</a>` : ''}</div>` : ''}
        ${NT.auth.aRole('agent', 'admin') ? `<p class="as-agent"><button type="button" class="btn" data-as-modifier="${e(a.id)}"><i class="ph ph-pencil-simple" aria-hidden="true"></i>${e(t('as.modifier'))}</button>
          ${a.majHoraires ? `<span class="doux">${e(t('as.majLe', { d: NT.ui.dateHeure(a.majHoraires) }))}${a.majPar ? ' · ' + e(a.majPar) : ''}</span>` : ''}</p>` : ''}
      </div></div>
    </article>`;
  };
  // Déplier / replier une fiche (le panneau replié est inerte : ni clavier ni lecteur d'écran)
  A.deplier = (carte, ouvert) => {
    const b = carte && carte.querySelector('[data-as-plis]'); if (!b) return;
    b.setAttribute('aria-expanded', String(ouvert)); carte.classList.toggle('as-ouverte', ouvert);
    carte.querySelector('.as-plis').toggleAttribute('inert', !ouvert);
  };
  // Bloc « Associations partenaires qui peuvent aussi vous aider » dans la fiche d'un service
  A.blocService = serviceId => {
    const l = A.liste().filter(a => (a.services || []).includes(serviceId));
    return l.length ? `<h3 class="sv-h3">${e(t('as.pourService'))}</h3><div class="as-liste as-liste-compacte">${l.map(a => A.carte(a, { compact: true })).join('')}</div>` : '';
  };
  // Statuts mis à jour sur place chaque minute (sans reconstruire les fiches)
  A.majStatuts = () => A.liste().forEach(a => {
    const s = A.statut(a);
    document.querySelectorAll(`[data-as-st="${CSS.escape(a.id)}"]`).forEach(el => { el.className = 'statut ' + (s.ouvert ? 'statut-ok' : 'statut-ferme') + ' as-st'; el.lastChild.textContent = s.txt; el.querySelector('i').className = 'ph ' + (s.ouvert ? 'ph-door-open' : 'ph-door'); });
    document.querySelectorAll(`[data-as-std="${CSS.escape(a.id)}"]`).forEach(el => { el.textContent = s.detail; });
  });

  /* ---------- Liste filtrable (services.html#associations) ---------- */
  function liste(zone) {
    const etat = { theme: '', ouvertes: false };
    const themes = [...new Set(A.liste().flatMap(a => a.themes || []))];
    zone.innerHTML = `<div class="titre-section"><div><h2 id="as-h"><i class="ph-duotone ph-hand-heart" aria-hidden="true"></i> ${e(t('as.titre'))}</h2><p>${e(t('as.intro'))}</p></div></div>
      <div class="sv-filtres" role="group" aria-labelledby="as-lbl"><span id="as-lbl">${e(t('as.filtre'))}</span>
        <span class="sv-boutons" id="as-themes">${[''].concat(themes).map(th => `<button type="button" class="sv-filtre" data-as-theme="${e(th)}" aria-pressed="${th === ''}">${e(th ? t('as.th.' + th) : t('as.toutes'))}</button>`).join('')}
          <button type="button" class="sv-filtre" data-as-ouvertes aria-pressed="false"><i class="ph ph-clock" aria-hidden="true"></i> ${e(t('as.ouvertes'))}</button></span></div>
      <p class="sv-compteur" id="as-compteur" role="status" aria-live="polite"></p>
      <div class="as-liste" id="as-liste"></div>`;
    const rendre = () => {
      const l = A.liste().filter(a => (!etat.theme || (a.themes || []).includes(etat.theme)) && (!etat.ouvertes || A.statut(a).ouvert));
      const ouvertes = [...zone.querySelectorAll('.as-ouverte')].map(c => c.id);   // les fiches dépliées le restent
      zone.querySelector('#as-liste').innerHTML = l.map(a => A.carte(a)).join('') || `<p class="vide">${e(t('as.nb0'))}</p>`;
      ouvertes.forEach(id => A.deplier(document.getElementById(id), true));
      zone.querySelector('#as-compteur').textContent = l.length === 0 ? t('as.nb0') : l.length === 1 ? t('as.nb1') : t('as.nbN', { n: l.length });
      zone.querySelectorAll('[data-as-theme]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.asTheme === etat.theme)));
      zone.querySelector('[data-as-ouvertes]').setAttribute('aria-pressed', String(etat.ouvertes));
    };
    zone.addEventListener('click', ev => {
      const p = ev.target.closest('[data-as-plis]');
      if (p) { const c = p.closest('.as-carte'), ouvert = p.getAttribute('aria-expanded') !== 'true'; A.deplier(c, ouvert); return; }
      const b = ev.target.closest('[data-as-theme]'); if (b) { etat.theme = b.dataset.asTheme; rendre(); return; }
      if (ev.target.closest('[data-as-ouvertes]')) { etat.ouvertes = !etat.ouvertes; rendre(); }
    });
    rendre();
    A.rendreListe = () => { A.liste(true); rendre(); };
  }

  /* ---------- Modifier les horaires (agents / admins ; le serveur vérifie le rôle et les heures) ---------- */
  function dialogue() {
    let dlg = document.getElementById('as-dlg');
    if (dlg) return dlg;
    dlg = document.createElement('sl-dialog');
    dlg.id = 'as-dlg';
    dlg.style.setProperty('--width', 'min(36rem, 100vw)');
    document.body.append(dlg);
    return dlg;
  }
  function ouvrirEdition(id, declencheur) {
    const a = A.liste().find(x => x.id === id); if (!a) return;
    const dlg = dialogue();
    dlg.label = t('as.dlgTitre', { nom: a.nom });
    const plageDe = j => (a.plages || []).find(p => p[0].includes(j));
    dlg.innerHTML = `<form id="as-form" novalidate>
      <div id="as-err" role="alert"></div>
      <table class="as-table"><caption class="sr-only">${e(t('as.horaires'))}</caption>
        <thead><tr><th scope="col">${e(t('as.jour'))}</th><th scope="col">${e(t('as.ouverteCeJour'))}</th><th scope="col">${e(t('as.ouvre'))}</th><th scope="col">${e(t('as.fermeture'))}</th></tr></thead>
        <tbody>${ORDRE.map(j => { const p = plageDe(j); return `<tr><th scope="row"><abbr title="${e(jourNom(j))}">${e(jourNom(j, true))}</abbr></th>
          <td><input type="checkbox" id="as-o-${j}" ${p ? 'checked' : ''} aria-label="${e(t('as.ouverteCeJour') + ' ' + jourNom(j))}"></td>
          <td><input type="time" id="as-d-${j}" value="${p ? e(p[1]) : '09:00'}" aria-label="${e(t('as.ouvre') + ' ' + jourNom(j))}" ${p ? '' : 'disabled'}></td>
          <td><input type="time" id="as-f-${j}" value="${p ? e(p[2]) : '17:00'}" aria-label="${e(t('as.fermeture') + ' ' + jourNom(j))}" ${p ? '' : 'disabled'}></td></tr>`; }).join('')}</tbody></table>
      <div class="champ"><label for="as-info">${e(t('as.infoLabel'))}</label><input id="as-info" maxlength="200" value="${e(a.info || '')}" aria-describedby="as-info-aide"><span class="aide" id="as-info-aide">${e(t('as.infoAide'))}</span></div>
    </form>
    <sl-button slot="footer" id="as-annuler">${e(t('as.annuler'))}</sl-button>
    <sl-button slot="footer" variant="primary" id="as-ok">${e(t('as.enregistrer'))}</sl-button>`;
    dlg.querySelectorAll('input[type=checkbox]').forEach(c => c.addEventListener('change', () => { const j = c.id.slice(5); dlg.querySelector('#as-d-' + j).disabled = !c.checked; dlg.querySelector('#as-f-' + j).disabled = !c.checked; }));
    dlg.querySelector('#as-annuler').addEventListener('click', () => dlg.hide());
    dlg.querySelector('#as-ok').addEventListener('click', () => {
      const parHoraire = new Map();
      let invalide = false;
      ORDRE.forEach(j => {
        if (!dlg.querySelector('#as-o-' + j).checked) return;
        const de = dlg.querySelector('#as-d-' + j).value, fin = dlg.querySelector('#as-f-' + j).value;
        if (!de || !fin || fin <= de) { invalide = true; dlg.querySelector('#as-f-' + j).setAttribute('aria-invalid', 'true'); return; }
        const cle = de + '|' + fin; if (!parHoraire.has(cle)) parHoraire.set(cle, []); parHoraire.get(cle).push(j);
      });
      if (invalide) { dlg.querySelector('#as-err').innerHTML = `<p class="erreur">${e(t('as.eHeure'))}</p>`; return; }
      const plages = [...parHoraire.entries()].map(([cle, jours]) => [jours, ...cle.split('|')]);
      const r = NT.api('PATCH', '/api/associations/' + encodeURIComponent(a.id), { plages, info: dlg.querySelector('#as-info').value });
      if (r.statut !== 200) { dlg.querySelector('#as-err').innerHTML = `<p class="erreur">${e((r.donnees && r.donnees.erreur) || 'Erreur')}</p>`; return; }
      dlg.hide(); NT.ui.toast(t('as.ok', { nom: a.nom }), 'success');
      if (A.rendreListe) A.rendreListe(); else A.liste(true);
      const b = document.querySelector(`[data-as-modifier="${CSS.escape(a.id)}"]`); if (b) b.focus();
    });
    dlg.addEventListener('sl-after-hide', ev => { if (ev.target === dlg && declencheur && document.body.contains(declencheur)) declencheur.focus(); }, { once: true });
    customElements.whenDefined('sl-dialog').then(() => dlg.show());
  }

  NT.pret(() => {
    document.addEventListener('click', ev => { const b = ev.target.closest('[data-as-modifier]'); if (b) ouvrirEdition(b.dataset.asModifier, b); });
    const zone = document.getElementById('sv-associations');
    if (zone) {
      liste(zone);
      const h = decodeURIComponent(location.hash.replace(/^#/, ''));
      if (h === 'associations' || h.startsWith('asso-')) requestAnimationFrame(() => { const c = document.getElementById(h === 'associations' ? 'as-h' : h); if (c) { if (c.classList.contains('as-carte')) A.deplier(c, true); c.scrollIntoView({ block: 'start' }); c.setAttribute('tabindex', '-1'); c.focus({ preventScroll: true }); } });
    }
    // lien « Voir la fiche » depuis le tiroir d'un service : la fiche est montrée une fois le tiroir refermé
    window.addEventListener('hashchange', () => {
      const h = decodeURIComponent(location.hash.replace(/^#/, ''));
      if (!h.startsWith('asso-')) return;
      setTimeout(() => { const c = document.getElementById(h); if (c) { if (c.classList.contains('as-carte')) A.deplier(c, true); c.scrollIntoView({ block: 'start' }); c.setAttribute('tabindex', '-1'); c.focus({ preventScroll: true }); } }, 400);
    });
    setInterval(A.majStatuts, NT.econome.delai(60000));
  });
})();
