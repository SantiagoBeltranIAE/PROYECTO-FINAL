document.addEventListener('DOMContentLoaded', function () {
  // --- NUEVO: estado para el polling ---
  const pollingInterval = 15000;        // 15s
  let productosCacheHash = null;
  let pollingTimer = null;

  const CONTROLLER = `${window.location.origin}/PROYECTO-FINAL/fronted-mejor/php/backend/controllers/productos.php?action=obtenerProductos`;
  const LIST_ENDPOINTS = [
    CONTROLLER,
    "/PROYECTO-FINAL/backend/productos/list.php",
    "../backend/productos/list.php",
    "/backend/productos/list.php"
  ];

  // Placeholder embebido (no requiere archivo en /imagenes)
  const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="sans-serif" font-size="24">Sin imagen</text></svg>')
  }`;

  // Normaliza productos a {id,name,description,price,category,image}
  function mapFromController(json) {
    if (!json || json.ok !== true || !Array.isArray(json.products)) return null;
    return json.products.map(p => ({
      id: p.id_producto ?? p.id ?? '',
      name: p.nombre ?? p.name ?? '',
      description: p.descripcion ?? p.description ?? '',
      price: p.precio ?? p.price ?? 0,
      category: p.categoria ?? p.category ?? 'Otros',
      image: p.imagen ?? p.imagen_url ?? p.image ?? ''
    }));
  }

  async function fetchFromListEndpoints() {
    for (const url of LIST_ENDPOINTS) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
        const json = await res.json();

        // Si viene del controlador (ok=true, products=[...])
        const mapped = mapFromController(json);
        if (mapped) return mapped;

        // Si el endpoint legacy ya devuelve array de productos, úsalo tal cual
        if (Array.isArray(json)) return json;
      } catch (_) {
        // probar siguiente endpoint
      }
    }
    throw new Error('No se pudo obtener la lista de productos desde los endpoints configurados.');
  }

  async function obtenerProductos() {
    try {
      const productos = await fetchFromListEndpoints();
      mostrarProductos(productos);
      return productos;
    } catch (error) {
      console.error("Error al obtener los productos", error);
      const contenedor = document.getElementById("contenedor-productos") || document.getElementById("productos-grid");
      if (contenedor) contenedor.innerHTML = "<p class='text-muted'>Error al cargar los productos.</p>";
      return null;
    }
  }

  // Helper para URLs de imagen
  const imgSrc = (p) => p?.imagen || p?.imagen_url || PLACEHOLDER_IMG;

  // Donde construyes cada card, usa <img src="...">
  function renderCard(p) {
    return `
      <div class="col">
        <div class="card h-100 product-card" data-id="${p.id_producto}">
          <img class="card-img-top"
               src="${imgSrc(p)}"
               alt="${p.nombre || 'Producto'}"
               loading="lazy"
               onerror="this.src='${PLACEHOLDER_IMG}'">
          <div class="card-body">
            <h5 class="card-title">${p.nombre || ''}</h5>
            ${p.descripcion ? `<p class="card-text">${p.descripcion}</p>` : ''}
            <div class="d-flex justify-content-between align-items-center">
              <strong>$${Number(p.precio || 0).toFixed(2)}</strong>
              <button class="btn btn-success" data-add data-id="${p.id_producto}">Añadir al carrito</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function mostrarProductos(productos) {
    if (!productos) return;

    const groupKeyOf = p => p.category ?? p.categoria ?? p.tipo ?? 'Otros';
    const groups = productos.reduce((acc, p) => {
      const k = (groupKeyOf(p) || 'Otros').trim() || 'Otros';
      (acc[k] ||= []).push(p);
      return acc;
    }, {});

    const gridContainer = document.getElementById("productos-grid");
    if (gridContainer) {
      gridContainer.innerHTML = "";
      Object.keys(groups).forEach(groupName => {
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'col-12';
        sectionTitle.innerHTML = `<h3 class="mb-3">${escapeHtml(groupName)}</h3>`;
        gridContainer.appendChild(sectionTitle);

        const row = document.createElement('div');
        row.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 w-100 mb-4';
        groups[groupName].forEach(prod => {
          const id = prod.id ?? prod.id_producto ?? '';
          const name = prod.name ?? prod.nombre ?? 'Producto';
          const description = prod.description ?? prod.descripcion ?? '';
          const price = prod.price ?? prod.precio ?? '';
          const image = prod.image || prod.imagen || prod.imagen_url || PLACEHOLDER_IMG;

          const col = document.createElement('div');
          col.className = 'col';
          col.innerHTML = `
            <div class="card h-100 product-card" data-id="${escapeHtml(id)}">
              <img src="${escapeHtml(image)}"
                   class="card-img-top"
                   alt="${escapeHtml(name)}"
                   loading="lazy"
                   onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${escapeHtml(name)}</h5>
                <p class="card-text flex-grow-1">${escapeHtml(description)}</p>
                ${ price !== '' ? `<p class="fw-bold">$${escapeHtml(price)}</p>` : '' }
                <button class="btn btn-success mt-auto btn-add-to-cart"
                        data-id="${escapeHtml(id)}"
                        data-name="${escapeHtml(name)}"
                        data-price="${escapeHtml(price)}">Añadir al carrito</button>
              </div>
            </div>`;
          row.appendChild(col);
        });
        gridContainer.appendChild(row);
      });

      // attach handlers
      gridContainer.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const b = e.currentTarget;
          const item = {
            id: b.dataset.id,
            name: b.dataset.name,
            price: parseFloat(b.dataset.price) || 0
          };
          if (typeof window.addToCart === 'function') window.addToCart(item);
          else document.dispatchEvent(new CustomEvent('add-to-cart', { detail: item }));
        });
      });
    }

    // RENDER TABLE (admin) si aplica
    const contenedor = document.getElementById("contenedor-productos");
    if (contenedor) {
      contenedor.innerHTML = "";
      productos.forEach(producto => {
        const id = producto.id ?? '';
        const tr = document.createElement('tr');
        tr.id = `producto-${id}`;
        tr.innerHTML = `
          <td>${escapeHtml(producto.name ?? '')}</td>
          <td>${escapeHtml(producto.description ?? '')}</td>
          <td>${escapeHtml(producto.price ?? '')}</td>
          <td>
            <button class="btn editar" data-id="${escapeHtml(id)}">Editar</button>
            <button class="btn danger eliminar" data-id="${escapeHtml(id)}">Eliminar</button>
          </td>
        `;
        contenedor.appendChild(tr);
      });

      contenedor.querySelectorAll('.eliminar').forEach(b => {
        b.addEventListener('click', (e) => eliminarProducto(e.currentTarget.dataset.id));
      });
      contenedor.querySelectorAll('.editar').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const row = document.getElementById(`producto-${id}`);
          if (!row) return;
          const cols = row.querySelectorAll('td');
          const producto = { id, name: cols[0].textContent.trim(), description: cols[1].textContent.trim(), price: cols[2].textContent.trim() };
          cargarProductoEnFormulario(producto);
        });
      });
    }
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // funciones admin mínimas (usar endpoints existentes si quieres)
  async function postToFirstWorkingEndpoint(endpoints, body, asJson = false) {
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
        // intento siguiente
      }
    }
    throw new Error('No se pudo comunicar con los endpoints configurados.');
  }

  // placeholders para eliminar/editar si existen endpoints admin en la misma página
  async function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      // ruta default; si no usás admin aquí, no hará nada
      await postToFirstWorkingEndpoint(['/backend/productos/delete.php'], { id }, true);
      await obtenerProductos();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el producto.');
    }
  }

  function cargarProductoEnFormulario(producto) {
    const fName = document.getElementById('name');
    if (!fName) return;
    document.getElementById('name').value = producto.name || '';
    document.getElementById('description').value = producto.description || '';
    document.getElementById('price').value = producto.price || '';
    const btn = document.getElementById('btn-guardar');
    if (btn) btn.textContent = "Modificar";
    window.productoEditandoId = producto.id;
  }

  // polling por cambios simples (hash)
  async function computeHashOfProducts() {
    try {
      const lista = await fetchFromListEndpoints();
      return JSON.stringify(lista);
    } catch (e) {
      return null;
    }
  }

  async function startPolling(interval = 15000) {   // <- default fijo
    const initial = await obtenerProductos();
    productosCacheHash = initial ? JSON.stringify(initial) : null;

    if (pollingTimer) clearInterval(pollingTimer);
    pollingTimer = setInterval(async () => {
      try {
        const h = await computeHashOfProducts();
        if (h && h !== productosCacheHash) {
          productosCacheHash = h;
          await obtenerProductos();
        }
      } catch (err) {
        console.error('Polling productos error', err);
      }
    }, interval);
  }

  startPolling();  // arranca
});