/* F52 — Soutenir un signalement déjà déposé par d'autres habitants.
   Données anonymisées : GET /api/demandes/publiques ; soutien : POST /api/demandes/:id/soutenir. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'sou.ariane': 'Soutenir un signalement' },
    en: {
      'sou.ariane': 'Support a report',
      'sou.titre': 'Support a report', 'sou.sous': 'A problem has already been reported near you? Say you are affected: the more supporters, the more the city takes it into account.',
      'sou.mesSoutiens': 'My supports', 'sou.mesSoutiensD': 'The reports you already support. You are told about their progress in your notifications.',
      'sou.ouverts': 'Open reports', 'sou.quartier': 'Neighbourhood', 'sou.rech': 'Search', 'sou.rechPh': 'Street, streetlight, waste…',
      'sou.aideRech': 'The list updates as you type. The most supported come first.',
      'sou.anonyme': 'Reports are shown without names or contact details. Nobody sees who supports what, except municipal agents.',
      'sou.tous': 'All neighbourhoods', 'sou.je': 'I support this', 'sou.retirer': 'Withdraw my support', 'sou.connexion': 'Log in to support',
      'sou.vous': 'Your report', 'sou.vousSoutenez': 'You support this report', 'sou.com': 'Add a comment (optional)',
      'sou.comAide': 'For example: “I also go through here every day…” (280 characters maximum)', 'sou.comPh': 'I also go through here every day…',
      'sou.ok': 'Your support is registered — you are {n} residents.', 'sou.ok1': 'Your support is registered — you are the first resident.',
      'sou.trace': 'A notification was added to your bell: you will be told when this report moves forward.',
      'sou.retire': 'Your support has been withdrawn. {n} residents still support this report.',
      'sou.n': '{n} supporters', 'sou.n1': '1 supporter', 'sou.n0': 'No supporter yet', 'sou.resultat': '{n} open reports', 'sou.resultat1': '1 open report',
      'sou.aucun': 'No report matches. Try another neighbourhood or word.',
      'sou.invit': 'To support a report, you must be logged in with a resident account.', 'sou.seConnecter': 'Log in', 'sou.creer': 'Create an account',
      'sou.personnel': 'Municipal staff cannot support reports: this feature is for residents.', 'sou.propre': 'You filed this report: it already counts. Follow it in your space.',
      'sou.suivre': 'Follow my report', 'sou.erreur': 'Your support could not be saved. Please try again.', 'sou.depuis': 'Reported {d}',
      'sou.service': 'Service'
    },
    es: {
      'sou.ariane': 'Apoyar un aviso',
      'sou.titre': 'Apoyar un aviso', 'sou.sous': '¿Ya se ha señalado un problema cerca de su casa? Diga que le afecta: cuantos más apoyos, más lo tiene en cuenta el ayuntamiento.',
      'sou.mesSoutiens': 'Mis apoyos', 'sou.mesSoutiensD': 'Los avisos que ya apoya. Se le informa de su avance en sus notificaciones.',
      'sou.ouverts': 'Avisos abiertos', 'sou.quartier': 'Barrio', 'sou.rech': 'Buscar', 'sou.rechPh': 'Calle, farola, residuos…',
      'sou.aideRech': 'La lista se actualiza mientras escribe. Los más apoyados aparecen primero.',
      'sou.anonyme': 'Los avisos se muestran sin nombre ni datos de contacto. Nadie ve quién apoya qué, salvo los agentes municipales.',
      'sou.tous': 'Todos los barrios', 'sou.je': 'Lo apoyo', 'sou.retirer': 'Retirar mi apoyo', 'sou.connexion': 'Iniciar sesión para apoyar',
      'sou.vous': 'Su aviso', 'sou.vousSoutenez': 'Usted apoya este aviso', 'sou.com': 'Añadir un comentario (opcional)',
      'sou.comAide': 'Por ejemplo: «Yo también paso por aquí cada día…» (280 caracteres como máximo)', 'sou.comPh': 'Yo también paso por aquí cada día…',
      'sou.ok': 'Su apoyo se ha registrado: ya son {n} vecinos.', 'sou.ok1': 'Su apoyo se ha registrado: es el primer vecino.',
      'sou.trace': 'Se ha añadido una notificación a su campana: se le avisará cuando este aviso avance.',
      'sou.retire': 'Su apoyo se ha retirado. {n} vecinos siguen apoyando este aviso.',
      'sou.n': '{n} apoyos', 'sou.n1': '1 apoyo', 'sou.n0': 'Ningún apoyo por el momento', 'sou.resultat': '{n} avisos abiertos', 'sou.resultat1': '1 aviso abierto',
      'sou.aucun': 'Ningún aviso coincide. Pruebe con otro barrio u otra palabra.',
      'sou.invit': 'Para apoyar un aviso, debe iniciar sesión con una cuenta de vecino.', 'sou.seConnecter': 'Iniciar sesión', 'sou.creer': 'Crear una cuenta',
      'sou.personnel': 'El personal municipal no puede apoyar avisos: esta función es para los vecinos.', 'sou.propre': 'Usted presentó este aviso: ya cuenta. Sígalo en su espacio.',
      'sou.suivre': 'Seguir mi aviso', 'sou.erreur': 'No se ha podido guardar su apoyo. Vuelva a intentarlo.', 'sou.depuis': 'Señalado {d}',
      'sou.service': 'Servicio'
    },
    ar: {
      'sou.ariane': 'دعم بلاغ',
      'sou.titre': 'دعم بلاغ', 'sou.sous': 'هل سبق الإبلاغ عن مشكلة قرب منزلك؟ قل إنك معني بها: كلما زاد الدعم، زاد اهتمام البلدية بها.',
      'sou.mesSoutiens': 'دعمي', 'sou.mesSoutiensD': 'البلاغات التي تدعمها بالفعل. تُبلَّغ بتقدمها في إشعاراتك.',
      'sou.ouverts': 'البلاغات المفتوحة', 'sou.quartier': 'الحي', 'sou.rech': 'بحث', 'sou.rechPh': 'شارع، عمود إنارة، نفايات…',
      'sou.aideRech': 'تتحدث القائمة أثناء الكتابة. تظهر البلاغات الأكثر دعماً أولاً.',
      'sou.anonyme': 'تُعرض البلاغات دون أسماء أو بيانات اتصال. لا أحد يرى من يدعم ماذا، باستثناء الأعوان البلديين.',
      'sou.tous': 'جميع الأحياء', 'sou.je': 'أدعم هذا البلاغ', 'sou.retirer': 'سحب دعمي', 'sou.connexion': 'سجّل الدخول للدعم',
      'sou.vous': 'بلاغك', 'sou.vousSoutenez': 'أنت تدعم هذا البلاغ', 'sou.com': 'إضافة تعليق (اختياري)',
      'sou.comAide': 'مثلاً: «أنا أيضاً أمر من هنا كل يوم…» (280 حرفاً كحد أقصى)', 'sou.comPh': 'أنا أيضاً أمر من هنا كل يوم…',
      'sou.ok': 'تم تسجيل دعمك — أنتم {n} من السكان.', 'sou.ok1': 'تم تسجيل دعمك — أنت أول ساكن.',
      'sou.trace': 'أُضيف إشعار إلى جرسك: ستُبلَّغ عندما يتقدم هذا البلاغ.',
      'sou.retire': 'تم سحب دعمك. ما زال {n} من السكان يدعمون هذا البلاغ.',
      'sou.n': '{n} داعماً', 'sou.n1': 'داعم واحد', 'sou.n0': 'لا يوجد داعم حالياً', 'sou.resultat': '{n} بلاغاً مفتوحاً', 'sou.resultat1': 'بلاغ واحد مفتوح',
      'sou.aucun': 'لا يوجد بلاغ مطابق. جرّب حياً آخر أو كلمة أخرى.',
      'sou.invit': 'لدعم بلاغ، يجب تسجيل الدخول بحساب ساكن.', 'sou.seConnecter': 'تسجيل الدخول', 'sou.creer': 'إنشاء حساب',
      'sou.personnel': 'لا يمكن للموظفين البلديين دعم البلاغات: هذه الميزة مخصصة للسكان.', 'sou.propre': 'أنت من قدّم هذا البلاغ: فهو محسوب بالفعل. تابعه في فضائك.',
      'sou.suivre': 'متابعة بلاغي', 'sou.erreur': 'تعذر حفظ دعمك. حاول مجدداً.', 'sou.depuis': 'أُبلغ عنه {d}',
      'sou.service': 'المصلحة'
    }
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const citoyen = !!u && u.role === 'citoyen';
    let donnees = [];
    const commentaires = {};
    let cible = (location.hash || '').replace('#', '');

    function charger() {
      const r = NT.api('GET', '/api/demandes/publiques');
      donnees = r.statut === 200 && Array.isArray(r.donnees) ? r.donnees : [];
    }
    const nombre = n => (n === 0 ? L('sou.n0', 'Aucun soutien pour l’instant') : n === 1 ? L('sou.n1', '1 habitant soutient') : L('sou.n', '{n} habitants soutiennent', { n }));

    function carte(d, prefixe) {
      const s = d.serviceId ? NT.services.get(d.serviceId) : null;
      const service = s ? NT.i18n.choisir(s.nom) : '';
      const id = prefixe + d.id;
      let action = '';
      if (d.estAMoi) {
        action = `<p class="doux" style="margin:0">${E(L('sou.propre', 'Vous avez déposé ce signalement : il compte déjà. Suivez-le dans votre espace.'))}</p>
          <a class="btn" href="suivi.html?id=${E(d.id)}">${E(L('sou.suivre', 'Suivre mon signalement'))}</a>`;
      } else if (citoyen) {
        action = `<button type="button" class="btn ${d.soutenuParMoi ? '' : 'btn-primaire'} btn-soutien" data-id="${E(d.id)}" aria-pressed="${d.soutenuParMoi}">
          <i class="ph-duotone ph-hands-clapping" aria-hidden="true"></i> ${E(d.soutenuParMoi ? L('sou.retirer', 'Retirer mon soutien') : L('sou.je', 'Je soutiens'))}</button>`;
      } else if (!u) {
        action = `<a class="btn btn-primaire" href="connexion.html?retour=soutenir.html${d.id ? '%23' + encodeURIComponent(d.id) : ''}"><i class="ph-duotone ph-sign-in" aria-hidden="true"></i> ${E(L('sou.connexion', 'Se connecter pour soutenir'))}</a>`;
      } else {
        action = `<p class="doux" style="margin:0">${E(L('sou.personnel', 'Le personnel municipal ne peut pas soutenir : cette fonction est réservée aux habitants.'))}</p>`;
      }
      const formulaire = citoyen && !d.estAMoi && !d.soutenuParMoi ? `<div class="champ sig-form">
          <label for="com-${E(id)}">${E(L('sou.com', 'Ajouter un commentaire (facultatif)'))}</label>
          <textarea id="com-${E(id)}" data-com="${E(d.id)}" maxlength="280" rows="2" aria-describedby="comaide-${E(id)}" placeholder="${E(L('sou.comPh', 'Moi aussi, je passe par là chaque jour…'))}">${E(commentaires[d.id] || '')}</textarea>
          <p class="aide" id="comaide-${E(id)}">${E(L('sou.comAide', 'Par exemple : « Moi aussi, je passe par là chaque jour… » (280 caractères maximum)'))}</p></div>` : '';
      const confirmation = d.soutenuParMoi ? `<div class="confirm-sou" role="group">
          <p><i class="ph-duotone ph-check-circle" aria-hidden="true"></i> <strong>${E(d.soutiens <= 1 ? L('sou.ok1', 'Votre soutien est enregistré — vous êtes le premier habitant.') : L('sou.ok', 'Votre soutien est enregistré — vous êtes {n} habitants.', { n: d.soutiens }))}</strong></p>
          <p class="doux">${E(L('sou.trace', 'Une notification a été ajoutée à votre cloche : vous serez prévenu quand ce signalement avance.'))}</p></div>` : '';
      return `<li><article class="sig ${d.soutenuParMoi ? 'soutenu' : ''}" ${prefixe ? '' : `id="${E(d.id)}"`} aria-labelledby="t-${E(id)}">
        <div class="sig-tete"><h3 id="t-${E(id)}">${E(d.objet)} <span class="doux">(${E(d.id)})</span></h3>
          <span class="ligne" style="gap:.5rem">${d.estAMoi ? `<span class="pastille-sou"><i class="ph-duotone ph-user-circle" aria-hidden="true"></i>${E(L('sou.vous', 'Votre signalement'))}</span>` : ''}
          ${d.soutenuParMoi ? `<span class="pastille-sou"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>${E(L('sou.vousSoutenez', 'Vous soutenez ce signalement'))}</span>` : ''}
          ${NT.ui.statut(d.statut)}</span></div>
        <p class="sig-meta">
          ${d.lieu ? `<span><i class="ph ph-map-pin" aria-hidden="true"></i>${E(d.lieu)}</span>` : ''}
          ${d.quartier ? `<span><i class="ph ph-buildings" aria-hidden="true"></i>${E(d.quartier)}</span>` : ''}
          ${service ? `<span><i class="ph ph-briefcase" aria-hidden="true"></i>${E(service)}</span>` : ''}
          <span><i class="ph ph-clock" aria-hidden="true"></i>${E(L('sou.depuis', 'Signalé {d}', { d: NT.ui.depuis(d.cree) }))}</span></p>
        ${d.message ? `<p class="sig-msg">${E(d.message)}</p>` : ''}
        ${formulaire}
        <div class="sig-actions"><span class="compteur"><i class="ph-duotone ph-users-three" aria-hidden="true"></i><span data-compteur="${E(d.id)}">${E(nombre(d.soutiens))}</span></span>${action}</div>
        ${confirmation}
      </article></li>`;
    }

    function filtrer() {
      const q = $('#f-q').value.trim().toLowerCase();
      const qt = $('#f-quartier').value;
      return donnees.filter(d => (!qt || d.quartier === qt) &&
        (!q || [d.objet, d.message, d.lieu, d.id, d.quartier].join(' ').toLowerCase().includes(q)));
    }

    function rendre() {
      const l = filtrer();
      $('#liste').innerHTML = l.length ? l.map(d => carte(d, '')).join('') : `<li class="vide">${E(L('sou.aucun', 'Aucun signalement ne correspond. Essayez un autre quartier ou un autre mot.'))}</li>`;
      $('#resultat').textContent = l.length === 1 ? L('sou.resultat1', '1 signalement ouvert') : L('sou.resultat', '{n} signalements ouverts', { n: l.length });
      const mes = donnees.filter(d => d.soutenuParMoi);
      $('#mes-soutiens').hidden = !mes.length;
      $('#liste-mes-soutiens').innerHTML = mes.map(d => carte(d, 'ms-')).join('');
      if (cible) {
        const el = document.getElementById(cible);
        if (el) { el.classList.add('cible'); el.scrollIntoView({ block: 'center' }); }
      }
    }

    // Filtres
    charger();
    const qs = Array.from(new Set(NT.QUARTIERS.concat(donnees.map(d => d.quartier)))).filter(Boolean);
    $('#f-quartier').innerHTML = `<option value="">${E(L('sou.tous', 'Tous les quartiers'))}</option>` + qs.map(q => `<option>${E(q)}</option>`).join('');
    $('#f-quartier').addEventListener('change', () => { cible = ''; rendre(); });
    $('#f-q').addEventListener('input', () => { cible = ''; rendre(); });

    // Invitation visiteur
    if (!u) {
      const inv = $('#invitation');
      inv.hidden = false;
      inv.innerHTML = `<p><i class="ph-duotone ph-info" aria-hidden="true"></i> ${E(L('sou.invit', 'Pour soutenir un signalement, vous devez être connecté avec un compte habitant.'))}</p>
        <p class="ligne"><a class="btn btn-primaire" href="connexion.html?retour=soutenir.html">${E(L('sou.seConnecter', 'Se connecter'))}</a>
        <a class="btn" href="inscription.html">${E(L('sou.creer', 'Créer un compte'))}</a></p>`;
    }

    // Commentaire : conservé quand la liste est redessinée
    document.addEventListener('input', e => { const c = e.target.closest && e.target.closest('[data-com]'); if (c) commentaires[c.dataset.com] = c.value; });

    // Soutenir / retirer
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('.btn-soutien'); if (!b) return;
      const id = b.dataset.id;
      const enCours = b.getAttribute('aria-pressed') === 'true';
      b.disabled = true;
      const r = NT.api('POST', '/api/demandes/' + encodeURIComponent(id) + '/soutenir', { commentaire: enCours ? '' : (commentaires[id] || '').trim() });
      if (r.statut !== 200 || !r.donnees || !r.donnees.ok) {
        b.disabled = false;
        NT.ui.toast((r.donnees && r.donnees.erreur) || L('sou.erreur', 'Votre soutien n’a pas pu être enregistré. Réessayez.'), 'danger');
        return;
      }
      delete commentaires[id];
      charger(); cible = ''; rendre();
      const n = r.donnees.soutiens;
      NT.ui.annoncer(r.donnees.soutenu
        ? (n <= 1 ? L('sou.ok1', 'Votre soutien est enregistré — vous êtes le premier habitant.') : L('sou.ok', 'Votre soutien est enregistré — vous êtes {n} habitants.', { n })) + ' ' + L('sou.trace', 'Une notification a été ajoutée à votre cloche : vous serez prévenu quand ce signalement avance.')
        : L('sou.retire', 'Votre soutien est retiré. {n} habitants soutiennent encore ce signalement.', { n }));
      if (!r.donnees.soutenu) NT.ui.toast(L('sou.retire', 'Votre soutien est retiré. {n} habitants soutiennent encore ce signalement.', { n }), 'primary');
      const nouveau = document.querySelector('#liste .btn-soutien[data-id="' + id + '"]');
      if (nouveau) nouveau.focus();
    });

    rendre();
  });
})();
