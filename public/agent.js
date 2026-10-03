// Polling de notre backend (jamais l'API Webcup directement : la clé reste serveur).
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DIFF = { 1: 'Facile', 2: 'Moyenne', 3: 'Difficile', 4: 'Expert' };
  const KEY = 'tn_seen_codes';
  let seen;
  try { seen = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { seen = new Set(); }
  const firstLoad = seen.size === 0;
  let interval = 20000;

  async function refresh() {
    try {
      const res = await fetch('/api/webcup/state', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      render(await res.json());
    } catch (e) {
      $('api-session').textContent = 'Impossible de joindre le serveur, nouvel essai bientôt.';
    }
  }

  function render(state) {
    interval = (state.poll_interval_seconds || 20) * 1000;
    const s = state.session || {};
    $('api-session').innerHTML = [
      `Statut : <strong>${esc(s.status || 'inconnu')}</strong>`,
      `Vague actuelle : <strong>${esc(s.current_wave ?? '—')}</strong>`,
      s.minutes_until_next_wave != null ? `Prochaine vague (${esc(s.next_wave_number)}) dans ~<strong>${esc(s.minutes_until_next_wave)} min</strong>` : '',
      `Dernière synchro : ${esc(state.last_poll_at || '—')} UTC`,
      state.last_error ? `<span class="warn-text">⚠ ${esc(state.last_error)}</span>` : '',
    ].filter(Boolean).join(' · ');

    const fresh = state.requests.filter((r) => !seen.has(r.request_code));
    $('api-count').textContent = state.requests.length;
    $('api-requests').innerHTML = state.requests.map((r) => {
      const isNew = !firstLoad && fresh.includes(r);
      return `<tr class="${isNew ? 'is-new' : ''} ${r.done ? 'is-done' : ''}">
        <td><strong>${esc(r.request_code)}</strong>${isNew ? ' <span class="badge new">Nouveau</span>' : ''}</td>
        <td>${esc(r.requester_name)}<br><small>${esc(r.group_name || '')}</small></td>
        <td>${esc(r.message_public)}</td>
        <td><span class="diff d${esc(r.difficulty_level)}">${esc(r.difficulty || DIFF[r.difficulty_level])}</span></td>
        <td>${esc(r.xp_total)}</td>
        <td>${esc(r.visible_since_wave ?? r.wave_number ?? 0)}</td>
        <td><input type="checkbox" data-code="${esc(r.request_code)}" ${r.done ? 'checked' : ''} aria-label="Marquer ${esc(r.request_code)} comme fait"></td>
      </tr>`;
    }).join('');

    const badge = $('api-new');
    if (!firstLoad && fresh.length) {
      badge.hidden = false;
      badge.textContent = `${fresh.length} nouvelle(s) demande(s)`;
      document.title = `(${fresh.length}) Espace agents · Terra Nova`;
    }
    state.requests.forEach((r) => seen.add(r.request_code));
    try { localStorage.setItem(KEY, JSON.stringify([...seen])); } catch {}
  }

  document.addEventListener('change', async (e) => {
    const code = e.target.dataset?.code;
    if (!code) return;
    await fetch(`/api/webcup/${encodeURIComponent(code)}/done`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: e.target.checked }) });
    refresh();
  });

  const loop = async () => { await refresh(); setTimeout(loop, interval); };
  loop();
})();
