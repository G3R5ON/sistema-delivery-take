const API_PEDIDOS = "http://localhost:8084/api/pedidos";

let carrito = JSON.parse(localStorage.getItem("carritoTAKE")) || [];

function renderResumen() {
  const contenedor = document.getElementById("resumenCarrito");

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <p>No hay productos en el carrito.</p>
      <a href="menu.html">Volver al menú</a>
    `;
    document.getElementById("total").textContent = "0.00";
    return;
  }

  contenedor.innerHTML = "";

  carrito.forEach(item => {
    contenedor.innerHTML += `
      <div class="item-resumen">
        <strong>${item.nombre}</strong>
        <span>S/ ${item.precio.toFixed(2)} x ${item.cantidad}</span>
      </div>
    `;
  });

  document.getElementById("total").textContent = calcularTotal().toFixed(2);
}

function calcularTotal() {
  return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function mostrarCampoPago() {
  const metodoPago = document.getElementById("metodoPago").value;
  const campo = document.getElementById("campoCodigoPago");

  if (metodoPago === "YAPE" || metodoPago === "TARJETA") {
    campo.style.display = "block";
  } else {
    campo.style.display = "none";
    document.getElementById("codigoPago").value = "";
  }
}

function confirmarPedido() {
  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const referencia = document.getElementById("referencia").value.trim();
  const metodoPago = document.getElementById("metodoPago").value;
  const codigoPago = document.getElementById("codigoPago").value.trim();

  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  if (!nombre || !telefono || !direccion) {
    alert("Completa nombre, teléfono y dirección.");
    return;
  }

  if (!metodoPago) {
    alert("Selecciona un método de pago.");
    return;
  }

  if ((metodoPago === "YAPE" || metodoPago === "TARJETA") && !codigoPago) {
    alert("Ingresa el código de operación o simulación.");
    return;
  }

  const pedido = {
    clienteNombre: nombre,
    telefono: telefono,
    direccion: direccion,
    referencia: referencia,
    metodoPago: metodoPago,
    codigoPago: codigoPago,
    items: carrito.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad
    }))
  };

  fetch(API_PEDIDOS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pedido)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error al registrar pedido");
    }
    return response.json();
  })
  .then(data => {
    alert("Pedido registrado correctamente. Código: " + data.idPedido);

    localStorage.removeItem("carritoTAKE");

    window.location.href = `comprobante.html?id=${data.idPedido}`;
  })
  .catch(error => {
    console.error("Error al registrar pedido:", error);
    alert("No se pudo registrar el pedido.");
  });
}

renderResumen();