/* Terra Nova — vague 19 : continuité hors connexion (F93), sobriété des mises à jour (F95), l'essentiel d'abord (F96).
   Chargé par store.js sur toutes les pages. Aucun bandeau : un indicateur calme dans le pied de page, une carte dans le tiroir
   « Alertes », une petite note en tête de page quand les informations viennent de la copie de l'appareil.
   - Indicateur « En ligne » / « Hors connexion · informations de HH:MM », la balise « Alertes » prend une teinte discrète.
   - Boîte d'envoi (IndexedDB) : une demande, un message ou une contribution envoyés sans connexion (ou pendant un incident
     du serveur) restent sur l'appareil avec leur clé d'idempotence (vague 16) et partent tout seuls au retour du réseau ;
     un renvoi ne crée jamais de doublon (même clé → même numéro). « En attente d'envoi (2) » : Réessayer / Annuler ;
     confirmation à l'écran de ce qui est parti (numéros NT-xxxx).
   - Paquet essentiel hors connexion : demandé au Service Worker (sw.js) au plus toutes les 10 minutes ; résumé personnel
     (« Mes demandes ») seulement pour l'habitant connecté, dans son navigateur, effacé à la déconnexion.
   - « Pouls » : une seule lecture légère (GET /api/pouls) toutes les 30 s au lieu de trois (messages officiels, notifications,
     veille), arrêtée quand l'onglet est caché, 304 quand rien n'a changé.
   - L'essentiel d'abord (html.essentiel-dabord, posé par store.js) : sections secondaires repliées derrière « Afficher plus »,
     longues listes raccourcies, carte affichée au toucher. */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || NT.boite) return;
  NT.i18n.ajouter({
    fr: { 'v19.enLigne': 'En ligne', 'v19.horsLigne': 'Hors connexion', 'v19.incident': 'Incident technique en cours', 'v19.donneesDe': 'informations du {d}', 'v19.essentiel': 'Infos essentielles',
      'v19.note': 'Hors connexion : vous voyez les informations enregistrées sur cet appareil le {d}.', 'v19.noteIncident': 'Le service en ligne est perturbé : vous voyez la copie de secours du {d}.',
      'v19.quoi': 'Ce qui fonctionne sans connexion', 'v19.ok1': 'Infos essentielles : alertes, consignes, numéros d’urgence, état des services, contacts utiles.', 'v19.ok2': 'Écrire une demande, un signalement ou un message : il part tout seul au retour du réseau, sans doublon.',
      'v19.ok3': 'Vos brouillons restent sur cet appareil.', 'v19.ok4': 'Vos demandes récentes (si vous étiez connecté sur cet appareil).', 'v19.ko': 'Ont besoin du réseau : connexion à votre compte, prise de rendez-vous, recherche et assistant d’orientation, horaires des navettes en direct, participation.',
      'v19.p.rdv': 'La prise de rendez-vous a besoin du réseau. Vos rendez-vous déjà pris figurent dans les infos essentielles.', 'v19.p.transports': 'Les horaires en direct ont besoin du réseau : les départs affichés peuvent être dépassés.',
      'v19.p.carte': 'La carte reste consultable ; les heures d’ouverture sont celles de la dernière mise à jour.', 'v19.p.participer': 'La participation (avis, idées) a besoin du réseau.', 'v19.p.recherche': 'La recherche a besoin du réseau. Les infos essentielles restent disponibles.',
      'v19.attente': 'En attente d’envoi ({n})', 'v19.boiteTitre': 'Envois en attente', 'v19.boiteIntro': 'Ces envois sont gardés sur cet appareil. Ils partent tout seuls dès que la connexion revient ; un renvoi ne crée jamais de doublon.',
      'v19.garde': 'gardé le {d}', 'v19.reessayer': 'Réessayer', 'v19.annuler': 'Annuler cet envoi', 'v19.toutEnvoyer': 'Tout envoyer maintenant', 'v19.fermer': 'Fermer', 'v19.vide': 'Aucun envoi en attente.',
      'v19.t.demande': 'Demande', 'v19.t.message': 'Message', 'v19.t.contribution': 'Contribution',
      'v19.e.attente': 'En attente du réseau', 'v19.e.envoi': 'Envoi en cours…', 'v19.e.verification': 'À renvoyer depuis la page (vérification demandée)', 'v19.e.connexion': 'Reconnectez-vous pour l’envoyer', 'v19.e.refuse': 'Refusé : {m}',
      'v19.mis': 'Pas de connexion : votre envoi est gardé sur cet appareil. Il partira tout seul dès le retour du réseau, sans doublon.', 'v19.voirAttente': 'Voir les envois en attente',
      'v19.parti': 'Connexion revenue : {n} envoi(s) parti(s){ids}.', 'v19.annule': 'Envoi annulé.', 'v19.deconnexion': '{n} envoi(s) en attente sera(ont) supprimé(s) de cet appareil si vous vous déconnectez maintenant. Se déconnecter quand même ?',
      'v19.plus': 'Afficher plus', 'v19.moins': 'Afficher moins', 'v19.plusN': 'Afficher les {n} autres', 'v19.carte': 'Afficher la carte', 'v19.carteAide': 'La liste des lieux est juste en dessous ; la carte s’affiche quand vous le demandez.',
      'v19.alerteTitre': 'Hors connexion', 'v19.alerteTexte': 'Les informations affichées sont celles enregistrées sur cet appareil. Les infos essentielles restent consultables ; vos envois partiront au retour du réseau.' },
    en: { 'v19.enLigne': 'Online', 'v19.horsLigne': 'Offline', 'v19.incident': 'Technical incident in progress', 'v19.donneesDe': 'information from {d}', 'v19.essentiel': 'Essential information',
      'v19.note': 'Offline: you are seeing the information saved on this device on {d}.', 'v19.noteIncident': 'The online service is disrupted: you are seeing the backup copy from {d}.',
      'v19.quoi': 'What works without a connection', 'v19.ok1': 'Essential information: alerts, instructions, emergency numbers, service status, useful contacts.', 'v19.ok2': 'Writing a request, a report or a message: it is sent automatically when the network is back, never twice.',
      'v19.ok3': 'Your drafts stay on this device.', 'v19.ok4': 'Your recent requests (if you were signed in on this device).', 'v19.ko': 'Need the network: signing in, booking appointments, search and guidance assistant, live shuttle times, participation.',
      'v19.p.rdv': 'Booking an appointment needs the network. Appointments already booked are listed in the essential information.', 'v19.p.transports': 'Live times need the network: the departures shown may be out of date.',
      'v19.p.carte': 'The map is still available; opening hours are from the last update.', 'v19.p.participer': 'Participation (opinions, ideas) needs the network.', 'v19.p.recherche': 'Search needs the network. The essential information remains available.',
      'v19.attente': 'Waiting to be sent ({n})', 'v19.boiteTitre': 'Waiting to be sent', 'v19.boiteIntro': 'These items are kept on this device. They are sent automatically when the connection is back; sending again never creates a duplicate.',
      'v19.garde': 'kept on {d}', 'v19.reessayer': 'Try again', 'v19.annuler': 'Cancel this item', 'v19.toutEnvoyer': 'Send all now', 'v19.fermer': 'Close', 'v19.vide': 'Nothing waiting to be sent.',
      'v19.t.demande': 'Request', 'v19.t.message': 'Message', 'v19.t.contribution': 'Contribution',
      'v19.e.attente': 'Waiting for the network', 'v19.e.envoi': 'Sending…', 'v19.e.verification': 'Send again from the page (check requested)', 'v19.e.connexion': 'Sign in again to send it', 'v19.e.refuse': 'Refused: {m}',
      'v19.mis': 'No connection: your item is kept on this device. It will be sent automatically when the network is back, never twice.', 'v19.voirAttente': 'See items waiting to be sent',
      'v19.parti': 'Connection is back: {n} item(s) sent{ids}.', 'v19.annule': 'Item cancelled.', 'v19.deconnexion': '{n} item(s) waiting to be sent will be deleted from this device if you sign out now. Sign out anyway?',
      'v19.plus': 'Show more', 'v19.moins': 'Show less', 'v19.plusN': 'Show the {n} others', 'v19.carte': 'Show the map', 'v19.carteAide': 'The list of places is just below; the map appears when you ask for it.',
      'v19.alerteTitre': 'Offline', 'v19.alerteTexte': 'The information shown is what was saved on this device. The essential information remains available; your items will be sent when the network is back.' },
    es: { 'v19.enLigne': 'En línea', 'v19.horsLigne': 'Sin conexión', 'v19.incident': 'Incidente técnico en curso', 'v19.donneesDe': 'información del {d}', 'v19.essentiel': 'Información esencial',
      'v19.note': 'Sin conexión: ve la información guardada en este dispositivo el {d}.', 'v19.noteIncident': 'El servicio en línea tiene incidencias: ve la copia de seguridad del {d}.',
      'v19.quoi': 'Lo que funciona sin conexión', 'v19.ok1': 'Información esencial: alertas, indicaciones, números de emergencia, estado de los servicios, contactos útiles.', 'v19.ok2': 'Escribir una solicitud, un aviso o un mensaje: sale solo cuando vuelve la red, sin duplicados.',
      'v19.ok3': 'Sus borradores se quedan en este dispositivo.', 'v19.ok4': 'Sus solicitudes recientes (si había iniciado sesión en este dispositivo).', 'v19.ko': 'Necesitan la red: iniciar sesión, pedir cita, búsqueda y asistente de orientación, horarios de lanzaderas en directo, participación.',
      'v19.p.rdv': 'Pedir cita necesita la red. Sus citas ya reservadas figuran en la información esencial.', 'v19.p.transports': 'Los horarios en directo necesitan la red: las salidas mostradas pueden estar desfasadas.',
      'v19.p.carte': 'El mapa sigue disponible; los horarios son los de la última actualización.', 'v19.p.participer': 'La participación (opiniones, ideas) necesita la red.', 'v19.p.recherche': 'La búsqueda necesita la red. La información esencial sigue disponible.',
      'v19.attente': 'Pendiente de envío ({n})', 'v19.boiteTitre': 'Envíos pendientes', 'v19.boiteIntro': 'Estos envíos se guardan en este dispositivo. Salen solos en cuanto vuelve la conexión; reenviar nunca crea un duplicado.',
      'v19.garde': 'guardado el {d}', 'v19.reessayer': 'Reintentar', 'v19.annuler': 'Cancelar este envío', 'v19.toutEnvoyer': 'Enviar todo ahora', 'v19.fermer': 'Cerrar', 'v19.vide': 'Ningún envío pendiente.',
      'v19.t.demande': 'Solicitud', 'v19.t.message': 'Mensaje', 'v19.t.contribution': 'Contribución',
      'v19.e.attente': 'Esperando la red', 'v19.e.envoi': 'Enviando…', 'v19.e.verification': 'Reenviar desde la página (comprobación pedida)', 'v19.e.connexion': 'Vuelva a iniciar sesión para enviarlo', 'v19.e.refuse': 'Rechazado: {m}',
      'v19.mis': 'Sin conexión: su envío se guarda en este dispositivo. Saldrá solo en cuanto vuelva la red, sin duplicados.', 'v19.voirAttente': 'Ver los envíos pendientes',
      'v19.parti': 'Conexión recuperada: {n} envío(s) enviado(s){ids}.', 'v19.annule': 'Envío cancelado.', 'v19.deconnexion': 'Si cierra sesión ahora, se borrará(n) {n} envío(s) pendiente(s) de este dispositivo. ¿Cerrar sesión de todos modos?',
      'v19.plus': 'Mostrar más', 'v19.moins': 'Mostrar menos', 'v19.plusN': 'Mostrar los {n} restantes', 'v19.carte': 'Mostrar el mapa', 'v19.carteAide': 'La lista de lugares está justo debajo; el mapa aparece cuando lo pide.',
      'v19.alerteTitre': 'Sin conexión', 'v19.alerteTexte': 'La información mostrada es la guardada en este dispositivo. La información esencial sigue disponible; sus envíos saldrán cuando vuelva la red.' },
    ar: { 'v19.enLigne': 'متصل', 'v19.horsLigne': 'غير متصل', 'v19.incident': 'عطل تقني جارٍ', 'v19.donneesDe': 'معلومات {d}', 'v19.essentiel': 'معلومات أساسية',
      'v19.note': 'غير متصل: تعرض المعلومات المحفوظة على هذا الجهاز بتاريخ {d}.', 'v19.noteIncident': 'الخدمة الإلكترونية مضطربة: تعرض النسخة الاحتياطية بتاريخ {d}.',
      'v19.quoi': 'ما يعمل دون اتصال', 'v19.ok1': 'المعلومات الأساسية: التنبيهات والتعليمات وأرقام الطوارئ وحالة الخدمات وجهات الاتصال.', 'v19.ok2': 'كتابة طلب أو بلاغ أو رسالة: يُرسل تلقائياً عند عودة الشبكة، دون تكرار.',
      'v19.ok3': 'تبقى مسوداتك على هذا الجهاز.', 'v19.ok4': 'طلباتك الأخيرة (إذا كنت متصلاً بحسابك على هذا الجهاز).', 'v19.ko': 'تحتاج إلى الشبكة: تسجيل الدخول، حجز المواعيد، البحث ومساعد التوجيه، مواعيد الحافلات المباشرة، المشاركة.',
      'v19.p.rdv': 'حجز موعد يحتاج إلى الشبكة. مواعيدك المحجوزة موجودة في المعلومات الأساسية.', 'v19.p.transports': 'المواعيد المباشرة تحتاج إلى الشبكة: قد تكون الانطلاقات المعروضة قديمة.',
      'v19.p.carte': 'تبقى الخريطة متاحة؛ أوقات الفتح هي أوقات آخر تحديث.', 'v19.p.participer': 'المشاركة (الآراء، الأفكار) تحتاج إلى الشبكة.', 'v19.p.recherche': 'البحث يحتاج إلى الشبكة. تبقى المعلومات الأساسية متاحة.',
      'v19.attente': 'في انتظار الإرسال ({n})', 'v19.boiteTitre': 'عناصر في انتظار الإرسال', 'v19.boiteIntro': 'هذه العناصر محفوظة على هذا الجهاز. تُرسل تلقائياً فور عودة الاتصال؛ إعادة الإرسال لا تنشئ نسخة مكررة أبداً.',
      'v19.garde': 'محفوظ بتاريخ {d}', 'v19.reessayer': 'إعادة المحاولة', 'v19.annuler': 'إلغاء هذا الإرسال', 'v19.toutEnvoyer': 'إرسال الكل الآن', 'v19.fermer': 'إغلاق', 'v19.vide': 'لا يوجد ما ينتظر الإرسال.',
      'v19.t.demande': 'طلب', 'v19.t.message': 'رسالة', 'v19.t.contribution': 'مساهمة',
      'v19.e.attente': 'في انتظار الشبكة', 'v19.e.envoi': 'جارٍ الإرسال…', 'v19.e.verification': 'أعد الإرسال من الصفحة (طُلب تحقق)', 'v19.e.connexion': 'سجّل الدخول من جديد لإرساله', 'v19.e.refuse': 'مرفوض: {m}',
      'v19.mis': 'لا يوجد اتصال: إرسالك محفوظ على هذا الجهاز. سيُرسل تلقائياً فور عودة الشبكة، دون تكرار.', 'v19.voirAttente': 'عرض العناصر في انتظار الإرسال',
      'v19.parti': 'عاد الاتصال: أُرسل {n} عنصر{ids}.', 'v19.annule': 'أُلغي الإرسال.', 'v19.deconnexion': 'سيُحذف {n} عنصر في انتظار الإرسال من هذا الجهاز إذا سجلت الخروج الآن. تسجيل الخروج رغم ذلك؟',
      'v19.plus': 'عرض المزيد', 'v19.moins': 'عرض أقل', 'v19.plusN': 'عرض الـ {n} الباقية', 'v19.carte': 'عرض الخريطة', 'v19.carteAide': 'قائمة الأماكن أدناه مباشرة؛ تظهر الخريطة عندما تطلبها.',
      'v19.alerteTitre': 'غير متصل', 'v19.alerteTexte': 'المعلومات المعروضة هي المحفوظة على هذا الجهاز. تبقى المعلومات الأساسية متاحة؛ ستُرسل عناصرك عند عودة الشبكة.' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lire = (k, d) => NT.store.lire(k, d), ecrire = (k, v) => NT.store.ecrire(k, v);
  const moi = () => { try { return NT.auth.utilisateur(); } catch (e) { return null; } };
  const quand = iso => { try { return new Date(iso).toLocaleString({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };
  const pret = fn => NT.pret(fn);

  /* ====================== Boîte d'envoi (F93) ====================== */
  const ELIGIBLES = [[/^\/api\/docs\/demandes$/, 'demande'], [/^\/api\/demandes\/[^/]+\/messages$/, 'message'], [/^\/api\/contributions$/, 'contribution']];
  const GARDER = ['Idempotency-Key', 'X-TN-Jeton', 'X-TN-Signaux', 'X-TN-Confirmer', 'Content-Type'];
  let file = [];          // éléments en mémoire (copie de l'IndexedDB)
  let base = null;        // Promise<IDBDatabase>
  let dernierForm = null;
  document.addEventListener('submit', ev => { if (ev.target && ev.target.tagName === 'FORM') dernierForm = { f: ev.target, t: Date.now() }; }, true);
  function ouvrirBase() {
    if (base) return base;
    base = new Promise((ok, ko) => {
      try {
        const r = indexedDB.open('terra-nova', 1);
        r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('boite')) r.result.createObjectStore('boite', { keyPath: 'cle' }); };
        r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
      } catch (e) { ko(e); }
    });
    return base;
  }
  const tx = (mode, fn) => ouvrirBase().then(db => new Promise((ok, ko) => { const x = db.transaction('boite', mode); const s = x.objectStore('boite'); const r = fn(s); x.oncomplete = () => ok(r && r.result); x.onerror = () => ko(x.error); })).catch(() => null);
  const sauver = el => tx('readwrite', s => s.put(el));
  const retirer = cle => tx('readwrite', s => s.delete(cle));
  function charger() {
    return tx('readonly', s => s.getAll()).then(l => { if (Array.isArray(l)) { const vus = new Set(file.map(x => x.cle)); file = file.concat(l.filter(x => !vus.has(x.cle))); } rendreBoite(); return file; });
  }
  const miens = () => { const u = moi(); return file.filter(x => (x.userId || null) === (u ? u.id : null)); };
  const typeDe = url => { let p = url; try { p = new URL(url, location.href).pathname; } catch (e) { /* relatif */ } const r = ELIGIBLES.find(([re]) => re.test(p)); return r ? r[1] : null; };

  // Appelé par store.js (api) quand une écriture ne peut pas partir : renvoie une réponse « 202 en attente » ou null
  function intercepter(req) {
    const type = typeDe(req.url);
    if (!type || req.methode !== 'POST') return null;
    const ent = {};
    GARDER.forEach(k => { const v = req.entetes[k] || req.entetes[k.toLowerCase()]; if (v) ent[k] = v; });
    if (!ent['Idempotency-Key']) ent['Idempotency-Key'] = 'boite.' + Date.now().toString(36) + '.' + Math.random().toString(36).slice(2, 10);
    const c = req.corps || {};
    const u = moi();
    const f = dernierForm && Date.now() - dernierForm.t < 8000 && document.contains(dernierForm.f) ? dernierForm.f : null;
    const el = { cle: ent['Idempotency-Key'], type, methode: 'POST', url: req.url, corps: c, entetes: ent, userId: u ? u.id : null, cree: new Date().toISOString(),
      libelle: String(c.objet || c.sujet || c.message || '').slice(0, 90), page: location.pathname + location.search, etat: 'attente', essais: 0,
      brouillon: f && f.querySelector('textarea') ? 'brouillon:' + location.pathname + location.search + '#' + (f.id || 'form' + [...document.forms].indexOf(f)) : '' };
    file = file.filter(x => x.cle !== el.cle).concat(el);   // même clé (même contenu renvoyé) : remplacé, jamais en double
    sauver(el);
    if (NT.formulaires) NT.formulaires.pris = true;   // la page n'affiche pas « L'envoi a échoué » : la note ci-dessous explique
    setTimeout(() => { noteFormulaire(f); rendreBoite(); }, 0);
    return { statut: 202, donnees: { enAttente: true, cle: el.cle, erreur: t('v19.mis') } };
  }
  function noteFormulaire(f) {
    const cible = f || (document.activeElement && document.activeElement.closest && document.activeElement.closest('form'));
    if (!cible) { NT.ui && NT.ui.toast(t('v19.mis'), 'primary', 9000); return; }
    cible.querySelectorAll('.reessai-note').forEach(n => n.remove());
    let n = cible.querySelector('.v19-note-boite');
    if (!n) { n = document.createElement('div'); n.className = 'v19-note-boite'; n.setAttribute('role', 'status'); cible.append(n); }
    n.innerHTML = `<i class="ph ph-tray-arrow-up" aria-hidden="true"></i><p>${E(t('v19.mis'))}</p><button type="button" class="lien-bouton" data-v19-boite>${E(t('v19.voirAttente'))}</button>`;
    NT.ui && NT.ui.annoncer(t('v19.mis'));
  }

  // Envoi d'un élément : mêmes en-têtes (clé d'idempotence comprise). Vérification anti-robots demandée → nouveau jeton puis un essai.
  const attendre = ms => new Promise(r => setTimeout(r, ms));
  function poster(el, entetes) {
    return fetch(el.url, { method: 'POST', credentials: 'same-origin', headers: entetes, body: JSON.stringify(el.corps) })
      .then(r => r.text().then(x => { let d = null; try { d = x ? JSON.parse(x) : null; } catch (e) { /* non JSON */ } return { statut: r.status, d }; }))
      .catch(() => ({ statut: 0, d: null }));
  }
  async function envoyer(el) {
    el.etat = 'envoi'; rendreBoite();
    let r = await poster(el, el.entetes);
    if (r.statut === 428 && r.d && r.d.verification) {
      const nom = String(el.entetes['X-TN-Jeton'] || '').split('.')[1] || 'page';
      const j = await fetch('/api/formulaires/jeton?f=' + encodeURIComponent(nom), { cache: 'no-store', credentials: 'same-origin' }).then(x => (x.ok ? x.json() : null)).catch(() => null);
      if (j && j.jeton) { await attendre(3300); el.entetes = Object.assign({}, el.entetes, { 'X-TN-Jeton': j.jeton }); if (!el.entetes['X-TN-Signaux']) el.entetes['X-TN-Signaux'] = 'k=1;p=1;i=1;f=1;c=0;a=0;cl=1;d=5000'; r = await poster(el, el.entetes); }
    }
    el.essais++;
    if (r.statut >= 200 && r.statut < 300) return fini(el, (r.d && (r.d.id || (r.d.demande && r.d.demande.id))) || '');
    if (r.statut === 409 && r.d && r.d.doublon) return fini(el, r.d.doublon.id);   // déjà reçu par le serveur : rien n'est créé deux fois
    if (r.statut === 0 || r.statut >= 500 || r.statut === 429) { el.etat = 'attente'; sauver(el); rendreBoite(); return null; }
    el.etat = r.statut === 401 ? 'connexion' : r.statut === 428 ? 'verification' : 'refuse';
    el.message = (r.d && r.d.erreur) || '';
    sauver(el); rendreBoite();
    return null;
  }
  function fini(el, id) {
    file = file.filter(x => x.cle !== el.cle); retirer(el.cle);
    if (el.brouillon) { try { localStorage.removeItem('nt:' + el.brouillon); } catch (e) { /* stockage bloqué */ } }
    document.querySelectorAll('.v19-note-boite').forEach(n => n.remove());
    rendreBoite();
    return { el, id: id || '' };
  }
  let enCours = false;
  async function synchroniser(forcer) {
    if (enCours || (!forcer && navigator.onLine === false)) return;
    const l = miens().filter(x => forcer || x.etat === 'attente');
    if (!l.length) return;
    enCours = true;
    const partis = [];
    try { for (const el of l) { const r = await envoyer(el); if (r) partis.push(r); else if (el.etat === 'attente') break; } }
    finally { enCours = false; }
    if (partis.length) {
      const ids = partis.map(p => p.id).filter(Boolean);
      const msg = t('v19.parti', { n: partis.length, ids: ids.length ? ' : ' + ids.join(', ') : '' });
      NT.ui.toast(msg, 'success', 10000);
      try { NT.recharger(); if (NT.ui.rafraichirAlertes) NT.ui.rafraichirAlertes(); } catch (e) { /* page sans état */ }
    }
  }

  /* ---------- Fenêtre « Envois en attente » (dialog natif : fonctionne aussi sans le CDN) ---------- */
  let dlg = null;
  function ouvrirBoite() {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'tn-dialogue v19-boite'; dlg.setAttribute('aria-labelledby', 'v19-boite-h');
      document.body.append(dlg);
      dlg.addEventListener('click', ev => {
        const b = ev.target.closest('[data-v19]'); if (!b) return;
        const el = file.find(x => x.cle === b.dataset.cle);
        if (b.dataset.v19 === 'fermer') dlg.close();
        else if (b.dataset.v19 === 'tout') synchroniser(true);
        else if (el && b.dataset.v19 === 'essai') { el.etat = 'attente'; synchroniser(true); }
        else if (el && b.dataset.v19 === 'annuler') { fini(el); NT.ui.annoncer(t('v19.annule')); }
      });
    }
    dessinerBoite();
    if (!dlg.open) dlg.showModal();
  }
  function dessinerBoite() {
    if (!dlg) return;
    const l = miens();
    dlg.innerHTML = `<div class="tn-dlg-form"><h2 id="v19-boite-h"><i class="ph-duotone ph-tray-arrow-up" aria-hidden="true"></i> ${E(t('v19.boiteTitre'))}</h2>
      <p>${E(t('v19.boiteIntro'))}</p>
      ${l.length ? `<ul class="v19-liste">${l.map(x => `<li><strong>${E(t('v19.t.' + x.type))}</strong>${x.libelle ? ' — ' + E(x.libelle) : ''}<br><span class="doux">${E(t('v19.garde', { d: quand(x.cree) }))} · ${E(x.etat === 'refuse' ? t('v19.e.refuse', { m: x.message || '' }) : t('v19.e.' + x.etat))}</span>
        <span class="ligne"><button type="button" class="btn petit" data-v19="essai" data-cle="${E(x.cle)}"${x.etat === 'envoi' ? ' disabled' : ''}><i class="ph ph-arrow-clockwise" aria-hidden="true"></i>${E(t('v19.reessayer'))}</button>
        <button type="button" class="lien-bouton" data-v19="annuler" data-cle="${E(x.cle)}">${E(t('v19.annuler'))}</button>${x.etat === 'verification' ? ` <a href="${E(x.page)}">${E(x.page)}</a>` : ''}</span></li>`).join('')}</ul>` : `<p class="doux">${E(t('v19.vide'))}</p>`}
      <details class="v19-quoi"><summary>${E(t('v19.quoi'))}</summary>${quoiHtml()}</details>
      <div class="ligne">${l.length ? `<button type="button" class="btn btn-primaire" data-v19="tout"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${E(t('v19.toutEnvoyer'))}</button>` : ''}<button type="button" class="btn" data-v19="fermer">${E(t('v19.fermer'))}</button></div></div>`;
  }
  const quoiHtml = () => `<ul class="v19-ok">${['ok1', 'ok2', 'ok3', 'ok4'].map(k => `<li><i class="ph ph-check" aria-hidden="true"></i>${E(t('v19.' + k))}</li>`).join('')}</ul><p class="doux">${E(t('v19.ko'))}</p><p><a href="/essentiel?lang=${E(NT.i18n.langue)}"><i class="ph ph-first-aid-kit" aria-hidden="true"></i> ${E(t('v19.essentiel'))}</a></p>`;
  document.addEventListener('click', ev => { if (ev.target.closest && ev.target.closest('[data-v19-boite]')) { ev.preventDefault(); ouvrirBoite(); } });

  NT.boite = {
    intercepter, synchroniser, ouvrir: ouvrirBoite, liste: () => miens().slice(),
    viderPersonnel() {
      try { localStorage.removeItem('nt:essMoi'); } catch (e) { /* stockage bloqué */ }
      try { const sw = navigator.serviceWorker && navigator.serviceWorker.controller; if (sw) sw.postMessage({ type: 'deconnexion' }); } catch (e) { /* sans Service Worker */ }
      const u = moi(); if (!u) return; file.filter(x => x.userId === u.id).forEach(x => retirer(x.cle)); file = file.filter(x => x.userId !== u.id); },
    avantDeconnexion() { const n = miens().length; return !n || window.confirm(t('v19.deconnexion', { n })); }
  };

  /* ====================== Indicateur en ligne / hors connexion (F93) ====================== */
  const C = NT.charge;
  const horsLigne = () => navigator.onLine === false || !!NT.horsLigne || (C && C.injoignable >= 2);
  let indic = null;
  function rendreBoite() {
    if (!indic) return;
    const n = miens().length;
    const hl = horsLigne(), inc = NT.horsLigne && NT.horsLigne.incident;
    const depuis = NT.horsLigne && NT.horsLigne.depuis;
    indic.dataset.etat = hl ? 'hors-ligne' : 'en-ligne';
    indic.innerHTML = `<span class="v19-point" aria-hidden="true"></span><span>${E(hl ? (inc ? t('v19.incident') : t('v19.horsLigne')) : t('v19.enLigne'))}${hl && depuis ? ' · ' + E(t('v19.donneesDe', { d: quand(depuis) })) : ''}</span>`
      + (hl ? ` <a href="/essentiel?lang=${E(NT.i18n.langue)}">${E(t('v19.essentiel'))}</a>` : '')
      + (n ? ` <button type="button" class="lien-bouton v19-attente" data-v19-boite><i class="ph ph-tray-arrow-up" aria-hidden="true"></i>${E(t('v19.attente', { n }))}</button>` : '');
    const balise = document.getElementById('nt-balise');
    if (balise) balise.classList.toggle('hors-ligne', hl);
    if (dlg && dlg.open) dessinerBoite();
    noteEnTete();
  }
  // Petite note en tête du contenu quand les données viennent de la copie de l'appareil (pas un bandeau : dans la page, une fois)
  const PAGES_RESEAU = { rdv: 'rdv', transports: 'transports', carte: 'carte', participer: 'participer', recherche: 'recherche', soutenir: 'participer' };
  function noteEnTete() {
    const main = document.getElementById('contenu');
    const existe = document.getElementById('v19-note');
    if (!main || !NT.horsLigne) { if (existe && !horsLigne()) existe.remove(); return; }
    if (existe) return;
    const p = document.createElement('div');
    p.id = 'v19-note'; p.className = 'v19-note'; p.setAttribute('role', 'status'); p.setAttribute('data-lc-non', ''); p.setAttribute('data-no-glossaire', '');
    const page = PAGES_RESEAU[document.body.dataset.page];
    p.innerHTML = `<p><i class="ph ph-wifi-slash" aria-hidden="true"></i> ${E(t(NT.horsLigne.incident ? 'v19.noteIncident' : 'v19.note', { d: quand(NT.horsLigne.depuis || new Date().toISOString()) }))}${page ? ' ' + E(t('v19.p.' + page)) : ''}</p>
      <details><summary>${E(t('v19.quoi'))}</summary>${quoiHtml()}</details>`;
    main.prepend(p);
  }
  function installerIndicateur() {
    const pied = document.querySelector('.pied .conteneur');
    if (!pied || indic) return;
    indic = document.createElement('p');
    indic.className = 'pied-reseau'; indic.setAttribute('aria-live', 'polite');
    pied.append(indic);
    rendreBoite();
    // la carte « Hors connexion » du tiroir des alertes (resilience.js) est complétée par l'explication de ce qui marche
    const rendre = NT.ui.rafraichirAlertes;
    NT.ui.rafraichirAlertes = () => {
      if (rendre) rendre();
      const tiroir = NT.ui.tiroirAlertes;
      if (!tiroir || !horsLigne() || tiroir.querySelector('.v19-quoi-tiroir')) return;
      tiroir.insertAdjacentHTML('afterbegin', `<article class="alerte-fiche niveau-charge v19-quoi-tiroir"><h3><i class="ph-duotone ph-wifi-slash" aria-hidden="true"></i>${E(t('v19.quoi'))}</h3>${quoiHtml()}</article>`);
    };
    NT.ui.rafraichirAlertes();
  }
  window.addEventListener('online', () => { rendreBoite(); setTimeout(() => synchroniser(), 1500); });
  window.addEventListener('offline', rendreBoite);
  if (C && C.surChangement) C.surChangement(() => { rendreBoite(); if (!C.echecs && !C.injoignable) synchroniser(); });
  setInterval(() => { if (miens().some(x => x.etat === 'attente') && navigator.onLine !== false && !document.hidden) synchroniser(); }, 30000);

  /* ====================== Paquet essentiel dans le Service Worker (F93) ====================== */
  function demanderPaquet() {
    if (!('serviceWorker' in navigator) || navigator.onLine === false || NT.horsLigne) return;
    const u = moi();
    const cle = 'paquet:' + NT.i18n.langue + ':' + (u ? u.id : '');
    const dernier = lire('paquetDemande', {});
    if (dernier.cle === cle && Date.now() - dernier.t < 10 * 60e3) return;
    // le Service Worker vient parfois d'être installé (première visite) : on attend qu'il soit actif
    Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(() => r(null), 15000))]).then(reg => {
      if (!reg || !reg.active) return;
      ecrire('paquetDemande', { cle, t: Date.now() });
      reg.active.postMessage({ type: 'paquet', langue: NT.i18n.langue, personnel: !!u });
    }).catch(() => {});
  }

  /* ====================== Pouls : une lecture groupée (F95) ====================== */
  const ecoutes = {};
  let dernier = null, minuterie = null, lancee = false;
  const pouls = NT.pouls = {
    ecouter(cle, fn) { (ecoutes[cle] = ecoutes[cle] || []).push(fn); if (dernier && dernier[cle] !== undefined && dernier[cle] !== null) fn(dernier[cle], true); },
    lire: lirePouls
  };
  function lirePouls() {
    if (document.hidden) return Promise.resolve();
    return fetch('/api/pouls', { cache: 'no-store', credentials: 'same-origin' }).then(r => (r.ok ? r.json().then(j => ({ j, inchange: r.headers.get('X-Non-Modifie') === '1' })) : null)).then(x => {
      if (!x) return;
      dernier = x.j;
      if (x.inchange && lancee) return;
      lancee = true;
      Object.keys(ecoutes).forEach(k => { if (x.j[k] !== undefined && x.j[k] !== null) ecoutes[k].forEach(fn => { try { fn(x.j[k], false); } catch (e) { /* écouteur fautif */ } }); });
    }).catch(() => {});
  }
  const rythme = () => (NT.leger.actif() ? 120000 : NT.econome.delai(30000));
  const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { lirePouls().finally(planifier); }, rythme()); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(minuterie); else { lirePouls(); planifier(); } });

  /* ====================== L'essentiel d'abord (F96) ====================== */
  function essentielDabord() {
    if (!NT.essentiel || !NT.essentiel.actif()) return;
    document.querySelectorAll('[data-secondaire]').forEach((s, i) => {
      if (s.querySelector(':scope > .v19-plus')) return;
      if (!s.id) s.id = 'v19-sec-' + i;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'v19-plus'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', s.id);
      b.innerHTML = `<i class="ph ph-caret-down" aria-hidden="true"></i><span>${E(t('v19.plus'))}</span>`;
      b.addEventListener('click', () => {
        const ouvert = s.classList.toggle('deplie');
        b.setAttribute('aria-expanded', String(ouvert));
        b.innerHTML = `<i class="ph ${ouvert ? 'ph-caret-up' : 'ph-caret-down'}" aria-hidden="true"></i><span>${E(t(ouvert ? 'v19.moins' : 'v19.plus'))}</span>`;
        if (ouvert) window.dispatchEvent(new Event('resize'));
      });
      s.append(b);
      s.classList.add('v19-pret');
      // section remplie plus tard par son script (ex. associations) : le bouton est remis à la fin
      new MutationObserver(() => { if (!s.contains(b) || s.lastElementChild !== b) s.append(b); }).observe(s, { childList: true });
    });
    // longues listes : les N premiers éléments, puis « Afficher les X autres »
    document.querySelectorAll('[data-liste-longue]').forEach(l => {
      const max = Number(l.dataset.listeLongue) || 5;
      const maj = () => {
        const n = l.children.length - max;
        let b = l.nextElementSibling && l.nextElementSibling.classList.contains('v19-plus-liste') ? l.nextElementSibling : null;
        if (n <= 0 || l.classList.contains('deplie')) { if (b) b.remove(); return; }
        if (!b) {
          b = document.createElement('button'); b.type = 'button'; b.className = 'v19-plus v19-plus-liste';
          b.addEventListener('click', () => { l.classList.add('deplie'); b.remove(); const x = l.children[max]; if (x) { x.setAttribute('tabindex', '-1'); x.focus(); } });
          l.after(b);
        }
        b.innerHTML = `<i class="ph ph-list-plus" aria-hidden="true"></i><span>${E(t('v19.plusN', { n }))}</span>`;
      };
      maj();
      new MutationObserver(maj).observe(l, { childList: true });
    });
    // carte : affichée seulement au toucher (la liste des lieux reste en premier)
    const plan = document.querySelector('.cm-colonne-carte');
    if (plan && !plan.querySelector('.v19-carte')) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn v19-carte';
      b.innerHTML = `<i class="ph ph-map-trifold" aria-hidden="true"></i><span>${E(t('v19.carte'))}</span>`;
      b.title = t('v19.carteAide');
      b.addEventListener('click', () => { plan.classList.add('carte-ouverte'); b.remove(); window.dispatchEvent(new Event('resize')); const d = plan.querySelector('.cm-defile'); if (d) d.focus(); });
      const cadre = plan.querySelector('.cm-cadre');
      (cadre || plan).append(b);
      plan.classList.add('v19-pret');
    }
  }

  /* ====================== Démarrage ====================== */
  pret(() => {
    const u = moi();
    if (u && !NT.horsLigne) ecrire('essMoi', u.id); else if (!u && !NT.horsLigne) { try { localStorage.removeItem('nt:essMoi'); } catch (e) { /* stockage bloqué */ } }
    installerIndicateur();
    essentielDabord();
    charger().then(() => { if (miens().some(x => x.etat === 'attente') && !NT.horsLigne) setTimeout(() => synchroniser(), 2000); });
    if (!NT.horsLigne) { lirePouls(); planifier(); }
    const paquet = () => setTimeout(demanderPaquet, 2500);
    if (document.readyState === 'complete') paquet(); else window.addEventListener('load', paquet);
  });
})();
