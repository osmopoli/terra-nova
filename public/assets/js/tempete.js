/* Terra Nova — vague 22 (F104, Centre d'alerte spatiale) : tempête solaire, côté habitant.
   Chargé sur toutes les pages par ui.js. Dès qu'une alerte « Tempête solaire » est vue (chargement ou « pouls » de 30 s) :
   - le navigateur demande tout de suite au Service Worker de rafraîchir le paquet essentiel (/essentiel, /simple, alertes,
     messages officiels, numéros d'urgence : message « paquet » urgent, sw.js) et affiche « Infos essentielles enregistrées sur
     cet appareil — disponibles même sans réseau » avec l'heure (une fois par alerte et par mise à jour) ;
   - le compte à rebours « Perturbations attendues dans 12 min » avance chaque seconde (aucune requête) ;
   - la liste « Se préparer » (cases à cocher) est gardée sur l'appareil ; la première case se coche seule quand le paquet est enregistré ;
   - hors connexion, l'indicateur du pied de page (continuite.js) explique que la coupure vient de la tempête (NT.tempete.active()). */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || NT.tempete) return;
  NT.i18n.ajouter({
    fr: { 'tp.enregistre': 'Infos essentielles enregistrées sur cet appareil — disponibles même sans réseau ({h})', 'tp.enregistrement': 'Enregistrement des infos essentielles sur cet appareil…',
      'tp.horsLigne': 'Réseau coupé par la tempête solaire : vos infos essentielles restent lisibles sur cet appareil.', 'tp.impossible': 'Enregistrement impossible sur ce navigateur : notez les numéros d’urgence sur papier.' },
    en: { 'tp.enregistre': 'Essential information saved on this device — available even without a network ({h})', 'tp.enregistrement': 'Saving the essential information on this device…',
      'tp.horsLigne': 'Network cut by the solar storm: your essential information stays readable on this device.', 'tp.impossible': 'Cannot save on this browser: write the emergency numbers on paper.' },
    es: { 'tp.enregistre': 'Información esencial guardada en este dispositivo — disponible incluso sin red ({h})', 'tp.enregistrement': 'Guardando la información esencial en este dispositivo…',
      'tp.horsLigne': 'Red cortada por la tormenta solar: su información esencial sigue legible en este dispositivo.', 'tp.impossible': 'No se puede guardar en este navegador: anote los números de emergencia en papel.' },
    ar: { 'tp.enregistre': 'المعلومات الأساسية محفوظة على هذا الجهاز — متاحة حتى دون شبكة ({h})', 'tp.enregistrement': 'جارٍ حفظ المعلومات الأساسية على هذا الجهاز…',
      'tp.horsLigne': 'انقطعت الشبكة بسبب العاصفة الشمسية: معلوماتك الأساسية تبقى مقروءة على هذا الجهاز.', 'tp.impossible': 'تعذر الحفظ على هذا المتصفح: اكتب أرقام الطوارئ على ورق.' }
  });
  const t = NT.t, E = s => NT.ui.echap(s == null ? '' : String(s));
  const lire = (k, d) => { try { const v = JSON.parse(localStorage.getItem('nt:' + k)); return v == null ? d : v; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem('nt:' + k, JSON.stringify(v)); } catch (e) { /* stockage bloqué */ } };
  const heure = ms => new Date(ms).toLocaleTimeString(NT.i18n.langue === 'ar' ? 'ar' : NT.i18n.langue, { hour: '2-digit', minute: '2-digit' });
  let enCours = null, echec = false;

  const paquet = () => lire('tempetePaquet', {});   // { id, maj, t } : dernier enregistrement réussi
  function paquetHtml(id) {
    const p = paquet();
    if (p.id === id && p.t) return `<i class="ph-duotone ph-check-circle" aria-hidden="true"></i><span>${E(t('tp.enregistre', { h: heure(p.t) }))}</span>`;
    if (enCours === id) return `<i class="ph ph-download-simple" aria-hidden="true"></i><span>${E(t('tp.enregistrement'))}</span>`;
    if (echec) return `<i class="ph ph-warning" aria-hidden="true"></i><span>${E(t('tp.impossible'))}</span>`;
    return '';
  }
  const coches = id => { const l = lire('tempeteCoches:' + id, []); const p = paquet(); return p.id === id && p.t && !l.includes(1) ? l.concat(1) : l; };
  function majVue(id) {
    document.querySelectorAll('[data-tp-paquet="' + CSS.escape(id) + '"]').forEach(el => { el.innerHTML = paquetHtml(id); el.classList.toggle('ok', paquet().id === id); });
    const c = coches(id);
    document.querySelectorAll('[data-tp-case="' + CSS.escape(id) + '"]').forEach(i => { i.checked = c.includes(Number(i.value)); });
    document.querySelectorAll('[data-tp-fait="' + CSS.escape(id) + '"]').forEach(el => { el.textContent = t('tp.fait', { n: c.length, t: 6 }); });
  }

  // Paquet essentiel rafraîchi tout de suite par le Service Worker (réponse « paquet-ok »)
  function enregistrer(m, force) {
    const id = m.id, maj = m.crise.majLe;
    const p = paquet();
    if (!force && p.id === id && p.maj === maj) return;
    if (enCours || navigator.onLine === false || NT.horsLigne) return;
    if (!('serviceWorker' in navigator)) { echec = true; majVue(id); return; }
    enCours = id; echec = false; majVue(id);
    const fini = ok => {
      enCours = null;
      if (ok) { ecrire('tempetePaquet', { id, maj, t: Date.now() }); NT.ui.annoncer(t('tp.enregistre', { h: heure(Date.now()) })); if (force) NT.ui.toast(t('tp.enregistre', { h: heure(Date.now()) }), 'success', 5000); }
      else echec = true;
      majVue(id);
    };
    const minuterie = setTimeout(() => { navigator.serviceWorker.removeEventListener('message', ecoute); fini(false); }, 25000);
    function ecoute(ev) {
      const d = ev.data || {};
      if (d.type !== 'paquet-ok' || d.id !== id) return;
      clearTimeout(minuterie); navigator.serviceWorker.removeEventListener('message', ecoute); fini(d.ok !== false);
    }
    navigator.serviceWorker.addEventListener('message', ecoute);
    Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(() => r(null), 15000))]).then(reg => {
      if (!reg || !reg.active) { clearTimeout(minuterie); navigator.serviceWorker.removeEventListener('message', ecoute); fini(false); return; }
      const u = NT.auth && NT.auth.utilisateur && NT.auth.utilisateur();
      reg.active.postMessage({ type: 'paquet', urgent: true, id, langue: NT.i18n.langue, personnel: !!(u && u.role === 'citoyen') });
    }).catch(() => fini(false));
  }

  function verifier(messages) {
    const m = (messages || []).find(x => x.crise && x.crise.type === 'tempete-solaire' && x.crise.statut === 'en-cours');
    if (!m) { if (navigator.onLine !== false && !NT.horsLigne) { try { localStorage.removeItem('nt:tempeteActive'); } catch (e) { /* stockage bloqué */ } } return; }
    ecrire('tempeteActive', { id: m.id, perturbations: m.crise.perturbations, fin: m.crise.retablissement });
    setTimeout(() => enregistrer(m, false), 300);
  }
  // Alerte gardée sur l'appareil : hors connexion, l'indicateur l'explique (jusqu'à 2 h après la fin prévue)
  function active() { const a = lire('tempeteActive', null); return !!(a && a.fin && Date.parse(a.fin) + 2 * 3600e3 > Date.now()); }

  document.addEventListener('change', e => {
    const i = e.target.closest && e.target.closest('[data-tp-case]');
    if (!i) return;
    const id = i.dataset.tpCase, l = coches(id).filter(n => n !== Number(i.value));
    if (i.checked) l.push(Number(i.value));
    ecrire('tempeteCoches:' + id, l); majVue(id);
  });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-tp-enregistrer]');
    if (!b) return;
    const m = NT.officiel && NT.officiel.messages().find(x => x.id === b.dataset.tpEnregistrer);
    if (m) enregistrer(m, true);
  });
  // Compte à rebours : chaque seconde, texte seulement (onglet caché : en pause)
  setInterval(() => {
    if (document.hidden || !NT.officielTempete) return;
    document.querySelectorAll('[data-tp-compte]').forEach(el => { const v = NT.officielTempete.compte(el.dataset.tpCompte); if (el.textContent !== v) el.textContent = v; });
  }, 1000);

  NT.tempete = { verifier, coches, paquetHtml, active, enregistrer, enregistre: (id) => { const p = paquet(); return p.id === id && !!p.t; } };
  // officiel.js peut avoir déjà reçu les messages avant ce script
  if (NT.officiel) { verifier(NT.officiel.messages()); if (NT.officiel.rendre) NT.officiel.rendre(); }
})();
