package com.take.restaurant.controller;

import com.take.restaurant.dto.LoginRequestDTO;
import com.take.restaurant.entity.Usuario;
import com.take.restaurant.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario crear(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody LoginRequestDTO request) {
        return usuarioRepository
                .findByCorreoAndPasswordAndEstado(
                        request.getCorreo(),
                        request.getPassword(),
                        "ACTIVO"
                )
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
    }

    @GetMapping("/repartidores")
    public List<Usuario> listarRepartidores() {
        return usuarioRepository.findByRol("REPARTIDOR");
    }

    @GetMapping("/repartidores/activos")
    public List<Usuario> listarRepartidoresActivos() {
        return usuarioRepository.findByRolAndEstado("REPARTIDOR", "ACTIVO");
    }

    @PostMapping("/repartidores")
    public Usuario crearRepartidor(@RequestBody Usuario usuario) {
        usuario.setRol("REPARTIDOR");

        if (usuario.getEstado() == null || usuario.getEstado().isBlank()) {
            usuario.setEstado("ACTIVO");
        }

        return usuarioRepository.save(usuario);
    }

    @PutMapping("/repartidores/{id}")
    public Usuario actualizarRepartidor(
            @PathVariable Long id,
            @RequestBody Usuario usuarioActualizado
    ) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repartidor no encontrado"));

        usuario.setNombre(usuarioActualizado.getNombre());
        usuario.setCorreo(usuarioActualizado.getCorreo());

        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isBlank()) {
            usuario.setPassword(usuarioActualizado.getPassword());
        }

        usuario.setEstado(usuarioActualizado.getEstado());
        usuario.setRol("REPARTIDOR");

        return usuarioRepository.save(usuario);
    }

    @DeleteMapping("/repartidores/{id}")
    public void eliminarRepartidor(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
    }
}