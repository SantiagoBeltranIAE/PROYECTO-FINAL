// ===== Estado de pedido (cliente) =====

// Ajustá la ruta si tu backend está en otra carpeta:
// desde /fronted-mejor/estado.html -> /backend/pedidos/estado_publico.php
const API_PUBLICA = "../backend/pedidos/estado_publico.php";

// Normaliza los estados del admin a los 4 pasos visuales
const NORMALIZA = {
  nuevo: "confirmado",
  confirmado: "confirmado",
  aceptado: "confirmado",
  en_preparacion: "en_preparacion",
  en_camino: "en_camino",
  entregado: "entregado",
  cancelado: "cancelado",
};

const PASOS = [
  { key: "confirmado",     el: "#paso_confirmado",  timeEl: "#hora_confirmado" },
  { key: "en_preparacion", el: "#paso_preparacion", timeEl: "#hora_preparacion" },
  { key: "en_camino",      el: "#paso_camino",      timeEl: "#hora_camino" },
  { key: "entregado",      el: "#paso_entregado",   timeEl: "#hora_entregado" },
];

let timer = null;

function getParams() {
  const q = new URLSearchParams(location.search);
  return { code: q.get("code") || null, id: q.get("id") || null };
}

async function cargarEstado() {
  const { code, id } = getParams();
  if (!code && !id) {
    setMeta("Falta el código (?code=) o el id (?id=)");
    return;
  }
  const url = new URL(API_PUBLICA, location.href);
  if (code) url.searchParams.set("code", code);
  if (id)   url.searchParams.set("id_pedido", id);

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) { setMeta("No encontramos el pedido"); return; }
    const data = await r.json();
    pintar(data);
  } catch {
    // silencio, reintenta en el próximo tick
  }
}

function setMeta(html) {
  const el = document.querySelector("#meta_pedido");
  if (el) el.innerHTML = html;
}

function pintar(data) {
  const p = data.pedido;
  const hist = data.historial || [];
  const track = p.tracking_code || p.id_pedido;

  setMeta(`N° de Pedido: <b>${track}</b> — Estado: <b>${p.estado}</b>`);

  const actual = NORMALIZA[p.estado] || "confirmado";

  // horitas desde historial
  const timeByKey = {};
  for (const h of hist) {
    const k = NORMALIZA[h.estado] || h.estado;
    if (!timeByKey[k]) timeByKey[k] = h.fecha_hora; // primera vez que pasó por ese estado
  }

  // reset clases + escribir horas
  PASOS.forEach(ps => {
    const node = document.querySelector(ps.el);
    const tEl  = document.querySelector(ps.timeEl);
    if (!node) return;
    node.classList.remove("hecho","activo");
    if (tEl) tEl.textContent = timeByKey[ps.key] ? toLocal(timeByKey[ps.key]) : "Pendiente";
  });

  // marcar hecho/activo
  const idxActual = PASOS.findIndex(x => x.key === actual);
  PASOS.forEach((ps, i) => {
    const node = document.querySelector(ps.el);
    if (!node) return;
    if (i < idxActual) node.classList.add("hecho");
    if (i === idxActual) node.classList.add("activo");
  });

  // ancho de la barra de progreso (0, 33, 66, 100 %)
  const w = Math.max(0, Math.min(100, idxActual * 33 + (idxActual === PASOS.length-1 ? 1 : 0)));
  const bar = document.querySelector("#tracking-line-progress");
  if (bar) bar.style.width = (idxActual <= 0 ? 0 : idxActual >= 3 ? 100 : idxActual*33) + "%";
}

function toLocal(str) {
  const d = new Date(str.replace(" ", "T"));
  return isNaN(d) ? str : d.toLocaleTimeString();
}

// primer carga + polling
cargarEstado();
timer = setInterval(cargarEstado, 5000);
window.addEventListener("beforeunload", () => clearInterval(timer));

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
