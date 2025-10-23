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

document.addEventListener('DOMContentLoaded', () => {
  const ID = new URLSearchParams(location.search).get('id') || new URLSearchParams(location.search).get('order');
  if (!ID) {
    document.getElementById('meta_pedido').textContent = 'ID de pedido faltante en la URL';
    return;
  }

  // probar varios endpoints (ajusta si tu ruta difiere)
  const ENDPOINTS = [
    `/PROYECTO-FINAL/backend/pedidos/status.php?id=${encodeURIComponent(ID)}`,
    `/PROYECTO-FINAL/backend/pedidos/estado_publico.php?id_pedido=${encodeURIComponent(ID)}`,
    `../backend/pedidos/status.php?id=${encodeURIComponent(ID)}`,
    `../backend/pedidos/estado_publico.php?id_pedido=${encodeURIComponent(ID)}`
  ];

  // mapeo de estados a step index (1..4)
  const STATE_MAP = {
    'pendiente': 1,
    'aceptado': 1,
    'aceptación': 1,
    'aceptado': 1,
    'en_preparacion': 2,
    'en_preparación': 2,
    'preparando': 2,
    'en_camino': 3,
    'en camino': 3,
    'camino': 3,
    'entregado': 4,
    'cancelado': -1
  };

  function setLoadingUI() {
    document.getElementById('meta_pedido').textContent = 'Cargando...';
    // por defecto mostrar primer paso (confirmado) como activo pero pendiente
    updateStepsUI(1, 'pendiente');
  }

  function updateStepsUI(stepIndex, estado, timestamps = {}) {
    // stepIndex: 1..4, -1 = cancelado
    const totalSteps = 4;
    const prog = document.getElementById('tracking-line-progress');
    const percent = (Math.max(0, Math.min(stepIndex, totalSteps)) - 1) / (totalSteps - 1) * 100;
    if (prog) prog.style.width = (isNaN(percent) ? '0%' : percent + '%');

    for (let i = 1; i <= totalSteps; i++) {
      const el = document.querySelector(`.tracking-step[data-step="${i}"]`);
      if (!el) continue;
      el.classList.remove('activo', 'hecho', 'cancelado');
      const timeEl = el.querySelector('.step-time');
      if (i < stepIndex) {
        el.classList.add('hecho');
        if (timeEl) timeEl.textContent = timestamps[i] ? timestamps[i] : 'Completado';
      } else if (i === stepIndex) {
        el.classList.add('activo');
        if (timeEl) timeEl.textContent = (estado && estado !== 'pendiente') ? capitalize(estado) : 'Pendiente';
      } else {
        if (timeEl) timeEl.textContent = 'Pendiente';
      }
    }

    if (stepIndex === -1) {
      // marcar todo como cancelado visualmente
      document.querySelectorAll('.tracking-step').forEach(s => s.classList.add('cancelado'));
      document.getElementById('meta_pedido').textContent = `Pedido ${ID} — Cancelado`;
    } else {
      const pretty = estado ? estado.replace(/_/g,' ') : 'Pendiente';
      document.getElementById('meta_pedido').textContent = `Pedido #${ID} — ${capitalize(pretty)}`;
    }
  }

  function capitalize(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1); }

  async function fetchStatus() {
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const j = await res.json();
        if (!j || j.ok === false) continue;

        // respuesta estándar esperada:
        // { ok:true, id:..., estado: 'en_camino', total:..., cliente:..., created_at:..., items: ... }
        const estadoRaw = (j.estado || j.status || '').toString().toLowerCase().trim();
        const estado = estadoRaw || 'pendiente';
        const idx = STATE_MAP[estado] ?? 1;

        // timestamps (si backend provee created_at u otros)
        const timestamps = {};
        if (j.created_at) timestamps[1] = j.created_at;
        if (j.hora_preparacion) timestamps[2] = j.hora_preparacion;
        if (j.hora_camino) timestamps[3] = j.hora_camino;
        if (j.hora_entregado) timestamps[4] = j.hora_entregado;

        updateStepsUI(idx, estado, timestamps);
        return; // ok
      } catch (e) {
        // intentar siguiente endpoint
      }
    }
    // si ninguno funcionó, mantener UI en estado inicial y mostrar mensaje discreto
    document.getElementById('meta_pedido').textContent = 'No encontramos el pedido';
    updateStepsUI(1, 'pendiente');
  }

  // inicio
  setLoadingUI();
  fetchStatus();
  setInterval(fetchStatus, 5000);
});
