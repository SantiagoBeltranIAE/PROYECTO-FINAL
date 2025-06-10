async function obtenerProductos() {
    try {
        const respuesta = await fetch("../backend/routes/api.php?seccion=productos");
        const productos = await respuesta.json();
        console.log(productos);
        mostrarProductos(productos);
    } catch (error) {
        console.error("Error al obtener los productos", error);
        document.getElementById("contenedor-productos").innerHTML = "<tr><td colspan='3'>Error al cargar los productos.</td></tr>";
    }
}

function mostrarProductos(productos) {
    const contenedorProductos = document.getElementById("contenedor-productos");
    contenedorProductos.innerHTML = "";

    productos.forEach(producto => {
        const fila = document.createElement("tr");
        fila.id = `producto-${producto.id}`;

        fila.innerHTML = `
            <td>${producto.name}</td>
            <td>${producto.description}</td>
            <td>${producto.price}</td>
        `;
        contenedorProductos.appendChild(fila);
    });
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const formData = new FormData();
    formData.append('id', id);
    const respuesta = await fetch("../backend/routes/api.php?seccion=eliminarProducto", {
        method: "POST",
        body: formData
    });
    const resultado = await respuesta.json();
    alert(resultado[0]);
    obtenerProductos();
}

// Editar producto
function cargarProductoEnFormulario(producto) {
    document.getElementById('name').value = producto.name;
    document.getElementById('description').value = producto.description;
    document.getElementById('price').value = producto.price;
    document.getElementById('btn-guardar').textContent = "Modificar";
    window.productoEditandoId = producto.id;
}

async function guardarEdicionProducto() {
    const formData = new FormData();
    formData.append('id', window.productoEditandoId);
    formData.append('name', document.getElementById('name').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', document.getElementById('price').value);

    const respuesta = await fetch("../backend/routes/api.php?seccion=editarProducto", {
        method: "POST",
        body: formData
    });
    const resultado = await respuesta.json();
    alert(resultado[0]);
    document.getElementById('form-producto').reset();
    document.getElementById('btn-guardar').textContent = "Añadir Producto";
    window.productoEditandoId = null;
    obtenerProductos();
}

obtenerProductos();