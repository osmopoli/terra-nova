/* Terra Nova — F73 : publier un « Message officiel » du Haut Conseil (agents / admins, page agent-alertes.html).
   Titre, message simple, « Ce que vous devez faire », public (toute la ville ou un quartier), début (tout de suite ou programmé)
   et fin. Le serveur contrôle les droits et les dates (POST /api/officiels) ; la liste montre l'état et le nombre de « J'ai compris ». */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ao.titre': 'Message officiel du Haut Conseil', 'ao.intro': 'Un message visible par tous immédiatement (ou à l’heure choisie) : la balise « Alertes » s’allume, le tiroir s’ouvre une fois pour chaque habitant concerné, avec le sceau du Haut Conseil et ce qu’il faut faire. Une carte est épinglée sur l’accueil et les annonces tant qu’il est en cours.',
      'ao.fTitre': 'Titre', 'ao.fTitreAide': 'Ce qu’il faut savoir, en une ligne.', 'ao.fMessage': 'Message', 'ao.fMessageAide': 'Phrases courtes, mots simples. Pas de jargon.',
      'ao.fActions': 'Ce que vous devez faire', 'ao.fActionsAide': 'Une action par ligne (6 au plus), en commençant par un verbe : « Fermez… », « Appelez… ».',
      'ao.fAudience': 'Public', 'ao.toute': 'Toute la ville', 'ao.quartier': 'Quartier {q}', 'ao.fQuand': 'Début', 'ao.immediat': 'Tout de suite', 'ao.programme': 'À une date et une heure précises',
      'ao.fDebut': 'Date et heure de début', 'ao.fFin': 'Fin de l’affichage', 'ao.fFinAide': 'Après cette date, le message disparaît tout seul (60 jours au plus).',
      'ao.trad': 'Traductions (facultatif)', 'ao.tradAide': 'Sans traduction, le message s’affiche en français avec une mention pour les habitants qui lisent une autre langue.',
      'ao.publier': 'Publier le message officiel', 'ao.resume': 'Le message ne peut pas encore être publié :',
      'ao.eTitre': 'Donnez un titre (5 caractères minimum).', 'ao.eMessage': 'Écrivez le message (10 caractères minimum).', 'ao.eActions': 'Indiquez au moins une chose à faire.',
      'ao.eDebut': 'Choisissez une date de début dans le futur.', 'ao.eFin': 'La fin doit être après le début.',
      'ao.okActif': 'Message officiel {id} publié : il s’affiche maintenant pour les habitants concernés.', 'ao.okProg': 'Message officiel {id} programmé : il s’affichera le {d}.',
      'ao.liste': 'Messages officiels', 'ao.aucun': 'Aucun message officiel pour le moment.', 'ao.periode': 'Du {d} au {f}', 'ao.compris': '{n} « J’ai compris »',
      'ao.retirer': 'Retirer', 'ao.retire': 'Message {id} retiré : il n’est plus affiché.', 'ao.confirmer': 'Retirer ce message officiel maintenant ?',
      'ao.e.actif': 'En cours', 'ao.e.programme': 'Programmé', 'ao.e.termine': 'Terminé', 'ao.e.retire': 'Retiré', 'ao.par': 'par {n}' },
    en: { 'ao.titre': 'Official message from the High Council', 'ao.intro': 'A message visible to everyone immediately (or at the chosen time): the “Alerts” beacon lights up, the drawer opens once for each resident concerned, with the High Council seal and what to do. A card is pinned on the home and notices pages while it is current.',
      'ao.fTitre': 'Title', 'ao.fTitreAide': 'What people need to know, in one line.', 'ao.fMessage': 'Message', 'ao.fMessageAide': 'Short sentences, simple words. No jargon.',
      'ao.fActions': 'What you need to do', 'ao.fActionsAide': 'One action per line (6 at most), starting with a verb: “Close…”, “Call…”.',
      'ao.fAudience': 'Audience', 'ao.toute': 'Whole city', 'ao.quartier': '{q} district', 'ao.fQuand': 'Start', 'ao.immediat': 'Right now', 'ao.programme': 'At a specific date and time',
      'ao.fDebut': 'Start date and time', 'ao.fFin': 'End of display', 'ao.fFinAide': 'After this date, the message disappears by itself (60 days at most).',
      'ao.trad': 'Translations (optional)', 'ao.tradAide': 'Without a translation, the message is shown in French with a note for residents reading another language.',
      'ao.publier': 'Publish the official message', 'ao.resume': 'The message cannot be published yet:',
      'ao.eTitre': 'Give a title (5 characters minimum).', 'ao.eMessage': 'Write the message (10 characters minimum).', 'ao.eActions': 'Give at least one thing to do.',
      'ao.eDebut': 'Choose a start date in the future.', 'ao.eFin': 'The end must be after the start.',
      'ao.okActif': 'Official message {id} published: it is now shown to the residents concerned.', 'ao.okProg': 'Official message {id} scheduled: it will be shown on {d}.',
      'ao.liste': 'Official messages', 'ao.aucun': 'No official message for now.', 'ao.periode': 'From {d} to {f}', 'ao.compris': '{n} “I understand”',
      'ao.retirer': 'Withdraw', 'ao.retire': 'Message {id} withdrawn: it is no longer shown.', 'ao.confirmer': 'Withdraw this official message now?',
      'ao.e.actif': 'Current', 'ao.e.programme': 'Scheduled', 'ao.e.termine': 'Ended', 'ao.e.retire': 'Withdrawn', 'ao.par': 'by {n}' },
    es: { 'ao.titre': 'Mensaje oficial del Alto Consejo', 'ao.intro': 'Un mensaje visible para todos de inmediato (o a la hora elegida): la baliza «Alertas» se enciende, el panel se abre una vez para cada habitante afectado, con el sello del Alto Consejo y lo que hay que hacer. Una tarjeta queda fijada en la portada y en los anuncios mientras esté vigente.',
      'ao.fTitre': 'Título', 'ao.fTitreAide': 'Lo que hay que saber, en una línea.', 'ao.fMessage': 'Mensaje', 'ao.fMessageAide': 'Frases cortas, palabras sencillas. Sin jerga.',
      'ao.fActions': 'Lo que debe hacer', 'ao.fActionsAide': 'Una acción por línea (6 como máximo), empezando por un verbo: «Cierre…», «Llame…».',
      'ao.fAudience': 'Público', 'ao.toute': 'Toda la ciudad', 'ao.quartier': 'Barrio {q}', 'ao.fQuand': 'Inicio', 'ao.immediat': 'Ahora mismo', 'ao.programme': 'En una fecha y hora precisas',
      'ao.fDebut': 'Fecha y hora de inicio', 'ao.fFin': 'Fin de la visualización', 'ao.fFinAide': 'Después de esta fecha, el mensaje desaparece solo (60 días como máximo).',
      'ao.trad': 'Traducciones (opcional)', 'ao.tradAide': 'Sin traducción, el mensaje se muestra en francés con una nota para quienes leen otro idioma.',
      'ao.publier': 'Publicar el mensaje oficial', 'ao.resume': 'El mensaje aún no se puede publicar:',
      'ao.eTitre': 'Indique un título (5 caracteres mínimo).', 'ao.eMessage': 'Escriba el mensaje (10 caracteres mínimo).', 'ao.eActions': 'Indique al menos una cosa que hacer.',
      'ao.eDebut': 'Elija una fecha de inicio futura.', 'ao.eFin': 'El fin debe ser posterior al inicio.',
      'ao.okActif': 'Mensaje oficial {id} publicado: ya se muestra a los habitantes afectados.', 'ao.okProg': 'Mensaje oficial {id} programado: se mostrará el {d}.',
      'ao.liste': 'Mensajes oficiales', 'ao.aucun': 'Ningún mensaje oficial por ahora.', 'ao.periode': 'Del {d} al {f}', 'ao.compris': '{n} «Lo he entendido»',
      'ao.retirer': 'Retirar', 'ao.retire': 'Mensaje {id} retirado: ya no se muestra.', 'ao.confirmer': '¿Retirar ahora este mensaje oficial?',
      'ao.e.actif': 'En curso', 'ao.e.programme': 'Programado', 'ao.e.termine': 'Terminado', 'ao.e.retire': 'Retirado', 'ao.par': 'por {n}' },
    ar: { 'ao.titre': 'رسالة رسمية من المجلس الأعلى', 'ao.intro': 'رسالة يراها الجميع فوراً (أو في الوقت المختار): تضيء منارة «التنبيهات»، ويُفتح الدرج مرة واحدة لكل ساكن معني، مع ختم المجلس الأعلى وما يجب فعله. تُثبَّت بطاقة في الصفحة الرئيسية والإعلانات ما دامت سارية.',
      'ao.fTitre': 'العنوان', 'ao.fTitreAide': 'ما يجب معرفته في سطر واحد.', 'ao.fMessage': 'الرسالة', 'ao.fMessageAide': 'جمل قصيرة وكلمات بسيطة. بدون مصطلحات معقدة.',
      'ao.fActions': 'ما يجب عليك فعله', 'ao.fActionsAide': 'إجراء واحد في كل سطر (6 على الأكثر)، يبدأ بفعل: «أغلق…»، «اتصل…».',
      'ao.fAudience': 'الجمهور', 'ao.toute': 'كل المدينة', 'ao.quartier': 'حي {q}', 'ao.fQuand': 'البداية', 'ao.immediat': 'فوراً', 'ao.programme': 'في تاريخ وساعة محددين',
      'ao.fDebut': 'تاريخ وساعة البداية', 'ao.fFin': 'نهاية العرض', 'ao.fFinAide': 'بعد هذا التاريخ تختفي الرسالة تلقائياً (60 يوماً على الأكثر).',
      'ao.trad': 'الترجمات (اختياري)', 'ao.tradAide': 'بدون ترجمة، تُعرض الرسالة بالفرنسية مع ملاحظة لمن يقرأ بلغة أخرى.',
      'ao.publier': 'نشر الرسالة الرسمية', 'ao.resume': 'لا يمكن نشر الرسالة بعد:',
      'ao.eTitre': 'أدخل عنواناً (5 أحرف على الأقل).', 'ao.eMessage': 'اكتب الرسالة (10 أحرف على الأقل).', 'ao.eActions': 'أدخل شيئاً واحداً على الأقل يجب فعله.',
      'ao.eDebut': 'اختر تاريخ بداية في المستقبل.', 'ao.eFin': 'يجب أن تكون النهاية بعد البداية.',
      'ao.okActif': 'نُشرت الرسالة الرسمية {id}: تظهر الآن للسكان المعنيين.', 'ao.okProg': 'بُرمجت الرسالة الرسمية {id}: ستظهر في {d}.',
      'ao.liste': 'الرسائل الرسمية', 'ao.aucun': 'لا توجد رسالة رسمية حالياً.', 'ao.periode': 'من {d} إلى {f}', 'ao.compris': '{n} «فهمت»',
      'ao.retirer': 'سحب', 'ao.retire': 'سُحبت الرسالة {id}: لم تعد معروضة.', 'ao.confirmer': 'سحب هذه الرسالة الرسمية الآن؟',
      'ao.e.actif': 'جارية', 'ao.e.programme': 'مبرمجة', 'ao.e.termine': 'منتهية', 'ao.e.retire': 'مسحوبة', 'ao.par': 'بواسطة {n}' }
  });

  NT.pret(() => {
    const racine = document.getElementById('officiel-agent');
    if (!racine) return;
    const t = NT.t, { echap } = NT.ui;
    const LANGUES = { en: 'English', es: 'Español', ar: 'العربية' };
    const local = d => { const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
    const champ = (id, lib, aide, html) => `<div class="champ"><label for="${id}">${echap(lib)}</label>${html}${aide ? `<span class="aide" id="${id}-aide">${echap(aide)}</span>` : ''}<p class="erreur" id="${id}-err" hidden></p></div>`;
    racine.innerHTML = `
      <div class="titre-section"><div><h2 id="t-officiel"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i> ${echap(t('ao.titre'))}</h2><p>${echap(t('ao.intro'))}</p></div></div>
      <div class="ag-alertes">
        <form class="panneau" id="form-officiel" novalidate aria-labelledby="t-officiel">
          <div id="ao-resume" role="alert"></div>
          ${champ('ao-titre', t('ao.fTitre'), t('ao.fTitreAide'), '<input id="ao-titre" maxlength="120" autocomplete="off" aria-describedby="ao-titre-aide ao-titre-err">')}
          ${champ('ao-message', t('ao.fMessage'), t('ao.fMessageAide'), '<textarea id="ao-message" maxlength="1200" aria-describedby="ao-message-aide ao-message-err"></textarea>')}
          ${champ('ao-actions', t('ao.fActions'), t('ao.fActionsAide'), '<textarea id="ao-actions" style="min-height:6rem" aria-describedby="ao-actions-aide ao-actions-err"></textarea>')}
          ${champ('ao-audience', t('ao.fAudience'), '', `<select id="ao-audience"><option value="Toute la ville">${echap(t('ao.toute'))}</option>${NT.QUARTIERS.map(q => `<option value="${q}">${echap(t('ao.quartier', { q }))}</option>`).join('')}</select>`)}
          <fieldset><legend>${echap(t('ao.fQuand'))}</legend>
            <div class="ag-niveaux"><label><input type="radio" name="ao-quand" value="immediat" checked><span><strong>${echap(t('ao.immediat'))}</strong></span></label>
              <label><input type="radio" name="ao-quand" value="programme"><span><strong>${echap(t('ao.programme'))}</strong></span></label></div>
            <div id="ao-zone-debut" hidden>${champ('ao-debut', t('ao.fDebut'), '', '<input id="ao-debut" type="datetime-local" aria-describedby="ao-debut-err">')}</div>
          </fieldset>
          ${champ('ao-fin', t('ao.fFin'), t('ao.fFinAide'), '<input id="ao-fin" type="datetime-local" aria-describedby="ao-fin-aide ao-fin-err">')}
          <details class="ao-trad"><summary>${echap(t('ao.trad'))}</summary><p class="aide">${echap(t('ao.tradAide'))}</p>
            ${Object.entries(LANGUES).map(([l, nom]) => `<fieldset lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}"><legend>${nom}</legend>
              <div class="champ"><label for="ao-${l}-titre">${echap(t('ao.fTitre'))} (${l.toUpperCase()})</label><input id="ao-${l}-titre" maxlength="120"></div>
              <div class="champ"><label for="ao-${l}-message">${echap(t('ao.fMessage'))} (${l.toUpperCase()})</label><textarea id="ao-${l}-message" maxlength="1200" style="min-height:4rem"></textarea></div>
              <div class="champ"><label for="ao-${l}-actions">${echap(t('ao.fActions'))} (${l.toUpperCase()})</label><textarea id="ao-${l}-actions" style="min-height:4rem"></textarea></div></fieldset>`).join('')}
          </details>
          <button type="submit" class="btn btn-primaire"><i class="ph ph-seal-check" aria-hidden="true"></i>${echap(t('ao.publier'))}</button>
          <p id="ao-ok" role="status" class="doux" style="margin:.8rem 0 0"></p>
        </form>
        <aside class="panneau" aria-labelledby="t-ao-liste"><h3 id="t-ao-liste">${echap(t('ao.liste'))}</h3><ul class="ag-annonces" id="ao-liste"></ul></aside>
      </div>`;
    const $ = id => document.getElementById(id);
    $('ao-fin').value = local(new Date(Date.now() + 864e5));
    racine.addEventListener('change', e => { if (e.target.name === 'ao-quand') { $('ao-zone-debut').hidden = e.target.value !== 'programme'; if (!$('ao-debut').value) $('ao-debut').value = local(new Date(Date.now() + 3600e3)); } });

    function liste() {
      const r = NT.api('GET', '/api/officiels/tous');
      const l = r.statut === 200 ? r.donnees : [];
      const ICONES = { actif: 'ph-broadcast', programme: 'ph-clock', termine: 'ph-check-circle', retire: 'ph-prohibit' };
      $('ao-liste').innerHTML = l.length ? l.map(m => `<li><div class="ligne entre"><strong>${echap(m.id)} · ${echap(m.titre)}</strong>
          <span class="statut statut-${m.etat === 'actif' ? 'ok' : m.etat === 'programme' ? 'en_cours' : 'cloturee'}"><i class="ph ${ICONES[m.etat]}" aria-hidden="true"></i>${echap(t('ao.e.' + m.etat))}</span></div>
        <p class="doux" style="margin:.3rem 0 0;font-size:.85rem">${echap(m.audience === 'Toute la ville' ? t('ao.toute') : t('ao.quartier', { q: m.audience }))} · ${echap(t('ao.periode', { d: NT.ui.dateHeure(m.debut), f: NT.ui.dateHeure(m.fin) }))}
          · ${echap(t('ao.compris', { n: m.nbCompris }))}${m.auteur ? ' · ' + echap(t('ao.par', { n: m.auteur })) : ''}</p>
        ${m.etat === 'actif' || m.etat === 'programme' ? `<button type="button" class="btn btn-danger" style="margin-top:.5rem" data-ao-retirer="${echap(m.id)}"><i class="ph ph-prohibit" aria-hidden="true"></i>${echap(t('ao.retirer'))}</button>` : ''}</li>`).join('')
        : `<li class="doux">${echap(t('ao.aucun'))}</li>`;
    }
    liste();

    const lignes = v => v.split('\n').map(s => s.trim()).filter(Boolean);
    function erreurs() {
      const e = [];
      const ok = (id, cond, msg) => { const err = $(id + '-err'), c = $(id); err.hidden = cond; err.textContent = cond ? '' : msg; if (cond) c.removeAttribute('aria-invalid'); else { c.setAttribute('aria-invalid', 'true'); e.push([id, msg]); } };
      ok('ao-titre', $('ao-titre').value.trim().length >= 5, t('ao.eTitre'));
      ok('ao-message', $('ao-message').value.trim().length >= 10, t('ao.eMessage'));
      ok('ao-actions', lignes($('ao-actions').value).length > 0, t('ao.eActions'));
      const prog = racine.querySelector('[name="ao-quand"]:checked').value === 'programme';
      const debut = prog ? new Date($('ao-debut').value).getTime() : Date.now();
      if (prog) ok('ao-debut', debut > Date.now(), t('ao.eDebut'));
      ok('ao-fin', new Date($('ao-fin').value).getTime() > debut, t('ao.eFin'));
      return { e, prog };
    }
    $('form-officiel').addEventListener('submit', ev => {
      ev.preventDefault();
      const { e, prog } = erreurs();
      const resume = $('ao-resume');
      if (e.length) {
        resume.className = 'ag-resume-erreurs';
        resume.innerHTML = `<strong>${echap(t('ao.resume'))}</strong><ul>${e.map(([id, m]) => `<li><a href="#${id}">${echap(m)}</a></li>`).join('')}</ul>`;
        $(e[0][0]).focus(); return;
      }
      resume.className = ''; resume.innerHTML = '';
      const traductions = {};
      Object.keys(LANGUES).forEach(l => { const tt = $(`ao-${l}-titre`).value.trim(), tm = $(`ao-${l}-message`).value.trim(), ta = lignes($(`ao-${l}-actions`).value); if (tt || tm || ta.length) traductions[l] = { titre: tt, message: tm, actions: ta }; });
      const r = NT.api('POST', '/api/officiels', { titre: $('ao-titre').value, message: $('ao-message').value, actions: lignes($('ao-actions').value), audience: $('ao-audience').value,
        immediat: !prog, debut: prog ? new Date($('ao-debut').value).toISOString() : undefined, fin: new Date($('ao-fin').value).toISOString(), traductions });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
      const m = r.donnees, msg = m.etat === 'actif' ? t('ao.okActif', { id: m.id }) : t('ao.okProg', { id: m.id, d: NT.ui.dateHeure(m.debut) });
      $('ao-ok').textContent = msg; NT.ui.toast(msg, 'success');
      ev.target.reset(); $('ao-zone-debut').hidden = true; $('ao-fin').value = local(new Date(Date.now() + 864e5));
      liste(); if (NT.officiel) NT.officiel.charger();
    });
    racine.addEventListener('click', ev => {
      const b = ev.target.closest('[data-ao-retirer]'); if (!b) return;
      // confirmation en deux temps, sans fenêtre bloquante : le premier clic demande de confirmer
      if (!b.dataset.confirme) { b.dataset.confirme = '1'; b.lastChild.textContent = t('ao.confirmer'); return; }
      const r = NT.api('POST', '/api/officiels/' + encodeURIComponent(b.dataset.aoRetirer) + '/retirer', {});
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
      NT.ui.toast(t('ao.retire', { id: b.dataset.aoRetirer }), 'success'); liste(); if (NT.officiel) NT.officiel.charger();
    });
  });
})();
