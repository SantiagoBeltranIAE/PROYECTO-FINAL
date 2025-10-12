document.addEventListener('DOMContentLoaded', () => {

    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4')
    ];

    const progressBar = document.getElementById('tracking-line-progress');

    // El tiempo en milisegundos para avanzar un paso (10 segundos)
    const INTERVAL_TIME = 5000;

    // El número total de pasos
    const TOTAL_STEPS = steps.length;

    // El índice del paso actual (comienza en 0)
    let currentStepIndex = 0;

    /**
     * Obtiene la hora actual en formato HH:MM AM/PM o el formato deseado
     * @returns {string} La hora formateada.
     */
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        // Puedes usar un formato más simple si solo quieres HH:MM
        return `${hours}:${minutes} PM`;
    }

    /**
     * Avanza el estado del pedido al siguiente paso.
     */
    function advanceStep() {
        if (currentStepIndex < TOTAL_STEPS) {

            // 1. Desactivar el paso anterior (si existe)
            if (currentStepIndex > 0) {
                const previousStep = steps[currentStepIndex - 1];
                previousStep.classList.remove('active');
                previousStep.classList.add('completed');
            }

            // 2. Activar el paso actual
            const currentStepElement = steps[currentStepIndex];
            currentStepElement.classList.add('active');

            // 3. Actualizar la hora en el paso actual
            const timeDisplay = currentStepElement.querySelector('.step-time');
            if (timeDisplay) {
                timeDisplay.textContent = getCurrentTime();
            }

            // 4. Actualizar la barra de progreso
            // Los pasos van de 0 a 3. El progreso debe calcularse con el índice actual.
            // Los valores de width son 0%, 33.3%, 66.6%, 100%
            const progressPercentage = (currentStepIndex / (TOTAL_STEPS - 1)) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            currentStepIndex++;

        } else {
            // Si ya no hay más pasos, detener la simulación
            clearInterval(trackingInterval);
            // El último paso (Entregado) debe ser "completed"
            steps[TOTAL_STEPS - 1].classList.remove('active');
            steps[TOTAL_STEPS - 1].classList.add('completed');
            localStorage.removeItem('deliveryStatus'); // <--- ¡AÑADIDO!

            console.log("¡Pedido entregado! Tracking eliminado.");
        }
    }

    // --- Lógica Principal ---

    // Iniciar el seguimiento inmediatamente
    advanceStep();

    // Configurar el intervalo para avanzar cada 10 segundos
    const trackingInterval = setInterval(advanceStep, INTERVAL_TIME);

});