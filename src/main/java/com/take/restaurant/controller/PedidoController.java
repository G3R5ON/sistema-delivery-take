package com.take.restaurant.controller;

import com.take.restaurant.dto.PedidoRequestDTO;
import com.take.restaurant.dto.PedidoResponseDTO;
import com.take.restaurant.entity.Pedido;
import com.take.restaurant.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public PedidoResponseDTO recibirPedido(@RequestBody PedidoRequestDTO request) {
        return pedidoService.crearPedido(request);
    }

    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoService.listarPedidos();
    }

    @PutMapping("/{id}/estado")
    public Pedido actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            @RequestParam Long idUsuario
    ) {
        return pedidoService.actualizarEstado(id, estado, idUsuario);
    }

    @GetMapping("/{id}")
    public PedidoResponseDTO obtenerPedidoPorId(@PathVariable Long id) {
        return pedidoService.obtenerPedidoPorId(id);
    }

    @PutMapping("/{id}/repartidor")
    public PedidoResponseDTO asignarRepartidor(
            @PathVariable Long id,
            @RequestParam Long idRepartidor
    ) {
        return pedidoService.asignarRepartidor(id, idRepartidor);
    }

    @GetMapping("/repartidor/{idRepartidor}")
    public List<PedidoResponseDTO> listarPedidosPorRepartidor(@PathVariable Long idRepartidor) {
        return pedidoService.listarPedidosPorRepartidor(idRepartidor);
    }
}