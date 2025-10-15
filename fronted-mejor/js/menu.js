// ******************************************************
// LÓGICA DE CARRITO, NOTIFICACIONES Y OFFCANVAS (menu.js) - CÓDIGO FINAL FUSIONADO Y ACTUALIZADO
// ******************************************************

// =======================================================
// NUEVAS FUNCIONES PARA CARGAR PRODUCTOS DESDE EL BACKEND
// =======================================================

/**
 * Agrupa un array de objetos por una clave específica (ej: 'categoria').
 */
function agruparPorCategoria(array, key) {
    return array.reduce((acc, item) => {
        const categoria = item[key];
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(item);
        return acc;
    }, {});
}

/**
 * Genera el HTML de una tarjeta de producto.
 */
function generarTarjetaProducto(producto) {
    const id = producto.id;
    const nombre = producto.nombre;
    const descripcion = producto.descripcion;
    const imagen_url = producto.imagen_url;
    const precio = producto.precio;
    const personalizable = producto.personalizable;
    const tamanos_precios = producto.tamanos_precios; // JSON con precios de Simple/Doble/Triple

    let dataAttrs = `data-id="${id}" data-name="${nombre}"`;
    let precioDisplay = '';

    // Añadir atributos de Toppings para que el modal los filtre (usando valores por defecto si no vienen de la DB)
    // NOTA: Si usas la DB, debes modificar tu backend para obtener y devolver estos campos si son dinámicos.
    // Por ahora, usaremos los valores predeterminados (hardcodeados) que estaban en tu HTML original
    // para los productos que son personalizables (H1, H2, H3).
    if (nombre === "Burger Mestiza") {
        dataAttrs += ` data-toppings-default="Cheddar,Salsa Mestiza,Cebollitas,Pepinillos Encurtidos" data-toppings-allowed="Cheddar,Salsa Mestiza,Cebollitas,Pepinillos Encurtidos,Tomate,Lechuga,Mostaza,Ketchup"`;
    } else if (nombre === "Cheeseburger Dani") {
        dataAttrs += ` data-toppings-default="Cheddar,Mostaza,Ketchup,Cebollitas Brunoise" data-toppings-allowed="Cheddar,Mostaza,Ketchup,Cebollitas Brunoise"`;
    } else if (nombre === "Cheeseburger Javito") {
        dataAttrs += ` data-toppings-default="Cheddar" data-toppings-allowed="Cheddar"`;
    }


    if (personalizable == 1) {
        // Producto personalizable (ej. Simple, Doble, Triple)
        dataAttrs += ` data-size-custom="true"`;
        precioDisplay = '<p class="fw-bold">Precio variable</p>'; 
    } else if (precio && precio > 0) {
        // Producto con precio fijo
        dataAttrs += ` data-precio="${precio}"`;
        precioDisplay = `<p class="fw-bold">$${new Intl.NumberFormat('es-AR').format(precio)}</p>`;
    }
    
    // Si no tiene precio (Toppings), el precioDisplay queda vacío.

    return `
        <div class="col">
            <div class="card h-100 product-card" ${dataAttrs}>
                <img src="${imagen_url}" class="card-img-top" alt="${nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${nombre}</h5>
                    <p class="card-text flex-grow-1">${descripcion}</p>
                    ${precioDisplay}
                    <button class="btn btn-success mt-auto btn-add-to-cart">Añadir al carrito</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera todas las secciones del menú a partir de los datos.
 */
function generarSeccionesMenu(productosAgrupados) {
    let html = '';
    const ordenCategorias = ['Hamburguesas', 'Tacos x 2', 'Papas Fritas', 'Toppings']; 

    const categoriasExistentes = Object.keys(productosAgrupados);
    categoriasExistentes.sort((a, b) => {
        const indexA = ordenCategorias.indexOf(a);
        const indexB = ordenCategorias.indexOf(b);
        if (indexA > -1 && indexB > -1) return indexA - indexB;
        if (indexA > -1) return -1;
        if (indexB > -1) return 1;
        return a.localeCompare(b);
    });
    
    categoriasExistentes.forEach(categoria => {
        html += `<section class="mb-5">`;
        html += `<h2 class="mb-4 border-bottom pb-2">${categoria}</h2>`;
        html += `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4" id="categoria-${categoria.replace(/\s/g, '-')}">`;

        productosAgrupados[categoria].forEach(producto => {
            html += generarTarjetaProducto(producto);
        });

        html += `</div>`;
        html += `</section>`;
    });

    return html;
}

/**
 * Llama al backend y devuelve los productos.
 * @returns {Promise<Array|Object>} Array de productos o un objeto de error.
 */
