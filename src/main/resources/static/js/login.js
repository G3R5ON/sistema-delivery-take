const API_LOGIN = "http://localhost:8084/api/usuarios/login";

function iniciarSesion() {
  const correo = document.getElementById("correo").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!correo || !password) {
    alert("Ingresa correo y contraseña.");
    return;
  }

  fetch(API_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      correo: correo,
      password: password
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }
    return response.json();
  })
  .then(usuario => {
  if (usuario.rol !== "ADMIN" && usuario.rol !== "REPARTIDOR") {
    alert("No tienes permisos para ingresar.");
    return;
  }

  localStorage.setItem("usuarioAdminTAKE", JSON.stringify({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol
  }));

  window.location.href = "admin.html";
})
  .catch(error => {
    console.error(error);
    alert("Correo o contraseña incorrectos.");
  });
}

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    iniciarSesion();
  }
});