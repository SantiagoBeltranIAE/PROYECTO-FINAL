document.addEventListener('DOMContentLoaded', () => {
  const ENDPOINT = '/PROYECTO-FINAL/backend/pedidos/change_state.php';

  async function changeState(id, estado) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: String(id), estado: String(estado) })
      });
      const j = await res.json().catch(()=>null);
      if (!res.ok || (j && j.ok === false)) throw new Error((j && j.msg) || `HTTP ${res.status}`);
      // refrescar la tabla (si existe función cargarPedidos) o recargar la página
      if (typeof cargarPedidos === 'function') { cargarPedidos(); }
      else { location.reload(); }
    } catch (err) {
      console.error('changeState error:', err);
      alert('No se pudo cambiar el estado: ' + (err.message || err));
    }
  }

  // Delegación: cualquier botón dentro de la tabla de pedidos
  document.body.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    // ignorar botones no relacionados
    if (!btn.closest('table')) return;

    // intentar obtener estado del botón: data-state o texto
    let estado = btn.getAttribute('data-state') || btn.dataset.state || btn.textContent || '';
    estado = estado.trim().toLowerCase().replace(/\s+/g,'_');

    // encontrar id de pedido: primera celda de la fila padre
    const row = btn.closest('tr');
    if (!row) return;
    const firstCell = row.querySelector('td, th');
    if (!firstCell) return;
    const idText = firstCell.textContent.trim().split(/\s+/)[0]; // toma primer token
    const id = idText.replace(/[^0-9]/g,''); // extrae solo números

    if (!id) { console.warn('Pedido id no encontrado en la fila'); return; }
    if (!confirm(`Cambiar estado del pedido ${id} a "${estado}"?`)) return;
    changeState(id, estado);
  });
});