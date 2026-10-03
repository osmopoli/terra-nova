// Onglet Veille API : interroge notre backend toutes les 30 s (jamais l'API Webcup directement : la clé reste serveur)
// et affiche les nouveautés détectées. Un événement est « Nouveau » tant qu'il n'a pas été marqué comme vu.
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'tn_veille_seen_id';
  const CHECK_MS = 30000;
  const KIND = { nouvelle: 'Nouvelle demande', modifiee: 'Demande modifiée', vague: 'Nouvelle vague' };
  const FIELD = {
    message_public: 'message', requester_name: 'demandeur', requester_type: 'type de demandeur', difficulty: 'difficulté',
    difficulty_level: 'niveau', xp_base: 'XP de base', group_name: 'groupe', wave_number: 'vague', visible_since_wave: 'vague',
    arrival_time: "heure d'arrivée", arrival_type: "type d'arrivée", is_ai_request: 'demande IA', is_ai_related: 'lien IA',
  };
  const toDate = (d) => new Date(d.includes('T') ? d : d.replace(' ', 'T') + 'Z');
  const fmt = (d) => (d ? toDate(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }) : '—');

  let seenId = null;
  try { const v = localStorage.getItem(KEY); seenId = v === null ? null : Number(v); } catch {}
  const events = new Map();
  let maxId = 0;
  let nextCheckAt = Date.now() + CHECK_MS;
  let timer = null;
  const baseTitle = document.title;

  function saveSeen(id) {
    seenId = id;
    try { localStorage.setItem(KEY, String(id)); } catch {}
  }

  function describe(e) {
    const d = e.details || {};
    if (e.kind === 'vague') return `La session passe de la vague <strong>${esc(d.from ?? '—')}</strong> à la vague <strong>${esc(d.to)}</strong>.`;
    const fields = e.kind === 'modifiee' && d.fields?.length
      ? `<p class="muted">Champs modifiés : ${esc([...new Set(d.fields.map((f) => FIELD[f] || f))].join(', '))}</p>` : '';
    return `<strong>${esc(e.request_code)}</strong> · ${esc(d.requester_name || '')}<p>${esc(d.message_public || '')}</p>${fields}`;
  }

  function render(state) {
    $('v-count').textContent = state.request_count;
    $('v-wave').textContent = state.session?.current_wave ?? '—';
    $('v-status').innerHTML = [
      `Dernière vérification de l'API : <strong>${esc(fmt(state.last_poll_at))}</strong>`,
      state.session?.minutes_until_next_wave != null ? `Prochaine vague dans ~<strong>${esc(state.session.minutes_until_next_wave)} min</strong>` : '',
      state.last_error ? `<span class="warn-text">⚠ ${esc(state.last_error)}</span>` : '',
    ].filter(Boolean).join(' · ');

    const list = [...events.values()].sort((a, b) => b.id - a.id);
    const unseen = list.filter((e) => e.id > seenId).length;
    $('v-unseen').textContent = unseen;
    document.title = unseen ? `(${unseen}) ${baseTitle}` : baseTitle;
    $('v-empty').hidden = list.length > 0;
    $('v-feed').innerHTML = list.map((e) => {
      const isNew = e.id > seenId;
      return `<li class="feed-item k-${esc(e.kind)}${isNew ? ' is-new' : ''}">
        <div class="row-between"><span class="status k-${esc(e.kind)}">${esc(KIND[e.kind] || e.kind)}</span>
        <span>${isNew ? '<span class="badge new">Nouveau</span> ' : ''}<time class="muted">${esc(fmt(e.created_at))}</time></span></div>
        <div class="feed-body">${describe(e)}</div></li>`;
    }).join('');
  }

  async function check() {
    try {
      const res = await fetch(`/api/webcup/events?since=${maxId}`, { headers: { Accept: 'application/json' } });
      if (res.status === 401) return location.assign('/connexion?next=/veille');
      if (!res.ok) throw new Error(res.status);
      const state = await res.json();
      state.events.forEach((e) => { events.set(e.id, e); maxId = Math.max(maxId, e.id); });
      // Première visite : l'historique existant n'est pas signalé comme « Nouveau ».
      if (seenId === null) saveSeen(maxId);
      render(state);
    } catch {
      $('v-status').innerHTML = '<span class="warn-text">Impossible de joindre le serveur, nouvel essai à la prochaine vérification.</span>';
    }
  }

  function schedule() {
    clearTimeout(timer);
    nextCheckAt = Date.now() + CHECK_MS;
    timer = setTimeout(async () => { await check(); schedule(); }, CHECK_MS);
  }

  setInterval(() => {
    $('v-next').textContent = `${Math.max(0, Math.ceil((nextCheckAt - Date.now()) / 1000))} s`;
  }, 500);

  $('v-seen').addEventListener('click', () => { saveSeen(maxId); check(); });
  $('v-check').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    // Un administrateur force une interrogation immédiate de l'API ; un agent relit simplement le journal.
    if (btn.dataset.admin) await fetch('/api/webcup/refresh', { method: 'POST' }).catch(() => {});
    await check();
    schedule();
    btn.disabled = false;
  });

  check().then(schedule);
})();
