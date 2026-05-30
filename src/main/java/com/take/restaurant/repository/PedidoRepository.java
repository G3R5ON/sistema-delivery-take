package com.take.restaurant.repository;

import com.take.restaurant.entity.Pedido;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByRepartidorId(Long idRepartidor, Sort sort);
}