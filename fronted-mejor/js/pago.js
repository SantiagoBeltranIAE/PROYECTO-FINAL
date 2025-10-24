// Pago — flujo, validación mínima y creación de pedido
document.addEventListener('DOMContentLoaded', () => {
  // 0) Enforce flujo
  const shipping = JSON.parse(localStorage.getItem('shippingInfo') || 'null');
  const method   = localStorage.getItem('paymentMethod');
  if (!shipping) return location.replace('direccion.html');
  if (!method)   return location.replace('metodo_de_pago.html');

  // 1) Config
  const API_URLS = [
    '../admin/backend/pedidos/create.php',
    '/PROYECTO-FINAL/admin/backend/pedidos/create.php'
  ];
  const VALID_CARDS = [
    { number: '4213016314706756', brand: 'Visa', logo: 'imagenes/visa.png', expiry: '12/26', cvc: '194' },
  ];

  // 2) DOM
  const $ = id => document.getElementById(id);
  const cardNumberInput     = $('card-number');
  const expiryDateInput     = $('expiry-date');
  const cvvInput            = $('cvv');
  const cardHolderNameInput = $('card-holder-name');
  const cardPaymentForm     = $('card-payment-form');
  const cardLogoSpan        = $('card-logo');
  const paymentAmountDisplay= $('payment-amount-display');

  // Helpers
  const normalize = s => (s || '').replace(/\s+/g, '');
  const toNum = v => {
    if (typeof v === 'number') return v;
    const n = String(v ?? '').replace(/[^\d,.-]/g,'').replace(',', '.');
    const x = parseFloat(n);
    return Number.isFinite(x) ? x : 0;
  };

  // 3) Carrito: leer de múltiples claves y formatos
  function leerCarritoRaw() {
    const keys = ['mestizaCart','carrito','cart','cartItems','shoppingCart'];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw && raw !== '[]' && raw !== '{}') return {key:k, raw};
    }
    return {key:null, raw:null};
  }
  function parseLista(raw) {
    try { const j = JSON.parse(raw); return j; } catch { return null; }
  }
  function obtenerItems() {
    const {key, raw} = leerCarritoRaw();
    let data = raw ? parseLista(raw) : null;
    let list = [];
    if (Array.isArray(data)) list = data;
    else if (data && Array.isArray(data.items)) list = data.items;
    else if (data && Array.isArray(data.products)) list = data.products;
    else if (data && Array.isArray(data.cart)) list = data.cart;

    // Normalizar
    return list.map(i => ({
      producto_nombre: i.producto_nombre ?? i.nombre ?? i.name ?? i.titulo ?? 'Producto',
      cantidad: toNum(i.cantidad ?? i.qty ?? i.quantity ?? 1),
      precio_unitario: toNum(i.precio_unitario ?? i.precio ?? i.price ?? i.unit_price ?? 0),
    })).filter(x => x.cantidad > 0);
  }

  function actualizarTotal() {
    const items = obtenerItems();
    const total = items.reduce((a,i)=>a + i.precio_unitario * i.cantidad, 0);
    if (paymentAmountDisplay) paymentAmountDisplay.textContent = `$${total.toFixed(2)}`;
    return {items, total};
  }
  actualizarTotal();

  // 4) UI mínima tarjeta
  cardNumberInput?.addEventListener('input', () => {
    const num = normalize(cardNumberInput.value);
    const match = VALID_CARDS.find(c => c.number && num.startsWith(c.number.slice(0,6)));
    if (cardLogoSpan) cardLogoSpan.innerHTML = match ? `<img src="${match.logo}" alt="${match.brand}" height="18">` : '';
  });

  // 5) Crear pedido en servidor
  async function crearPedidoEnServidor() {
    const {items} = actualizarTotal();
    if (!items.length) { alert('Carrito vacío'); throw new Error('Carrito vacío'); }

    const payload = {
      cliente: {
        nombre: shipping.nombre || '',
        telefono: shipping.telefono || '',
        direccion: shipping.direccion || '',
        referencia: shipping.referencia || ''
      },
      metodo_pago: method || 'efectivo',
      items
    };

    let lastErr;
    for (const url of API_URLS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store'
        });
        const txt = await res.text();
        // Intentar parsear como JSON; si viene HTML (errores PHP), mostrar mensaje claro
        let data = null;
        try {
          data = txt ? JSON.parse(txt) : null;
        } catch (e) {
          // Si el servidor devolvió HTML, recortar para el alert y también loguear completo
          console.error('Respuesta del servidor no-JSON:', txt);
          const preview = txt.replace(/<[^>]+>/g, ' ').slice(0, 180);
          throw new Error('Respuesta del servidor no válida: ' + preview);
        }
        if (!res.ok || !data?.ok) throw new Error(data?.msg || ('HTTP '+res.status));
        return data; // { ok:true, id_pedido }
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('No se pudo crear el pedido');
  }

  // 6) Submit
  async function onSubmit(e) {
    e?.preventDefault?.();
    try {
      const resp = await crearPedidoEnServidor();
      // guardar último pedido para acceso rápido desde el menú/ícono de tracking
      try {
        localStorage.setItem('lastOrderId', String(resp.id_pedido));
        localStorage.setItem('lastOrder', JSON.stringify({ id: resp.id_pedido, ts: Date.now() }));
      } catch {}
      // limpiar estado del checkout y carritos conocidos
      ['shippingInfo','paymentMethod','mestizaCart','carrito','cart','cartItems','shoppingCart'].forEach(k=>localStorage.removeItem(k));
      location.href = `estado.html?id=${resp.id_pedido}`;
    } catch (err) {
      alert(err?.message || String(err));
    }
  }

  if (cardPaymentForm) {
    cardPaymentForm.addEventListener('submit', onSubmit);
  } else {
    document.getElementById('pay-button')?.addEventListener('click', onSubmit);
  }
});
