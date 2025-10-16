document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 1. DATA (Tarjetas Válidas y Parámetros de Validación)
    // ----------------------------------------------------
    const VALID_CARDS = [
        // Las tarjetas deben guardarse sin espacios para la validación
        { number: '5031755734530604', brand: 'Mastercard', logo: 'imagenes/mastercard.png' },
        { number: '4509953566233704', brand: 'Visa', logo: 'imagenes/visa.png' },
        { number: '4213016314706756', brand: 'Visa', logo: 'imagenes/visa.png' }
    ];

    // *IMPORTANTE*: Parámetros de la fecha actual (Octubre de 2025)
    const CURRENT_YEAR_LAST_TWO_DIGITS = 25; 
    const CURRENT_MONTH = 10; 
    
    // ----------------------------------------------------
    // 2. Obtención de Elementos del DOM
    // ----------------------------------------------------
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const cardHolderNameInput = document.getElementById('card-holder-name');
    
    const paymentAmountDisplay = document.getElementById('payment-amount-display');
    const cardPaymentForm = document.getElementById('card-payment-form');
    
    // Referencias para el logo y mensajes de error (feedback)
    const cardLogoSpan = document.getElementById('card-logo');
    const cardNumberFeedback = document.getElementById('card-number-feedback');
    const expiryDateFeedback = document.getElementById('expiry-date-feedback');

    // NUEVAS REFERENCIAS PARA EL LOADER Y BLUR
    const overlay = document.getElementById('payment-overlay');
    const body = document.body;
    
    // NUEVAS REFERENCIAS PARA LA NOTIFICACIÓN DE ÉXITO Y BOTONES
    const successNotification = document.getElementById('payment-success-notification');
    const dismissButton = document.getElementById('dismiss-success-notification');
    // El botón 'Ver Estado' ya tiene 'onclick' en el HTML.

    // Botones de Pago Rápido
    const applePayBtn = document.getElementById('apple-pay-btn');
    const paypalBtn = document.getElementById('paypal-btn');
    const googlePayBtn = document.getElementById('google-pay-btn');

    // ----------------------------------------------------
    // 3. Funciones de Validaciones y Formato
    // ----------------------------------------------------

    // Helper para mostrar mensajes de error/éxito
    function showFeedback(element, inputElement, message, isValid = true) {
        element.textContent = message;
        if (isValid) {
            element.style.display = 'none';
            inputElement.classList.remove('is-invalid');
        } else {
            element.style.display = 'block';
            inputElement.classList.add('is-invalid');
        }
    }

    /**
     * Valida si el número de tarjeta coincide con las tarjetas permitidas.
     * @param {string} rawNumber - El número de tarjeta sin espacios.
     * @returns {object|null} El objeto de tarjeta si es válida, o null.
     */
    function validateCardNumber(rawNumber) {
        const cleanedNumber = rawNumber.replace(/\s/g, '');
        if (cleanedNumber.length !== 16) return null;
        
        return VALID_CARDS.find(card => card.number === cleanedNumber);
    }
    
    // Detecta la marca por el/los primeros dígitos
    function detectCardBrand(cleanedNumber) {
        if (!cleanedNumber || cleanedNumber.length === 0) return null;
        if (cleanedNumber.startsWith('4')) return { brand: 'Visa', logo: 'imagenes/visa.png' };
        if (cleanedNumber.startsWith('5')) return { brand: 'Mastercard', logo: 'imagenes/mastercard.png' };
        return null;
    }

    // FUNCIÓN MODIFICADA: Ahora formatea, valida y muestra el logo.
    function formatAndValidateCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, ''); // Elimina espacios y no dígitos
        let formattedValue = '';
        
        // Formato: Añadir espacio cada 4 dígitos
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue;
        
        const cleanedNumber = value.substring(0, 16);

        // Mostrar logo según el primer dígito mientras escribe
        const detected = detectCardBrand(cleanedNumber);
        if (detected && cardLogoSpan) {
            cardLogoSpan.innerHTML = `<img src="./${detected.logo}" alt="${detected.brand} Logo" style="width: 30px; height: auto;">`;
        } else if (cardLogoSpan) {
            cardLogoSpan.innerHTML = '';
        }
        
        // Si el número está completo (16 dígitos) intentamos validación exacta contra la lista
        if (cleanedNumber.length === 16) {
            const matchingCard = validateCardNumber(cleanedNumber);

            if (matchingCard) {
                // Si coincide exactamente con una tarjeta permitida, usamos su logo (si difiere)
                if (cardLogoSpan) {
                    cardLogoSpan.innerHTML = `<img src="./${matchingCard.logo}" alt="${matchingCard.brand} Logo" style="width: 30px; height: auto;">`;
                }
                showFeedback(cardNumberFeedback, cardNumberInput, '', true);
                return;
            } else {
                // número completo pero no en la lista: dejamos el logo por prefijo y no mostramos error aquí
                showFeedback(cardNumberFeedback, cardNumberInput, '', true);
                return;
            }
        }
        
        // Limpiamos errores mientras el usuario escribe; la validación final ocurre en submit.
        showFeedback(cardNumberFeedback, cardNumberInput, '', true);
    }

    /**
     * FUNCIÓN MODIFICADA: Ahora formatea y valida la fecha de vencimiento.
     * @param {Event} e - Evento de input o nulo si se llama desde el submit.
     * @returns {boolean} True si la fecha es válida, false en caso contrario.
     */
    function validateAndFormatExpiryDate(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, ''); 

        // Formato MM/AA
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else if (value.length === 2 && !input.value.includes('/')) {
            value += '/';
        }
        
        input.value = value.substring(0, 5); 

        // Validamos cuando está completo en formato "MM/AA" => longitud 5
        if (input.value.length === 5) {
            const [monthStr, yearStr] = input.value.split('/');
            const month = parseInt(monthStr, 10);
            const year = parseInt(yearStr, 10);

            let isValid = true;
            let message = '';

            if (month < 1 || month > 12 || monthStr.length !== 2) {
                isValid = false;
                message = 'Mes inválido. Formato debe ser MM/AA.';
            } else if (year < CURRENT_YEAR_LAST_TWO_DIGITS) {
                isValid = false;
                message = `El año de vencimiento ('${year}') no puede ser anterior a '${CURRENT_YEAR_LAST_TWO_DIGITS}'.`;
            } else if (year === CURRENT_YEAR_LAST_TWO_DIGITS) {
                if (month < CURRENT_MONTH) {
                    isValid = false;
                    message = `La tarjeta está vencida. El mes debe ser ${CURRENT_MONTH} o superior para el año ${CURRENT_YEAR_LAST_TWO_DIGITS}.`;
                }
            }

            if (!isValid) {
                showFeedback(expiryDateFeedback, input, message, false);
                return false;
            } else {
                showFeedback(expiryDateFeedback, input, '', true);
                return true;
            }
        } else {
            showFeedback(expiryDateFeedback, input, '', true);
            return false;
        }
    }

    // ----------------------------------------------------
    // 4. Lógica de Carga y Eventos
    // ----------------------------------------------------

    // Cargar total desde localStorage
    function loadPaymentAmount() {
        const storedTotal = localStorage.getItem('mestizaCartTotal'); 
        let totalAmount = '0.00'; 
        
        if (storedTotal) {
            totalAmount = parseFloat(storedTotal).toFixed(2);
        }
        
        if (paymentAmountDisplay) {
            paymentAmountDisplay.textContent = '$' + totalAmount;
        }
    }

    // Eventos de input
    if (cardNumberInput) cardNumberInput.addEventListener('input', formatAndValidateCardNumber);
    if (expiryDateInput) expiryDateInput.addEventListener('input', validateAndFormatExpiryDate);

    // FUNCIÓN NUEVA: Iniciar Tracking
    function startTracking() {
        localStorage.setItem('deliveryStatus', 'active');
        console.log("🚚 Tracking iniciado y guardado en localStorage.");
    }

    // FUNCIÓN MODIFICADA: Limpieza del carrito al finalizar
    function clearCartData() {
        // Limpia los ítems reales del carrito (key de menu.js)
        localStorage.removeItem('mestizaCart'); 
        // Limpia el total guardado
        localStorage.removeItem('mestizaCartTotal'); 
        console.log("✅ Carrito (mestizaCart y mestizaCartTotal) limpiado de localStorage.");
    }
    
    // Simular el proceso de pago con tarjeta
    if (cardPaymentForm) {
        cardPaymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // --- 1. VALIDACIÓN FINAL DE TODOS LOS CAMPOS ---
            let isFormValid = true;

            // a) Número de Tarjeta
            const rawCardNumber = cardNumberInput.value.replace(/\s/g, '');
            const matchingCard = validateCardNumber(rawCardNumber);
            
            if (!matchingCard) {
                showFeedback(cardNumberFeedback, cardNumberInput, 'El número de tarjeta no es válido o no está en la lista permitida.', false);
                isFormValid = false;
            } else {
                showFeedback(cardNumberFeedback, cardNumberInput, '', true);
            }
            
            // b) Fecha de Vencimiento
            // Forzamos la validación final llamando a la función con el valor actual
            const isDateValid = validateAndFormatExpiryDate({ target: expiryDateInput });
            if (!isDateValid) isFormValid = false;

            // c) CVV
            if (cvvInput.value.length !== 3) {
                cvvInput.classList.add('is-invalid');
                isFormValid = false;
            } else {
                cvvInput.classList.remove('is-invalid');
            }

            // d) Nombre del Titular
            if (cardHolderNameInput.value.trim() === '') {
                cardHolderNameInput.classList.add('is-invalid');
                isFormValid = false;
            } else {
                cardHolderNameInput.classList.remove('is-invalid');
            }


            if (!isFormValid) {
                // Desplazar a la primera validación fallida
                const firstInvalid = cardPaymentForm.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return; // Detener la ejecución si no es válido
            }

            // --- 2. PROCESO DE PAGO SIMULADO (Si es válido) ---
            
            // 1. Muestra el loader y aplica el blur (asumiendo que .is-loading está en tu CSS)
            if (overlay && body) {
                overlay.style.display = 'flex'; // Usamos display: flex para mostrar el overlay
            }
            
            // Simular un tiempo de procesamiento (3 segundos)
            setTimeout(() => {
                
                // Ocultar el loader
                if (overlay) {
                    overlay.style.display = 'none';
                }

                // Oculta el modal de pago y muestra el mensaje de éxito
                document.querySelector('.card-modal').style.display = 'none'; 
                if (successNotification) {
                    successNotification.style.display = 'flex';
                }
                
                // Limpiar datos y empezar el tracking
                clearCartData();
                startTracking(); 
                
                // Limpiar formulario para el próximo uso
                cardPaymentForm.reset();
                
            }, 3000); 
        });
    }

    // Lógica para el botón "Cerrar" - REDIRECCIONA A menu.html
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            window.location.href = 'menu.html'; 
        });
    }

    // Lógica para los botones de pago rápido (Mantener lógica de alerts)
    if (applePayBtn) {
        applePayBtn.addEventListener('click', () => {
            alert('Proceso de pago de Apple Pay iniciado. Redirigiendo...');
        });
    }
    if (paypalBtn) {
        paypalBtn.addEventListener('click', () => {
            alert('Proceso de pago de PayPal iniciado. Redirigiendo...');
        });
    }
    if (googlePayBtn) {
        googlePayBtn.addEventListener('click', () => {
            alert('Proceso de pago de Google Pay iniciado. Redirigiendo...');
        });
    }

    // Iniciar la carga del monto
    loadPaymentAmount();
});
