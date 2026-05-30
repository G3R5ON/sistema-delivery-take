const API_PEDIDOS = "http://localhost:8084/api/pedidos";
const API_REPARTIDORES = "http://localhost:8084/api/usuarios/repartidores/activos";

let usuarioSesion = JSON.parse(localStorage.getItem("usuarioAdminTAKE"));
let pedidosGlobal = [];
let repartidoresGlobal = [];

function iniciarAdmin() {
  configurarMenuPorRol();
  cargarRepartidores();
}

function cargarRepartidores() {
  fetch(API_REPARTIDORES)
    .then(response => response.json())
    .then(repartidores => {
      repartidoresGlobal = repartidores;
      listarPedidos();
    })
    .catch(error => {
      console.error("Error al cargar repartidores:", error);
      listarPedidos();
    });
}

function listarPedidos() {
  const url = usuarioSesion.rol === "REPARTIDOR"
    ? `${API_PEDIDOS}/repartidor/${usuarioSesion.id}`
    : API_PEDIDOS;

  fetch(url)
    .then(response => response.json())
    .then(pedidos => {
      pedidosGlobal = pedidos;
      actualizarEstadisticas(pedidosGlobal);
      renderPedidos(pedidosGlobal);
    })
    .catch(error => {
      console.error(error);
      alert("No se pudieron cargar los pedidos");
    });
}

function obtenerIdRepartidor(pedido) {
  if (pedido.idRepartidor) return pedido.idRepartidor;

  if (pedido.repartidor && typeof pedido.repartidor === "object") {
    return pedido.repartidor.id;
  }

  return null;
}

function obtenerNombreRepartidor(pedido) {
  if (pedido.repartidor && typeof pedido.repartidor === "object") {
    return pedido.repartidor.nombre || "Sin asignar";
  }

  if (typeof pedido.repartidor === "string") {
    return pedido.repartidor;
  }

  return "Sin asignar";
}

function renderPedidos(pedidos) {
  const tabla = document.getElementById("tablaPedidos");
  tabla.innerHTML = "";

  if (pedidos.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="13">No hay pedidos para mostrar.</td>
      </tr>
    `;
    return;
  }

  pedidos.forEach(pedido => {
    const cliente = pedido.cliente || {};
    const idPedido = pedido.id || pedido.idPedido;

    const nombreCliente = cliente.nombre || pedido.cliente || "Sin cliente";
    const telefono = cliente.telefono || pedido.telefono || "-";
    const direccion = cliente.direccion || pedido.direccion || "-";
    const detalle = pedido.detallePedido || generarDetalleDesdeItems(pedido.detalles);

    const idRepartidorActual = obtenerIdRepartidor(pedido);
    const repartidorNombre = obtenerNombreRepartidor(pedido);

    tabla.innerHTML += `
      <tr>
        <td>#${idPedido}</td>
        <td>${nombreCliente}</td>
        <td>${telefono}</td>
        <td>${direccion}</td>

        <td class="detalle">
          ${(detalle || "-").replaceAll("|", "<br>")}
        </td>

        <td>${pedido.metodoPago || "No especificado"}</td>
        <td>${pedido.estadoPago || "No especificado"}</td>
        <td>S/ ${Number(pedido.total || 0).toFixed(2)}</td>

        <td>
          <span class="estado ${pedido.estado}">
            ${pedido.estado}
          </span>
        </td>

        <td>
          ${renderAsignacionRepartidor(idPedido, idRepartidorActual, repartidorNombre)}
        </td>

        <td>
          <button class="btn-estado btn-pendiente" onclick="cambiarEstado(${idPedido}, 'PENDIENTE')">
            Pendiente
          </button>

          <button class="btn-estado btn-camino" onclick="cambiarEstado(${idPedido}, 'EN_CAMINO')">
            En camino
          </button>

          <button class="btn-estado btn-entregado" onclick="cambiarEstado(${idPedido}, 'ENTREGADO')">
            Entregado
          </button>
        </td>

        <td>
          <a class="btn-ver" href="comprobante.html?id=${idPedido}">
            Ver
          </a>
        </td>

        <td>${formatearFecha(pedido.fechaCreacion)}</td>
      </tr>
    `;
  });
}

function renderAsignacionRepartidor(idPedido, idRepartidorActual, repartidorNombre) {
  if (usuarioSesion.rol === "REPARTIDOR") {
    return repartidorNombre;
  }

  let opciones = `<option value="">Sin asignar</option>`;

  repartidoresGlobal.forEach(rep => {
    const selected = Number(rep.id) === Number(idRepartidorActual) ? "selected" : "";

    opciones += `
      <option value="${rep.id}" ${selected}>
        ${rep.nombre}
      </option>
    `;
  });

  return `
    <select class="select-repartidor" onchange="asignarRepartidor(${idPedido}, this.value)">
      ${opciones}
    </select>
  `;
}

function asignarRepartidor(idPedido, idRepartidor) {
  if (!idRepartidor) {
    alert("Selecciona un repartidor válido.");
    return;
  }

  fetch(`${API_PEDIDOS}/${idPedido}/repartidor?idRepartidor=${idRepartidor}`, {
    method: "PUT"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo asignar repartidor");
    }
    return response.json();
  })
  .then(() => {
    alert("Repartidor asignado correctamente.");
    listarPedidos();
  })
  .catch(error => {
    console.error(error);
    alert("No se pudo asignar el repartidor.");
  });
}

function actualizarEstadisticas(pedidos) {
  document.getElementById("totalPedidos").textContent = pedidos.length;

  document.getElementById("totalPendientes").textContent =
    pedidos.filter(p => p.estado === "PENDIENTE").length;

  document.getElementById("totalCamino").textContent =
    pedidos.filter(p => p.estado === "EN_CAMINO").length;

  document.getElementById("totalEntregados").textContent =
    pedidos.filter(p => p.estado === "ENTREGADO").length;
}

function filtrarPedidos(estado) {
  if (estado === "TODOS") {
    renderPedidos(pedidosGlobal);
    return;
  }

  const filtrados = pedidosGlobal.filter(pedido => pedido.estado === estado);
  renderPedidos(filtrados);
}

function generarDetalleDesdeItems(detalles) {
  if (!detalles || detalles.length === 0) {
    return "-";
  }

  return detalles.map(item =>
    `${item.cantidad} x ${item.producto}`
  ).join(" | ");
}

function cambiarEstado(id, estado) {
  const idUsuario = usuarioSesion.id;

  fetch(`${API_PEDIDOS}/${id}/estado?estado=${estado}&idUsuario=${idUsuario}`, {
    method: "PUT"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo actualizar el estado");
    }
    return response.json();
  })
  .then(data => {
    alert("Estado actualizado a: " + data.estado);
    listarPedidos();
  })
  .catch(error => {
    console.error(error);
    alert("No se pudo actualizar el estado");
  });
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleString("es-PE");
}

function cerrarSesion() {
  localStorage.removeItem("usuarioAdminTAKE");
  window.location.href = "login.html";
}

function configurarMenuPorRol() {
  if (!usuarioSesion) return;

  if (usuarioSesion.rol === "REPARTIDOR") {
    const enlaces = document.querySelectorAll("nav a");

    enlaces.forEach(enlace => {
      const texto = enlace.textContent.trim();

      if (
        texto === "Productos" ||
        texto === "Categorías" ||
        texto === "Repartidores"
      ) {
        enlace.style.display = "none";
      }
    });
  }
}

iniciarAdmin();