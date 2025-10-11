// ******************************************************
// LÓGICA DE CARRITO, NOTIFICACIONES Y OFFCANVAS (menu.js) - CÓDIGO FINAL FUSIONADO Y ACTUALIZADO
// ******************************************************
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('mestizaCart')) || []; 

    // Referencias a elementos del DOM (Carrito/Offcanvas)
    const cartCounter = document.getElementById('cart-counter');
    const notificationContainer = document.getElementById('notification-container');
    const productButtons = document.querySelectorAll('.btn-add-to-cart');
    const cartItemsList = document.getElementById('cart-items-list'); 
    const cartTotal = document.getElementById('cart-total'); 
    const clearCartBtn = document.getElementById('clear-cart-btn');

    // Referencias al Modal de Personalización
    const customizationModalElement = document.getElementById('customizationModal');
    // Verifica si el modal existe antes de intentar inicializarlo
    let customizationModal = null;
    if (customizationModalElement) {
        // Asegúrate de que la clase 'bootstrap' esté disponible
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            customizationModal = new bootstrap.Modal(customizationModalElement);
        } else {
            console.error("Bootstrap Modal no está definido. ¿Está el script de Bootstrap incluido?");
        }
    }
    const productNameModal = document.getElementById('product-name-modal');
    const productIdModal = document.getElementById('product-id-modal');
    const sizeOptions = document.getElementById('size-options');
    const finalPriceDisplay = document.getElementById('final-price-display');
    const btnPriceDisplay = document.getElementById('btn-price-display');
    const btnAddToCartModal = document.getElementById('btn-add-to-cart-modal');
    // Seleccionamos los inputs, pero necesitamos trabajar con sus contenedores (div.form-check)
    const toppingCheckboxes = document.querySelectorAll('#customizationModal .form-check-input[type="checkbox"]');

    let currentBasePrice = 300; 
    let currentSizeName = 'Simple';
    
    // ******************************************************
    // 1. FUNCIONES PRINCIPALES DE GESTIÓN DEL CARRITO
    // ******************************************************

    // 1.1 FUNCIÓN PRINCIPAL: ACTUALIZA EL CONTADOR Y VUELVE A DIBUJAR EL CARRITO
    const updateCartCounter = () => {
        const totalItems = cart.length;
        cartCounter.textContent = totalItems;
        // Muestra el contador solo si hay items
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        localStorage.setItem('mestizaCart', JSON.stringify(cart)); 
        
        // Renderiza el contenido del Offcanvas (lo que el usuario ve)
        renderCart(); 
    };

    // 1.2 FUNCIÓN PARA DIBUJAR LOS PRODUCTOS EN EL OFFCANVAS
    const renderCart = () => {
        cartItemsList.innerHTML = ''; // Limpiar lista
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `<p class="text-muted text-center">El carrito está vacío. ¡Añade algo delicioso!</p>`;
            cartTotal.textContent = '$0.00';
            return;
        }

        // Muestra cada item personalizado como una línea separada.
        cart.forEach((item, index) => {
            
            // Si el producto tiene 'size' y 'toppings', es personalizado (hamburguesa)
            const isCustom = item.size && item.toppings;
            
            // Construir detalles para mostrar en la lista
            let details = '';
            if (isCustom) {
                details += ` <small class="text-secondary">(${item.size})</small>`;
                if (item.toppings.length > 0) {
                    // Muestra los toppings seleccionados
                    details += `<br><small class="text-muted fst-italic">Toppings: ${item.toppings.join(', ')}</small>`;
                } else {
                    details += `<br><small class="text-muted fst-italic">Sin toppings extra</small>`;
                }
            } else {
                // Producto simple (papas, etc.)
                details += ` <small class="text-secondary">(Clásico)</small>`;
            }
            
            total += item.precio; // Sumar al total global

            const cartItem = document.createElement('div');
            cartItem.className = 'd-flex justify-content-between align-items-center mb-2 pb-2 border-bottom';
            cartItem.innerHTML = `
                <div style="max-width: 75%;">
                    <span class="fw-bold">${item.name}</span>
                    ${details}
                </div>
                <div class="d-flex align-items-center flex-shrink-0">
                    <span class="me-3 fw-bold">$${item.precio.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger p-1 btn-remove-unique" data-index="${index}">
                        &minus;
                    </button>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });

        cartTotal.textContent = `$${total.toFixed(2)}`;
    };

    // 1.3 FUNCIÓN PARA AÑADIR UN PRODUCTO (Usada por el modal y productos simples)
    const addProduct = (product) => {
        // Asignar un ID único por cada instancia de producto (ej: H1-16335123456)
        const uniqueProduct = { ...product, uniqueId: product.id + '-' + Date.now() };
        cart.push(uniqueProduct);
        updateCartCounter(); 
        // Si tiene tamaño, la notificación es más detallada
        const sizeDetail = product.size ? ` (${product.size})` : '';
        showNotification(`✅ ¡${product.name}${sizeDetail} añadido por $${product.precio.toFixed(2)}!`, 'success');
    };
    
    // 1.4 FUNCIÓN PARA ELIMINAR UNA UNIDAD (Al hacer clic en el botón - del Offcanvas)
    const removeUniqueItem = (index) => {
        if (index > -1 && index < cart.length) {
            const removedItem = cart.splice(index, 1)[0];
            updateCartCounter();
            showNotification(`❌ Se quitó ${removedItem.name}.`, 'danger');
        }
    }
    
    // 1.5 FUNCIÓN PARA VACIAR EL CARRITO 
    const clearCart = () => {
        const cartLength = cart.length;
        if (cartLength > 0) {
            cart = [];
            updateCartCounter();
            showNotification(`🗑️ Carrito vaciado (Se quitaron ${cartLength} items).`, 'danger');
        }
    };
    
    // 1.6 FUNCIÓN PARA MOSTRAR NOTIFICACIÓN (simplificada)
    const showNotification = (message, type) => {
        notificationContainer.innerHTML = ''; 
        const notification = document.createElement('div');
        notification.className = `alert fade show mb-2 p-3 text-start alert-${type}`; 
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `<div class="d-flex align-items-center"><span>${message}</span></div>`;

        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove(); 
        }, 4000);
    };

    // ******************************************************
    // 2. LÓGICA Y FUNCIONES DEL MODAL DE PERSONALIZACIÓN
    // ******************************************************
    
    // 2.1 FUNCIÓN PARA CALCULAR Y ACTUALIZAR EL PRECIO EN EL MODAL
    const updatePrice = () => {
        const selectedRadio = document.querySelector('input[name="burgerSize"]:checked');
        if (selectedRadio) {
            currentBasePrice = parseFloat(selectedRadio.value);
            currentSizeName = selectedRadio.dataset.name;
        } else {
            // Valor de respaldo
            currentBasePrice = 300; 
            currentSizeName = 'Simple';
        }
        
        // Actualizar el display del precio
        finalPriceDisplay.textContent = `$${currentBasePrice.toFixed(2)}`;
        btnPriceDisplay.textContent = `($${currentBasePrice.toFixed(2)})`;
    };
    
    // 2.2 FUNCIÓN PARA RECOGER LOS TOPPINGS SELECCIONADOS
    const getSelectedToppings = () => {
        // Solo recogemos los que están marcados Y visibles (no ocultos por el CSS 'd-none')
        return Array.from(toppingCheckboxes)
            .filter(checkbox => checkbox.checked)
            // Asegurarse de que el contenedor del checkbox no tenga la clase d-none
            .filter(checkbox => !checkbox.closest('.form-check').classList.contains('d-none'))
            .map(checkbox => checkbox.value);
    };

    // ******************************************************
    // 3. EVENT LISTENERS
    // ******************************************************
    
    // 3.1 ESCUCHA CLICKS en los botones "Añadir al carrito" de la lista de productos
    productButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            
            // Lógica para productos simples (no personalizables)
            if (!card.hasAttribute('data-size-custom')) { 
                const product = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    precio: parseFloat(card.dataset.precio || 300) 
                };
                addProduct(product);
                return; 
            }
            
            // --- Lógica para productos PERSONALIZABLES (Hamburguesas) ---
            
            // 1. Cargar datos del producto base en el modal
            productNameModal.textContent = card.dataset.name;
            productIdModal.value = card.dataset.id;
            
            // 2. Resetear a tamaño simple (precio base)
            const simpleRadio = document.getElementById('sizeSimple');
            if (simpleRadio) {
                simpleRadio.checked = true;
            } else {
                const firstRadio = document.querySelector('input[name="burgerSize"]');
                if (firstRadio) firstRadio.checked = true;
            }
            
            // 3. *** LÓGICA CLAVE: GESTIONAR TOPPINGS PERMITIDOS Y MARCAR DEFAULTS ***
            const defaultToppingsString = card.dataset.toppingsDefault || "";
            const allowedToppingsString = card.dataset.toppingsAllowed || "";

            const defaultToppingsArray = defaultToppingsString.split(',').map(t => t.trim()).filter(t => t);
            const allowedToppingsArray = allowedToppingsString.split(',').map(t => t.trim()).filter(t => t);
            
            toppingCheckboxes.forEach(cb => {
                const toppingValue = cb.value;
                const formCheckDiv = cb.closest('.form-check'); // El contenedor que queremos ocultar/mostrar
                
                // a) Desmarcar por si acaso (limpieza)
                cb.checked = false; 
                
                // b) Mostrar/Ocultar el checkbox (Filtrado de opciones)
                if (allowedToppingsArray.includes(toppingValue)) {
                    // Si está permitido, lo mostramos
                    formCheckDiv.classList.remove('d-none'); 
                    // c) Marcar si es un topping por defecto
                    if (defaultToppingsArray.includes(toppingValue)) {
                        cb.checked = true;
                    }
                } else {
                    // Si NO está permitido (ej: Salsa Mestiza en la Javito), lo ocultamos
                    formCheckDiv.classList.add('d-none');
                }
            });
            // *******************************************************************
            
            // 4. Mostrar el modal y actualizar precio
            updatePrice();
            if (customizationModal) customizationModal.show();
        });
    });

    // 3.2 ESCUCHA CAMBIOS en los radio buttons de tamaño para actualizar el precio del Modal
    if (sizeOptions) sizeOptions.addEventListener('change', updatePrice);
    
    // 3.3 ESCUCHA CLICKS en el botón FINAL "Añadir al carrito" DENTRO del modal
    if (btnAddToCartModal) btnAddToCartModal.addEventListener('click', () => {
        const finalProduct = {
            id: productIdModal.value, 
            name: productNameModal.textContent,
            precio: currentBasePrice, 
            size: currentSizeName, 
            toppings: getSelectedToppings(), // Esta función ahora solo toma los visibles
        };
        
        addProduct(finalProduct); 
        if (customizationModal) customizationModal.hide();
    });
    
    // 3.4 Limpiar datos al cerrar el modal (opcional, pero buena práctica)
    if (customizationModalElement) customizationModalElement.addEventListener('hidden.bs.modal', () => {
        currentBasePrice = 300;
        currentSizeName = 'Simple';
    });
    
    // 3.5 EVENTOS PARA EL OFFCANVAS Y BOTONES
    
    // a) Botón "Vaciar Carrito"
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

    // b) Botón de remover UN item individual (botón -)
    if (cartItemsList) cartItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-unique')) {
            const index = parseInt(e.target.dataset.index); 
            removeUniqueItem(index);
        }

        // Referencia al botón de Continuar Pedido
    const checkoutBtn = document.getElementById('checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            // ... (Tu lógica de verificación del carrito) ...
            if (cart.length === 0) {
                 showNotification('🛒 Tu carrito está vacío. ¡Añade productos antes de continuar!', 'warning');
            } else {
                window.location.href = 'pago.html';
            }
        });
    }
    });

    // Inicializar el contador y el carrito al cargar la página
    updateCartCounter();

});