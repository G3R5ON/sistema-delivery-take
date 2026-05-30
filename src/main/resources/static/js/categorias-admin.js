const API_CATEGORIAS = "http://localhost:8084/api/categorias";

let categorias = [];

function listarCategorias() {
  fetch(API_CATEGORIAS)
    .then(response => response.json())
    .then(data => {
      categorias = data;

      const tabla = document.getElementById("tablaCategorias");
      tabla.innerHTML = "";

      categorias.forEach(categoria => {
        tabla.innerHTML += `
          <tr>
            <td>#${categoria.id}</td>
            <td>${categoria.nombre}</td>
            <td>${categoria.descripcion || "-"}</td>
            <td>
              <button class="btn-editar" onclick="editarCategoria(${categoria.id})">
                Editar
              </button>
              <button class="btn-eliminar" onclick="eliminarCategoria(${categoria.id})">
                Eliminar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(error => {
      console.error("Error al cargar categorías:", error);
      alert("No se pudieron cargar las categorías.");
    });
}

function guardarCategoria() {
  const id = document.getElementById("categoriaId").value;
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!nombre) {
    alert("Ingresa el nombre de la categoría.");
    return;
  }

  const categoria = {
    nombre: nombre,
    descripcion: descripcion
  };

  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API_CATEGORIAS}/${id}` : API_CATEGORIAS;

  fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(categoria)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo guardar la categoría.");
    }
    return response.json();
  })
  .then(() => {
    alert(id ? "Categoría actualizada correctamente." : "Categoría registrada correctamente.");
    limpiarFormulario();
    listarCategorias();
  })
  .catch(error => {
    console.error("Error al guardar categoría:", error);
    alert("No se pudo guardar la categoría.");
  });
}

function editarCategoria(id) {
  const categoria = categorias.find(c => c.id === id);

  if (!categoria) {
    alert("Categoría no encontrada.");
    return;
  }

  document.getElementById("categoriaId").value = categoria.id;
  document.getElementById("nombre").value = categoria.nombre;
  document.getElementById("descripcion").value = categoria.descripcion || "";
}

function eliminarCategoria(id) {
  if (!confirm("¿Seguro que deseas eliminar esta categoría?")) {
    return;
  }

  fetch(`${API_CATEGORIAS}/${id}`, {
    method: "DELETE"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo eliminar la categoría.");
    }

    alert("Categoría eliminada correctamente.");
    listarCategorias();
  })
  .catch(error => {
    console.error("Error al eliminar categoría:", error);
    alert("No se pudo eliminar la categoría. Puede estar asociada a productos.");
  });
}

function limpiarFormulario() {
  document.getElementById("categoriaId").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("descripcion").value = "";
}

function cerrarSesion() {
  localStorage.removeItem("usuarioAdminTAKE");
  window.location.href = "login.html";
}

listarCategorias();