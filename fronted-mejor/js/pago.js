document.addEventListener('DOMContentLoaded', () => {

    // 1. Obtención de Elementos del DOM
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const paymentAmountDisplay = document.getElementById('payment-amount-display');
    const cardPaymentForm = document.getElementById('card-payment-form');
    
    // NUEVAS REFERENCIAS PARA EL LOADER Y BLUR
    const overlay = document.getElementById('payment-overlay');
    const body = document.body;
    
    // NUEVAS REFERENCIAS PARA LA NOTIFICACIÓN DE ÉXITO Y BOTONES
    const successNotification = document.getElementById('payment-success-notification');
    const dismissButton = document.getElementById('dismiss-success-notification');
    const viewStatusButton = document.getElementById('view-status-button'); // NUEVA REFERENCIA
    
    // Botones de Pago Rápido
    const applePayBtn = document.getElementById('apple-pay-btn');
    const paypalBtn = document.getElementById('paypal-btn');
    const googlePayBtn = document.getElementById('google-pay-btn');

    // 2. Funciones de Formato para la Tarjeta

    // Función para dar formato al Número de Tarjeta (XXXX XXXX XXXX XXXX)
    function formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número
        value = value.match(/.{1,4}/g)?.join(' ') || value; // Agrupa en bloques de 4
        e.target.value = value;
    }

    // Función para dar formato a la Fecha de Vencimiento (MM/AA)
    function formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número
        if (value.length > 2) {
            // Inserta el '/' después de los primeros 2 dígitos
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    // 3. Simulación de Carga del Monto Total
    function loadPaymentAmount() {
        const storedTotal = localStorage.getItem('mestizaCartTotal'); 
        let totalAmount = 0;
        
        if (storedTotal) {
            // Si hay total guardado, úsalo
            totalAmount = parseFloat(storedTotal).toFixed(2);
        } else {
            // Valor de respaldo si el total no existe
            totalAmount = '0.00'; 
        }
        
        // Asegúrate de que este ID existe en pago.html
        if (paymentAmountDisplay) {
            paymentAmountDisplay.textContent = '$' + totalAmount;
        }
    }

    // 4. Lógica de Eventos

    // Eventos de formato de input
    if (cardNumberInput) cardNumberInput.addEventListener('input', formatCardNumber);
    if (expiryDateInput) expiryDateInput.addEventListener('input', formatExpiryDate);

    // **********************************************
// FUNCIÓN NUEVA: Iniciar Tracking
// **********************************************
function startTracking() {
        localStorage.setItem('deliveryStatus', 'active');
        console.log("🚚 Tracking iniciado y guardado en localStorage.");
    }
    
    // Simular el proceso de pago con tarjeta
    if (cardPaymentForm) {
        cardPaymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const total = paymentAmountDisplay.textContent;

            // **********************************************
            // LÓGICA DE LOADER
            // **********************************************
            
            // 1. Muestra el loader y aplica el blur
            if (overlay && body) {
                overlay.classList.add('show');
                body.classList.add('is-loading');
            }

            // Simular un tiempo de procesamiento (por ejemplo, 3 segundos)
            setTimeout(() => {
                
                // Ocultar el loader
                if (overlay) {
                    overlay.classList.remove('show');
                }
                
                // **********************************************
                // LÓGICA DE NOTIFICACIÓN DE ÉXITO 
                // **********************************************
                
                // Mostrar el mensaje de éxito (el blur se mantiene)
                if (successNotification) {
                    // Oculta el modal de pago temporalmente
                    document.querySelector('.card-modal').style.display = 'none'; 
                    
                    // Muestra el mensaje de éxito
                    successNotification.style.display = 'flex';
                }
                
                  // **********************************************
                // INICIAR SEGUIMIENTO AQUÍ
                startTracking(); 
                // **********************************************
                
                // Limpiar formulario
                cardPaymentForm.reset();
                // **********************************************
                
            }, 3000); // 3000 milisegundos = 3 segundos
            // **********************************************
        });
    }

    // Lógica para el botón "Cerrar" - REDIRECCIONA A menu.html
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            // Limpiar el total del carrito al finalizar la compra
            localStorage.removeItem('mestizaCartTotal'); 
            // Redirigir a menu.html
            window.location.href = 'menu.html'; 
        });
    }

    // Lógica para el botón "Ver Estado" - REDIRECCIONA A estado.html
    if (viewStatusButton) {
        viewStatusButton.addEventListener('click', () => {
            // Limpiar el total del carrito al finalizar la compra
            localStorage.removeItem('mestizaCartTotal'); 
            // Redirigir a estado.html
            window.location.href = 'estado.html'; 
        });
    }

  // **********************************************
    // FUNCIÓN PARA LIMPIEZA COMPLETA DEL CARRITO
    // **********************************************
    function clearCartData() {
        // 1. Limpia el total guardado del carrito
        localStorage.removeItem('mestizaCartTotal'); 
        // 2. Limpia los ítems reales del carrito (ASUMIMOS la clave 'cartItems')
        localStorage.removeItem('cartItems'); 
        console.log("✅ Carrito (cartItems y mestizaCartTotal) limpiado de localStorage.");
    }
    
    // Lógica para los botones de pago rápido (Mantener lógica de alerts)
    if (applePayBtn) {
        applePayBtn.addEventListener('click', () => {
            alert('Proceso de pago de Apple Pay iniciado. Redirigiendo...');
            // window.location.href = 'url-de-apple-pay'; // Redirección real
        });
    }
    if (paypalBtn) {
        paypalBtn.addEventListener('click', () => {
            alert('Proceso de pago de PayPal iniciado. Redirigiendo...');
            // window.location.href = 'url-de-paypal'; // Redirección real
        });
    }
    if (googlePayBtn) {
        googlePayBtn.addEventListener('click', () => {
            alert('Proceso de pago de Google Pay iniciado. Redirigiendo...');
            // window.location.href = 'url-de-google-pay'; // Redirección real
        });
    }

    // Iniciar la carga del monto
    loadPaymentAmount();
});