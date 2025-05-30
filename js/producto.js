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

obtenerProductos();