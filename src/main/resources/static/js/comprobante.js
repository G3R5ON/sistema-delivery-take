const API_PEDIDOS = "http://localhost:8084/api/pedidos";

function obtenerIdPedido() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function obtenerUsuarioSesion() {
  return JSON.parse(localStorage.getItem("usuarioAdminTAKE"));
}

function formatearFecha(fecha) {
  if (!fecha) return "No registrada";
  return new Date(fecha).toLocaleString("es-PE");
}

function formatearDetalles(detalles) {
  if (!detalles || detalles.length === 0) {
    return "<p>No hay detalle registrado.</p>";
  }

  return detalles.map(detalle => `
    <div class="detalle-item">
      <strong>${detalle.cantidad} x ${detalle.producto}</strong>
      <span>
        Precio: S/ ${Number(detalle.precioUnitario || 0).toFixed(2)} |
        Subtotal: S/ ${Number(detalle.subtotal || 0).toFixed(2)}
      </span>
    </div>
  `).join("");
}

function configurarVistaPorRol() {
  const usuario = obtenerUsuarioSesion();

  const btnNuevoPedido = document.getElementById("btnNuevoPedido");
  const btnVolverPanel = document.getElementById("btnVolverPanel");
  const mensaje = document.getElementById("mensajeComprobante");
  const btnImprimir = document.getElementById("btnImprimir");

  if (!usuario) {
    if (btnNuevoPedido) btnNuevoPedido.style.display = "inline-block";
    if (btnVolverPanel) btnVolverPanel.style.display = "none";
    return;
  }

  if (usuario.rol === "ADMIN") {
    if (btnNuevoPedido) btnNuevoPedido.style.display = "none";
    if (btnVolverPanel) btnVolverPanel.style.display = "inline-block";
    if (mensaje) mensaje.textContent = "Vista administrativa del comprobante del pedido.";
  }

  if (usuario.rol === "REPARTIDOR") {
    if (btnNuevoPedido) btnNuevoPedido.style.display = "none";
    if (btnVolverPanel) btnVolverPanel.style.display = "inline-block";
    if (btnImprimir) btnImprimir.textContent = "Imprimir entrega";
    if (mensaje) mensaje.textContent = "Comprobante del pedido asignado para entrega.";
  }
}

function cargarComprobante() {
  const id = obtenerIdPedido();

  if (!id) {
    document.getElementById("comprobanteContenido").innerHTML = `
      <p>No se encontró el ID del pedido.</p>
    `;
    return;
  }

  fetch(`${API_PEDIDOS}/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("No se encontró el pedido");
      }
      return response.json();
    })
    .then(pedido => {
      document.getElementById("comprobanteContenido").innerHTML = `
        <div class="info-grid">
          <div class="info-box">
            <span>Número de pedido</span>
            <strong>#${pedido.idPedido}</strong>
          </div>

          <div class="info-box">
            <span>Fecha</span>
            <strong>${formatearFecha(pedido.fechaCreacion)}</strong>
          </div>

          <div class="info-box">
            <span>Cliente</span>
            <strong>${pedido.cliente || "-"}</strong>
          </div>

          <div class="info-box">
            <span>Teléfono</span>
            <strong>${pedido.telefono || "-"}</strong>
          </div>

          <div class="info-box">
            <span>Dirección</span>
            <strong>${pedido.direccion || "-"}</strong>
          </div>

          <div class="info-box">
            <span>Estado del pedido</span>
            <strong class="estado ${pedido.estado}">
              ${pedido.estado || "-"}
            </strong>
          </div>

          <div class="info-box">
            <span>Método de pago</span>
            <strong>${pedido.metodoPago || "No especificado"}</strong>
          </div>

          <div class="info-box">
            <span>Estado de pago</span>
            <strong>${pedido.estadoPago || "No especificado"}</strong>
          </div>

          <div class="info-box">
            <span>Repartidor</span>
            <strong>${pedido.repartidor || "Sin asignar"}</strong>
          </div>
        </div>

        <div class="detalle">
          <h3>Detalle del pedido</h3>
          ${formatearDetalles(pedido.detalles)}
        </div>

        <div class="total-box">
          <span>Total</span>
          <strong>S/ ${Number(pedido.total || 0).toFixed(2)}</strong>
        </div>
      `;

      configurarVistaPorRol();
    })
    .catch(error => {
      console.error(error);
      document.getElementById("comprobanteContenido").innerHTML = `
        <p>No se pudo cargar el comprobante del pedido.</p>
      `;
    });
}

configurarVistaPorRol();
cargarComprobante();