document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('shippingInfo')) return location.replace('direccion.html');
  const go = m => { localStorage.setItem('paymentMethod', m); location.href = 'pago.html'; };
  document.getElementById('btn-efectivo')?.setAttribute('type','button');
  document.getElementById('btn-tarjeta') ?.setAttribute('type','button');
  document.getElementById('btn-efectivo')?.addEventListener('click', e=>{e.preventDefault(); go('efectivo');});
  document.getElementById('btn-tarjeta') ?.addEventListener('click', e=>{e.preventDefault(); go('tarjeta'); });
  document.querySelectorAll('[data-method]').forEach(el=>{
    el.addEventListener('click', e=>{
      const m = el.getAttribute('data-method');
      if (m==='efectivo'||m==='tarjeta'){ e.preventDefault(); go(m); }
    });
  });
});

function goToPage(page) {
    // Redirige al navegador a la página especificada
    window.location.href = page;
}

