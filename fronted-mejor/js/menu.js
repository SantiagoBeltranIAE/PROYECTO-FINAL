// ******************************************************
// LÓGICA DE CARRITO, NOTIFICACIONES Y OFFCANVAS (menu.js)
// ******************************************************
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('mestizaCart')) || []; 

    // Referencias a elementos del DOM
    const cartCounter = document.getElementById('cart-counter');
    const notificationContainer = document.getElementById('notification-container');
    const productButtons = document.querySelectorAll('.btn-add-to-cart');
    const cartItemsList = document.getElementById('cart-items-list'); // NUEVO
    const cartTotal = document.getElementById('cart-total');       // NUEVO
    const clearCartBtn = document.getElementById('clear-cart-btn'); // NUEVO

    // 1. FUNCIÓN PRINCIPAL: ACTUALIZA EL CONTADOR Y VUELVE A DIBUJAR EL CARRITO
    const updateCartCounter = () => {
        const totalItems = cart.length;
        cartCounter.textContent = totalItems;
        // Muestra el contador solo si hay items
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        localStorage.setItem('mestizaCart', JSON.stringify(cart)); 
        
        // Renderiza el contenido del Offcanvas (lo que el usuario ve)
        renderCart(); 
    };

    // 2. FUNCIÓN PARA DIBUJAR LOS PRODUCTOS EN EL OFFCANVAS
    const renderCart = () => {
        cartItemsList.innerHTML = ''; // Limpiar lista
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `<p class="text-muted text-center">El carrito está vacío. ¡Añade algo delicioso!</p>`;
            cartTotal.textContent = '$0.00';
            return;
        }

        // Agrupar items por ID base (ej: H1) y contar para mostrarlos limpios
        const productCounts = cart.reduce((acc, item) => {
            const baseId = item.id.split('-')[0]; // ID original del producto (H1, H2, etc.)
            if (!acc[baseId]) {
                acc[baseId] = { count: 0, name: item.name, precio: item.precio };
            }
            acc[baseId].count++;
            total += item.precio; // Sumar al total global
            return acc;
        }, {});
        
        // Renderizar la lista agrupada
        Object.keys(productCounts).forEach(baseId => {
            const item = productCounts[baseId];
            const itemTotal = item.precio * item.count;

            const cartItem = document.createElement('div');
            cartItem.className = 'd-flex justify-content-between align-items-center mb-2 pb-2 border-bottom';
            cartItem.innerHTML = `
                <div>
                    <span class="badge bg-secondary me-2">${item.count}</span>
                    <span>${item.name}</span>
                </div>
                <div class="d-flex align-items-center">
                    <span class="me-3 fw-bold">$${itemTotal.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger p-1 btn-remove-one" data-base-id="${baseId}">
                        &minus; </button>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });

        cartTotal.textContent = `$${total.toFixed(2)}`;
    };

    // 3. FUNCIÓN PARA AÑADIR UN PRODUCTO (Al hacer clic en el botón verde)
    const addProduct = (product) => {
        // Asignar un ID único por cada instancia de producto (ej: H1-16335123456)
        const uniqueProduct = { ...product, id: product.id + '-' + Date.now() };
        cart.push(uniqueProduct);
        updateCartCounter(); // <<-- ESTA LÍNEA ES LA QUE GARANTIZA LA SUMA
        showNotification(`✅ ¡${product.name} añadido!`, 'success');
    };
    
    // 4. FUNCIÓN PARA ELIMINAR UNA UNIDAD (Al hacer clic en el botón - del Offcanvas)
    const removeOneItem = (baseId) => {
        // Encontrar el índice del último item agregado con el mismo baseId para quitarlo
        const indexToRemove = cart.map(item => item.id.split('-')[0]).lastIndexOf(baseId); 
        
        if (indexToRemove > -1) {
            const removedItem = cart.splice(indexToRemove, 1)[0];
            updateCartCounter();
            showNotification(`❌ Se quitó una unidad de ${removedItem.name}.`, 'danger');
        }
    }
    
    // 5. FUNCIÓN PARA VACIAR EL CARRITO (Al hacer clic en el botón "Vaciar Carrito")
    const clearCart = () => {
        const cartLength = cart.length;
        if (cartLength > 0) {
            cart = [];
            updateCartCounter();
            showNotification(`🗑️ Carrito vaciado (Se quitaron ${cartLength} items).`, 'danger');
        }
    };
    
    const showNotification = (message, type) => {
        notificationContainer.innerHTML = ''; 
        const notification = document.createElement('div');
        // Quitamos la clase 'alert-dismissible' porque ya no hay botón de cerrar.
        notification.className = `alert fade show mb-2 p-3 text-start alert-${type}`; 
        notification.setAttribute('role', 'alert');
        
        // El contenido es solo el mensaje, sin el botón de cerrar.
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <span>${message}</span>
            </div>
        `;

        notificationContainer.appendChild(notification);

        // Ocultar después de 4 segundos
        setTimeout(() => {
            // Se usa .remove() en lugar de bootstrap.Alert.close()
            notification.remove(); 
        }, 4000);
    };
    

    // 7. EVENTO PRINCIPAL: ESCUCHA CLICKS EN LOS BOTONES "Añadir al carrito"
    productButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                precio: parseFloat(card.dataset.precio)
            };
            addProduct(product); // Llama a la función que añade y actualiza
        });
    });

    // 8. EVENTOS PARA EL OFFCANVAS Y BOTONES (Delegación de eventos)
    
    // a) Botón "Vaciar Carrito"
    clearCartBtn.addEventListener('click', clearCart);

    // b) Botón de remover UN item individual (botón -)
    cartItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-one')) {
            const baseId = e.target.dataset.baseId; 
            removeOneItem(baseId);
        }
    });

    // Inicializar el contador y el carrito al cargar la página
    updateCartCounter();
});