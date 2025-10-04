document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

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
    events: [
      {
        title: 'Noche de Jazz',
        start: new Date().toISOString().split('T')[0], // Evento para hoy
      },
      {
        title: 'Promoción 2x1 en hamburguesas',
        start: '2025-07-20',
      },
      {
        title: 'Cata de vinos',
        start: '2025-07-25',
        end: '2025-07-27',
      },
    ],
    eventClick: function (info) {
      alert('Evento: ' + info.event.title);
    },
  });

  calendar.render();
});

// Mostrar la fecha actual en tiempo real
const calendario = document.getElementById('calendario');

setInterval(() => {
  const fecha = new Date();
  calendario.innerHTML = fecha.toLocaleString(); // Muestra la fecha y hora actual
}, 1000);