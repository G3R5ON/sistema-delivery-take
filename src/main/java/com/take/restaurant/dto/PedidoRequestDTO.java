package com.take.restaurant.dto;

import lombok.Data;

import java.util.List;

@Data
public class PedidoRequestDTO {

    private String clienteNombre;
    private String telefono;
    private String direccion;
    private String referencia;
    private String metodoPago;
    private String codigoPago;

    private List<ItemPedidoDTO> items;

    @Data
    public static class ItemPedidoDTO {
        private Long productoId;
        private Integer cantidad;
    }
}