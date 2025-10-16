document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('address-form');

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

        if (validateForm()) {
            // Recolectar datos
            const shippingData = {
                nombre: document.getElementById('nombre-completo').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                referencia: document.getElementById('referencia').value.trim(),
            };

            // Guardar datos en LocalStorage (opcional, pero útil para la siguiente página)
            localStorage.setItem('mestizaShippingData', JSON.stringify(shippingData));
            
            // Redirigir a la página de método de pago
            window.location.href = 'metodo_de_pago.html';
        } else {
            // Si la validación falla, podemos hacer scroll al primer campo con error
            document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});