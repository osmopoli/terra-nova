/* Terra Nova — utilitaires partagés de l'espace des agents (agent.html, agent-demandes.html, agent-alertes.html).
   Chargé dans <head> après store.js. Les fonctions qui utilisent NT.ui doivent être appelées dans NT.pret(). */
(function () {
  'use strict';
  const NT = window.NT;
  const A = (NT.agent = {});
  const e = s => NT.ui.echap(s);
  const T = (cle, fr, vars) => NT.t(cle, vars, fr);
  A.T = T;

  /* ---------- Traductions communes (EN / ES) ---------- */
  NT.i18n.ajouter({
    en: {
      'statut.recue': 'Received', 'statut.en_cours': 'In progress', 'statut.traitee': 'Resolved', 'statut.cloturee': 'Closed',
      'ag.type.contact': 'Question', 'ag.type.signalement': 'Report', 'ag.type.demarche': 'Procedure',
      'ag.prio.basse': 'Low', 'ag.prio.normale': 'Normal', 'ag.prio.haute': 'High',
      'ag.etat.ok': 'Available', 'ag.etat.maintenance': 'Under maintenance', 'ag.etat.incident': 'Incident', 'ag.etat.desactive': 'Disabled (unavailable)',
      'ag.niv.info': 'Information', 'ag.niv.importante': 'Important', 'ag.niv.alerte': 'Alert',
      'ag.diff.1': 'Easy', 'ag.diff.2': 'Medium', 'ag.diff.3': 'Hard',
      'ag.actionRequise': 'Action required', 'ag.toutes': 'All', 'ag.quartier': 'District', 'ag.aucun': 'None'
    },
    es: {
      'statut.recue': 'Recibida', 'statut.en_cours': 'En curso', 'statut.traitee': 'Tratada', 'statut.cloturee': 'Cerrada',
      'ag.type.contact': 'Pregunta', 'ag.type.signalement': 'Aviso', 'ag.type.demarche': 'Trámite',
      'ag.prio.basse': 'Baja', 'ag.prio.normale': 'Normal', 'ag.prio.haute': 'Alta',
      'ag.etat.ok': 'Disponible', 'ag.etat.maintenance': 'En mantenimiento', 'ag.etat.incident': 'Incidencia', 'ag.etat.desactive': 'Desactivado (no disponible)',
      'ag.niv.info': 'Información', 'ag.niv.importante': 'Importante', 'ag.niv.alerte': 'Alerta',
      'ag.diff.1': 'Fácil', 'ag.diff.2': 'Media', 'ag.diff.3': 'Difícil',
      'ag.actionRequise': 'Acción requerida', 'ag.toutes': 'Todas', 'ag.quartier': 'Barrio', 'ag.aucun': 'Ninguno'
    },
    ar: {
      'statut.recue': 'مستلمة', 'statut.en_cours': 'قيد المعالجة', 'statut.traitee': 'تمت المعالجة', 'statut.cloturee': 'مغلقة',
      'ag.type.contact': 'سؤال', 'ag.type.signalement': 'بلاغ', 'ag.type.demarche': 'إجراء',
      'ag.prio.basse': 'منخفضة', 'ag.prio.normale': 'عادية', 'ag.prio.haute': 'عالية',
      'ag.etat.ok': 'متاحة', 'ag.etat.maintenance': 'قيد الصيانة', 'ag.etat.incident': 'عطل', 'ag.etat.desactive': 'معطّلة (غير متاحة)',
      'ag.niv.info': 'معلومة', 'ag.niv.importante': 'مهمة', 'ag.niv.alerte': 'تنبيه',
      'ag.diff.1': 'سهلة', 'ag.diff.2': 'متوسطة', 'ag.diff.3': 'صعبة',
      'ag.actionRequise': 'إجراء مطلوب', 'ag.toutes': 'الكل', 'ag.quartier': 'الحي', 'ag.aucun': 'لا شيء'
    }
  });

  /* ---------- Libellés ---------- */
  const ICONES_STATUT = { recue: 'ph-tray', en_cours: 'ph-hourglass-medium', traitee: 'ph-check-circle', cloturee: 'ph-lock-simple' };
  A.statutBadge = code => `<span class="statut statut-${e(code)}"><i class="ph ${ICONES_STATUT[code] || 'ph-circle'}" aria-hidden="true"></i>${e(T('statut.' + code, NT.STATUTS[code] || code))}</span>`;

  const TYPES = { contact: 'Question', signalement: 'Signalement', demarche: 'Démarche' };
  A.typeLabel = k => T('ag.type.' + k, TYPES[k] || k || '–');

  const PRIOS = { basse: 'Basse', normale: 'Normale', haute: 'Haute' };
  A.estHaute = p => p === 'haute' || p === 'urgente';
  A.prioLabel = p => T('ag.prio.' + (A.estHaute(p) ? 'haute' : p), PRIOS[A.estHaute(p) ? 'haute' : p] || p || '–');
  A.prioBadge = p => {
    const k = A.estHaute(p) ? 'haute' : (p === 'basse' ? 'basse' : 'normale');
    const ic = { haute: 'ph-caret-double-up', normale: 'ph-minus', basse: 'ph-caret-down' }[k];
    return `<span class="ag-prio ag-prio-${k}"><i class="ph ${ic}" aria-hidden="true"></i>${e(A.prioLabel(p))}</span>`;
  };

  const ETATS = { ok: 'Disponible', maintenance: 'En maintenance', incident: 'Incident', desactive: 'Désactivé (indisponible)' };
  const ICONES_ETAT = { ok: 'ph-check-circle', maintenance: 'ph-wrench', incident: 'ph-warning-octagon', desactive: 'ph-prohibit' };
  A.etatLabel = c => T('ag.etat.' + c, ETATS[c] || c);
  A.etatBadge = c => `<span class="statut statut-${e(c)}"><i class="ph ${ICONES_ETAT[c] || 'ph-circle'}" aria-hidden="true"></i>${e(A.etatLabel(c))}</span>`;

  const NIVEAUX = { info: 'Information', importante: 'Importante', alerte: 'Alerte' };
  const ICONES_NIVEAU = { info: 'ph-info', importante: 'ph-megaphone', alerte: 'ph-warning-octagon' };
  A.niveauLabel = n => T('ag.niv.' + n, NIVEAUX[n] || n);
  A.niveauBadge = n => `<span class="ag-niv ag-niv-${e(n)}"><i class="ph ${ICONES_NIVEAU[n] || 'ph-info'}" aria-hidden="true"></i>${e(A.niveauLabel(n))}</span>`;

  /* ---------- Données ---------- */
  A.utilisateur = id => (id ? NT.store.find('utilisateurs', id) : null);
  A.nomComplet = u => (u ? u.prenom + ' ' + u.nom : '');
  A.service = id => { const s = id ? NT.services.get(id) : null; return s ? NT.i18n.choisir(s.nom) : ''; };
  A.quartierDe = d => d.quartier || ((A.utilisateur(d.userId) || {}).quartier) || '';
  A.dernierChangement = d => ((d.historique || []).slice(-1)[0] || {}).date || d.cree;
  const JOUR = 86400000;
  A.ageMs = iso => Date.now() - new Date(iso).getTime();
  A.estOuverte = d => d.statut === 'recue' || d.statut === 'en_cours';
  /* Une demande « nécessite une action » (F22) : reçue, ou en cours depuis plus de 2 jours, ou priorité haute non terminée */
  A.actionRequise = d => A.estOuverte(d) && (d.statut === 'recue' || A.estHaute(d.priorite) || A.ageMs(A.dernierChangement(d)) > 2 * JOUR);
  A.signalementUrgent = d => d.type === 'signalement' && A.estOuverte(d) && (A.estHaute(d.priorite) || (d.statut === 'recue' && A.ageMs(d.cree) >= JOUR));
  A.traiteeCetteSemaine = d => (d.statut === 'traitee' || d.statut === 'cloturee') && A.ageMs(A.dernierChangement(d)) <= 7 * JOUR;
  A.heure = (d, avecSec) => (d || new Date()).toLocaleTimeString(NT.i18n.langue === 'fr' ? 'fr-FR' : undefined, avecSec ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour: '2-digit', minute: '2-digit' });
  A.sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  A.destinataires = zone => NT.store.get('utilisateurs').filter(u => u.role === 'citoyen' && u.actif !== false && (!zone || zone === 'Toute la ville' || u.quartier === zone));
})();
