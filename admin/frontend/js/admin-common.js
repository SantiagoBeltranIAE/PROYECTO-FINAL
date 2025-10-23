// frontend/js/admin-common.js
export async function me() {
  const r = await fetch('../../backend/auth/me.php', {cache:'no-store'});
  return r.ok ? r.json() : { ok:false };
}

export async function logout() {
  await fetch('../../backend/auth/logout.php');
  location.href = 'login.html';
}

export function nav(active) {
  return `
<header>
  <div class="brand">
    <div class="logo"></div>
    <div><strong>Admin Delivery</strong></div>
  </div>
  <nav>
    <button onclick="location.href='productos.html'" class="${active==='productos'?'active':''}">Productos</button>
    <button onclick="location.href='pedidos.html'" class="${active==='pedidos'?'active':''}">Pedidos</button>
    <button onclick="location.href='estadisticas.html'" class="${active==='estadisticas'?'active':''}">Estadísticas</button>
    <button onclick="location.href='general.html'" class="${active==='general'?'active':''}">General</button>
    <button onclick="window._logout()">Salir</button>
  </nav>
</header>`;
}

// --- ensure persistent theme toggle (se reinserta si el header se reemplaza) ---
(function(){
  const KEY = 'admin_theme';
  const html = document.documentElement;

  const applySaved = () => {
    const saved = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'light') html.setAttribute('data-theme','light');
    else if (saved === 'dark') html.removeAttribute('data-theme');
    else {
      if (!prefersDark) html.setAttribute('data-theme','light');
      else html.removeAttribute('data-theme');
    }
  };
  applySaved();

  const createBtn = () => {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.title = 'Cambiar modo claro/oscuro';
    btn.className = 'btn';
    btn.style.marginLeft = '8px';
    btn.style.minWidth = '40px';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.gap = '6px';

    const updateIcon = () => {
      const isLight = html.getAttribute('data-theme') === 'light';
      btn.textContent = isLight ? '☀️' : '🌙';
    };

    btn.addEventListener('click', () => {
      const isLight = html.getAttribute('data-theme') === 'light';
      if (isLight) {
        html.removeAttribute('data-theme'); // vuelve a dark (default)
        localStorage.setItem(KEY, 'dark');
      } else {
        html.setAttribute('data-theme','light');
        localStorage.setItem(KEY, 'light');
      }
      updateIcon();
    });

    updateIcon();
    return btn;
  };

  const ensureInserted = () => {
    const header = document.querySelector('header');
    if (!header) return false;
    // preferir un slot si existe para controles (opcional)
    const slot = header.querySelector('#theme-slot') || header;
    if (!document.getElementById('theme-toggle')) slot.appendChild(createBtn());
    return true;
  };

  // intentar insertar ahora
  ensureInserted();

  // observar cambios en el DOM para re-insertar si header es reemplazado
  const obs = new MutationObserver(() => {
    ensureInserted();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
// --- fin theme persistente ---
