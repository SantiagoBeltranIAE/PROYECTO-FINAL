document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  // Cargar eventos desde el backend
  let eventosBackend = [];
  try {
    const response = await fetch('/PROYECTO-FINAL/admin/backend/calendario/list.php?action=publico');
    if (response.ok) {
      eventosBackend = await response.json();
    }
  } catch (error) {
    console.error('Error cargando eventos:', error);
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    navLinks: false,
    selectable: false,
    dayMaxEvents: true,
    events: eventosBackend,
    eventClick: function (info) {
      alert('Evento: ' + info.event.title);
    },
  });

  calendar.render();
});