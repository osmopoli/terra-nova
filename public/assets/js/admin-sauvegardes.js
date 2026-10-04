/* Terra Nova — vague 17 (F87, DSI) : page « Sauvegardes » (administrateur).
   Créer une sauvegarde cohérente, voir les sauvegardes conservées (date, type, taille, documents, empreinte SHA-256, dernier test),
   tester la restauration (verdict en langage clair, étapes vérifiées, quoi faire), télécharger après confirmation du mot de passe
   (journal d'audit). Les fichiers restent hors de public/ : ils ne sont servis que par l'API, à l'administrateur. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'sv.verdictOk': 'Sauvegarde du {d} : complète et restaurable, {n} documents, {t}.', 'sv.verdictKo': 'Sauvegarde du {d} : à ne pas utiliser telle quelle ({n} problème(s)).', 'sv.okQuoi': 'Rien à faire. Conservez aussi la clé de chiffrement à part, en lieu sûr.', 'sv.c.empreinte': 'Ne pas utiliser ce fichier : créez une nouvelle sauvegarde et vérifiez l’espace disque et les droits du dossier.', 'sv.c.integrite': 'Fichier abîmé : utilisez une autre sauvegarde et créez-en une nouvelle tout de suite.', 'sv.c.schema': 'Sauvegarde incomplète ou trop ancienne : refaites une sauvegarde depuis la version en service.', 'sv.c.comptes': 'L’essentiel manque : ne pas restaurer, refaire une sauvegarde.', 'sv.c.documents': 'Des documents sont abîmés : comparez avec la sauvegarde précédente.', 'sv.c.chiffrement': 'Les données chiffrées ne se lisent pas avec la clé actuelle : retrouvez la clé utilisée à cette date et gardez-la avec les sauvegardes.', 'sv.c.ouverture': 'Fichier inutilisable : utilisez une autre sauvegarde.', 'sv.details': 'Détail technique', 'sv.surtitre': 'Direction des systèmes d’information', 'sv.titre': 'Sauvegardes', 'sv.sous': 'Vérifier que les données importantes peuvent être sauvegardées et restaurées : un verdict clair, pas des données brutes.',
      'sv.kDerniere': 'Dernière sauvegarde', 'sv.kProchaine': 'Prochaine sauvegarde automatique', 'sv.kConservees': 'Sauvegardes conservées', 'sv.kBase': 'Base en service', 'sv.aucune': 'Aucune',
      'sv.creer': 'Créer une sauvegarde maintenant', 'sv.creation': 'Sauvegarde en cours…', 'sv.creee': 'Sauvegarde créée : {n} documents, {t}.', 'sv.liste': 'Sauvegardes conservées',
      'sv.listeAide': 'Une sauvegarde automatique chaque jour ; les {n} dernières automatiques sont gardées. Dossier sur le serveur : {d} (jamais accessible depuis le site).',
      'sv.cDate': 'Date', 'sv.cType': 'Type', 'sv.cTaille': 'Taille', 'sv.cDocs': 'Documents', 'sv.cEmpreinte': 'Empreinte SHA-256', 'sv.cTest': 'Dernier test', 'sv.cActions': 'Actions',
      'sv.auto': 'Automatique', 'sv.manuel': 'Manuelle', 'sv.jamais': 'Pas encore testée', 'sv.restaurable': 'Restaurable', 'sv.probleme': 'Problème',
      'sv.tester': 'Tester la restauration', 'sv.test': 'Test en cours…', 'sv.telecharger': 'Télécharger', 'sv.vide': 'Aucune sauvegarde pour le moment : créez la première.',
      'sv.resultat': 'Résultat du test de restauration', 'sv.etapes': 'Ce qui a été vérifié', 'sv.quoi': 'Que faire', 'sv.ecarts': 'Comparaison avec la base en service', 'sv.cCol': 'Collection', 'sv.cSauv': 'Dans la sauvegarde', 'sv.cLive': 'En service',
      'sv.e.empreinte': 'Fichier intact', 'sv.e.integrite': 'Structure de la base', 'sv.e.schema': 'Tables et colonnes', 'sv.e.comptes': 'Contenu', 'sv.e.documents': 'Documents lisibles', 'sv.e.chiffrement': 'Données chiffrées', 'sv.e.ouverture': 'Ouverture',
      'sv.cle': 'La clé de chiffrement n’est jamais copiée dans les sauvegardes : conservez-la à part (DATA_ENCRYPTION_KEY ou fichier terranova.key), en lieu sûr.', 'sv.par': 'par {p}' },
    en: { 'sv.verdictOk': 'Backup of {d}: complete and restorable, {n} documents, {t}.', 'sv.verdictKo': 'Backup of {d}: do not use as is ({n} problem(s)).', 'sv.okQuoi': 'Nothing to do. Also keep the encryption key separately, somewhere safe.', 'sv.c.empreinte': 'Do not use this file: create a new backup and check disk space and folder permissions.', 'sv.c.integrite': 'Damaged file: use another backup and create a new one right away.', 'sv.c.schema': 'Incomplete or too old backup: back up again from the live version.', 'sv.c.comptes': 'Essential data is missing: do not restore, back up again.', 'sv.c.documents': 'Some documents are damaged: compare with the previous backup.', 'sv.c.chiffrement': 'Encrypted data cannot be read with the current key: find the key used at that date and keep it with the backups.', 'sv.c.ouverture': 'Unusable file: use another backup.', 'sv.details': 'Technical detail', 'sv.surtitre': 'IT department', 'sv.titre': 'Backups', 'sv.sous': 'Check that important data can be backed up and restored: a clear verdict, not raw data.',
      'sv.kDerniere': 'Last backup', 'sv.kProchaine': 'Next automatic backup', 'sv.kConservees': 'Backups kept', 'sv.kBase': 'Live database', 'sv.aucune': 'None',
      'sv.creer': 'Create a backup now', 'sv.creation': 'Backing up…', 'sv.creee': 'Backup created: {n} documents, {t}.', 'sv.liste': 'Backups kept',
      'sv.listeAide': 'One automatic backup every day; the last {n} automatic ones are kept. Folder on the server: {d} (never reachable from the website).',
      'sv.cDate': 'Date', 'sv.cType': 'Type', 'sv.cTaille': 'Size', 'sv.cDocs': 'Documents', 'sv.cEmpreinte': 'SHA-256 fingerprint', 'sv.cTest': 'Last test', 'sv.cActions': 'Actions',
      'sv.auto': 'Automatic', 'sv.manuel': 'Manual', 'sv.jamais': 'Not tested yet', 'sv.restaurable': 'Restorable', 'sv.probleme': 'Problem',
      'sv.tester': 'Test the restore', 'sv.test': 'Testing…', 'sv.telecharger': 'Download', 'sv.vide': 'No backup yet: create the first one.',
      'sv.resultat': 'Restore test result', 'sv.etapes': 'What was checked', 'sv.quoi': 'What to do', 'sv.ecarts': 'Comparison with the live database', 'sv.cCol': 'Collection', 'sv.cSauv': 'In the backup', 'sv.cLive': 'Live',
      'sv.e.empreinte': 'File intact', 'sv.e.integrite': 'Database structure', 'sv.e.schema': 'Tables and columns', 'sv.e.comptes': 'Content', 'sv.e.documents': 'Readable documents', 'sv.e.chiffrement': 'Encrypted data', 'sv.e.ouverture': 'Opening',
      'sv.cle': 'The encryption key is never copied into backups: keep it separately (DATA_ENCRYPTION_KEY or terranova.key file), somewhere safe.', 'sv.par': 'by {p}' },
    es: { 'sv.verdictOk': 'Copia del {d}: completa y restaurable, {n} documentos, {t}.', 'sv.verdictKo': 'Copia del {d}: no usar tal cual ({n} problema(s)).', 'sv.okQuoi': 'Nada que hacer. Guarde también la clave de cifrado aparte, en un lugar seguro.', 'sv.c.empreinte': 'No use este archivo: cree una nueva copia y compruebe el espacio en disco y los permisos de la carpeta.', 'sv.c.integrite': 'Archivo dañado: use otra copia y cree una nueva enseguida.', 'sv.c.schema': 'Copia incompleta o demasiado antigua: vuelva a hacer una copia desde la versión en servicio.', 'sv.c.comptes': 'Falta lo esencial: no restaurar, rehacer una copia.', 'sv.c.documents': 'Hay documentos dañados: compare con la copia anterior.', 'sv.c.chiffrement': 'Los datos cifrados no se leen con la clave actual: recupere la clave usada en esa fecha y guárdela con las copias.', 'sv.c.ouverture': 'Archivo inutilizable: use otra copia.', 'sv.details': 'Detalle técnico', 'sv.surtitre': 'Dirección de sistemas de información', 'sv.titre': 'Copias de seguridad', 'sv.sous': 'Comprobar que los datos importantes pueden guardarse y restaurarse: un veredicto claro, no datos en bruto.',
      'sv.kDerniere': 'Última copia', 'sv.kProchaine': 'Próxima copia automática', 'sv.kConservees': 'Copias conservadas', 'sv.kBase': 'Base en servicio', 'sv.aucune': 'Ninguna',
      'sv.creer': 'Crear una copia ahora', 'sv.creation': 'Copia en curso…', 'sv.creee': 'Copia creada: {n} documentos, {t}.', 'sv.liste': 'Copias conservadas',
      'sv.listeAide': 'Una copia automática cada día; se guardan las {n} últimas automáticas. Carpeta en el servidor: {d} (nunca accesible desde el sitio).',
      'sv.cDate': 'Fecha', 'sv.cType': 'Tipo', 'sv.cTaille': 'Tamaño', 'sv.cDocs': 'Documentos', 'sv.cEmpreinte': 'Huella SHA-256', 'sv.cTest': 'Última prueba', 'sv.cActions': 'Acciones',
      'sv.auto': 'Automática', 'sv.manuel': 'Manual', 'sv.jamais': 'Aún no probada', 'sv.restaurable': 'Restaurable', 'sv.probleme': 'Problema',
      'sv.tester': 'Probar la restauración', 'sv.test': 'Prueba en curso…', 'sv.telecharger': 'Descargar', 'sv.vide': 'Todavía no hay copias: cree la primera.',
      'sv.resultat': 'Resultado de la prueba de restauración', 'sv.etapes': 'Qué se ha comprobado', 'sv.quoi': 'Qué hacer', 'sv.ecarts': 'Comparación con la base en servicio', 'sv.cCol': 'Colección', 'sv.cSauv': 'En la copia', 'sv.cLive': 'En servicio',
      'sv.e.empreinte': 'Archivo intacto', 'sv.e.integrite': 'Estructura de la base', 'sv.e.schema': 'Tablas y columnas', 'sv.e.comptes': 'Contenido', 'sv.e.documents': 'Documentos legibles', 'sv.e.chiffrement': 'Datos cifrados', 'sv.e.ouverture': 'Apertura',
      'sv.cle': 'La clave de cifrado nunca se copia en las copias: guárdela aparte (DATA_ENCRYPTION_KEY o archivo terranova.key), en un lugar seguro.', 'sv.par': 'por {p}' },
    ar: { 'sv.verdictOk': 'نسخة {d}: كاملة وقابلة للاستعادة، {n} مستنداً، {t}.', 'sv.verdictKo': 'نسخة {d}: لا تُستخدم كما هي ({n} مشكلة).', 'sv.okQuoi': 'لا شيء يجب فعله. احتفظ أيضاً بمفتاح التشفير على حدة في مكان آمن.', 'sv.c.empreinte': 'لا تستخدم هذا الملف: أنشئ نسخة جديدة وتحقق من مساحة القرص وصلاحيات المجلد.', 'sv.c.integrite': 'ملف تالف: استخدم نسخة أخرى وأنشئ نسخة جديدة فوراً.', 'sv.c.schema': 'نسخة غير كاملة أو قديمة جداً: أعد النسخ من الإصدار العامل.', 'sv.c.comptes': 'البيانات الأساسية ناقصة: لا تستعد، وأعد النسخ.', 'sv.c.documents': 'بعض المستندات تالفة: قارن مع النسخة السابقة.', 'sv.c.chiffrement': 'لا يمكن قراءة البيانات المشفرة بالمفتاح الحالي: استرجع المفتاح المستخدم في ذلك التاريخ واحفظه مع النسخ.', 'sv.c.ouverture': 'ملف غير قابل للاستخدام: استخدم نسخة أخرى.', 'sv.details': 'تفاصيل تقنية', 'sv.surtitre': 'مديرية نظم المعلومات', 'sv.titre': 'النسخ الاحتياطية', 'sv.sous': 'التحقق من إمكانية نسخ البيانات المهمة واستعادتها: حكم واضح، لا بيانات خام.',
      'sv.kDerniere': 'آخر نسخة', 'sv.kProchaine': 'النسخة التلقائية القادمة', 'sv.kConservees': 'النسخ المحفوظة', 'sv.kBase': 'قاعدة البيانات العاملة', 'sv.aucune': 'لا شيء',
      'sv.creer': 'إنشاء نسخة احتياطية الآن', 'sv.creation': 'جارٍ النسخ…', 'sv.creee': 'تم إنشاء النسخة: {n} مستنداً، {t}.', 'sv.liste': 'النسخ المحفوظة',
      'sv.listeAide': 'نسخة تلقائية كل يوم؛ تُحفظ آخر {n} نسخ تلقائية. المجلد على الخادم: {d} (لا يمكن الوصول إليه من الموقع أبداً).',
      'sv.cDate': 'التاريخ', 'sv.cType': 'النوع', 'sv.cTaille': 'الحجم', 'sv.cDocs': 'المستندات', 'sv.cEmpreinte': 'البصمة SHA-256', 'sv.cTest': 'آخر اختبار', 'sv.cActions': 'إجراءات',
      'sv.auto': 'تلقائية', 'sv.manuel': 'يدوية', 'sv.jamais': 'لم تُختبر بعد', 'sv.restaurable': 'قابلة للاستعادة', 'sv.probleme': 'مشكلة',
      'sv.tester': 'اختبار الاستعادة', 'sv.test': 'جارٍ الاختبار…', 'sv.telecharger': 'تنزيل', 'sv.vide': 'لا توجد نسخة بعد: أنشئ الأولى.',
      'sv.resultat': 'نتيجة اختبار الاستعادة', 'sv.etapes': 'ما تم التحقق منه', 'sv.quoi': 'ما العمل', 'sv.ecarts': 'مقارنة مع القاعدة العاملة', 'sv.cCol': 'المجموعة', 'sv.cSauv': 'في النسخة', 'sv.cLive': 'في الخدمة',
      'sv.e.empreinte': 'الملف سليم', 'sv.e.integrite': 'بنية القاعدة', 'sv.e.schema': 'الجداول والأعمدة', 'sv.e.comptes': 'المحتوى', 'sv.e.documents': 'مستندات مقروءة', 'sv.e.chiffrement': 'البيانات المشفرة', 'sv.e.ouverture': 'الفتح',
      'sv.cle': 'لا يُنسخ مفتاح التشفير أبداً في النسخ الاحتياطية: احتفظ به على حدة (DATA_ENCRYPTION_KEY أو الملف terranova.key) في مكان آمن.', 'sv.par': 'بواسطة {p}' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const taille = (n) => (n == null ? '—' : n < 1048576 ? `${Math.round(n / 1024).toLocaleString(NT.i18n.langue)} Ko` : `${(n / 1048576).toLocaleString(NT.i18n.langue, { maximumFractionDigits: 1 })} Mo`);
  const dh = (iso) => (iso ? NT.ui.dateHeure(iso) : '—');
  const kpi = (v, lib) => `<div class="kpi"><div class="valeur" style="font-size:1.35rem">${E(v)}</div><div class="libelle">${E(lib)}</div></div>`;
  let donnees = null;

  function rendre() {
    const d = donnees; if (!d) return;
    const l = d.sauvegardes || [];
    document.getElementById('sv-kpis').innerHTML = kpi(l[0] ? dh(l[0].cree) : t('sv.aucune'), t('sv.kDerniere')) + kpi(dh(d.prochaineAuto), t('sv.kProchaine'))
      + kpi(l.length, t('sv.kConservees')) + kpi(`${taille(d.base.taille)} · ${(d.base.documents || 0).toLocaleString(NT.i18n.langue)} docs`, t('sv.kBase'));
    document.getElementById('sv-aide').textContent = t('sv.listeAide', { n: d.garder, d: d.dossier });
    document.getElementById('sv-lignes').innerHTML = l.length ? l.map((f) => {
      const test = f.dernierTest;
      return `<tr><td data-label="${E(t('sv.cDate'))}">${E(dh(f.cree))}${f.par ? `<br><span class="doux">${E(t('sv.par', { p: f.par }))}</span>` : ''}</td>
        <td data-label="${E(t('sv.cType'))}"><span class="sv-type">${E(t(f.type === 'auto' ? 'sv.auto' : 'sv.manuel'))}</span></td>
        <td data-label="${E(t('sv.cTaille'))}">${E(taille(f.taille || f.tailleActuelle))}</td><td data-label="${E(t('sv.cDocs'))}">${E((f.documents || 0).toLocaleString(NT.i18n.langue))}</td>
        <td data-label="${E(t('sv.cEmpreinte'))}"><span class="sv-empreinte" title="${E(f.sha256 || '')}">${E(f.sha256 ? f.sha256.slice(0, 16) + '…' : '—')}</span></td>
        <td data-label="${E(t('sv.cTest'))}">${test ? `<span class="${test.ok ? 'sv-test-ok' : 'sv-test-ko'}">${E(t(test.ok ? 'sv.restaurable' : 'sv.probleme'))}</span><br><span class="doux">${E(dh(test.date))}</span>` : `<span class="doux">${E(t('sv.jamais'))}</span>`}</td>
        <td data-label="${E(t('sv.cActions'))}"><div class="v17-boutons" style="margin:0"><button class="btn petit" type="button" data-sv="tester" data-nom="${E(f.fichier)}">${E(t('sv.tester'))}</button>
          <button class="btn petit" type="button" data-sv="telecharger" data-nom="${E(f.fichier)}"><i class="ph ph-download-simple" aria-hidden="true"></i>${E(t('sv.telecharger'))}</button></div></td></tr>`;
    }).join('') : `<tr><td colspan="7" class="doux">${E(t('sv.vide'))}</td></tr>`;
  }
  function charger() { const r = NT.api('GET', '/api/sauvegardes'); if (r.statut === 200) { donnees = r.donnees; rendre(); } }
  function resultat(r, nom) {
    const z = document.getElementById('sv-resultat');
    z.hidden = false;
    z.innerHTML = `<h2 id="sv-res-t">${E(t('sv.resultat'))}</h2>
      <div class="sv-verdict ${r.ok ? 'ok' : 'ko'}" role="status" tabindex="-1" id="sv-verdict"><i class="ph-duotone ${r.ok ? 'ph-check-circle' : 'ph-warning-octagon'}" aria-hidden="true"></i>
        <div><h3>${E(r.cree ? t(r.ok ? 'sv.verdictOk' : 'sv.verdictKo', { d: dh(r.cree), n: r.ok ? (r.documents || 0).toLocaleString(NT.i18n.langue) : r.problemes, t: taille(r.taille) }) : r.verdict)}</h3><p class="doux sv-empreinte" style="margin:.3rem 0 0">${E(nom)}</p></div></div>
      <div class="grille-2" style="margin-top:1rem"><div class="panneau"><h3>${E(t('sv.etapes'))}</h3><ul class="sv-etapes">${r.etapes.map((e) => `<li class="${e.ok ? '' : 'ko'}"><i class="ph-duotone ${e.ok ? 'ph-check-circle' : 'ph-x-circle'}" aria-hidden="true"></i>
        <span><strong>${E(t('sv.e.' + e.code))}</strong>${e.ok ? '' : `<small>${E(t('sv.c.' + e.code))}</small>`}<br><span class="doux" lang="fr">${E(e.detail)}</span></span></li>`).join('')}</ul></div>
        <div class="panneau"><h3>${E(t('sv.quoi'))}</h3><ul class="liste-sec">${(r.ok ? [t('sv.okQuoi')] : [...new Set(r.etapes.filter((e) => !e.ok).map((e) => t('sv.c.' + e.code)))]).map((q) => `<li><i class="ph-duotone ${r.ok ? 'ph-shield-check' : 'ph-wrench'}" aria-hidden="true"></i><span>${E(q)}</span></li>`).join('')}</ul></div></div>
      ${r.ecarts && r.ecarts.length ? `<details style="margin-top:1rem"><summary>${E(t('sv.ecarts'))}</summary><div class="table-defile"><table class="table-sec"><caption class="sr-only">${E(t('sv.ecarts'))}</caption>
        <thead><tr><th scope="col">${E(t('sv.cCol'))}</th><th scope="col">${E(t('sv.cSauv'))}</th><th scope="col">${E(t('sv.cLive'))}</th></tr></thead>
        <tbody>${r.ecarts.map((e) => `<tr><td>${E(e.collection)}</td><td>${E(e.sauvegarde)}</td><td>${E(e.enService)}</td></tr>`).join('')}</tbody></table></div></details>` : ''}`;
    document.getElementById('sv-verdict').focus();
  }
  function telecharger(nom) {
    const url = '/api/sauvegardes/' + encodeURIComponent(nom) + '/telecharger';
    // Vérifie d'abord si le serveur demande la confirmation du mot de passe (428), puis lance le téléchargement natif
    const r = NT.api('GET', url + '?verifier=1');
    if (r.statut === 428) { NT.reauth ? NT.reauth({ apres: () => telecharger(nom) }) : NT.ui.toast(r.donnees.erreur, 'warning'); return; }
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); return; }
    const a = document.createElement('a'); a.href = url; a.download = nom; document.body.append(a); a.click(); a.remove();
  }

  NT.pret(() => {
    if (!NT.auth.aRole('admin')) return;
    charger();
    document.getElementById('sv-creer').addEventListener('click', (e) => {
      const b = e.currentTarget; b.disabled = true; b.setAttribute('aria-busy', 'true');
      const lib = b.querySelector('span'); const avant = lib.textContent; lib.textContent = t('sv.creation');
      setTimeout(() => {
        const r = NT.api('POST', '/api/sauvegardes', {});
        b.disabled = false; b.removeAttribute('aria-busy'); lib.textContent = avant;
        if (r.statut === 200) { NT.ui.toast(t('sv.creee', { n: r.donnees.documents, t: taille(r.donnees.taille) }), 'success'); charger(); }
        else if (r.statut !== 428) NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger');
      }, 30);
    });
    document.getElementById('sv-lignes').addEventListener('click', (e) => {
      const b = e.target.closest('[data-sv]'); if (!b) return;
      const nom = b.dataset.nom;
      if (b.dataset.sv === 'telecharger') return telecharger(nom);
      b.disabled = true; const avant = b.textContent; b.textContent = t('sv.test');
      fetch('/api/sauvegardes/' + encodeURIComponent(nom) + '/tester', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        .then((x) => x.json().then((j) => ({ ok: x.ok, j })))
        .then(({ ok, j }) => { b.disabled = false; b.textContent = avant; if (ok) { resultat(j, nom); charger(); } else NT.ui.toast(j.erreur || NT.t('ui.erreur'), 'danger'); })
        .catch(() => { b.disabled = false; b.textContent = avant; });
    });
  });
})();
