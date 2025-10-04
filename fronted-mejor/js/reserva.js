document.addEventListener('DOMContentLoaded', function () {
  flatpickr("#hora", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true
    });
});