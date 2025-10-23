document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'mestizaCart';
  const TOTAL_KEY = 'mestizaCartTotal';

  function readCart() {
    try { const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    const total = items.reduce((s, it) => s + (parseFloat(it.price || 0) * (parseInt(it.cantidad || 1))), 0);
    localStorage.setItem(TOTAL_KEY, total.toFixed(2));
    dispatchCartUpdated(items);
  }

  function dispatchCartUpdated(items) {
    document.dispatchEvent(new CustomEvent('cart-updated', { detail: { items, total: localStorage.getItem(TOTAL_KEY) } }));
    updateBadge();
    renderOffcanvas();
  }

  function updateBadge() {
    const items = readCart();
    const count = items.reduce((s, it) => s + (parseInt(it.cantidad || 1)), 0) || '';
    // actualizar por id (#cart-counter) o por clase (.cart-badge)
    const badgeById = document.getElementById('cart-counter');
    if (badgeById) { badgeById.textContent = count; return; }
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.textContent = count;
  }

  function renderOffcanvas() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    if (!list) return;
    const items = readCart();
    if (!items.length) {
      list.innerHTML = '<p class="text-muted text-center">El carrito está vacío. ¡Añade algo delicioso!</p>';
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }
    list.innerHTML = '';
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'd-flex align-items-center mb-3';
      row.innerHTML = `
        <div class="flex-grow-1">
          <div class="fw-bold">${escapeHtml(it.name || '')}</div>
          <div class="text-muted small">x${it.cantidad || 1} • $${(parseFloat(it.price)||0).toFixed(2)}</div>
        </div>
        <div class="ms-3">
          <button class="btn btn-sm btn-outline-danger btn-remove-item" data-id="${escapeHtml(it.id_producto||it.id||'')}">Eliminar</button>
        </div>
      `;
      list.appendChild(row);
    });
    if (totalEl) totalEl.textContent = '$' + (localStorage.getItem(TOTAL_KEY) || '0.00');
    // attach remove handlers
    list.querySelectorAll('.btn-remove-item').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        removeFromCart(id);
      });
    });
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }

  function addToCartItem(item) {
    const id = Number(item.id_producto ?? item.id ?? item.id_p ?? 0);
    if (!id) return false;
    const price = parseFloat(item.price ?? item.precio ?? 0) || 0;
    const name = item.name ?? item.nombre ?? '';
    const qty = parseInt(item.cantidad ?? 1) || 1;

    const cart = readCart();
    const found = cart.find(x => Number(x.id_producto) === id);
    if (found) found.cantidad = Number(found.cantidad || 0) + qty;
    else cart.push({ id_producto: id, cantidad: qty, name, price });
    saveCart(cart);
    return true;
  }

  function removeFromCart(id) {
    const cart = readCart().filter(x => String(x.id_producto) !== String(id));
    saveCart(cart);
  }

  // API pública
  window.addToCart = function(item){
    const ok = addToCartItem(item);
    if (ok) {
      // feedback sencillo
      const n = document.getElementById('notification-container');
      if (n) {
        const el = document.createElement('div');
        el.className = 'toast align-items-center text-white bg-success border-0 p-2 mb-2';
        el.style.minWidth = '200px';
        el.textContent = 'Añadido al carrito';
        n.appendChild(el);
        setTimeout(()=> el.remove(), 1200);
      }
    }
    return ok;
  };
  window.getCart = readCart;
  window.clearCart = function(){ saveCart([]); };

  // escucha custom event de producto.js
  document.addEventListener('add-to-cart', e => {
    const d = e.detail;
    if (!d) return;
    addToCartItem(d);
  });

  // botones del offcanvas
  const clearBtn = document.getElementById('clear-cart-btn');
  if (clearBtn) clearBtn.addEventListener('click', () => saveCart([]));
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    // redirige a pago o abre formulario
    window.location.href = 'pago.html';
  });

  // inicializar
  updateBadge();
  renderOffcanvas();
});