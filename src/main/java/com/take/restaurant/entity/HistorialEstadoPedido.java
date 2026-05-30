package com.take.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialEstadoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    private String estadoAnterior;

    @Column(nullable = false)
    private String estadoNuevo;

    @CreationTimestamp
    @Column(name = "fecha_cambio", updatable = false)
    private LocalDateTime fechaCambio;
}