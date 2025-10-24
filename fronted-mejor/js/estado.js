// ===== Estado de pedido (página pública estado.html) =====
(() => {
  const qs = new URLSearchParams(location.search);
  const id = parseInt(qs.get('id') || qs.get('pedido') || qs.get('id_pedido') || '0', 10);

  // Endpoints válidos (desde fronted-mejor -> admin/backend)
  const ENDPOINTS = [
    '../admin/backend/pedidos/status.php',
    '../admin/backend/pedidos/estado_publico.php',
    '/PROYECTO-FINAL/admin/backend/pedidos/status.php',
    '/PROYECTO-FINAL/admin/backend/pedidos/estado_publico.php'
  ];

  const MAP = {
    pendiente:'confirmado', aceptado:'confirmado', confirmado:'confirmado', nuevo:'confirmado',
    en_preparacion:'en_preparacion', preparando:'en_preparacion', preparacion:'en_preparacion',
    en_camino:'en_camino', camino:'en_camino', reparto:'en_camino', delivery:'en_camino',
    entregado:'entregado', cancelado:'cancelado'
  };
  const PASOS = [
    { key:'confirmado',     id:'paso_confirmado'  }, // 0
    { key:'en_preparacion', id:'paso_preparacion' }, // 1
    { key:'en_camino',      id:'paso_camino'      }, // 2
    { key:'entregado',      id:'paso_entregado'   }  // 3
  ];

  function normEstado(s){ const e=String(s||'').toLowerCase().trim().replace(/[\s-]+/g,'_'); return MAP[e]||'confirmado'; }
  function stepUIFromSlug(slug){ return PASOS.findIndex(p=>p.key===slug); }            // 0..3
  function stepUIFromBackend(be){ return Math.max(0, Math.min(3, Number(be)-1||0)); }   // 0..3
  function labelFrom(slug){
    return {confirmado:'En confirmación', en_preparacion:'Preparando', en_camino:'En camino', entregado:'Entregado', cancelado:'Cancelado'}[slug] || 'Pendiente';
  }
  function setMeta(txt){ const el=document.getElementById('meta_pedido'); if(el) el.textContent=txt; }

  async function fetchJSON(u){
    const url = new URL(u, location.href);
    url.searchParams.set('id', id);
    url.searchParams.set('ts', Date.now()); // anti-cache
    const res = await fetch(url.toString(), { cache:'no-store' });
    const txt = await res.text();
    return JSON.parse(txt);
  }
  function normalize(resp){
    if (resp?.pedido){
      const slug = normEstado(resp.pedido.estado);
      const step = (typeof resp.pedido.estado_step==='number') ? stepUIFromBackend(resp.pedido.estado_step) : stepUIFromSlug(slug);
      return { ok:true, id: resp.pedido.id_pedido||id, estado:slug, label: labelFrom(slug), step };
    }
    if (resp?.ok){
      const slug = normEstado(resp.estado);
      const step = (typeof resp.estado_step==='number') ? stepUIFromBackend(resp.estado_step) : stepUIFromSlug(slug);
      return { ok:true, id: resp.id||id, estado:slug, label: labelFrom(slug), step };
    }
    return null;
  }

  function render(data){
    setMeta(`Pedido #${data.id} — ${data.label}`);
    PASOS.forEach((p,i)=>{
      const el = document.getElementById(p.id);
      if(!el) return;
      el.classList.toggle('hecho',  i < data.step);
      el.classList.toggle('activo', i === data.step);
      const t = el.querySelector('.step-time');
      if (t) t.textContent = (i < data.step) ? 'Hecho' : (i === data.step ? 'En curso' : 'Pendiente');
    });
    const bar = document.getElementById('tracking-line-progress');
    if (bar) bar.style.width = `${(data.step/3)*100}%`;

    // Si el pedido terminó, limpiar el "último pedido" del cliente para que no quede colgado
    if (data.estado === 'entregado' || data.estado === 'cancelado'){
      try{ localStorage.removeItem('lastOrder'); localStorage.removeItem('lastOrderId'); }catch{}
    } else {
      // refrescar timestamp para extender su vigencia mientras el cliente mira el estado
      try{ localStorage.setItem('lastOrder', JSON.stringify({ id: data.id, ts: Date.now() })); }catch{}
    }
  }

  async function load(){
    if(!id){ setMeta('Falta ?id='); return; }
    for (const u of ENDPOINTS){
      try{
        const r = await fetchJSON(u);
        const n = normalize(r);
        if(n?.ok){ render(n); return; }
      }catch{/* intenta el siguiente */}
    }
    setMeta('No se pudo cargar el estado');
  }

  // Primera carga + sondeo cada 2s
  load();
  let timer = setInterval(load, 2000);

  // Refrescar inmediato al volver a la pestaña
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });

  // Limpieza
  window.addEventListener('beforeunload', ()=> clearInterval(timer));
})();
