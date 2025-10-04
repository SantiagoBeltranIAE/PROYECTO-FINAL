document.addEventListener('DOMContentLoaded', function () {
    function cargarOpiniones() {
        fetch('php/mostrar_opiniones.php')
            .then(response => response.text())
            .then(html => {
                document.getElementById('opiniones-list').innerHTML = html;
            });
    }
    cargarOpiniones();

    // Enviar opinión
    document.getElementById('form-opinion').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch('php/guardar_opinion.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(res => {
                if (res.trim() === "ok") {
                    this.reset();
                    cargarOpiniones();
                } else {
                    alert("Error al guardar la opinión. Completa todos los campos.");
                }
            });
    });

    // Estrellas interactivas (solo 5, sin medias)
    const starContainer = document.getElementById('star-rating');
    const ratingInput = document.getElementById('rating');
    let currentRating = 0;

    function paintStars(value) {
        const stars = starContainer.querySelectorAll('.fa-star');
        stars.forEach((star, idx) => {
            if (idx < value) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    starContainer.addEventListener('mousemove', function (e) {
        if (e.target.classList.contains('fa-star')) {
            const value = parseInt(e.target.getAttribute('data-value'));
            paintStars(value);
        }
    });

    starContainer.addEventListener('mouseleave', function () {
        paintStars(currentRating);
    });

    starContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('fa-star')) {
            currentRating = parseInt(e.target.getAttribute('data-value'));
            ratingInput.value = currentRating;
            paintStars(currentRating);
        }
    });

    currentRating = 0;
    paintStars(currentRating);
});

