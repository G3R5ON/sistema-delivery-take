package com.take.restaurant.controller;

import com.take.restaurant.entity.Cliente;
import com.take.restaurant.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @PostMapping
    public Cliente crearCliente(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }
}