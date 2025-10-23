'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form');
  if (!form) {
    console.error('No se encontró #product-form en el DOM');
    return;
  }

  const ENDPOINT = `${window.location.origin}/PROYECTO-FINAL/fronted-mejor/php/backend/controllers/productos.php`;

  async function cargarProductos() {
    try {
      const res = await fetch(`${ENDPOINT}?action=obtenerProductos`, { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.msg || 'Error obteniendo productos');
      // TODO: refrescar tu tabla con j.products si es necesario
    } catch (e) {
      console.error(e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const id = (document.getElementById('id_producto')?.value || '').trim();
    fd.set('action', id ? 'editarProducto' : 'agregarProducto');

    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.msg || `HTTP ${res.status}`);
      alert(j.msg || (id ? 'Producto editado' : 'Producto agregado'));
      form.reset();
      const hidden = document.getElementById('id_producto');
      if (hidden) hidden.value = '';
      await cargarProductos();
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + (err.message || err));
    }
  });

  // Editar
  document.body.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-edit-product]');
    if (!btn) return;
    const tr = btn.closest('tr');
    if (!tr) return;

    document.getElementById('id_producto').value =
      tr.dataset.id || tr.querySelector('.prod-id')?.textContent?.trim() || '';

    document.getElementById('product-nombre').value =
      tr.querySelector('.prod-nombre')?.value || tr.querySelector('.prod-nombre')?.textContent?.trim() || '';

    const cat =
      tr.querySelector('.prod-categoria')?.value || tr.querySelector('.prod-categoria')?.textContent?.trim() || '';
    document.getElementById('product-categoria').value = cat;

    document.getElementById('product-precio').value =
      tr.querySelector('.prod-precio')?.value || tr.querySelector('.prod-precio')?.textContent?.trim() || '';

    document.getElementById('product-tamanos').value =
      tr.querySelector('.prod-tamanos')?.value || tr.querySelector('.prod-tamanos')?.textContent?.trim() || '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Eliminar
  document.body.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-delete-product]');
    if (!btn) return;

    const id = btn.getAttribute('data-id')
      || btn.closest('tr')?.dataset.id
      || btn.closest('tr')?.querySelector('.prod-id')?.textContent?.trim();

    if (!id) return;
    if (!confirm(`Eliminar producto #${id}?`)) return;

    try {
      const fd = new FormData();
      fd.set('action', 'eliminarProducto');
      fd.set('id_producto', id);
      const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.msg || 'Error eliminando');
      alert(j.msg || 'Eliminado');
      await cargarProductos();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar: ' + (e.message || e));
    }
  });

  cargarProductos();
});

