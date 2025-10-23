document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('address-form');

  // Prefill si existe
  const saved = JSON.parse(localStorage.getItem('shippingInfo') || 'null');
  if (saved) {
    document.getElementById('nombre-completo').value = saved.nombre || '';
    document.getElementById('telefono').value = saved.telefono || '';
    document.getElementById('direccion').value = saved.direccion || '';
    document.getElementById('referencia').value = saved.referencia || '';
  }

  // Función de validación simple
  const validateForm = () => {
    let isFormValid = true;

    // Validar Nombre Completo
    const nombreInput = document.getElementById('nombre-completo');
    if (nombreInput.value.trim() === '') {
      nombreInput.classList.add('is-invalid');
      isFormValid = false;
    } else {
      nombreInput.classList.remove('is-invalid');
    }

    // Validar Teléfono (patrón HTML ya ayuda, pero revisamos que no esté vacío)
    const telefonoInput = document.getElementById('telefono');
    const phonePattern = /^[0-9]{8,15}$/;
    if (!phonePattern.test(telefonoInput.value.trim())) {
      telefonoInput.classList.add('is-invalid');
      isFormValid = false;
    } else {
      telefonoInput.classList.remove('is-invalid');
    }

    // Validar Dirección
    const direccionInput = document.getElementById('direccion');
    if (direccionInput.value.trim() === '') {
      direccionInput.classList.add('is-invalid');
      isFormValid = false;
    } else {
      direccionInput.classList.remove('is-invalid');
    }

    return isFormValid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!form.checkValidity() || !validateForm()) {
      form.classList.add('was-validated');
      return;
    }

    const shippingInfo = {
      nombre: document.getElementById('nombre-completo').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      referencia: document.getElementById('referencia').value.trim(),
    };

    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    window.location.href = 'metodo_de_pago.html';
  });
});