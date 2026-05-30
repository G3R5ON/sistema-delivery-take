const usuarioSesion = JSON.parse(localStorage.getItem("usuarioAdminTAKE"));

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbarLinks");
  if (!nav) return;

  const paginaActual = window.location.pathname.split("/").pop();

  function activo(pagina) {
    return paginaActual === pagina ? 'class="activo"' : "";
  }

  if (!usuarioSesion) {
    nav.innerHTML = `
      <a ${activo("index.html")} href="index.html">Inicio</a>
      <a ${activo("menu.html")} href="menu.html">Menú</a>
      <a href="login.html">Personal</a>
    `;
    return;
  }

  if (usuarioSesion.rol === "ADMIN") {
    nav.innerHTML = `
      <a ${activo("index.html")} href="index.html">Inicio</a>
      <a ${activo("menu.html")} href="menu.html">Menú</a>
      <a ${activo("admin.html")} href="admin.html">Panel Admin</a>
      <a href="#" onclick="cerrarSesion()">Cerrar sesión</a>
    `;
  }

  if (usuarioSesion.rol === "REPARTIDOR") {
    nav.innerHTML = `
      <a ${activo("index.html")} href="index.html">Inicio</a>
      <a ${activo("admin.html")} href="admin.html">Mis pedidos</a>
      <a href="#" onclick="cerrarSesion()">Cerrar sesión</a>
    `;
  }
});

function cerrarSesion() {
  localStorage.removeItem("usuarioAdminTAKE");
  window.location.href = "index.html";
}