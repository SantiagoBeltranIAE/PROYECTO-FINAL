document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 1. DATA (Tarjetas Válidas y Parámetros de Validación)
    // ----------------------------------------------------
    const VALID_CARDS = [
        // Nombres de titular asignados según la solicitud
        { number: '5031755734530604', brand: 'Mastercard', logo: 'imagenes/mastercard.png', expiry: '12/28', cvc: '582', holder: 'Pedro Menendez' },
        { number: '4509953566233704', brand: 'Visa', logo: 'imagenes/visa.png', expiry: '12/30', cvc: '395', holder: 'Mariano Bastarreix' },
        { number: '4213016314706756', brand: 'Visa', logo: 'imagenes/visa.png', expiry: '12/26', cvc: '194', holder: 'Diego Comunales' }
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
    const cvvFeedback = document.getElementById('cvv-feedback'); // ¡NUEVA REFERENCIA!

    // REFERENCIAS PARA EL LOADER
    const overlay = document.getElementById('payment-overlay');
    const body = document.body;
    
    // REFERENCIAS PARA LA NOTIFICACIÓN DE ÉXITO
    const successNotification = document.getElementById('payment-success-notification');
    const dismissButton = document.getElementById('dismiss-success-notification');

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

    // FUNCIÓN: formatea, valida y muestra el logo.
    function formatAndValidateCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, ''); 
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
                if (cardLogoSpan) {
                    cardLogoSpan.innerHTML = `<img src="./${matchingCard.logo}" alt="${matchingCard.brand} Logo" style="width: 30px; height: auto;">`;
                }
                showFeedback(cardNumberFeedback, cardNumberInput, '', true);
                return;
            } else {
                showFeedback(cardNumberFeedback, cardNumberInput, '', true);
                return;
            }
        }
        
        showFeedback(cardNumberFeedback, cardNumberInput, '', true);
    }

    /**
     * FUNCIÓN: formatea y valida la fecha de vencimiento.
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

    // FUNCIÓN: Iniciar Tracking
    function startTracking() {
        localStorage.setItem('deliveryStatus', 'active');
        console.log("🚚 Tracking iniciado y guardado en localStorage.");
    }

    // FUNCIÓN: Limpieza del carrito al finalizar
    function clearCartData() {
        localStorage.removeItem('mestizaCart'); 
        localStorage.removeItem('mestizaCartTotal'); 
        console.log("✅ Carrito limpiado de localStorage.");
    }
    
    // Simular el proceso de pago con tarjeta
    if (cardPaymentForm) {
        cardPaymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // --- 1. VALIDACIÓN FINAL DE TODOS LOS CAMPOS ---
            let isFormValid = true;
            
            // Limpiar feedback de errores antes de revalidar
            showFeedback(cvvFeedback, cvvInput, '', true);
            cardHolderNameInput.classList.remove('is-invalid');
            cardHolderNameInput.nextElementSibling && (cardHolderNameInput.nextElementSibling.textContent = '');
            
            // Buscar la tarjeta coincidente (Tarjeta Principal)
            const rawCardNumber = cardNumberInput.value.replace(/\s/g, '');
            const matchingCard = validateCardNumber(rawCardNumber);
            
            if (!matchingCard) {
                showFeedback(cardNumberFeedback, cardNumberInput, 'El número de tarjeta no es válido o no está en la lista permitida.', false);
                isFormValid = false;
            } else {
                showFeedback(cardNumberFeedback, cardNumberInput, '', true);

                // ** A. VALIDACIÓN DE NOMBRE DEL TITULAR ÚNICO **
                const enteredHolder = cardHolderNameInput.value.trim();
                // Normalizamos el nombre para comparación (quitamos mayúsculas/minúsculas)
                const normalizedEnteredHolder = enteredHolder.toLowerCase().trim();
                const normalizedCardHolder = matchingCard.holder.toLowerCase().trim();
                
                if (matchingCard.holder && normalizedEnteredHolder !== normalizedCardHolder) {
                    // Usar el mensaje de error de Bootstrap (ya que no tienes un div de feedback específico)
                    cardHolderNameInput.classList.add('is-invalid');
                    // Mostrar el nombre correcto para debug
                    // Nota: Asumiendo que has añadido un div de feedback después del input de nombre
                    if (cardHolderNameInput.nextElementSibling && cardHolderNameInput.nextElementSibling.classList.contains('invalid-feedback')) {
                        cardHolderNameInput.nextElementSibling.textContent = `Debe ser '${matchingCard.holder}' para esta tarjeta.`;
                        cardHolderNameInput.nextElementSibling.style.display = 'block';
                    }
                    isFormValid = false;
                } else {
                    cardHolderNameInput.classList.remove('is-invalid');
                    if (cardHolderNameInput.nextElementSibling && cardHolderNameInput.nextElementSibling.classList.contains('invalid-feedback')) {
                        cardHolderNameInput.nextElementSibling.style.display = 'none';
                    }
                }

                // ** B. VALIDACIÓN DE CVC ÚNICO **
                const enteredCvc = cvvInput.value.trim();
                if (matchingCard.cvc && enteredCvc !== matchingCard.cvc) {
                    showFeedback(cvvFeedback, cvvInput, 'El CVC/CVV es incorrecto para esta tarjeta.', false);
                    isFormValid = false;
                } else {
                    showFeedback(cvvFeedback, cvvInput, '', true);
                }

                // ** C. VALIDACIÓN DE VENCIMIENTO ÚNICO **
                // (Mantenemos la validación general de fecha más adelante, pero validamos la coincidencia con la tarjeta de la lista)
                const enteredExpiry = expiryDateInput.value.trim();
                if (matchingCard.expiry && enteredExpiry !== matchingCard.expiry) {
                    showFeedback(expiryDateFeedback, expiryDateInput, 'La fecha de vencimiento ingresada no coincide con la tarjeta proporcionada.', false);
                    isFormValid = false;
                }
            }
            
            // D. Validación de formato y expiración general de Fecha de Vencimiento
            const isDateFormatValid = validateAndFormatExpiryDate({ target: expiryDateInput });
            if (!isDateFormatValid) isFormValid = false;
            
            // E. Validación de longitud de CVV (3 dígitos)
            if (cvvInput.value.length !== 3) {
                // Sobrescribe el error de CVC incorrecto si la longitud es el problema.
                showFeedback(cvvFeedback, cvvInput, 'El CVC/CVV debe tener 3 dígitos.', false);
                isFormValid = false;
            } 

            // F. Validación de campo Nombre Titular no vacío
            if (cardHolderNameInput.value.trim() === '') {
                cardHolderNameInput.classList.add('is-invalid');
                // Si ya tiene un mensaje de error por coincidencia, no lo sobrescribe.
                if (cardHolderNameInput.nextElementSibling && cardHolderNameInput.nextElementSibling.textContent === '') {
                     cardHolderNameInput.nextElementSibling.textContent = 'Este campo no puede estar vacío.';
                     cardHolderNameInput.nextElementSibling.style.display = 'block';
                }
                isFormValid = false;
            }


            // --- 2. PROCESO DE PAGO SIMULADO (Si es válido) ---
            if (!isFormValid) {
                // ... [Manejo de scroll a error] ...
                return; 
            }

            // 1. Muestra el loader usando la clase 'show' del CSS y añade la clase al body para el blur
            if (overlay) {
                overlay.classList.add('show');
                document.body.classList.add('is-loading'); // Añadir la clase para el blur en el body
            }
            
            // Simular un tiempo de procesamiento (3 segundos)
            setTimeout(() => {
                
                // 2. Ocultar el loader
                if (overlay) {
                    overlay.classList.remove('show');
                    document.body.classList.remove('is-loading'); // Eliminar la clase del body
                }

                // 3. Oculta el modal de pago y muestra el mensaje de éxito
                document.querySelector('.card-modal').style.display = 'none'; 
                if (successNotification) {
                    successNotification.style.display = 'flex';
                }
                
                // ... [Limpieza de datos y tracking] ...
                
            }, 3000); 
        });
    }

    // Lógica para el botón "Cerrar" - REDIRECCIONA A menu.html
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            window.location.href = 'menu.html'; 
        });
    }
    // Iniciar la carga del monto
    loadPaymentAmount();
});