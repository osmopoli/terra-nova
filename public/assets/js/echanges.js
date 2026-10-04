/* Terra Nova — vague 16 (F84) : réponses des agents aux habitants et fil d'échanges par demande.
   - Habitant (suivi.html) : « Échanges avec la mairie » — fil des réponses de la ville et de ses messages, formulaire « Répondre ».
   - Agent (agent-demandes.html) : dans le tiroir de traitement, fil + « Répondre à l'habitant » (réponses types, changement de
     statut facultatif, envoi aussi aux demandes rattachées F75) ; badges « Réponse en attente » / « Répondu » avec la date,
     panneau de suivi (compteurs + filtre « sans réponse depuis X jours »). Tableau de bord (agent.html) : compteurs cliquables.
   Les droits et l'audit sont tenus par le serveur (src/modules/echanges.js). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ech.titre': 'Échanges avec la mairie', 'ech.intro': 'Les réponses de la ville et vos messages sur cette demande.', 'ech.aucun': 'Pas encore de réponse écrite : vous serez prévenu dès que la mairie vous répond.',
      'ech.mairie': 'Mairie', 'ech.vous': 'Vous', 'ech.habitant': 'Habitant', 'ech.statutChange': 'Statut passé à « {s} »', 'ech.commun': 'Réponse commune à la demande {id}',
      'ech.repondre': 'Répondre à la mairie', 'ech.votreMsg': 'Votre message', 'ech.aideMsg': 'L’agent qui suit votre demande est prévenu.', 'ech.envoyer': 'Envoyer mon message',
      'ech.errMsg': 'Écrivez votre message.', 'ech.ok': 'Message envoyé à la mairie.', 'ech.cloturee': 'Cette demande est clôturée : pour une nouvelle question, faites une nouvelle demande.',
      'ech.agTitre': 'Échanges avec l’habitant', 'ech.agRepondre': 'Répondre à l’habitant', 'ech.modele': 'Réponse type (facultatif)', 'ech.modeleAucun': 'Écrire librement',
      'ech.msgAgent': 'Message à l’habitant', 'ech.msgAide': 'Écrit en langage simple. L’habitant est notifié et peut vous répondre depuis son suivi.',
      'ech.statut': 'Statut de la demande', 'ech.statutGarder': 'Ne pas changer (actuellement : {s})', 'ech.liees': 'Envoyer aussi aux {n} demandes rattachées (réponse commune)',
      'ech.envoyerAg': 'Envoyer la réponse', 'ech.errAg': 'Écrivez votre réponse (5 caractères minimum).', 'ech.okAg': 'Réponse envoyée à l’habitant de la demande {id} : il est notifié.',
      'ech.okCommun': 'Réponse envoyée aussi aux {n} demandes rattachées.', 'ech.sansCompte': 'Habitant sans compte : copiez la réponse dans un e-mail à {e}.', 'ech.mailto': 'Écrire l’e-mail',
      'ech.sansContact': 'Habitant sans compte ni e-mail : la réponse reste dans le dossier.',
      'ech.attente': 'Réponse en attente', 'ech.attenteDepuis': 'Réponse en attente · {d}', 'ech.repondu': 'Répondu le {d}', 'ech.jours': '{n} j', 'ech.aujourdhui': 'aujourd’hui',
      'ech.panneau': 'Réponses aux habitants', 'ech.panneauD': 'Suivi quotidien : demandes ouvertes qui attendent une réponse écrite, et celles déjà répondues.',
      'ech.kAttente': 'Réponses en attente', 'ech.kRepondu': 'Répondues', 'ech.kRetard': 'Sans réponse depuis plus de {n} jours', 'ech.filtre': 'Sans réponse depuis',
      'ech.f0': 'Peu importe', 'ech.f1': 'au moins 1 jour', 'ech.f3': 'au moins 3 jours', 'ech.f7': 'au moins 7 jours', 'ech.tout': 'Afficher toutes les demandes', 'ech.filtreActif': 'Filtre : {f}',
      'ech.derniere': 'Dernière réponse', 'ech.jamais': 'aucune réponse écrite' },
    en: { 'ech.titre': 'Messages with the city hall', 'ech.intro': 'The city’s replies and your messages about this request.', 'ech.aucun': 'No written reply yet: you will be notified as soon as the city hall replies.',
      'ech.mairie': 'City hall', 'ech.vous': 'You', 'ech.habitant': 'Resident', 'ech.statutChange': 'Status changed to “{s}”', 'ech.commun': 'Common reply to request {id}',
      'ech.repondre': 'Reply to the city hall', 'ech.votreMsg': 'Your message', 'ech.aideMsg': 'The agent following your request is notified.', 'ech.envoyer': 'Send my message',
      'ech.errMsg': 'Write your message.', 'ech.ok': 'Message sent to the city hall.', 'ech.cloturee': 'This request is closed: for a new question, make a new request.',
      'ech.agTitre': 'Messages with the resident', 'ech.agRepondre': 'Reply to the resident', 'ech.modele': 'Template reply (optional)', 'ech.modeleAucun': 'Write freely',
      'ech.msgAgent': 'Message to the resident', 'ech.msgAide': 'Use plain language. The resident is notified and can reply from their tracking page.',
      'ech.statut': 'Request status', 'ech.statutGarder': 'Do not change (currently: {s})', 'ech.liees': 'Also send to the {n} linked requests (common reply)',
      'ech.envoyerAg': 'Send the reply', 'ech.errAg': 'Write your reply (5 characters minimum).', 'ech.okAg': 'Reply sent to the resident of request {id}: they are notified.',
      'ech.okCommun': 'Reply also sent to the {n} linked requests.', 'ech.sansCompte': 'Resident without an account: copy the reply into an e-mail to {e}.', 'ech.mailto': 'Write the e-mail',
      'ech.sansContact': 'Resident with no account or e-mail: the reply stays in the file.',
      'ech.attente': 'Reply pending', 'ech.attenteDepuis': 'Reply pending · {d}', 'ech.repondu': 'Replied on {d}', 'ech.jours': '{n} d', 'ech.aujourdhui': 'today',
      'ech.panneau': 'Replies to residents', 'ech.panneauD': 'Daily follow-up: open requests waiting for a written reply, and those already answered.',
      'ech.kAttente': 'Replies pending', 'ech.kRepondu': 'Answered', 'ech.kRetard': 'No reply for more than {n} days', 'ech.filtre': 'No reply for',
      'ech.f0': 'Any time', 'ech.f1': 'at least 1 day', 'ech.f3': 'at least 3 days', 'ech.f7': 'at least 7 days', 'ech.tout': 'Show all requests', 'ech.filtreActif': 'Filter: {f}',
      'ech.derniere': 'Last reply', 'ech.jamais': 'no written reply' },
    es: { 'ech.titre': 'Intercambios con el ayuntamiento', 'ech.intro': 'Las respuestas del ayuntamiento y sus mensajes sobre esta solicitud.', 'ech.aucun': 'Aún no hay respuesta escrita: recibirá un aviso en cuanto el ayuntamiento responda.',
      'ech.mairie': 'Ayuntamiento', 'ech.vous': 'Usted', 'ech.habitant': 'Habitante', 'ech.statutChange': 'Estado cambiado a «{s}»', 'ech.commun': 'Respuesta común a la solicitud {id}',
      'ech.repondre': 'Responder al ayuntamiento', 'ech.votreMsg': 'Su mensaje', 'ech.aideMsg': 'El agente que sigue su solicitud recibe un aviso.', 'ech.envoyer': 'Enviar mi mensaje',
      'ech.errMsg': 'Escriba su mensaje.', 'ech.ok': 'Mensaje enviado al ayuntamiento.', 'ech.cloturee': 'Esta solicitud está cerrada: para una nueva pregunta, haga una nueva solicitud.',
      'ech.agTitre': 'Intercambios con el habitante', 'ech.agRepondre': 'Responder al habitante', 'ech.modele': 'Respuesta tipo (opcional)', 'ech.modeleAucun': 'Escribir libremente',
      'ech.msgAgent': 'Mensaje al habitante', 'ech.msgAide': 'En lenguaje sencillo. El habitante recibe un aviso y puede responder desde su seguimiento.',
      'ech.statut': 'Estado de la solicitud', 'ech.statutGarder': 'No cambiar (actualmente: {s})', 'ech.liees': 'Enviar también a las {n} solicitudes vinculadas (respuesta común)',
      'ech.envoyerAg': 'Enviar la respuesta', 'ech.errAg': 'Escriba su respuesta (5 caracteres mínimo).', 'ech.okAg': 'Respuesta enviada al habitante de la solicitud {id}: ha recibido un aviso.',
      'ech.okCommun': 'Respuesta enviada también a las {n} solicitudes vinculadas.', 'ech.sansCompte': 'Habitante sin cuenta: copie la respuesta en un correo a {e}.', 'ech.mailto': 'Escribir el correo',
      'ech.sansContact': 'Habitante sin cuenta ni correo: la respuesta queda en el expediente.',
      'ech.attente': 'Respuesta pendiente', 'ech.attenteDepuis': 'Respuesta pendiente · {d}', 'ech.repondu': 'Respondida el {d}', 'ech.jours': '{n} d', 'ech.aujourdhui': 'hoy',
      'ech.panneau': 'Respuestas a los habitantes', 'ech.panneauD': 'Seguimiento diario: solicitudes abiertas que esperan una respuesta escrita y las ya respondidas.',
      'ech.kAttente': 'Respuestas pendientes', 'ech.kRepondu': 'Respondidas', 'ech.kRetard': 'Sin respuesta desde hace más de {n} días', 'ech.filtre': 'Sin respuesta desde hace',
      'ech.f0': 'Indiferente', 'ech.f1': 'al menos 1 día', 'ech.f3': 'al menos 3 días', 'ech.f7': 'al menos 7 días', 'ech.tout': 'Mostrar todas las solicitudes', 'ech.filtreActif': 'Filtro: {f}',
      'ech.derniere': 'Última respuesta', 'ech.jamais': 'ninguna respuesta escrita' },
    ar: { 'ech.titre': 'المراسلات مع البلدية', 'ech.intro': 'ردود المدينة ورسائلك بشأن هذا الطلب.', 'ech.aucun': 'لا يوجد رد مكتوب بعد: سيتم إعلامك فور رد البلدية.',
      'ech.mairie': 'البلدية', 'ech.vous': 'أنت', 'ech.habitant': 'الساكن', 'ech.statutChange': 'تغيّرت الحالة إلى «{s}»', 'ech.commun': 'رد مشترك على الطلب {id}',
      'ech.repondre': 'الرد على البلدية', 'ech.votreMsg': 'رسالتك', 'ech.aideMsg': 'يتم إعلام العون الذي يتابع طلبك.', 'ech.envoyer': 'إرسال رسالتي',
      'ech.errMsg': 'اكتب رسالتك.', 'ech.ok': 'تم إرسال الرسالة إلى البلدية.', 'ech.cloturee': 'هذا الطلب مغلق: لسؤال جديد، قدّم طلباً جديداً.',
      'ech.agTitre': 'المراسلات مع الساكن', 'ech.agRepondre': 'الرد على الساكن', 'ech.modele': 'رد جاهز (اختياري)', 'ech.modeleAucun': 'الكتابة بحرية',
      'ech.msgAgent': 'رسالة إلى الساكن', 'ech.msgAide': 'بلغة بسيطة. يتم إعلام الساكن ويمكنه الرد من صفحة المتابعة.',
      'ech.statut': 'حالة الطلب', 'ech.statutGarder': 'دون تغيير (حالياً: {s})', 'ech.liees': 'الإرسال أيضاً إلى {n} طلبات مرتبطة (رد مشترك)',
      'ech.envoyerAg': 'إرسال الرد', 'ech.errAg': 'اكتب ردك (5 أحرف على الأقل).', 'ech.okAg': 'أُرسل الرد إلى ساكن الطلب {id}: تم إعلامه.',
      'ech.okCommun': 'أُرسل الرد أيضاً إلى {n} طلبات مرتبطة.', 'ech.sansCompte': 'ساكن بدون حساب: انسخ الرد في بريد إلكتروني إلى {e}.', 'ech.mailto': 'كتابة البريد',
      'ech.sansContact': 'ساكن بدون حساب ولا بريد: يبقى الرد في الملف.',
      'ech.attente': 'رد منتظر', 'ech.attenteDepuis': 'رد منتظر · {d}', 'ech.repondu': 'تم الرد في {d}', 'ech.jours': '{n} يوم', 'ech.aujourdhui': 'اليوم',
      'ech.panneau': 'الردود على السكان', 'ech.panneauD': 'المتابعة اليومية: الطلبات المفتوحة التي تنتظر رداً مكتوباً، وتلك التي تم الرد عليها.',
      'ech.kAttente': 'ردود منتظرة', 'ech.kRepondu': 'تم الرد عليها', 'ech.kRetard': 'بدون رد منذ أكثر من {n} أيام', 'ech.filtre': 'بدون رد منذ',
      'ech.f0': 'أي مدة', 'ech.f1': 'يوم واحد على الأقل', 'ech.f3': '3 أيام على الأقل', 'ech.f7': '7 أيام على الأقل', 'ech.tout': 'عرض كل الطلبات', 'ech.filtreActif': 'تصفية: {f}',
      'ech.derniere': 'آخر رد', 'ech.jamais': 'لا يوجد رد مكتوب' }
  });
  const t = (k, v) => NT.t(k, v);
  const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const JOUR = 864e5;
  const STATUTS = ['recue', 'en_cours', 'traitee', 'cloturee'];
  const libStatut = s => NT.t('statut.' + s, null, NT.STATUTS[s] || s);
  const dateCourte = iso => NT.ui.dateHeure(iso);

  /* ---------- Où en est la réponse écrite d'une demande ---------- */
  const NOTE_HABITANT = /^(Complément du citoyen|Message de l’habitant)/;
  function etat(d) {
    const ech = d.echanges || [];
    const auteur = d.userId && NT.store.find('utilisateurs', d.userId);
    const nomHab = auteur ? auteur.prenom + ' ' + auteur.nom : '';
    let rep = (ech.filter(x => x.auteur === 'agent').pop() || {}).date || null;
    if (!rep) {   // demandes antérieures à la vague 16 : dernière note écrite par un agent dans l'historique
      const h = (d.historique || []).filter(x => x.note && x.par && x.par !== 'Système' && x.par !== nomHab && !x.interne && !NOTE_HABITANT.test(x.note) && !/^Prise en charge par/.test(x.note)).pop();
      rep = h ? h.date : null;
    }
    let hab = (ech.filter(x => x.auteur === 'habitant').pop() || {}).date || null;
    if (!hab) { const h = (d.historique || []).filter(x => x.note && NOTE_HABITANT.test(x.note)).pop(); hab = h ? h.date : null; }
    const ouverte = d.statut === 'recue' || d.statut === 'en_cours';
    const attente = ouverte && (!rep || (hab && hab > rep));
    const depuis = attente ? (hab && (!rep || hab > rep) ? hab : d.cree) : null;
    return { attente, repondu: !!rep && !attente, derniereReponse: rep, depuis, jours: depuis ? Math.floor((Date.now() - Date.parse(depuis)) / JOUR) : 0 };
  }

  /* ---------- Fil d'échanges (commun habitant / agent) ---------- */
  function fil(d, vueAgent) {
    const ech = d.echanges || [];
    if (!ech.length) return `<p class="doux">${e(t('ech.aucun'))}</p>`;
    return `<ol class="tn-fil">${ech.map(x => {
      const agent = x.auteur === 'agent';
      const qui = agent ? t('ech.mairie') + ' · ' + x.par : (vueAgent ? t('ech.habitant') + ' · ' + x.par : t('ech.vous'));
      return `<li class="tn-msg ${agent ? 'tn-msg-mairie' : 'tn-msg-habitant'}">
        <p class="tn-msg-entete"><i class="ph-duotone ${agent ? 'ph-buildings' : 'ph-user-circle'}" aria-hidden="true"></i><strong>${e(qui)}</strong>
          <time datetime="${e(x.date)}" class="doux">${e(dateCourte(x.date))}</time></p>
        <p class="tn-msg-texte" dir="auto">${e(x.message)}</p>
        ${x.statut ? `<p class="tn-msg-meta">${NT.ui.statut(x.statut)} <span class="doux">${e(t('ech.statutChange', { s: libStatut(x.statut) }))}</span></p>` : ''}
        ${x.commun ? `<p class="tn-msg-meta doux"><i class="ph ph-stack" aria-hidden="true"></i> ${e(t('ech.commun', { id: x.commun }))}</p>` : ''}</li>`;
    }).join('')}</ol>`;
  }

  const R = (NT.reponses = { etat, fil });

  /* ---------- Habitant : suivi.html ---------- */
  R.suivi = (ancre, d) => {   // le fil est placé juste avant « ancre » (zone d'avis F76 du suivi)
    const u = NT.auth.utilisateur();
    if (!ancre || !d || !u) return;
    const citoyen = u.role === 'citoyen' && d.userId === u.id;
    const sec = document.createElement('section');
    sec.className = 'panneau dm-panneau tn-echanges';
    sec.id = 'echanges';
    sec.setAttribute('aria-labelledby', 'h-echanges');
    sec.innerHTML = `<h2 id="h-echanges" style="font-size:1.2rem"><i class="ph-duotone ph-chats-circle" aria-hidden="true"></i> ${e(t('ech.titre'))}</h2>
      <p class="doux">${e(t('ech.intro'))}</p>${fil(d, !citoyen)}
      ${citoyen ? (d.statut === 'cloturee' ? `<p class="doux">${e(t('ech.cloturee'))}</p>` : `
      <form id="form-echange" novalidate>
        <div class="champ"><label for="ech-msg">${e(t('ech.repondre'))}</label>
          <textarea id="ech-msg" maxlength="2000" style="min-height:5.5rem" aria-describedby="ech-aide ech-err"></textarea>
          <p class="aide" id="ech-aide">${e(t('ech.aideMsg'))}</p><p class="erreur dm-err" id="ech-err" hidden></p></div>
        <button class="btn btn-primaire" type="submit"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i><span>${e(t('ech.envoyer'))}</span></button>
      </form>`) : ''}`;
    ancre.before(sec);
    const compl = document.getElementById('form-compl');   // le fil remplace l'ancien « complément d'information »
    if (compl && compl.closest('section')) compl.closest('section').hidden = true;
    const f = sec.querySelector('#form-echange');
    if (!f) return;
    const champ = f.querySelector('#ech-msg'), err = f.querySelector('#ech-err');
    champ.addEventListener('input', () => { err.hidden = true; champ.removeAttribute('aria-invalid'); });
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      const msg = champ.value.trim();
      if (msg.length < 2) { err.textContent = t('ech.errMsg'); err.hidden = false; champ.setAttribute('aria-invalid', 'true'); champ.focus(); return; }
      const r = NT.api('POST', '/api/demandes/' + encodeURIComponent(d.id) + '/messages', { message: msg });
      if (r.statut !== 200) { if (!(NT.formulaires && NT.formulaires.pris)) { err.textContent = (r.donnees && r.donnees.erreur) || t('ech.errMsg'); err.hidden = false; } return; }
      NT.recharger();
      NT.ui.toast(t('ech.ok'), 'success');
      const maj = r.donnees.demande;
      sec.remove();
      R.suivi(ancre, maj);
      const h = document.getElementById('h-echanges'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    });
    if (location.hash === '#echanges') setTimeout(() => sec.scrollIntoView({ block: 'start' }), 50);
  };

  /* ---------- Agent : agent-demandes.html ---------- */
  const filtreEtat = { vue: '', jours: 0 };
  R.etatFiltre = filtreEtat;
  R.onChange = () => {};
  if (['attente', 'repondu'].includes(new URLSearchParams(location.search).get('reponse'))) filtreEtat.vue = new URLSearchParams(location.search).get('reponse');
  const sansP = Number(new URLSearchParams(location.search).get('sans'));
  if ([1, 3, 7].includes(sansP)) { filtreEtat.vue = 'attente'; filtreEtat.jours = sansP; }

  R.filtre = d => {
    if (!filtreEtat.vue) return true;
    const s = etat(d);
    if (filtreEtat.vue === 'repondu') return s.repondu;
    return s.attente && s.jours >= filtreEtat.jours;
  };
  R.badge = d => {
    const s = etat(d);
    if (s.attente) return `<span class="rp-badge rp-attente"><i class="ph ph-hourglass-medium" aria-hidden="true"></i>${e(t('ech.attenteDepuis', { d: s.jours ? t('ech.jours', { n: s.jours }) : t('ech.aujourdhui') }))}</span>`;
    if (s.repondu) return `<span class="rp-badge rp-repondu"><i class="ph ph-chat-circle-text" aria-hidden="true"></i>${e(t('ech.repondu', { d: NT.ui.date(s.derniereReponse, { day: 'numeric', month: 'short' }) }))}</span>`;
    return '';
  };
  R.compteurs = liste => {
    const l = (liste || NT.demandes.toutes()).map(etat);
    return { attente: l.filter(s => s.attente).length, repondu: l.filter(s => s.repondu).length, retard: l.filter(s => s.attente && s.jours >= 3).length };
  };
  R.panneau = () => {
    let p = document.getElementById('rp-panneau');
    if (!p) {
      const ancre = document.getElementById('compte'); if (!ancre) return;
      p = document.createElement('section');
      p.id = 'rp-panneau'; p.className = 'panneau rp-panneau'; p.setAttribute('aria-labelledby', 'rp-h');
      ancre.before(p);
      p.addEventListener('click', ev => {
        const b = ev.target.closest('[data-rp]'); if (!b) return;
        const v = b.dataset.rp;
        if (v === 'tout') { filtreEtat.vue = ''; filtreEtat.jours = 0; }
        else if (v === 'retard') { filtreEtat.vue = 'attente'; filtreEtat.jours = 3; }
        else { filtreEtat.vue = filtreEtat.vue === v && !filtreEtat.jours ? '' : v; filtreEtat.jours = 0; }
        R.panneau(); R.onChange();
        const n = p.querySelector(`[data-rp="${v}"]`); if (n) n.focus();
      });
      p.addEventListener('change', ev => {
        if (ev.target.id !== 'rp-jours') return;
        filtreEtat.jours = Number(ev.target.value) || 0;
        filtreEtat.vue = filtreEtat.jours ? 'attente' : filtreEtat.vue;
        R.panneau(); R.onChange();
        const s = document.getElementById('rp-jours'); if (s) s.focus();
      });
    }
    const c = R.compteurs();
    const presse = (v, j) => String(filtreEtat.vue === v && (j === undefined || filtreEtat.jours === j));
    p.innerHTML = `<h2 id="rp-h"><i class="ph-duotone ph-chats-circle" aria-hidden="true"></i> ${e(t('ech.panneau'))}</h2>
      <p class="doux">${e(t('ech.panneauD'))}</p>
      <div class="rp-boutons" role="group" aria-label="${e(t('ech.panneau'))}">
        <button type="button" class="rp-k" data-rp="attente" aria-pressed="${presse('attente', 0)}"><span class="valeur">${c.attente}</span><span>${e(t('ech.kAttente'))}</span></button>
        <button type="button" class="rp-k" data-rp="retard" aria-pressed="${presse('attente', 3)}"><span class="valeur">${c.retard}</span><span>${e(t('ech.kRetard', { n: 3 }))}</span></button>
        <button type="button" class="rp-k" data-rp="repondu" aria-pressed="${presse('repondu')}"><span class="valeur">${c.repondu}</span><span>${e(t('ech.kRepondu'))}</span></button>
      </div>
      <div class="ligne rp-filtre">
        <div class="champ"><label for="rp-jours">${e(t('ech.filtre'))}</label>
          <select id="rp-jours">${[0, 1, 3, 7].map(n => `<option value="${n}" ${filtreEtat.jours === n ? 'selected' : ''}>${e(t('ech.f' + n))}</option>`).join('')}</select></div>
        ${filtreEtat.vue ? `<button type="button" class="btn" data-rp="tout"><i class="ph ph-x" aria-hidden="true"></i>${e(t('ech.tout'))}</button>` : ''}
      </div>`;
  };

  // Tiroir de traitement : fil + composeur de réponse
  let modeles = null;
  const chargerModeles = () => { if (modeles) return modeles; const r = NT.api('GET', '/api/reponses-types'); modeles = r.statut === 200 ? r.donnees : []; return modeles; };
  R.tiroirHtml = d => {
    const s = etat(d);
    const c = d.userId && NT.store.find('utilisateurs', d.userId);
    const liees = (d.liees || []).length;
    const ms = chargerModeles();
    return `<section class="tn-echanges-ag" aria-labelledby="rp-t">
      <h3 id="rp-t">${e(t('ech.agTitre'))} ${R.badge(d)}</h3>
      <p class="doux" style="margin:.2rem 0 .6rem">${e(t('ech.derniere'))} : ${e(s.derniereReponse ? dateCourte(s.derniereReponse) : t('ech.jamais'))}</p>
      ${fil(d, true)}
      <form id="rp-form" novalidate>
        <h4>${e(t('ech.agRepondre'))}</h4>
        ${!c ? `<p class="sg-note"><i class="ph-duotone ph-envelope-simple" aria-hidden="true"></i><span>${e(d.contactEmail ? t('ech.sansCompte', { e: d.contactEmail }) : t('ech.sansContact'))}</span></p>` : ''}
        <div class="champ"><label for="rp-modele">${e(t('ech.modele'))}</label>
          <select id="rp-modele"><option value="">${e(t('ech.modeleAucun'))}</option>${ms.map(m => `<option value="${e(m.id)}">${e(m.titre)}</option>`).join('')}</select></div>
        <div class="champ"><label for="rp-msg">${e(t('ech.msgAgent'))}</label>
          <textarea id="rp-msg" maxlength="2000" style="min-height:7rem" aria-describedby="rp-aide rp-err"></textarea>
          <span class="aide" id="rp-aide">${e(t('ech.msgAide'))}</span><p class="erreur" id="rp-err" hidden></p></div>
        <div class="champ"><label for="rp-statut">${e(t('ech.statut'))}</label>
          <select id="rp-statut"><option value="">${e(t('ech.statutGarder', { s: libStatut(d.statut) }))}</option>${STATUTS.filter(x => x !== d.statut).map(x => `<option value="${x}">${e(libStatut(x))}</option>`).join('')}</select></div>
        ${liees ? `<p><label class="ligne" style="gap:.5rem;align-items:center"><input type="checkbox" id="rp-liees" checked> ${e(t('ech.liees', { n: liees }))}</label></p>` : ''}
        <button type="submit" class="btn btn-primaire"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${e(t('ech.envoyerAg'))}</button>
        <div id="rp-apres" aria-live="polite"></div>
      </form>
    </section>`;
  };
  R.remplirTiroir = (corps, d, apres) => {
    const f = corps.querySelector('#rp-form'); if (!f) return;
    const msg = f.querySelector('#rp-msg'), err = f.querySelector('#rp-err');
    const svc = d.serviceId && NT.services.get(d.serviceId);
    f.querySelector('#rp-modele').addEventListener('change', ev => {
      const m = (modeles || []).find(x => x.id === ev.target.value); if (!m) return;
      msg.value = m.texte.split('{numero}').join(d.id).split('{service}').join(svc ? NT.i18n.choisir(svc.nom) : 'concerné');
      const st = f.querySelector('#rp-statut');
      if (m.statut && m.statut !== d.statut) st.value = m.statut;
      msg.focus();
    });
    msg.addEventListener('input', () => { err.hidden = true; msg.removeAttribute('aria-invalid'); });
    f.addEventListener('submit', ev => {
      ev.preventDefault(); ev.stopPropagation();   // le formulaire « Traitement » de la page ne doit pas le recevoir
      const texte = msg.value.trim();
      if (texte.length < 5) { err.textContent = t('ech.errAg'); err.hidden = false; msg.setAttribute('aria-invalid', 'true'); msg.focus(); return; }
      const liees = f.querySelector('#rp-liees');
      const r = NT.api('POST', '/api/demandes/' + encodeURIComponent(d.id) + '/repondre', { message: texte, statut: f.querySelector('#rp-statut').value, modele: f.querySelector('#rp-modele').value, liees: liees ? liees.checked : false });
      if (r.statut !== 200) { err.textContent = (r.donnees && r.donnees.erreur) || 'Erreur'; err.hidden = false; return; }
      NT.recharger();
      NT.ui.toast(t('ech.okAg', { id: d.id }) + (r.donnees.communes ? ' ' + t('ech.okCommun', { n: r.donnees.communes }) : ''), 'success');
      if (apres) apres();
      if (r.donnees.sansCompte) {
        const z = corps.querySelector('#rp-apres');
        if (z) z.innerHTML = `<p class="ligne"><a class="btn" href="mailto:${encodeURIComponent(r.donnees.sansCompte)}?subject=${encodeURIComponent('Terra Nova — ' + d.id)}&body=${encodeURIComponent(texte)}"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${e(t('ech.mailto'))}</a></p>`;
      }
      const h = corps.querySelector('#rp-t'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    });
  };

  /* ---------- Tableau de bord des agents (agent.html) ---------- */
  R.tableau = () => {
    const kpis = document.getElementById('kpis');
    if (!kpis || document.getElementById('rp-tableau')) return;
    const c = R.compteurs();
    const sec = document.createElement('section');
    sec.id = 'rp-tableau'; sec.setAttribute('aria-labelledby', 'rp-tab-h');
    sec.innerHTML = `<h2 id="rp-tab-h" class="rp-tab-h"><i class="ph-duotone ph-chats-circle" aria-hidden="true"></i> ${e(t('ech.panneau'))}</h2>
      <ul class="ag-kpis">
        <li><a class="kpi" href="agent-demandes.html?reponse=attente"><span class="valeur">${c.attente}</span><span class="libelle">${e(t('ech.kAttente'))}</span></a></li>
        <li><a class="kpi" href="agent-demandes.html?sans=3"><span class="valeur">${c.retard}</span><span class="libelle">${e(t('ech.kRetard', { n: 3 }))}</span></a></li>
        <li><a class="kpi" href="agent-demandes.html?reponse=repondu"><span class="valeur">${c.repondu}</span><span class="libelle">${e(t('ech.kRepondu'))}</span></a></li>
      </ul>`;
    kpis.closest('section').after(sec);
  };

  NT.pret(() => {
    if (document.body.dataset.page === 'agent' && NT.auth.aRole('agent', 'admin')) R.tableau();
  });
})();
