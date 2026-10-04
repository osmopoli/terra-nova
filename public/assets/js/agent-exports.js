/* Terra Nova — vague 17 (F88, Service Qualité) : page « Exports » des agents.
   Jeu de données → colonnes (libellés clairs) → filtres → aperçu des premières lignes → fichier CSV (Excel en français :
   « ; », UTF-8 avec BOM), JSON ou tableau imprimable. Données personnelles pseudonymisées par défaut ; export nominatif
   réservé aux agents habilités (F70), après confirmation du mot de passe. Modèles enregistrés et historique des exports.
   Le serveur contrôle les rôles, applique la pseudonymisation et journalise chaque export. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ex.surtitre': 'Service Qualité · transmissions entre services', 'ex.titre': 'Exports des données de suivi', 'ex.sous': 'Choisissez les informations utiles et récupérez-les dans un format simple et réutilisable. Les données personnelles sont réduites par défaut.',
      'ex.e1': '1. Données à exporter', 'ex.e2': '2. Colonnes', 'ex.e3': '3. Filtres', 'ex.e4': '4. Données personnelles', 'ex.e5': '5. Format du fichier',
      'ex.conseillees': 'Colonnes conseillées', 'ex.toutes': 'Tout cocher', 'ex.aucune': 'Tout décocher', 'ex.perso': 'donnée personnelle',
      'ex.periode': 'Période', 'ex.p.7j': '7 derniers jours', 'ex.p.30j': '30 derniers jours', 'ex.p.mois': 'Ce mois-ci', 'ex.p.dates': 'Entre deux dates', 'ex.p.tout': 'Tout',
      'ex.du': 'Du', 'ex.au': 'Au', 'ex.service': 'Service', 'ex.quartier': 'Quartier', 'ex.statut': 'Statut', 'ex.priorite': 'Priorité', 'ex.tous': 'Tous',
      'ex.n.critique': 'Critique', 'ex.n.haute': 'Haute', 'ex.n.normale': 'Normale', 'ex.n.basse': 'Basse',
      'ex.pseudo': 'Pseudonymiser les habitants (recommandé)', 'ex.pseudoAide': 'Les noms deviennent « Habitant-3F9A2C » (le même habitant garde le même pseudonyme), les e-mails et téléphones sont retirés et masqués dans les textes.',
      'ex.nonHabilite': 'Export nominatif réservé aux agents habilités aux données réservées : la pseudonymisation reste active.', 'ex.nominatif': 'Export nominatif : votre mot de passe sera redemandé et l’export inscrit au journal.',
      'ex.f.csv': 'CSV pour Excel (français)', 'ex.f.csvAide': 'Séparateur « ; », accents conservés (UTF-8 avec BOM).', 'ex.f.json': 'JSON', 'ex.f.jsonAide': 'Pour un autre logiciel.', 'ex.f.tableau': 'Tableau imprimable', 'ex.f.tableauAide': 'Page HTML à ouvrir, imprimer ou coller dans un tableur.',
      'ex.apercu': 'Aperçu', 'ex.apercuTitre': 'Aperçu : {n} premières lignes sur {t}', 'ex.apercuVide': 'Aucune ligne ne correspond à ces filtres.', 'ex.telecharger': 'Télécharger le fichier', 'ex.telecharge': 'Fichier « {f} » téléchargé ({n} lignes).',
      'ex.enregistrer': 'Enregistrer comme modèle', 'ex.nomModele': 'Nom du modèle', 'ex.nomModeleEx': 'Exemple : Transmission hebdo au Service Qualité', 'ex.modeleOk': 'Modèle « {n} » enregistré.',
      'ex.modeles': 'Modèles enregistrés', 'ex.modelesVide': 'Aucun modèle pour le moment.', 'ex.utiliser': 'Utiliser', 'ex.supprimer': 'Supprimer', 'ex.modeleCharge': 'Modèle « {n} » chargé : vérifiez l’aperçu puis téléchargez.', 'ex.supprime': 'Modèle supprimé.',
      'ex.historique': 'Historique des exports', 'ex.histVide': 'Aucun export pour le moment.', 'ex.hDate': 'Date', 'ex.hPar': 'Par', 'ex.hJeu': 'Données', 'ex.hLignes': 'Lignes', 'ex.hFormat': 'Format', 'ex.hPseudo': 'Pseudonymisé', 'ex.oui': 'Oui', 'ex.non': 'Non (nominatif)',
      'ex.colonnesMin': 'Choisissez au moins une colonne.', 'ex.par': 'par {p}', 'ex.cols': '{n} colonne(s)' },
    en: { 'ex.surtitre': 'Quality department · transfers between services', 'ex.titre': 'Follow-up data exports', 'ex.sous': 'Choose the useful information and get it in a simple, reusable format. Personal data is minimised by default.',
      'ex.e1': '1. Data to export', 'ex.e2': '2. Columns', 'ex.e3': '3. Filters', 'ex.e4': '4. Personal data', 'ex.e5': '5. File format',
      'ex.conseillees': 'Recommended columns', 'ex.toutes': 'Select all', 'ex.aucune': 'Clear all', 'ex.perso': 'personal data',
      'ex.periode': 'Period', 'ex.p.7j': 'Last 7 days', 'ex.p.30j': 'Last 30 days', 'ex.p.mois': 'This month', 'ex.p.dates': 'Between two dates', 'ex.p.tout': 'All',
      'ex.du': 'From', 'ex.au': 'To', 'ex.service': 'Service', 'ex.quartier': 'District', 'ex.statut': 'Status', 'ex.priorite': 'Priority', 'ex.tous': 'All',
      'ex.n.critique': 'Critical', 'ex.n.haute': 'High', 'ex.n.normale': 'Normal', 'ex.n.basse': 'Low',
      'ex.pseudo': 'Pseudonymise residents (recommended)', 'ex.pseudoAide': 'Names become “Habitant-3F9A2C” (the same resident keeps the same pseudonym), e-mails and phone numbers are removed and masked in texts.',
      'ex.nonHabilite': 'Named exports are reserved for staff authorised for reserved data: pseudonymisation stays on.', 'ex.nominatif': 'Named export: your password will be asked again and the export written to the log.',
      'ex.f.csv': 'CSV for Excel (French)', 'ex.f.csvAide': '“;” separator, accents kept (UTF-8 with BOM).', 'ex.f.json': 'JSON', 'ex.f.jsonAide': 'For another software.', 'ex.f.tableau': 'Printable table', 'ex.f.tableauAide': 'HTML page to open, print or paste into a spreadsheet.',
      'ex.apercu': 'Preview', 'ex.apercuTitre': 'Preview: first {n} rows out of {t}', 'ex.apercuVide': 'No row matches these filters.', 'ex.telecharger': 'Download the file', 'ex.telecharge': 'File “{f}” downloaded ({n} rows).',
      'ex.enregistrer': 'Save as a template', 'ex.nomModele': 'Template name', 'ex.nomModeleEx': 'Example: Weekly transfer to the Quality department', 'ex.modeleOk': 'Template “{n}” saved.',
      'ex.modeles': 'Saved templates', 'ex.modelesVide': 'No template yet.', 'ex.utiliser': 'Use', 'ex.supprimer': 'Delete', 'ex.modeleCharge': 'Template “{n}” loaded: check the preview then download.', 'ex.supprime': 'Template deleted.',
      'ex.historique': 'Export history', 'ex.histVide': 'No export yet.', 'ex.hDate': 'Date', 'ex.hPar': 'By', 'ex.hJeu': 'Data', 'ex.hLignes': 'Rows', 'ex.hFormat': 'Format', 'ex.hPseudo': 'Pseudonymised', 'ex.oui': 'Yes', 'ex.non': 'No (named)',
      'ex.colonnesMin': 'Choose at least one column.', 'ex.par': 'by {p}', 'ex.cols': '{n} column(s)' },
    es: { 'ex.surtitre': 'Servicio de Calidad · transmisiones entre servicios', 'ex.titre': 'Exportaciones de datos de seguimiento', 'ex.sous': 'Elija la información útil y obténgala en un formato simple y reutilizable. Los datos personales se reducen por defecto.',
      'ex.e1': '1. Datos a exportar', 'ex.e2': '2. Columnas', 'ex.e3': '3. Filtros', 'ex.e4': '4. Datos personales', 'ex.e5': '5. Formato del archivo',
      'ex.conseillees': 'Columnas recomendadas', 'ex.toutes': 'Marcar todo', 'ex.aucune': 'Desmarcar todo', 'ex.perso': 'dato personal',
      'ex.periode': 'Periodo', 'ex.p.7j': 'Últimos 7 días', 'ex.p.30j': 'Últimos 30 días', 'ex.p.mois': 'Este mes', 'ex.p.dates': 'Entre dos fechas', 'ex.p.tout': 'Todo',
      'ex.du': 'Desde', 'ex.au': 'Hasta', 'ex.service': 'Servicio', 'ex.quartier': 'Barrio', 'ex.statut': 'Estado', 'ex.priorite': 'Prioridad', 'ex.tous': 'Todos',
      'ex.n.critique': 'Crítica', 'ex.n.haute': 'Alta', 'ex.n.normale': 'Normal', 'ex.n.basse': 'Baja',
      'ex.pseudo': 'Seudonimizar a los habitantes (recomendado)', 'ex.pseudoAide': 'Los nombres pasan a «Habitant-3F9A2C» (el mismo habitante conserva el mismo seudónimo); correos y teléfonos se eliminan y se ocultan en los textos.',
      'ex.nonHabilite': 'La exportación nominativa está reservada a los agentes habilitados para datos reservados: la seudonimización sigue activa.', 'ex.nominatif': 'Exportación nominativa: se le pedirá de nuevo la contraseña y la exportación quedará en el registro.',
      'ex.f.csv': 'CSV para Excel (francés)', 'ex.f.csvAide': 'Separador «;», acentos conservados (UTF-8 con BOM).', 'ex.f.json': 'JSON', 'ex.f.jsonAide': 'Para otro programa.', 'ex.f.tableau': 'Tabla imprimible', 'ex.f.tableauAide': 'Página HTML para abrir, imprimir o pegar en una hoja de cálculo.',
      'ex.apercu': 'Vista previa', 'ex.apercuTitre': 'Vista previa: {n} primeras filas de {t}', 'ex.apercuVide': 'Ninguna fila coincide con estos filtros.', 'ex.telecharger': 'Descargar el archivo', 'ex.telecharge': 'Archivo «{f}» descargado ({n} filas).',
      'ex.enregistrer': 'Guardar como modelo', 'ex.nomModele': 'Nombre del modelo', 'ex.nomModeleEx': 'Ejemplo: Transmisión semanal al Servicio de Calidad', 'ex.modeleOk': 'Modelo «{n}» guardado.',
      'ex.modeles': 'Modelos guardados', 'ex.modelesVide': 'Todavía no hay modelos.', 'ex.utiliser': 'Usar', 'ex.supprimer': 'Eliminar', 'ex.modeleCharge': 'Modelo «{n}» cargado: revise la vista previa y descargue.', 'ex.supprime': 'Modelo eliminado.',
      'ex.historique': 'Historial de exportaciones', 'ex.histVide': 'Todavía no hay exportaciones.', 'ex.hDate': 'Fecha', 'ex.hPar': 'Por', 'ex.hJeu': 'Datos', 'ex.hLignes': 'Filas', 'ex.hFormat': 'Formato', 'ex.hPseudo': 'Seudonimizado', 'ex.oui': 'Sí', 'ex.non': 'No (nominativo)',
      'ex.colonnesMin': 'Elija al menos una columna.', 'ex.par': 'por {p}', 'ex.cols': '{n} columna(s)' },
    ar: { 'ex.surtitre': 'مصلحة الجودة · الإحالات بين المصالح', 'ex.titre': 'تصدير بيانات المتابعة', 'ex.sous': 'اختر المعلومات المفيدة واحصل عليها بصيغة بسيطة وقابلة لإعادة الاستخدام. تُقلَّص البيانات الشخصية افتراضياً.',
      'ex.e1': '1. البيانات المراد تصديرها', 'ex.e2': '2. الأعمدة', 'ex.e3': '3. عوامل التصفية', 'ex.e4': '4. البيانات الشخصية', 'ex.e5': '5. صيغة الملف',
      'ex.conseillees': 'الأعمدة المقترحة', 'ex.toutes': 'تحديد الكل', 'ex.aucune': 'إلغاء تحديد الكل', 'ex.perso': 'بيانات شخصية',
      'ex.periode': 'الفترة', 'ex.p.7j': 'آخر 7 أيام', 'ex.p.30j': 'آخر 30 يوماً', 'ex.p.mois': 'هذا الشهر', 'ex.p.dates': 'بين تاريخين', 'ex.p.tout': 'الكل',
      'ex.du': 'من', 'ex.au': 'إلى', 'ex.service': 'الخدمة', 'ex.quartier': 'الحي', 'ex.statut': 'الحالة', 'ex.priorite': 'الأولوية', 'ex.tous': 'الكل',
      'ex.n.critique': 'حرجة', 'ex.n.haute': 'عالية', 'ex.n.normale': 'عادية', 'ex.n.basse': 'منخفضة',
      'ex.pseudo': 'إخفاء هوية السكان (موصى به)', 'ex.pseudoAide': 'تصبح الأسماء «Habitant-3F9A2C» (يحتفظ الساكن نفسه بالاسم المستعار نفسه)، وتُحذف عناوين البريد والهواتف وتُخفى في النصوص.',
      'ex.nonHabilite': 'التصدير بالأسماء مخصص للموظفين المؤهلين للبيانات المحجوزة: يبقى إخفاء الهوية مفعّلاً.', 'ex.nominatif': 'تصدير بالأسماء: ستُطلب كلمة المرور مجدداً ويُسجَّل التصدير في السجل.',
      'ex.f.csv': 'CSV لبرنامج Excel (بالفرنسية)', 'ex.f.csvAide': 'الفاصل «;»، مع الحفاظ على الحروف (UTF-8 مع BOM).', 'ex.f.json': 'JSON', 'ex.f.jsonAide': 'لبرنامج آخر.', 'ex.f.tableau': 'جدول قابل للطباعة', 'ex.f.tableauAide': 'صفحة HTML للفتح أو الطباعة أو اللصق في جدول بيانات.',
      'ex.apercu': 'معاينة', 'ex.apercuTitre': 'معاينة: أول {n} أسطر من أصل {t}', 'ex.apercuVide': 'لا يوجد سطر مطابق لعوامل التصفية هذه.', 'ex.telecharger': 'تنزيل الملف', 'ex.telecharge': 'تم تنزيل الملف «{f}» ({n} سطراً).',
      'ex.enregistrer': 'حفظ كنموذج', 'ex.nomModele': 'اسم النموذج', 'ex.nomModeleEx': 'مثال: إحالة أسبوعية إلى مصلحة الجودة', 'ex.modeleOk': 'تم حفظ النموذج «{n}».',
      'ex.modeles': 'النماذج المحفوظة', 'ex.modelesVide': 'لا يوجد نموذج بعد.', 'ex.utiliser': 'استخدام', 'ex.supprimer': 'حذف', 'ex.modeleCharge': 'تم تحميل النموذج «{n}»: تحقق من المعاينة ثم نزّل الملف.', 'ex.supprime': 'تم حذف النموذج.',
      'ex.historique': 'سجل عمليات التصدير', 'ex.histVide': 'لا توجد عملية تصدير بعد.', 'ex.hDate': 'التاريخ', 'ex.hPar': 'بواسطة', 'ex.hJeu': 'البيانات', 'ex.hLignes': 'الأسطر', 'ex.hFormat': 'الصيغة', 'ex.hPseudo': 'بهوية مخفية', 'ex.oui': 'نعم', 'ex.non': 'لا (بالأسماء)',
      'ex.colonnesMin': 'اختر عموداً واحداً على الأقل.', 'ex.par': 'بواسطة {p}', 'ex.cols': '{n} عمود(أعمدة)' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const L = (o) => (o && typeof o === 'object' ? o[NT.i18n.langue] || o.fr : o || '');
  const el = (id) => document.getElementById(id);
  let defs = null, jeu = null, minuterie = null;

  function jeuDe(cle) { return defs.jeux.find((j) => j.cle === cle) || defs.jeux[0]; }
  function rendreJeux() {
    el('ex-jeux').innerHTML = defs.jeux.map((j) => `<label class="ex-choix"><input type="radio" name="ex-jeu" value="${E(j.cle)}" ${j.cle === jeu.cle ? 'checked' : ''}><span>${E(L(j.libelle))}</span></label>`).join('');
  }
  function rendreColonnes(cochees) {
    const c = new Set(cochees || jeu.defaut);
    el('ex-colonnes').innerHTML = jeu.colonnes.map((x) => `<label class="ex-choix"><input type="checkbox" name="ex-col" value="${E(x.cle)}" ${c.has(x.cle) ? 'checked' : ''}><span>${E(L(x.libelle))}</span>${x.perso ? `<span class="ex-perso">${E(t('ex.perso'))}</span>` : ''}</label>`).join('');
  }
  function rendreFiltres(f) {
    f = f || {};
    const opt = (v, lib, sel) => `<option value="${E(v)}" ${sel === v ? 'selected' : ''}>${E(lib)}</option>`;
    el('ex-periode').innerHTML = ['7j', '30j', 'mois', 'dates', 'tout'].map((p) => opt(p, t('ex.p.' + p), f.periode || '30j')).join('');
    el('ex-du').value = f.du || ''; el('ex-au').value = f.au || '';
    el('ex-service').innerHTML = opt('', t('ex.tous'), f.service || '') + defs.services.map((s) => opt(s.id, L(s.nom), f.service || '')).join('');
    el('ex-quartier').innerHTML = opt('', t('ex.tous'), f.quartier || '') + defs.quartiers.map((q) => opt(q, q, f.quartier || '')).join('');
    el('ex-statut').innerHTML = opt('', t('ex.tous'), f.statut || '') + jeu.statuts.map((s) => opt(s, defs.statutsLibelles[s] || s, f.statut || '')).join('');
    el('ex-statut-champ').hidden = !jeu.statuts.length;
    el('ex-priorite').innerHTML = opt('', t('ex.tous'), f.priorite || '') + defs.niveaux.map((n) => opt(n, t('ex.n.' + n), f.priorite || '')).join('');
    el('ex-priorite-champ').hidden = !jeu.priorite;
    majDates();
  }
  const majDates = () => { const d = el('ex-periode').value === 'dates'; el('ex-du-champ').hidden = !d; el('ex-au-champ').hidden = !d; };
  function parametres() {
    return { jeu: jeu.cle, colonnes: [...document.querySelectorAll('input[name=ex-col]:checked')].map((c) => c.value),
      filtres: { periode: el('ex-periode').value, du: el('ex-du').value, au: el('ex-au').value, service: el('ex-service').value, quartier: el('ex-quartier').value,
        statut: jeu.statuts.length ? el('ex-statut').value : '', priorite: jeu.priorite ? el('ex-priorite').value : '' },
      pseudonymiser: el('ex-pseudo').checked, format: (document.querySelector('input[name=ex-format]:checked') || {}).value || 'csv', langue: NT.i18n.langue };
  }
  function apercu() {
    const p = parametres();
    const z = el('ex-apercu');
    el('ex-nominatif').hidden = p.pseudonymiser;
    if (!p.colonnes.length) { z.innerHTML = `<p class="doux">${E(t('ex.colonnesMin'))}</p>`; return; }
    const r = NT.api('POST', '/api/exports/apercu', p);
    if (r.statut !== 200) { z.innerHTML = `<p class="doux">${E((r.donnees && r.donnees.erreur) || 'Erreur')}</p>`; return; }
    const d = r.donnees;
    z.innerHTML = d.total ? `<div class="table-defile"><table class="table-sec"><caption>${E(t('ex.apercuTitre', { n: d.lignes.length, t: d.total }))}</caption>
      <thead><tr>${d.colonnes.map((c) => `<th scope="col">${E(c.libelle)}</th>`).join('')}</tr></thead>
      <tbody>${d.lignes.map((l) => `<tr>${l.map((v) => `<td>${E(v.length > 90 ? v.slice(0, 88) + '…' : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<p class="doux">${E(t('ex.apercuVide'))}</p>`;
    el('ex-annonce').textContent = d.total ? t('ex.apercuTitre', { n: d.lignes.length, t: d.total }) : t('ex.apercuVide');
  }
  const apercuBientot = () => { clearTimeout(minuterie); minuterie = setTimeout(apercu, 350); };

  function telecharger(modele) {
    const p = Object.assign(parametres(), { modele: modele || '' });
    if (!p.colonnes.length) { NT.ui.toast(t('ex.colonnesMin'), 'warning'); return; }
    const b = el('ex-telecharger'); b.disabled = true; b.setAttribute('aria-busy', 'true');
    fetch('/api/exports/fichier', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      .then((r) => {
        b.disabled = false; b.removeAttribute('aria-busy');
        if (r.status === 428) { NT.reauth({ apres: () => telecharger(modele) }); return null; }
        if (!r.ok) return r.json().then((j) => { NT.ui.toast(j.erreur || 'Erreur', 'danger'); return null; });
        const nom = ((r.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/) || [])[1] || 'export.csv';
        const lignes = r.headers.get('X-Lignes') || '';
        return r.blob().then((blob) => {
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom; document.body.append(a); a.click();
          setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
          NT.ui.toast(t('ex.telecharge', { f: nom, n: lignes }), 'success');
          historique();
        });
      }).catch(() => { b.disabled = false; b.removeAttribute('aria-busy'); });
  }
  let modeleCourant = '';
  function modeles() {
    const r = NT.api('GET', '/api/exports/modeles');
    const l = r.statut === 200 ? r.donnees : [];
    const moi = NT.auth.utilisateur();
    el('ex-modeles').innerHTML = l.length ? l.map((m) => `<li><strong>${E(m.nom)}</strong><span class="doux">${E(L((defs.jeux.find((j) => j.cle === m.jeu) || {}).libelle))} · ${E(t('ex.cols', { n: m.colonnes.length }))} · ${E(t('ex.p.' + ((m.filtres || {}).periode || 'tout')))} · ${E(String(m.format).toUpperCase())}${m.auteur ? ' · ' + E(t('ex.par', { p: m.auteur })) : ''}</span>
      <div class="actions"><button class="btn petit" type="button" data-ex="utiliser" data-id="${E(m.id)}">${E(t('ex.utiliser'))}</button>${m.auteurId === moi.id || moi.role === 'admin' ? `<button class="btn btn-danger petit" type="button" data-ex="supprimer" data-id="${E(m.id)}">${E(t('ex.supprimer'))}</button>` : ''}</div></li>`).join('')
      : `<li class="doux">${E(t('ex.modelesVide'))}</li>`;
    el('ex-modeles').dataset.liste = JSON.stringify(l);
  }
  function historique() {
    const r = NT.api('GET', '/api/exports/historique');
    const l = r.statut === 200 ? r.donnees : [];
    el('ex-historique').innerHTML = l.length ? l.slice(0, 20).map((h) => `<tr><td data-label="${E(t('ex.hDate'))}">${E(NT.ui.dateHeure(h.date))}</td><td data-label="${E(t('ex.hPar'))}">${E(h.par)}</td>
      <td data-label="${E(t('ex.hJeu'))}">${E(L((defs.jeux.find((j) => j.cle === h.jeu) || {}).libelle))}${h.modele ? `<br><span class="doux">${E(h.modele)}</span>` : ''}</td><td data-label="${E(t('ex.hLignes'))}">${E(h.lignes)}</td>
      <td data-label="${E(t('ex.hFormat'))}">${E(String(h.format).toUpperCase())}</td><td data-label="${E(t('ex.hPseudo'))}">${E(t(h.pseudonymise ? 'ex.oui' : 'ex.non'))}</td></tr>`).join('')
      : `<tr><td colspan="6" class="doux">${E(t('ex.histVide'))}</td></tr>`;
  }
  function appliquerModele(m) {
    jeu = jeuDe(m.jeu); modeleCourant = m.nom;
    rendreJeux(); rendreColonnes(m.colonnes); rendreFiltres(m.filtres);
    const f = document.querySelector(`input[name=ex-format][value="${m.format}"]`); if (f) f.checked = true;
    el('ex-pseudo').checked = m.pseudonymiser !== false || !defs.habilite;
    apercu();
    NT.ui.toast(t('ex.modeleCharge', { n: m.nom }), 'primary');
  }

  NT.pret(() => {
    if (!NT.auth.aRole('agent') && !NT.auth.aRole('admin')) return;
    const r = NT.api('GET', '/api/exports/definitions');
    if (r.statut !== 200) return;
    defs = r.donnees;
    jeu = defs.jeux[0];
    rendreJeux(); rendreColonnes(); rendreFiltres({ periode: '30j' });
    el('ex-pseudo').disabled = !defs.habilite;
    el('ex-pseudo-aide').textContent = t('ex.pseudoAide') + (defs.habilite ? '' : ' ' + t('ex.nonHabilite'));
    modeles(); historique(); apercu();
    const form = el('ex-form');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'ex-jeu') { jeu = jeuDe(e.target.value); modeleCourant = ''; rendreColonnes(); rendreFiltres({ periode: el('ex-periode').value }); }
      if (e.target.id === 'ex-periode') majDates();
      apercuBientot();
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); telecharger(modeleCourant); });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cols]'); if (!b) return;
      const v = b.dataset.cols;
      document.querySelectorAll('input[name=ex-col]').forEach((c) => { c.checked = v === 'toutes' ? true : v === 'aucune' ? false : jeu.defaut.includes(c.value); });
      apercuBientot();
    });
    el('ex-voir').addEventListener('click', apercu);
    el('ex-form-modele').addEventListener('submit', (e) => {
      e.preventDefault();
      const nom = el('ex-nom-modele').value.trim();
      const p = Object.assign(parametres(), { nom });
      const x = NT.api('POST', '/api/exports/modeles', p);
      if (x.statut === 200) { NT.ui.toast(t('ex.modeleOk', { n: nom }), 'success'); el('ex-nom-modele').value = ''; modeleCourant = nom; modeles(); }
      else NT.ui.toast((x.donnees && x.donnees.erreur) || 'Erreur', 'danger');
    });
    el('ex-modeles').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ex]'); if (!b) return;
      const l = JSON.parse(el('ex-modeles').dataset.liste || '[]');
      const m = l.find((x) => x.id === b.dataset.id); if (!m) return;
      if (b.dataset.ex === 'utiliser') { appliquerModele(m); el('ex-form').scrollIntoView({ block: 'start' }); }
      if (b.dataset.ex === 'supprimer') { const x = NT.api('DELETE', '/api/exports/modeles/' + encodeURIComponent(m.id)); if (x.statut === 200) { NT.ui.toast(t('ex.supprime'), 'success'); modeles(); } }
    });
  });
})();
