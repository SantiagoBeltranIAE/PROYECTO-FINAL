document.addEventListener('DOMContentLoaded', () => {
  // Enforce flujo: si no hay dirección, volver
  const shipping = localStorage.getItem('shippingInfo');
  if (!shipping) {
    window.location.replace('direccion.html');
    return;
  }

  // Prefill si ya había selección
  const savedMethod = localStorage.getItem('paymentMethod');
  if (savedMethod) {
    const radio = document.querySelector(`input[name="metodoPago"][value="${savedMethod}"]`);
    if (radio) radio.checked = true;
  }

  const form = document.getElementById('payment-form');
  const error = document.getElementById('payment-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const selected = document.querySelector('input[name="metodoPago"]:checked');
    if (!selected) {
      error.style.display = 'block';
      return;
    }
    error.style.display = 'none';
    localStorage.setItem('paymentMethod', selected.value);
    window.location.href = 'pago.html';
  });
});