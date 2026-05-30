const API = "http://localhost:8084/api/usuarios/repartidores";
let repartidoresGlobal = [];
function listarRepartidores() {

  fetch(API)

    .then(response => response.json())

    .then(repartidores => {
        repartidoresGlobal = repartidores;  

      const tabla = document.getElementById("tablaRepartidores");

      tabla.innerHTML = "";
      

      repartidores.forEach(repartidor => {

        tabla.innerHTML += `
          <tr>

            <td>${repartidor.id}</td>

            <td>${repartidor.nombre}</td>

            <td>${repartidor.correo}</td>

            <td>
              <span class="estado ${repartidor.estado}">
                ${repartidor.estado}
              </span>
            </td>

            <td>
              ${formatearFecha(repartidor.fechaCreacion)}
            </td>

            <td>

              <button
                class="btn btn-editar"
                onclick="editarEstado(${repartidor.id}, '${repartidor.estado}')"
              >
                Estado
              </button>

              <button
                class="btn btn-eliminar"
                onclick="eliminar(${repartidor.id})"
              >
                Eliminar
              </button>

            </td>

          </tr>
        `;
      });

    })

    .catch(error => {
      console.error(error);
      alert("Error al cargar repartidores");
    });
}

function crearRepartidor() {

  const nombre = document.getElementById("nombre").value.trim();

  const correo = document.getElementById("correo").value.trim();

  const password = document.getElementById("password").value.trim();

  if (!nombre || !correo || !password) {
    alert("Completa todos los campos");
    return;
  }

  const repartidor = {
    nombre,
    correo,
    password,
    rol: "REPARTIDOR",
    estado: "ACTIVO"
  };

  fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(repartidor)
  })

  .then(response => response.json())

  .then(data => {

    alert("Repartidor creado");

    document.getElementById("nombre").value = "";
    document.getElementById("correo").value = "";
    document.getElementById("password").value = "";

    listarRepartidores();
  })

  .catch(error => {
    console.error(error);
    alert("Error al crear repartidor");
  });
}

function editarEstado(id, estadoActual) {
  const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

  const repartidor = obtenerRepartidorPorId(id);

  if (!repartidor) {
    alert("No se encontró el repartidor.");
    return;
  }

  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre: repartidor.nombre,
      correo: repartidor.correo,
      password: repartidor.password,
      estado: nuevoEstado
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error al actualizar estado");
    }
    return response.json();
  })
  .then(() => {
    alert("Estado actualizado");
    listarRepartidores();
  })
  .catch(error => {
    console.error(error);
    alert("Error al actualizar estado");
  });
}

function eliminar(id) {

  if (!confirm("¿Eliminar repartidor?")) {
    return;
  }

  fetch(`${API}/${id}`, {
    method: "DELETE"
  })

  .then(() => {

    alert("Repartidor eliminado");

    listarRepartidores();
  })

  .catch(error => {
    console.error(error);
    alert("Error al eliminar");
  });
}

function formatearFecha(fecha) {

  if (!fecha) return "-";

  return new Date(fecha).toLocaleString("es-PE");
}
function obtenerRepartidorPorId(id) {
  return repartidoresGlobal.find(r => r.id === id);
}

listarRepartidores();