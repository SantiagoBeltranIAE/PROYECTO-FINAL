// Nuevo: maneja creación de pedidos desde la web pública y polling del estado
document.addEventListener('DOMContentLoaded', function () {
  const CREATE_ENDPOINTS = [
    "../backend/routes/api.php?seccion=crearPedido",
    "/backend/pedidos/create.php"
  ];
  const STATUS_ENDPOINTS = [
    "../backend/routes/api.php?seccion=pedidoStatus",
    "/backend/pedidos/status.php"
  ];

  async function postToFirstWorkingEndpoint(endpoints, body, asJson = true) {
    for (const url of endpoints) {
      try {
        const opts = { method: 'POST' };
        if (asJson) {
          opts.headers = { 'Content-Type': 'application/json' };
          opts.body = JSON.stringify(body);
        } else {
          const fd = new FormData();
          for (const k in body) fd.append(k, body[k]);
          opts.body = fd;
        }
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        // intentar siguiente
      }
    }
    throw new Error('No se pudo comunicar con los endpoints configurados.');
  }

  // crear pedido: espera recibir { ok:true, orderId:123 } ó similar
  async function crearPedido(pedidoData) {
    try {
      const resp = await postToFirstWorkingEndpoint(CREATE_ENDPOINTS, pedidoData, true)
        .catch(() => postToFirstWorkingEndpoint(CREATE_ENDPOINTS, pedidoData, false));
      return resp;
    } catch (err) {
      console.error('Error crearPedido', err);
      throw err;
    }
  }

  // obtener estado de pedido por id (probar distintos endpoints GET/POST)
  async function obtenerEstadoPedido(orderId) {
    // intentar GET en cada endpoint con ?id=
    for (const base of STATUS_ENDPOINTS) {
      try {
        // si endpoint acepta GET con id
        const url = base.includes('?') ? `${base}&id=${orderId}` : `${base}?id=${orderId}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const j = await res.json();
          if (j && (j.estado || j.status)) return j;
        }
      } catch (e) {
        // intentar POST abajo
      }
    }

    // fallback: POST
    for (const ep of STATUS_ENDPOINTS) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId })
        });
        if (res.ok) {
          const j = await res.json();
          if (j && (j.estado || j.status)) return j;
        }
      } catch (e) {
        // next
      }
    }

    throw new Error('No se pudo obtener estado del pedido');
  }

  // polling de un pedido hasta que su estado sea 'pagado' / 'completado' (ajustar estados segun backend)
  async function pollOrderUntilFinal(orderId, onUpdate, interval = 5000, timeout = 5 * 60 * 1000) {
    const start = Date.now();
    let last = null;
    while (Date.now() - start < timeout) {
      try {
        const res = await obtenerEstadoPedido(orderId);
        const estado = res.estado || res.status || null;
        if (estado !== last) {
          last = estado;
          onUpdate(res);
        }
        if (estado === 'pagado' || estado === 'completado' || estado === 'paid') {
          return res;
        }
      } catch (e) {
        console.error('pollOrder error', e);
      }
      await new Promise(r => setTimeout(r, interval));
    }
    throw new Error('Timeout esperando confirmación del pago');
  }

  // exportar funciones globales si se desea usar desde otros scripts
  window.PedidosAPI = {
    crearPedido,
    obtenerEstadoPedido,
    pollOrderUntilFinal
  };

  // ejemplo: hook en formulario de compra si existe
  const formCompra = document.getElementById('form-compra');
  if (formCompra) {
    formCompra.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const data = {};
      new FormData(formCompra).forEach((v, k) => data[k] = v);
      try {
        const creacion = await crearPedido(data);
        const orderId = creacion.orderId || creacion.id || creacion.insertId || (creacion.data && creacion.data.id);
        if (!orderId) {
          alert('Pedido creado pero no se recibió id. Revisa consola.');
          console.log('crearPedido resp:', creacion);
          return;
        }
        alert('Pedido creado. Esperando confirmación de pago...');
        // iniciar polling del estado y actualizar UI según onUpdate
        pollOrderUntilFinal(orderId, (estadoResp) => {
          // actualizar UI localmente
          const statusSpan = document.getElementById('order-status-' + orderId);
          if (statusSpan) statusSpan.textContent = estadoResp.estado || estadoResp.status;
        }).then(() => {
          alert('Pago confirmado. Gracias.');
        }).catch(err => {
          console.warn('No se confirmó pago en el tiempo esperado', err);
        });
      } catch (err) {
        alert('Error al crear pedido. Revisa la consola.');
      }
    });
  }
});