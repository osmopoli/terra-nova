/* Terra Nova — vague 21 (F101) : Centre de crise, publication rapide d'une crise localisée (agents / admins, agent-alertes.html).
   Un modèle (« Panne électrique » ou « Crise localisée ») préremplit tout : quartier(s), rétablissement estimé, message simple,
   « Ce que vous devez faire », points d'accueil et de recharge, services touchés. Un seul envoi (POST /api/crises, rôle contrôlé
   par le serveur) crée le message officiel ciblé (F73), l'annonce du quartier, les notifications des habitants, l'état « Perturbé »
   des services et les entrées de /essentiel. Puis « Mettre à jour » (heure, avancement) et « Rétablissement » (tout se ferme). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'cz.titre': 'Centre de crise : crise localisée', 'cz.intro': 'En une fois : message officiel ciblé sur le quartier (critique pour ses habitants, information pour les autres), annonce, notification à chaque habitant du quartier, services marqués « Perturbé » avec une solution de rechange, et infos essentielles (/essentiel, /simple) lisibles sans script.',
      'cz.modele': 'Modèle', 'cz.m.panne': 'Panne électrique', 'cz.m.crise': 'Crise localisée', 'cz.quartiers': 'Quartier(s) touché(s)', 'cz.ret': 'Rétablissement estimé', 'cz.retAide': 'Heure annoncée aux habitants (« Rétablissement estimé : 14 h 30 »). Vous pourrez la changer.',
      'cz.fTitre': 'Titre', 'cz.fMessage': 'Ce qui se passe (mots simples)', 'cz.fActions': 'Ce que vous devez faire (une action par ligne, 6 au plus)', 'cz.fPoints': 'Points d’accueil et de recharge (un par ligne)',
      'cz.fServices': 'Services touchés (marqués « Perturbé »)', 'cz.fAlt': 'Solution de rechange proposée sous les services', 'cz.publier': 'Publier la crise maintenant',
      'cz.ok': 'Crise {id} publiée : {n} habitant(s) notifié(s), services perturbés : {s}.', 'cz.encours': 'Crises en cours', 'cz.aucune': 'Aucune crise en cours.', 'cz.terminees': 'Crises terminées',
      'cz.depuis': 'Depuis {d}', 'cz.retEst': 'Rétablissement estimé : {h}', 'cz.majLe': 'Dernière mise à jour : {d}', 'cz.compris': '{n} « J’ai compris » · {h} habitant(s) du quartier',
      'cz.maj': 'Mettre à jour', 'cz.nouvelleHeure': 'Nouvelle heure estimée', 'cz.avancement': 'Point d’avancement', 'cz.envoyerMaj': 'Envoyer la mise à jour', 'cz.majOk': 'Mise à jour envoyée aux habitants.',
      'cz.retablir': 'Rétablissement', 'cz.confirmer': 'Confirmer : tout fermer et notifier le rétablissement', 'cz.retabliOk': 'Crise {id} close : habitants notifiés, services rétablis.', 'cz.retablieLe': 'Close le {d}',
      'cz.eQuartier': 'Choisissez au moins un quartier.', 'cz.eRet': 'L’heure estimée doit être dans le futur.' },
    en: { 'cz.titre': 'Crisis centre: local crisis', 'cz.intro': 'In one go: official message targeted at the district (critical for its residents, information for others), notice, notification to every resident of the district, services marked “Disrupted” with an alternative, and essential information (/essentiel, /simple) readable without scripts.',
      'cz.modele': 'Template', 'cz.m.panne': 'Power cut', 'cz.m.crise': 'Local crisis', 'cz.quartiers': 'Affected district(s)', 'cz.ret': 'Estimated restoration', 'cz.retAide': 'Time announced to residents (“Estimated restoration: 2:30 pm”). You can change it later.',
      'cz.fTitre': 'Title', 'cz.fMessage': 'What is happening (simple words)', 'cz.fActions': 'What you need to do (one action per line, 6 at most)', 'cz.fPoints': 'Reception and charging points (one per line)',
      'cz.fServices': 'Affected services (marked “Disrupted”)', 'cz.fAlt': 'Alternative shown under the services', 'cz.publier': 'Publish the crisis now',
      'cz.ok': 'Crisis {id} published: {n} resident(s) notified, disrupted services: {s}.', 'cz.encours': 'Ongoing crises', 'cz.aucune': 'No ongoing crisis.', 'cz.terminees': 'Closed crises',
      'cz.depuis': 'Since {d}', 'cz.retEst': 'Estimated restoration: {h}', 'cz.majLe': 'Last update: {d}', 'cz.compris': '{n} “I understand” · {h} resident(s) in the district',
      'cz.maj': 'Update', 'cz.nouvelleHeure': 'New estimated time', 'cz.avancement': 'Progress update', 'cz.envoyerMaj': 'Send the update', 'cz.majOk': 'Update sent to residents.',
      'cz.retablir': 'Restoration', 'cz.confirmer': 'Confirm: close everything and announce restoration', 'cz.retabliOk': 'Crisis {id} closed: residents notified, services restored.', 'cz.retablieLe': 'Closed on {d}',
      'cz.eQuartier': 'Choose at least one district.', 'cz.eRet': 'The estimated time must be in the future.' },
    es: { 'cz.titre': 'Centro de crisis: crisis local', 'cz.intro': 'De una vez: mensaje oficial dirigido al barrio (crítico para sus habitantes, información para los demás), anuncio, notificación a cada habitante del barrio, servicios marcados «Con incidencias» con una alternativa, e información esencial (/essentiel, /simple) legible sin scripts.',
      'cz.modele': 'Plantilla', 'cz.m.panne': 'Corte eléctrico', 'cz.m.crise': 'Crisis local', 'cz.quartiers': 'Barrio(s) afectado(s)', 'cz.ret': 'Restablecimiento estimado', 'cz.retAide': 'Hora anunciada a los habitantes («Restablecimiento estimado: 14:30»). Podrá cambiarla.',
      'cz.fTitre': 'Título', 'cz.fMessage': 'Qué ocurre (palabras sencillas)', 'cz.fActions': 'Lo que debe hacer (una acción por línea, 6 como máximo)', 'cz.fPoints': 'Puntos de acogida y de carga (uno por línea)',
      'cz.fServices': 'Servicios afectados (marcados «Con incidencias»)', 'cz.fAlt': 'Alternativa mostrada bajo los servicios', 'cz.publier': 'Publicar la crisis ahora',
      'cz.ok': 'Crisis {id} publicada: {n} habitante(s) notificado(s), servicios con incidencias: {s}.', 'cz.encours': 'Crisis en curso', 'cz.aucune': 'Ninguna crisis en curso.', 'cz.terminees': 'Crisis cerradas',
      'cz.depuis': 'Desde {d}', 'cz.retEst': 'Restablecimiento estimado: {h}', 'cz.majLe': 'Última actualización: {d}', 'cz.compris': '{n} «Lo he entendido» · {h} habitante(s) del barrio',
      'cz.maj': 'Actualizar', 'cz.nouvelleHeure': 'Nueva hora estimada', 'cz.avancement': 'Avance', 'cz.envoyerMaj': 'Enviar la actualización', 'cz.majOk': 'Actualización enviada a los habitantes.',
      'cz.retablir': 'Restablecimiento', 'cz.confirmer': 'Confirmar: cerrar todo y anunciar el restablecimiento', 'cz.retabliOk': 'Crisis {id} cerrada: habitantes notificados, servicios restablecidos.', 'cz.retablieLe': 'Cerrada el {d}',
      'cz.eQuartier': 'Elija al menos un barrio.', 'cz.eRet': 'La hora estimada debe estar en el futuro.' },
    ar: { 'cz.titre': 'مركز الأزمات: أزمة محلية', 'cz.intro': 'دفعة واحدة: رسالة رسمية موجهة إلى الحي (حرجة لسكانه، وللعلم لغيرهم)، إعلان، إشعار لكل ساكن في الحي، خدمات موسومة «مضطربة» مع بديل، ومعلومات أساسية (/essentiel، /simple) مقروءة دون سكربت.',
      'cz.modele': 'نموذج', 'cz.m.panne': 'انقطاع الكهرباء', 'cz.m.crise': 'أزمة محلية', 'cz.quartiers': 'الحي أو الأحياء المتضررة', 'cz.ret': 'الإصلاح المتوقع', 'cz.retAide': 'الساعة المعلنة للسكان («الإصلاح المتوقع: 14:30»). يمكنك تغييرها لاحقاً.',
      'cz.fTitre': 'العنوان', 'cz.fMessage': 'ماذا يحدث (كلمات بسيطة)', 'cz.fActions': 'ما يجب عليك فعله (إجراء في كل سطر، 6 على الأكثر)', 'cz.fPoints': 'نقاط الاستقبال والشحن (واحدة في كل سطر)',
      'cz.fServices': 'الخدمات المتضررة (موسومة «مضطربة»)', 'cz.fAlt': 'البديل المعروض تحت الخدمات', 'cz.publier': 'نشر الأزمة الآن',
      'cz.ok': 'تم نشر الأزمة {id}: إشعار {n} ساكن، الخدمات المضطربة: {s}.', 'cz.encours': 'الأزمات الجارية', 'cz.aucune': 'لا توجد أزمة جارية.', 'cz.terminees': 'الأزمات المنتهية',
      'cz.depuis': 'منذ {d}', 'cz.retEst': 'الإصلاح المتوقع: {h}', 'cz.majLe': 'آخر تحديث: {d}', 'cz.compris': '{n} «فهمت» · {h} ساكن في الحي',
      'cz.maj': 'تحديث', 'cz.nouvelleHeure': 'الساعة المتوقعة الجديدة', 'cz.avancement': 'آخر المستجدات', 'cz.envoyerMaj': 'إرسال التحديث', 'cz.majOk': 'تم إرسال التحديث إلى السكان.',
      'cz.retablir': 'الإصلاح', 'cz.confirmer': 'تأكيد: إغلاق كل شيء والإعلان عن الإصلاح', 'cz.retabliOk': 'تم إغلاق الأزمة {id}: إشعار السكان واستعادة الخدمات.', 'cz.retablieLe': 'أُغلقت في {d}',
      'cz.eQuartier': 'اختر حياً واحداً على الأقل.', 'cz.eRet': 'يجب أن تكون الساعة المتوقعة في المستقبل.' }
  });

  // Modèles (texte en français, traductions envoyées seulement si le texte du modèle n'a pas été modifié)
  const MODELES = {
    'panne-electrique': {
      titre: q => `Panne électrique — ${q.length > 1 ? 'secteurs ' + q.join(', ') : 'secteur ' + q[0]}`,
      message: q => `Une panne électrique touche le ${q.length > 1 ? 'secteurs ' + q.join(', ') : 'secteur ' + q[0]}. Les équipes de la centrale réparent le réseau. Les ascenseurs et l’éclairage public du secteur sont arrêtés.`,
      actions: ['Débranchez les appareils sensibles (ordinateur, télévision)', 'Gardez le réfrigérateur et le congélateur fermés', 'Personnes sous assistance respiratoire : appelez le 15', 'Utilisez une lampe de poche, pas de bougie', 'Rechargez votre téléphone au point d’accueil le plus proche'],
      points: q => ['Dôme des Pionniers — salle polyvalente, recharge et eau, ouvert 24 h/24', q[0] === 'Nord' ? 'Maison de quartier Nord — arrêt Orion, accueil jusqu’à 22 h' : `Maison de quartier ${q[0]} — accueil jusqu’à 22 h`],
      services: ['eau-energie', 'voirie'],
      alternative: 'Signalez une urgence électrique à l’astreinte technique du dôme ; accueil et recharge au Dôme des Pionniers.',
      traductions: q => (q.length === 1 && q[0] === 'Nord' ? {
        en: { titre: 'Power cut — North sector', message: 'A power cut is affecting the North sector. The power plant teams are repairing the network. Lifts and street lighting in the sector are down.',
          actions: ['Unplug sensitive devices (computer, TV)', 'Keep the fridge and freezer closed', 'People on breathing support: call 15', 'Use a torch, not a candle', 'Charge your phone at the nearest reception point'] },
        es: { titre: 'Corte eléctrico — sector Norte', message: 'Un corte eléctrico afecta al sector Norte. Los equipos de la central reparan la red. Los ascensores y el alumbrado público del sector están parados.',
          actions: ['Desenchufe los aparatos sensibles (ordenador, televisión)', 'Mantenga cerrados el frigorífico y el congelador', 'Personas con asistencia respiratoria: llamen al 15', 'Use una linterna, no velas', 'Cargue su teléfono en el punto de acogida más cercano'] },
        ar: { titre: 'انقطاع الكهرباء — القطاع الشمالي', message: 'انقطاع في الكهرباء يمس القطاع الشمالي. فرق المحطة تصلح الشبكة. المصاعد والإنارة العامة في القطاع متوقفة.',
          actions: ['افصل الأجهزة الحساسة (الحاسوب، التلفاز)', 'أبقِ الثلاجة والمجمد مغلقين', 'الأشخاص تحت التنفس الاصطناعي: اتصلوا بالرقم 15', 'استعمل مصباحاً يدوياً لا شمعة', 'اشحن هاتفك في أقرب نقطة استقبال'] }
      } : {})
    },
    'crise-localisee': {
      titre: q => `Incident en cours — ${q.length > 1 ? 'secteurs ' + q.join(', ') : 'secteur ' + q[0]}`,
      message: q => `Un incident touche le ${q.length > 1 ? 'secteurs ' + q.join(', ') : 'secteur ' + q[0]}. Les équipes de la ville sont sur place. Suivez les consignes ci-dessous.`,
      actions: ['Restez chez vous si vous le pouvez', 'Suivez les consignes des agents sur place', 'En cas de danger, appelez le 112', 'Prenez des nouvelles de vos voisins âgés ou isolés'],
      points: () => ['Dôme des Pionniers — accueil et informations, ouvert 24 h/24'],
      services: [],
      alternative: 'Rendez-vous au point d’accueil indiqué ou appelez la mairie.',
      traductions: () => ({})
    }
  };

  NT.pret(() => {
    const racine = document.getElementById('crise-agent');
    if (!racine) return;
    const t = NT.t, { echap } = NT.ui;
    const local = d => { const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
    const dansDeuxHeures = () => { const q = 15 * 60e3; return new Date(Math.ceil((Date.now() + 2 * 3600e3) / q) * q); };
    const heure = iso => new Date(iso).toLocaleTimeString(NT.i18n.langue === 'ar' ? 'ar' : NT.i18n.langue, { hour: '2-digit', minute: '2-digit' });
    const lignes = v => v.split('\n').map(s => s.trim()).filter(Boolean);
    const services = (NT.services && NT.services.tous()) || [];
    const nomSvc = s => (s.nom && (s.nom[NT.i18n.langue] || s.nom.fr)) || s.id;
    const $ = id => document.getElementById(id);

    racine.innerHTML = `
      <div class="titre-section"><div><h2 id="t-crise"><i class="ph-duotone ph-lightning-slash" aria-hidden="true"></i> ${echap(t('cz.titre'))}</h2><p>${echap(t('cz.intro'))}</p></div></div>
      <div class="ag-alertes">
        <form class="panneau" id="form-crise" novalidate aria-labelledby="t-crise">
          <fieldset><legend>${echap(t('cz.modele'))}</legend><div class="ag-niveaux">
            <label><input type="radio" name="cz-type" value="panne-electrique" checked><span><strong>${echap(t('cz.m.panne'))}</strong></span></label>
            <label><input type="radio" name="cz-type" value="crise-localisee"><span><strong>${echap(t('cz.m.crise'))}</strong></span></label></div></fieldset>
          <fieldset><legend>${echap(t('cz.quartiers'))}</legend><div class="cz-quartiers">${NT.QUARTIERS.map(q => `<label><input type="checkbox" name="cz-q" value="${q}"${q === 'Nord' ? ' checked' : ''}> ${echap(t('ao.quartier', { q }))}</label>`).join('')}</div>
            <p class="erreur" id="cz-q-err" hidden></p></fieldset>
          <div class="champ"><label for="cz-ret">${echap(t('cz.ret'))}</label><input id="cz-ret" type="datetime-local" aria-describedby="cz-ret-aide cz-ret-err"><span class="aide" id="cz-ret-aide">${echap(t('cz.retAide'))}</span><p class="erreur" id="cz-ret-err" hidden></p></div>
          <div class="champ"><label for="cz-titre">${echap(t('cz.fTitre'))}</label><input id="cz-titre" maxlength="120" autocomplete="off"></div>
          <div class="champ"><label for="cz-message">${echap(t('cz.fMessage'))}</label><textarea id="cz-message" maxlength="1200"></textarea></div>
          <div class="champ"><label for="cz-actions">${echap(t('cz.fActions'))}</label><textarea id="cz-actions" style="min-height:7rem"></textarea></div>
          <div class="champ"><label for="cz-points">${echap(t('cz.fPoints'))}</label><textarea id="cz-points" style="min-height:4rem"></textarea></div>
          <fieldset><legend>${echap(t('cz.fServices'))}</legend><div class="cz-quartiers">${services.map(s => `<label><input type="checkbox" name="cz-s" value="${echap(s.id)}"> ${echap(nomSvc(s))}</label>`).join('')}</div></fieldset>
          <div class="champ"><label for="cz-alt">${echap(t('cz.fAlt'))}</label><input id="cz-alt" maxlength="300"></div>
          <button type="submit" class="btn btn-primaire"><i class="ph ph-lightning-slash" aria-hidden="true"></i>${echap(t('cz.publier'))}</button>
          <p id="cz-ok" role="status" class="doux" style="margin:.8rem 0 0"></p>
        </form>
        <aside class="panneau" aria-labelledby="t-cz-liste"><h3 id="t-cz-liste">${echap(t('cz.encours'))}</h3><ul class="ag-annonces" id="cz-liste"></ul>
          <details><summary>${echap(t('cz.terminees'))}</summary><ul class="ag-annonces" id="cz-fini"></ul></details></aside>
      </div>`;

    let modele = null;   // valeurs du modèle appliqué (pour savoir si l'agent a modifié le texte)
    const type = () => racine.querySelector('[name="cz-type"]:checked').value;
    const quartiers = () => [...racine.querySelectorAll('[name="cz-q"]:checked')].map(i => i.value);
    function appliquer() {
      const m = MODELES[type()], q = quartiers().length ? quartiers() : ['Nord'];
      modele = { titre: m.titre(q), message: m.message(q), actions: m.actions.join('\n'), traductions: m.traductions(q) };
      $('cz-titre').value = modele.titre; $('cz-message').value = modele.message; $('cz-actions').value = modele.actions;
      $('cz-points').value = m.points(q).join('\n'); $('cz-alt').value = m.alternative;
      racine.querySelectorAll('[name="cz-s"]').forEach(i => { i.checked = m.services.includes(i.value); });
    }
    $('cz-ret').value = local(dansDeuxHeures());
    appliquer();
    racine.addEventListener('change', e => { if (e.target.name === 'cz-type' || e.target.name === 'cz-q') appliquer(); });

    function liste() {
      const r = NT.api('GET', '/api/crises');
      const l = r.statut === 200 ? r.donnees : [];
      const actives = l.filter(m => m.crise.statut === 'en-cours' && m.statut !== 'retire'), finies = l.filter(m => !actives.includes(m));
      $('cz-liste').innerHTML = actives.length ? actives.map(m => `<li data-cz="${echap(m.id)}"><div class="ligne entre"><strong>${echap(m.id)} · ${echap(m.titre)}</strong>
          <span class="statut statut-en_cours"><i class="ph ph-lightning-slash" aria-hidden="true"></i>${echap(m.crise.quartiers.join(', '))}</span></div>
        <p class="doux" style="margin:.3rem 0 0;font-size:.85rem">${echap(t('cz.depuis', { d: NT.ui.dateHeure(m.debut) }))} · <strong>${echap(m.crise.retablissement ? t('cz.retEst', { h: heure(m.crise.retablissement) }) : '—')}</strong><br>
          ${echap(t('cz.majLe', { d: NT.ui.dateHeure(m.crise.majLe) }))}${m.crise.progression ? ' · ' + echap(m.crise.progression) : ''}<br>${echap(t('cz.compris', { n: m.nbCompris, h: m.nbHabitants }))}</p>
        <details class="cz-maj"><summary class="btn">${echap(t('cz.maj'))}</summary>
          <div class="champ"><label for="cz-h-${echap(m.id)}">${echap(t('cz.nouvelleHeure'))}</label><input id="cz-h-${echap(m.id)}" type="datetime-local" value="${m.crise.retablissement ? local(new Date(m.crise.retablissement)) : ''}"></div>
          <div class="champ"><label for="cz-p-${echap(m.id)}">${echap(t('cz.avancement'))}</label><input id="cz-p-${echap(m.id)}" maxlength="300"></div>
          <button type="button" class="btn btn-primaire" data-cz-maj="${echap(m.id)}"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${echap(t('cz.envoyerMaj'))}</button></details>
        <button type="button" class="btn" style="margin-top:.5rem" data-cz-retablir="${echap(m.id)}"><i class="ph ph-check-circle" aria-hidden="true"></i>${echap(t('cz.retablir'))}</button></li>`).join('')
        : `<li class="doux">${echap(t('cz.aucune'))}</li>`;
      $('cz-fini').innerHTML = finies.map(m => `<li><strong>${echap(m.id)} · ${echap(m.titre)}</strong><p class="doux" style="margin:.2rem 0 0;font-size:.85rem">${echap(t('cz.retablieLe', { d: NT.ui.dateHeure(m.crise.retablieLe || m.crise.majLe) }))}</p></li>`).join('') || `<li class="doux">—</li>`;
    }
    liste();

    $('form-crise').addEventListener('submit', ev => {
      ev.preventDefault();
      const q = quartiers(), ret = new Date($('cz-ret').value).getTime();
      $('cz-q-err').hidden = q.length > 0; $('cz-q-err').textContent = q.length ? '' : t('cz.eQuartier');
      const retOk = !$('cz-ret').value || ret > Date.now();
      $('cz-ret-err').hidden = retOk; $('cz-ret-err').textContent = retOk ? '' : t('cz.eRet');
      if (!q.length) { racine.querySelector('[name="cz-q"]').focus(); return; }
      if (!retOk) { $('cz-ret').focus(); return; }
      const inchange = modele && $('cz-titre').value === modele.titre && $('cz-message').value === modele.message && $('cz-actions').value === modele.actions;
      const r = NT.api('POST', '/api/crises', { type: type(), quartiers: q, retablissement: $('cz-ret').value ? new Date(ret).toISOString() : '',
        titre: $('cz-titre').value, message: $('cz-message').value, actions: lignes($('cz-actions').value), points: lignes($('cz-points').value),
        services: [...racine.querySelectorAll('[name="cz-s"]:checked')].map(i => i.value), alternative: $('cz-alt').value, traductions: inchange ? modele.traductions : {} });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
      const m = r.donnees, nb = (liste(), NT.api('GET', '/api/crises').donnees || []).find(x => x.id === m.id);
      const msg = t('cz.ok', { id: m.id, n: nb ? nb.nbHabitants : 0, s: (m.crise.services || []).map(id => nomSvc(services.find(s => s.id === id) || { id })).join(', ') || '—' });
      $('cz-ok').textContent = msg; NT.ui.toast(msg, 'success');
      if (NT.recharger) NT.recharger();
      if (NT.officiel) NT.officiel.charger();
    });

    racine.addEventListener('click', ev => {
      const bm = ev.target.closest('[data-cz-maj]');
      if (bm) {
        const id = bm.dataset.czMaj, h = $('cz-h-' + id).value, p = $('cz-p-' + id).value.trim();
        const r = NT.api('POST', '/api/crises/' + encodeURIComponent(id) + '/maj', { retablissement: h ? new Date(h).toISOString() : '', progression: p });
        if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
        NT.ui.toast(t('cz.majOk'), 'success'); liste(); if (NT.officiel) NT.officiel.charger();
        return;
      }
      const br = ev.target.closest('[data-cz-retablir]');
      if (!br) return;
      // confirmation en deux temps, sans fenêtre bloquante
      if (!br.dataset.confirme) { br.dataset.confirme = '1'; br.classList.add('btn-primaire'); br.lastChild.textContent = t('cz.confirmer'); return; }
      const r = NT.api('POST', '/api/crises/' + encodeURIComponent(br.dataset.czRetablir) + '/retablir', {});
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
      NT.ui.toast(t('cz.retabliOk', { id: br.dataset.czRetablir }), 'success'); liste();
      if (NT.recharger) NT.recharger();
      if (NT.officiel) NT.officiel.charger();
    });
  });
})();
