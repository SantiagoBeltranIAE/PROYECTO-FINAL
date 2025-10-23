// fronted-mejor/js/pago.js —  conectada al backend
document.addEventListener('DOMContentLoaded', () => {

  // ===========================
  // 1) CONFIG / CONSTANTES
  // ===========================
  // Endpoint del backend que Crea el pedido
  const API_CREAR = "./php/routes/api.php?action=crear_pedido";

  const VALID_CARDS = [
    { number: '5031755734530604', brand: 'Mastercard', logo: 'imagenes/mastercard.png', expiry: '12/28', cvc: '582', holder: 'Pedro Menendez' },
    { number: '4509953566233704', brand: 'Visa',       logo: 'imagenes/visa.png',       expiry: '12/30', cvc: '395', holder: 'Mariano Bastarreix' },
    { number: '4213016314706756', brand: 'Visa',       logo: 'imagenes/visa.png',       expiry: '12/26', cvc: '194', holder: 'Diego Comunales' }
  ];
  // fecha de referencia para validación de vencimiento
  const CURRENT_YEAR_LAST_TWO_DIGITS = 25;
  const CURRENT_MONTH = 10;

  // ===========================
  // 2) DOM
  // ===========================
  const cardNumberInput      = document.getElementById('card-number');
  const expiryDateInput      = document.getElementById('expiry-date');
  const cvvInput             = document.getElementById('cvv');
  const cardHolderNameInput  = document.getElementById('card-holder-name');

  const paymentAmountDisplay = document.getElementById('payment-amount-display');
  const cardPaymentForm      = document.getElementById('card-payment-form');

  const cardLogoSpan         = document.getElementById('card-logo');
  const cardNumberFeedback   = document.getElementById('card-number-feedback');
  const expiryDateFeedback   = document.getElementById('expiry-date-feedback');
  const cvvFeedback          = document.getElementById('cvv-feedback');

  const overlay              = document.getElementById('payment-overlay');
  const successNotification  = document.getElementById('payment-success-notification');
  const dismissButton        = document.getElementById('dismiss-success-notification');

  const applePayBtn          = document.getElementById('apple-pay-btn');
  const paypalBtn            = document.getElementById('paypal-btn');
  const googlePayBtn         = document.getElementById('google-pay-btn');

  // ===========================
  // 3) HELPERS / VALIDACIONES
  // ===========================
  function showFeedback(element, inputElement, message, isValid = true) {
    element.textContent = message;
    if (isValid) {
      element.style.display = 'none';
      inputElement?.classList?.remove('is-invalid');
    } else {
      element.style.display = 'block';
      inputElement?.classList?.add('is-invalid');
    }
  }

  function validateCardNumber(rawNumber) {
    const cleanedNumber = rawNumber.replace(/\s/g, '');
    if (cleanedNumber.length !== 16) return null;
    return VALID_CARDS.find(card => card.number === cleanedNumber);
  }

  function detectCardBrand(cleanedNumber) {
    if (!cleanedNumber) return null;
    if (cleanedNumber.startsWith('4')) return { brand: 'Visa',       logo: 'imagenes/visa.png' };
    if (cleanedNumber.startsWith('5')) return { brand: 'Mastercard', logo: 'imagenes/mastercard.png' };
    return null;
  }

  function formatAndValidateCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    e.target.value = formattedValue;

    const cleaned = value.substring(0, 16);
    const detected = detectCardBrand(cleaned);
    if (detected && cardLogoSpan) {
      cardLogoSpan.innerHTML = `<img src="./${detected.logo}" alt="${detected.brand} Logo" style="width:30px;height:auto;">`;
    } else if (cardLogoSpan) {
      cardLogoSpan.innerHTML = '';
    }

    if (cleaned.length === 16) {
      const matchingCard = validateCardNumber(cleaned);
      if (matchingCard) {
        cardLogoSpan.innerHTML = `<img src="./${matchingCard.logo}" alt="${matchingCard.brand} Logo" style="width:30px;height:auto;">`;
      }
      showFeedback(cardNumberFeedback, cardNumberInput, '', true);
      return;
    }
    showFeedback(cardNumberFeedback, cardNumberInput, '', true);
  }

  function validateAndFormatExpiryDate(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else if (value.length === 2 && !input.value.includes('/')) {
      value += '/';
    }
    input.value = value.substring(0, 5);

    if (input.value.length === 5) {
      const [mm, yy] = input.value.split('/');
      const month = parseInt(mm, 10);
      const year  = parseInt(yy, 10);
      let ok = true, msg = '';

      if (mm.length !== 2 || month < 1 || month > 12) {
        ok = false; msg = 'Mes inválido. Formato MM/AA.';
      } else if (year < CURRENT_YEAR_LAST_TWO_DIGITS) {
        ok = false; msg = `El año no puede ser menor a '${CURRENT_YEAR_LAST_TWO_DIGITS}'.`;
      } else if (year === CURRENT_YEAR_LAST_TWO_DIGITS && month < CURRENT_MONTH) {
        ok = false; msg = `Tarjeta vencida para ${CURRENT_MONTH}/${CURRENT_YEAR_LAST_TWO_DIGITS}.`;
      }

      if (!ok) { showFeedback(expiryDateFeedback, input, msg, false); return false; }
      showFeedback(expiryDateFeedback, input, '', true);
      return true;
    } else {
      showFeedback(expiryDateFeedback, input, '', true);
      return false;
    }
  }

  function loadPaymentAmount() {
    const storedTotal = localStorage.getItem('mestizaCartTotal');
    const total = storedTotal ? parseFloat(storedTotal).toFixed(2) : '0.00';
    if (paymentAmountDisplay) paymentAmountDisplay.textContent = '$' + total;
  }

  function startTracking() {
    localStorage.setItem('deliveryStatus', 'active');
  }

  function clearCartData() {
    localStorage.removeItem('mestizaCart');
    localStorage.removeItem('mestizaCartTotal');
  }

  // Lee datos del cliente desde inputs si existen, o desde localStorage
  function leerCliente() {
    const nombreInp   = document.querySelector("#nombre");
    const telefonoInp = document.querySelector("#telefono");
    const dirInp      = document.querySelector("#direccion");

    const nombre    = (nombreInp?.value || localStorage.getItem('mestizaNombre')    || '').trim();
    const telefono  = (telefonoInp?.value || localStorage.getItem('mestizaTelefono')|| '').trim();
    const direccion = (dirInp?.value      || localStorage.getItem('mestizaDireccion')|| '').trim();

    return { nombre, telefono, direccion };
  }

  // Carrito: esperamos formato similar a: [{id_producto, cantidad}, ...]
  function leerCarrito() {
  // 1) candidatas de nombre de clave
  const KEYS = [
    'mestizaCart', 'carrito', 'cart', 'carritoItems', 'cartItems', 'items',
    'MESTIZA_CART', 'MESTIZA_ITEMS'
  ];

  // 2) helper: intenta parsear una clave y normalizar
  const parseKey = (store, key) => {
    try {
      const raw = store.getItem(key);
      if (!raw) return [];
      const val = JSON.parse(raw);

      // si viene un objeto con 'items'
      const arr = Array.isArray(val) ? val : (Array.isArray(val?.items) ? val.items : []);

      if (!Array.isArray(arr)) return [];

      return arr.map(it => {
        // id posible en varias formas
        const id =
          Number(it.id_producto ?? it.id ?? it.productoId ?? it.productId ?? it.pid ?? 0);

        // cantidad posible en varias formas
        const qty =
          Number(it.cantidad ?? it.qty ?? it.quantity ?? it.cant ?? it.contador ?? 1);

        return { id_producto: id, cantidad: qty };
      }).filter(x => x.id_producto > 0 && x.cantidad > 0);
    } catch {
      return [];
    }
  };

  // 3) probar primero claves “conocidas”
  for (const key of KEYS) {
    let items = parseKey(localStorage, key);
    if (items.length) return items;
    items = parseKey(sessionStorage, key);
    if (items.length) return items;
  }

  // 4) escaneo total (por si la clave tiene otro nombre)
  const scanStores = [localStorage, sessionStorage];
  for (const store of scanStores) {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key) continue;
      // ignorar totales/otros
      if (/total/i.test(key) || /precio/i.test(key) || /amount/i.test(key)) continue;
      const items = parseKey(store, key);
      if (items.length) return items;
    }
  }

  // 5) si no encontramos nada:
  console.warn('No encontré items en el storage. Claves disponibles:', {
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage)
  });
  return [];
}

  // --- insertar AHI (después de leerCarrito, antes de los eventos) ---
  async function crearPedidoEnServidor() {
  const CREATE_ENDPOINTS = [
    "/PROYECTO-FINAL/backend/pedidos/create.php",
    "../backend/pedidos/create.php"
  ];

  const items = leerCarrito() || [];
  if (!items.length) throw new Error('Carrito vacío');

  const cliente = leerCliente() || { nombre: document.querySelector('#nombre')?.value || 'Cliente' };
  const total = parseFloat(localStorage.getItem('mestizaCartTotal') || '0') || 0;

  const payload = { items, total, cliente };
  console.log('Crear pedido: payload=', payload);

  for (const url of CREATE_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });
      const text = await res.text();
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch(e) {}
      if (!res.ok) { console.warn('HTTP', res.status, text); continue; }
      if (parsed && parsed.ok === false) throw new Error(parsed.msg || JSON.stringify(parsed));
      const id = (parsed && (parsed.orderId||parsed.id||parsed.id_pedido)) || null;
      if (!id) throw new Error('No se recibió id en la respuesta: '+text);
      return { id_pedido: id, raw: parsed };
    } catch (err) {
      console.error('Error endpoint', url, err);
    }
  }
  throw new Error('No se pudo crear el pedido en el servidor (todos los endpoints fallaron).');
}

  // ===========================
  // 4) EVENTOS UI
  // ===========================
  if (cardNumberInput) cardNumberInput.addEventListener('input', formatAndValidateCardNumber);
  if (expiryDateInput) expiryDateInput.addEventListener('input', validateAndFormatExpiryDate);

  // SUBMIT del pago
  if (cardPaymentForm) {
    cardPaymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // --- Validación final ---
      let isFormValid = true;

      showFeedback(cvvFeedback, cvvInput, '', true);
      cardHolderNameInput.classList.remove('is-invalid');
      cardHolderNameInput.nextElementSibling && (cardHolderNameInput.nextElementSibling.textContent = '');

      const rawCardNumber = cardNumberInput.value.replace(/\s/g, '');
      const matchingCard  = validateCardNumber(rawCardNumber);

      if (!matchingCard) {
        showFeedback(cardNumberFeedback, cardNumberInput, 'El número de tarjeta no es válido o no está en la lista permitida.', false);
        isFormValid = false;
      } else {
        showFeedback(cardNumberFeedback, cardNumberInput, '', true);

        const enteredHolder = cardHolderNameInput.value.trim();
        const normalizedEnteredHolder = enteredHolder.toLowerCase();
        const normalizedCardHolder    = matchingCard.holder.toLowerCase();
        if (matchingCard.holder && normalizedEnteredHolder !== normalizedCardHolder) {
          cardHolderNameInput.classList.add('is-invalid');
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

        if (matchingCard.cvc && cvvInput.value.trim() !== matchingCard.cvc) {
          showFeedback(cvvFeedback, cvvInput, 'El CVC/CVV es incorrecto para esta tarjeta.', false);
          isFormValid = false;
        } else {
          showFeedback(cvvFeedback, cvvInput, '', true);
        }

        const enteredExpiry = expiryDateInput.value.trim();
        if (matchingCard.expiry && enteredExpiry !== matchingCard.expiry) {
          showFeedback(expiryDateFeedback, expiryDateInput, 'La fecha de vencimiento ingresada no coincide con la tarjeta proporcionada.', false);
          isFormValid = false;
        }
      }

      const isDateFormatValid = validateAndFormatExpiryDate({ target: expiryDateInput });
      if (!isDateFormatValid) isFormValid = false;

      if (cvvInput.value.length !== 3) {
        showFeedback(cvvFeedback, cvvInput, 'El CVC/CVV debe tener 3 dígitos.', false);
        isFormValid = false;
      }

      if (cardHolderNameInput.value.trim() === '') {
        cardHolderNameInput.classList.add('is-invalid');
        if (cardHolderNameInput.nextElementSibling && cardHolderNameInput.nextElementSibling.textContent === '') {
          cardHolderNameInput.nextElementSibling.textContent = 'Este campo no puede estar vacío.';
          cardHolderNameInput.nextElementSibling.style.display = 'block';
        }
        isFormValid = false;
      }

      if (!isFormValid) return;

      // --- Loader ON ---
      if (overlay) {
        overlay.classList.add('show');
        document.body.classList.add('is-loading');
      }

      // --- Crear pedido en el servidor ---
      try {
        const data = await crearPedidoEnServidor(); // {id_pedido, tracking_code,...}

        // Exito: limpiar carrito, marcar tracking y mostrar mensaje
        clearCartData();
        startTracking();

        // Ocultar loader
        if (overlay) {
          overlay.classList.remove('show');
          document.body.classList.remove('is-loading');
        }

        // Mostrar notificación de éxito (si querés mantenerla)
        if (successNotification) {
          successNotification.style.display = 'flex';
        }

        // Redirigir al tracking (usa id o code, el script de estado soporta ambos)
        location.href = `estado.html?id=${data.id_pedido}`;

      } catch (err) {
        // Error: ocultar loader y mostrar mensaje
        if (overlay) {
          overlay.classList.remove('show');
          document.body.classList.remove('is-loading');
        }
        alert(err.message || "Error al procesar el pedido.");
      }
    });
  }

  if (dismissButton) {
    dismissButton.addEventListener('click', () => {
      window.location.href = 'menu.html';
    });
  }

  loadPaymentAmount();
});

// --- crearPedidoEnServidor: envia el pedido al backend y devuelve { id_pedido, ... } ---
