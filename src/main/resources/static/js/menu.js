const API_PRODUCTOS = "http://localhost:8084/api/productos";

let productosGlobal = [];
let carrito = JSON.parse(localStorage.getItem("carritoTAKE")) || [];

function iconoProducto(categoria) {
  if (!categoria) return "🍽️";

  const cat = String(categoria).toUpperCase();

  if (cat.includes("BEBIDA")) return "🥤";
  if (cat.includes("POSTRE")) return "🍮";
  if (cat.includes("ENTRADA")) return "🥗";
  if (cat.includes("SOPA")) return "🍲";
  if (cat.includes("POLLO")) return "🍗";
  if (cat.includes("CHAUFA")) return "🍚";
  if (cat.includes("PLATO")) return "🍛";

  return "🍽️";
}

function obtenerCategoria(producto) {
  if (producto.categoria && typeof producto.categoria === "object") {
    return producto.categoria.nombre || "Sin categoría";
  }

  return producto.categoria || "Sin categoría";
}

function cargarProductos() {
  fetch(API_PRODUCTOS)
    .then(response => response.json())
    .then(productos => {
      productosGlobal = productos;
      renderProductos(productosGlobal);
      renderCarrito();
    })
    .catch(error => {
      console.error("Error al cargar productos:", error);
      alert("No se pudo cargar el menú.");
    });
}

function renderProductos(productos) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const categoria = obtenerCategoria(producto);

    contenedor.innerHTML += `
      <div class="producto-card">
        <div class="producto-img">${iconoProducto(categoria)}</div>
        <div class="producto-body">
          <p class="categoria">${categoria}</p>
          <h3>${producto.nombre}</h3>
          <p class="precio">S/ ${Number(producto.precio).toFixed(2)}</p>
          <button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>
            Agregar
          </button>
        </div>
      </div>
    `;
  });
}

function filtrarProductos() {
  const texto = document.getElementById("buscador").value.toLowerCase();

  const filtrados = productosGlobal.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    obtenerCategoria(producto).toLowerCase().includes(texto)
  );

  renderProductos(filtrados);
}

function agregarAlCarrito(producto) {
  const existente = carrito.find(item => item.id === producto.id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      categoria: obtenerCategoria(producto),
      cantidad: 1
    });
  }

  guardarCarrito();
  renderCarrito();
}

function aumentar(id) {
  const item = carrito.find(p => p.id === id);
  if (item) item.cantidad++;

  guardarCarrito();
  renderCarrito();
}

function disminuir(id) {
  const item = carrito.find(p => p.id === id);

  if (item) {
    item.cantidad--;

    if (item.cantidad <= 0) {
      quitar(id);
      return;
    }
  }

  guardarCarrito();
  renderCarrito();
}

function quitar(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito();
  renderCarrito();
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito");
  const contador = document.getElementById("contadorCarrito");

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
  }

  carrito.forEach(item => {
    contenedor.innerHTML += `
      <div class="carrito-item">
        <strong>${item.nombre}</strong>
        <span>S/ ${item.precio.toFixed(2)} x ${item.cantidad}</span>

        <div class="carrito-actions">
          <button onclick="disminuir(${item.id})">-</button>
          <button onclick="aumentar(${item.id})">+</button>
          <button onclick="quitar(${item.id})">Quitar</button>
        </div>
      </div>
    `;
  });

  contador.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  document.getElementById("total").textContent = calcularTotal().toFixed(2);
}

function calcularTotal() {
  return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function guardarCarrito() {
  localStorage.setItem("carritoTAKE", JSON.stringify(carrito));
}

function irAPedido() {
  if (carrito.length === 0) {
    alert("Agrega productos al carrito antes de continuar.");
    return;
  }

  window.location.href = "pedido.html";
}

cargarProductos();
renderCarrito();