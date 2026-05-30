package com.take.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private String estado;

    @Column(length = 500)
    private String detallePedido;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<DetallePedido> detalles;

    @ManyToOne
    @JoinColumn(name = "id_repartidor")
    private Usuario repartidor;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "codigo_pago")
    private String codigoPago;

    @Column(name = "estado_pago")
    private String estadoPago;
}