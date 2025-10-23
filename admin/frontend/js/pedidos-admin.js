document.addEventListener('DOMContentLoaded', () => {
  const API = {
    list: [
      '../../backend/pedidos/list.php',
      '/PROYECTO-FINAL/admin/backend/pedidos/list.php'
    ]
  };

  async function fetchJSON(url) {
    const r = await fetch(url + '?ts=' + Date.now(), { cache:'no-store' });
    const t = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${t}`);
    let json;
    try { json = JSON.parse(t); }
    catch { throw new Error('Respuesta no JSON: ' + t.slice(0,180)); }
    return json;
  }
  async function tryFetch(urls) {
    let lastErr;
    for (const u of urls) {
      try { return await fetchJSON(u); }
      catch (e) { lastErr = e; }
    }
    console.error(lastErr);
    alert('No se pudo cargar la lista de pedidos.\n' + (lastErr?.message || ''));
    return [];
  }

  function colIndexByHeader(table, name) {
    const ths = Array.from(table.tHead?.rows[0]?.cells || []);
    return ths.findIndex(th => (th.textContent||'').trim().toLowerCase() === name);
  }
  function moveColumn(table, from, to) {
    if (from === -1 || to === -1 || from === to) return;
    [...table.rows].forEach(row => {
      const c = row.cells[from];
      if (c) row.insertBefore(c, row.cells[to] || null);
    });
  }

  function patchTable(data) {
    const table = document.querySelector('table');
    if (!table) return;

    const map = new Map(data.map(p => [String(p.id_pedido), p]));

    const idxId      = 0;
    const idxDetalle = colIndexByHeader(table,'detalle');
    const idxFecha   = colIndexByHeader(table,'fecha');

    if (idxDetalle !== -1 && idxDetalle !== 1) {
      moveColumn(table, idxDetalle, 1);
      if (idxFecha !== -1) moveColumn(table, idxFecha, idxDetalle);
    }

    const detIdx = colIndexByHeader(table,'detalle');

    [...(table.tBodies[0]?.rows || [])].forEach(tr => {
      const idTxt = (tr.cells[idxId]?.textContent || '').trim();
      const p = map.get(idTxt);
      if (!p) return;
      const cell = tr.cells[detIdx];
      if (!cell) return;

      const items = Array.isArray(p.detalle) ? p.detalle : [];
      const html = items.length
        ? items.map(d => `${d.cantidad}x ${d.producto_nombre}`).join('<br>')
        : '-';

      cell.innerHTML = html;

      const ref = (p.referencia || '').trim();
      if (ref) cell.innerHTML += `<div style="color:#999;margin-top:4px;">Ref: ${ref}</div>`;
    });
  }

  async function load() {
    const data = await tryFetch(API.list);
    patchTable(data);
  }

  load();
  document.querySelector('button#refrescar, button#ref')?.addEventListener('click', load);
});