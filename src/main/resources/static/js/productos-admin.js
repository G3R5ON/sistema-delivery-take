const API_PRODUCTOS = "http://localhost:8084/api/productos";
const API_CATEGORIAS = "http://localhost:8084/api/categorias";

let productos = [];
let categorias = [];

function cargarDatos() {
  listarCategorias();
  listarProductos();
}

function listarCategorias() {
  fetch(API_CATEGORIAS)
    .then(response => response.json())
    .then(data => {
      categorias = data;

      const select = document.getElementById("categoria");
      select.innerHTML = `<option value="">Seleccione una categoría</option>`;

      categorias.forEach(categoria => {
        select.innerHTML += `
          <option value="${categoria.id}">
            ${categoria.nombre}
          </option>
        `;
      });
    })
    .catch(error => {
      console.error("Error al cargar categorías:", error);
      alert("No se pudieron cargar las categorías.");
    });
}

function listarProductos() {
  fetch(API_PRODUCTOS)
    .then(response => response.json())
    .then(data => {
      productos = data;
      const tabla = document.getElementById("tablaProductos");
      tabla.innerHTML = "";

      productos.forEach(producto => {
        const categoriaNombre = producto.categoria
          ? producto.categoria.nombre
          : "Sin categoría";

        tabla.innerHTML += `
          <tr>
            <td>#${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>S/ ${Number(producto.precio).toFixed(2)}</td>
            <td>${categoriaNombre}</td>
            <td>
              <button class="btn-editar" onclick="editarProducto(${producto.id})">
                Editar
              </button>
              <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">
                Eliminar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(error => {
      console.error("Error al cargar productos:", error);
      alert("No se pudieron cargar los productos.");
    });
}

function guardarProducto() {
  const id = document.getElementById("productoId").value;
  const nombre = document.getElementById("nombre").value.trim();
  const precio = document.getElementById("precio").value;
  const categoriaId = document.getElementById("categoria").value;

  if (!nombre || !precio || !categoriaId) {
    alert("Completa todos los campos.");
    return;
  }

  const producto = {
    nombre: nombre,
    precio: Number(precio),
    categoria: {
      id: Number(categoriaId)
    }
  };

  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API_PRODUCTOS}/${id}` : API_PRODUCTOS;

  fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(producto)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo guardar el producto");
    }
    return response.json();
  })
  .then(() => {
    alert(id ? "Producto actualizado correctamente." : "Producto registrado correctamente.");
    limpiarFormulario();
    listarProductos();
  })
  .catch(error => {
    console.error("Error al guardar producto:", error);
    alert("No se pudo guardar el producto.");
  });
}

function editarProducto(id) {
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    alert("Producto no encontrado.");
    return;
  }

  document.getElementById("productoId").value = producto.id;
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("precio").value = producto.precio;

  if (producto.categoria) {
    document.getElementById("categoria").value = producto.categoria.id;
  }
}

function eliminarProducto(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) {
    return;
  }

  fetch(`${API_PRODUCTOS}/${id}`, {
    method: "DELETE"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo eliminar el producto");
    }

    alert("Producto eliminado correctamente.");
    listarProductos();
  })
  .catch(error => {
    console.error("Error al eliminar producto:", error);
    alert("No se pudo eliminar el producto. Puede estar asociado a un pedido.");
  });
}

function limpiarFormulario() {
  document.getElementById("productoId").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("categoria").value = "";
}

function cerrarSesion() {
  localStorage.removeItem("usuarioAdminTAKE");
  window.location.href = "login.html";
}

cargarDatos();