async function cargarProductos() {
    const url = "/PROYECTO-FINAL-2/fronted-mejor/php/mostrar_productos.php"; 

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            // Este error puede ser un 404, 500, etc.
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json(); 
        
        if (data.error) {
            // Si el JSON contiene un campo 'error' (como definimos en el PHP)
            return { error: data.error };
        }

        return data; // Devuelve el array de productos
        
    } catch (error) {
        console.error("Fallo al obtener los productos:", error);
        // Devuelve una promesa rechazada para que el .catch() lo atrape en el DOMContentLoaded
        return Promise.reject(new Error(`Error de red o formato: ${error.message}`));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('mestizaCart')) || [];

    // Referencias a elementos del DOM (Carrito/Offcanvas)
    const cartCounter = document.getElementById('cart-counter');
    const notificationContainer = document.getElementById('notification-container');
    
    // ELIMINADO: const productButtons = document.querySelectorAll('.btn-add-to-cart'); 
    // Ahora usaremos delegación de eventos en 'document' o en un contenedor superior.
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
    
    // Nuevo contenedor donde se cargarán los productos
    const productosContainer = document.getElementById('productos-container');


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

    /**
     * FUNCIÓN CLAVE: Configura los listeners en los botones cargados dinámicamente.
     * Se llama después de que cargarProductos finaliza.
     */
    function setupProductListeners() {
        // 3.1 ESCUCHA CLICKS en el contenedor principal y DELEGA el evento a .btn-add-to-cart
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-to-cart')) {
                const card = e.target.closest('.product-card');
                
                // Lógica para productos simples (no personalizables)
                if (!card.hasAttribute('data-size-custom')) {
                    const product = {
                        id: card.dataset.id,
                        name: card.dataset.name,
                        // Usar 0 si no hay precio (ej. Toppings), aunque lo ideal es que la DB devuelva 0.00
                        precio: parseFloat(card.dataset.precio || 0) 
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
            }
        });
    } // Fin setupProductListeners

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

    // b) Botón de remover UN item individual (botón -) - Usa delegación
    if (cartItemsList) cartItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-unique')) {
            const index = parseInt(e.target.dataset.index);
            removeUniqueItem(index);
        }
    });

    // 3.6 EVENTO PARA EL BOTÓN "CONTINUAR PEDIDO"
    const checkoutBtn = document.getElementById('checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                showNotification('🛒 Tu carrito está vacío. ¡Añade productos antes de continuar!', 'warning');
            } else {
                // 1. Guardar el total (asegúrate de que cartTotal esté actualizado)
                const totalText = cartTotal.textContent.replace('$', '').trim();
                localStorage.setItem('mestizaCartTotal', totalText);

                // 2. Redirigir a la página de pago
                window.location.href = 'pago.html';
            }
        });
    }

    const trackingIcon = document.getElementById('tracking-icon-link');

    function checkTrackingStatus() {
        const status = localStorage.getItem('deliveryStatus');
        
        if (trackingIcon) {
            if (status === 'active') {
                // Si hay un pedido activo, lo mostramos
                // Usar 'flex' o 'block' depende de cómo lo quieres alinear con otros iconos. 'flex' es común en navbars.
                trackingIcon.style.display = 'flex'; 
                console.log("Icono de tracking: MOSTRADO. Estado: ACTIVO.");
                
            } else {
                // Si no hay estado o está vacío, lo ocultamos
                trackingIcon.style.display = 'none';
                console.log("Icono de tracking: OCULTO. Estado: INACTIVO/COMPLETADO.");
            }
        } else {
             // Este error indica un problema en el HTML
             console.error("❌ Error en menu.js: No se encontró el elemento con ID 'tracking-icon-link'.");
        }
    }

    // ******************************************************
    // INICIALIZACIÓN FINAL Y CARGA DINÁMICA (CORREGIDA)
    // ******************************************************
    
    if (productosContainer) {
        // 1. Mostrar mensaje de carga
        productosContainer.innerHTML = '<p class="text-center text-muted">Cargando menú...</p>';

        // 2. Cargar los datos y renderizar
        cargarProductos()
            .then(data => {
                if (data.error || !Array.isArray(data)) {
                    // Manejar error devuelto por PHP o si el formato no es el esperado
                    productosContainer.innerHTML = `<p class="text-center text-danger">${data.error || 'Fallo al obtener los productos en formato JSON.'}</p>`;
                    return;
                }
                
                // 3. Generar y inyectar HTML
                const productosAgrupados = agruparPorCategoria(data, 'categoria');
                productosContainer.innerHTML = generarSeccionesMenu(productosAgrupados);

                // 4. Configurar listeners (AHORA SÍ FUNCIONA porque tiene acceso a todas las variables)
                setupProductListeners(); 

            })
            .catch(error => {
                // Manejar errores de red o errores retornados por la función asíncrona
                console.error("Fallo inesperado durante la carga y renderizado:", error);
                productosContainer.innerHTML = '<p class="text-center text-danger">Error al cargar el menú. Inténtalo más tarde.</p>';
            });
    } else {
        console.error("❌ Error en menu.js: No se encontró el elemento con ID 'productos-container'.");
    }


    updateCartCounter();
    checkTrackingStatus();

});