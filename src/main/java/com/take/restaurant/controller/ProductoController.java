package com.take.restaurant.controller;

import com.take.restaurant.entity.Producto;
import com.take.restaurant.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listarPlatos() {
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Long id, @RequestBody Producto productoActualizado) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(productoActualizado.getNombre());
        producto.setPrecio(productoActualizado.getPrecio());
        producto.setCategoria(productoActualizado.getCategoria());

        return productoRepository.save(producto);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoRepository.deleteById(id);
    }
}