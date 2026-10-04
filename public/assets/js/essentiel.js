/* Terra Nova — vague 19 (F94) : compléments facultatifs de la page « Infos essentielles » (/essentiel).
   La page fonctionne entièrement sans ce script. Il ajoute seulement :
   - « Vos demandes récentes » pour l'habitant connecté sur cet appareil (copie gardée dans son navigateur, même hors connexion) ;
   - un bouton « Imprimer » ;
   - une mention « Hors connexion » quand la page vient de la copie de l'appareil ;
   - l'inscription du Service Worker, pour que cette page et le paquet essentiel soient disponibles hors connexion. */
(function () {
  'use strict';
  const l = document.body.dataset.lang || 'fr';
  const T = {
    fr: { imprimer: 'Imprimer cette page', horsLigne: 'Hors connexion : copie enregistrée sur cet appareil.', maj: 'Résumé enregistré le {d}', vide: 'Aucune demande pour le moment.', rdv: 'Prochain rendez-vous', suivre: 'Suivre',
      s: { recue: 'Reçue', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée' } },
    en: { imprimer: 'Print this page', horsLigne: 'Offline: copy saved on this device.', maj: 'Summary saved on {d}', vide: 'No request at the moment.', rdv: 'Next appointment', suivre: 'Track',
      s: { recue: 'Received', en_cours: 'In progress', traitee: 'Resolved', cloturee: 'Closed' } },
    es: { imprimer: 'Imprimir esta página', horsLigne: 'Sin conexión: copia guardada en este dispositivo.', maj: 'Resumen guardado el {d}', vide: 'Ninguna solicitud por ahora.', rdv: 'Próxima cita', suivre: 'Seguir',
      s: { recue: 'Recibida', en_cours: 'En curso', traitee: 'Tratada', cloturee: 'Cerrada' } },
    ar: { imprimer: 'طباعة هذه الصفحة', horsLigne: 'غير متصل: نسخة محفوظة على هذا الجهاز.', maj: 'ملخص محفوظ بتاريخ {d}', vide: 'لا توجد طلبات حالياً.', rdv: 'الموعد القادم', suivre: 'متابعة',
      s: { recue: 'مستلمة', en_cours: 'قيد المعالجة', traitee: 'تمت معالجتها', cloturee: 'مغلقة' } }
  }[l] || {};
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const date = iso => { try { return new Date(iso).toLocaleString({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[l], { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };

  // Imprimer
  const p = document.querySelector('.ess-imprimer');
  if (p && window.print) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ess-bouton'; b.textContent = T.imprimer;
    b.addEventListener('click', () => window.print());
    p.textContent = ''; p.append(b);   // en pied de page, à la place de « Ctrl + P » : rien ne bouge dans le contenu
  }
  // Hors connexion
  if (navigator.onLine === false) {
    const z = document.querySelector('.ess-maj');
    if (z) { const n = document.createElement('p'); n.className = 'ess-maj'; n.setAttribute('role', 'status'); n.textContent = T.horsLigne; z.after(n); }
  }
  // Vos demandes récentes : seulement si l'habitant connecté sur cet appareil est bien le propriétaire du résumé
  let uid = null;
  try { uid = JSON.parse(localStorage.getItem('nt:essMoi') || 'null'); } catch (e) { uid = null; }
  if (uid) {
    fetch('/api/essentiel/moi', { credentials: 'same-origin' }).then(r => (r.ok ? r.json().then(j => ({ j, copie: r.headers.get('X-Copie-Du') })) : null)).then(x => {
      if (!x || !x.j || x.j.uid !== uid) return;
      const sec = document.getElementById('ess-moi'), liste = document.getElementById('ess-moi-liste');
      if (!sec || !liste) return;
      const d = x.j;
      liste.innerHTML = `<p class="ess-source">${E(T.maj.replace('{d}', date(d.majLe)))}</p>`
        + (d.demandes.length ? `<ul class="simple-liste">${d.demandes.map(q => `<li><strong>${E(q.id)}</strong> — ${E(q.objet)} : <strong>${E(T.s[q.statut] || q.statut)}</strong> · ${E(date(q.maj))}${navigator.onLine === false ? '' : ` · <a href="/suivi.html?id=${encodeURIComponent(q.id)}">${E(T.suivre)}</a>`}</li>`).join('')}</ul>` : `<p>${E(T.vide)}</p>`)
        + (d.rdv.length ? `<p><strong>${E(T.rdv)} :</strong> ${E(date(d.rdv[0].debut))} — ${E(d.rdv[0].libelle)}${d.rdv[0].lieu ? ' · ' + E(d.rdv[0].lieu) : ''}</p>` : '');
      sec.hidden = false;
    }).catch(() => {});
  }
  // Service Worker : la page et le paquet essentiel restent disponibles hors connexion
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
