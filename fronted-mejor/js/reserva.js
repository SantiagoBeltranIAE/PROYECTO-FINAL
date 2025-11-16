document.addEventListener('DOMContentLoaded', function () {
  // Inicializar flatpickr para hora
  flatpickr("#hora", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    minTime: "11:00",
    maxTime: "23:00"
  });

  // Configurar fecha mínima (hoy)
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.setAttribute('min', hoy);
  }

  // Manejar envío del formulario
  const form = document.getElementById('reservaForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validar formulario
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      
      // Recoger datos
      const formData = new FormData();
      formData.append('action', 'crear');
      formData.append('nombre', document.getElementById('nombre').value.trim());
      formData.append('telefono', document.getElementById('telefono').value.trim());
      formData.append('email', document.getElementById('email').value.trim());
      formData.append('fecha', document.getElementById('fecha').value);
      formData.append('hora', document.getElementById('hora').value);
      formData.append('personas', document.getElementById('personas').value);
      formData.append('comentarios', document.getElementById('comentarios').value.trim());
      
      try {
        const response = await fetch('./php/backend/controllers/reservas.php', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.ok) {
          alert(result.msg || '¡Reserva enviada exitosamente!');
          form.reset();
          form.classList.remove('was-validated');
        } else {
          alert(result.msg || 'Error al enviar la reserva');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la reserva. Por favor, intenta de nuevo.');
      }
    });
  }
});