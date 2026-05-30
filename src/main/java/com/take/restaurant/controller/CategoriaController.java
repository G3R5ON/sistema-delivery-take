package com.take.restaurant.controller;

import com.take.restaurant.entity.Categoria;
import com.take.restaurant.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    @PostMapping
    public Categoria crearCategoria(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @PutMapping("/{id}")
    public Categoria actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoriaActualizada) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoria.setNombre(categoriaActualizada.getNombre());
        categoria.setDescripcion(categoriaActualizada.getDescripcion());

        return categoriaRepository.save(categoria);
    }

    @DeleteMapping("/{id}")
    public void eliminarCategoria(@PathVariable Long id) {
        categoriaRepository.deleteById(id);
    }
}