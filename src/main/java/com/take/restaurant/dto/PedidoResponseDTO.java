package com.take.restaurant.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoResponseDTO {

    private Long idPedido;
    private String cliente;
    private String telefono;
    private String direccion;
    private BigDecimal total;
    private String estado;
    private LocalDateTime fechaCreacion;

    private String metodoPago;
    private String codigoPago;
    private String estadoPago;

    private Long idRepartidor;
    private String repartidor;

    private List<DetalleResponseDTO> detalles;

    @Data
    public static class DetalleResponseDTO {
        private String producto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}