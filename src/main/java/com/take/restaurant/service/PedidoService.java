package com.take.restaurant.service;

import com.take.restaurant.dto.PedidoRequestDTO;
import com.take.restaurant.dto.PedidoResponseDTO;
import com.take.restaurant.entity.Cliente;
import com.take.restaurant.entity.DetallePedido;
import com.take.restaurant.entity.Pedido;
import com.take.restaurant.entity.Producto;
import com.take.restaurant.repository.ClienteRepository;
import com.take.restaurant.repository.DetallePedidoRepository;
import com.take.restaurant.repository.PedidoRepository;
import com.take.restaurant.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.take.restaurant.entity.HistorialEstadoPedido;
import com.take.restaurant.entity.Usuario;
import com.take.restaurant.repository.HistorialEstadoPedidoRepository;
import com.take.restaurant.repository.UsuarioRepository;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.google.common.base.Preconditions;

import java.io.ByteArrayOutputStream;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final Logger logger = LoggerFactory.getLogger(PedidoService.class);
    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialEstadoPedidoRepository historialRepository;

    @Transactional
    public PedidoResponseDTO crearPedido(PedidoRequestDTO request) {
        validarPedido(request);

        Cliente cliente = new Cliente();
        cliente.setNombre(request.getClienteNombre());
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
        cliente.setReferencia(request.getReferencia());

        Cliente clienteGuardado = clienteRepository.save(cliente);

        Pedido pedido = new Pedido();
        pedido.setCliente(clienteGuardado);
        pedido.setEstado("PENDIENTE");
        pedido.setMetodoPago(request.getMetodoPago());
        pedido.setCodigoPago(request.getCodigoPago());

        if ("EFECTIVO".equalsIgnoreCase(request.getMetodoPago())) {
            pedido.setEstadoPago("PENDIENTE");
        } else if ("YAPE".equalsIgnoreCase(request.getMetodoPago())) {
            pedido.setEstadoPago("PENDIENTE_VALIDACION");
        } else if ("TARJETA".equalsIgnoreCase(request.getMetodoPago())) {
            pedido.setEstadoPago("SIMULADO");
        } else {
            pedido.setEstadoPago("PENDIENTE");
        }

        BigDecimal total = BigDecimal.ZERO;
        StringBuilder resumenPedido = new StringBuilder();
        List<DetallePedido> detalles = new ArrayList<>();

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        for (PedidoRequestDTO.ItemPedidoDTO item : request.getItems()) {

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getProductoId()));

            BigDecimal precioUnitario = producto.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);

            detallePedidoRepository.save(detalle);
            detalles.add(detalle);

            total = total.add(subtotal);

            resumenPedido
                    .append(item.getCantidad())
                    .append(" x ")
                    .append(producto.getNombre())
                    .append(" = S/ ")
                    .append(subtotal)
                    .append(" | ");
        }

        pedidoGuardado.setTotal(total);
        pedidoGuardado.setDetallePedido(resumenPedido.toString());
        pedidoGuardado.setDetalles(detalles);

        Pedido pedidoFinal = pedidoRepository.save(pedidoGuardado);
        logger.info("Pedido registrado correctamente con ID: {}", pedidoFinal.getId());

        return convertirAResponseDTO(pedidoFinal);
    }

    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"));
    }

    @Transactional
    public Pedido actualizarEstado(Long id, String nuevoEstado, Long idUsuario) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String estadoAnterior = pedido.getEstado();

        pedido.setEstado(nuevoEstado);
        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        HistorialEstadoPedido historial = new HistorialEstadoPedido();
        historial.setPedido(pedidoActualizado);
        historial.setUsuario(usuario);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(nuevoEstado);

        historialRepository.save(historial);
        logger.info(
                "Pedido {} actualizado de {} a {} por el usuario {}",
                pedido.getId(),
                estadoAnterior,
                nuevoEstado,
                usuario.getNombre()
        );

        return pedidoActualizado;
    }

    public PedidoResponseDTO convertirAResponseDTO(Pedido pedido) {

        PedidoResponseDTO response = new PedidoResponseDTO();

        response.setIdPedido(pedido.getId());
        response.setCliente(pedido.getCliente().getNombre());
        response.setTelefono(pedido.getCliente().getTelefono());
        response.setDireccion(pedido.getCliente().getDireccion());
        response.setTotal(pedido.getTotal());
        response.setEstado(pedido.getEstado());
        response.setFechaCreacion(pedido.getFechaCreacion());
        response.setMetodoPago(pedido.getMetodoPago());
        response.setCodigoPago(pedido.getCodigoPago());
        response.setEstadoPago(pedido.getEstadoPago());

        if (pedido.getRepartidor() != null) {
            response.setIdRepartidor(pedido.getRepartidor().getId());
            response.setRepartidor(pedido.getRepartidor().getNombre());
        }

        List<PedidoResponseDTO.DetalleResponseDTO> detalles = pedido.getDetalles()
                .stream()
                .map(detalle -> {
                    PedidoResponseDTO.DetalleResponseDTO dto = new PedidoResponseDTO.DetalleResponseDTO();
                    dto.setProducto(detalle.getProducto().getNombre());
                    dto.setCantidad(detalle.getCantidad());
                    dto.setPrecioUnitario(detalle.getPrecioUnitario());
                    dto.setSubtotal(detalle.getSubtotal());
                    return dto;
                })
                .toList();

        response.setDetalles(detalles);

        return response;
    }

    public PedidoResponseDTO obtenerPedidoPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        return convertirAResponseDTO(pedido);
    }

    @Transactional
    public PedidoResponseDTO asignarRepartidor(Long idPedido, Long idRepartidor) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Usuario repartidor = usuarioRepository.findById(idRepartidor)
                .orElseThrow(() -> new RuntimeException("Repartidor no encontrado"));

        if (!"REPARTIDOR".equalsIgnoreCase(repartidor.getRol())) {
            throw new RuntimeException("El usuario seleccionado no es repartidor");
        }

        if (!"ACTIVO".equalsIgnoreCase(repartidor.getEstado())) {
            throw new RuntimeException("El repartidor no está activo");
        }

        pedido.setRepartidor(repartidor);

        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        logger.info(
                "Pedido {} asignado al repartidor {}",
                pedido.getId(),
                repartidor.getNombre()
        );

        return convertirAResponseDTO(pedidoActualizado);
    }

    public List<PedidoResponseDTO> listarPedidosPorRepartidor(Long idRepartidor) {
        return pedidoRepository.findByRepartidorId(
                idRepartidor,
                Sort.by(Sort.Direction.DESC, "fechaCreacion")
        )
        .stream()
        .map(this::convertirAResponseDTO)
        .toList();
    }

    private void validarPedido(PedidoRequestDTO request) {

            Preconditions.checkArgument(
                    !StringUtils.isBlank(request.getClienteNombre()),
                    "El nombre del cliente es obligatorio"
            );

            Preconditions.checkArgument(
                    !StringUtils.isBlank(request.getTelefono()),
                    "El teléfono del cliente es obligatorio"
            );

            Preconditions.checkArgument(
                    !StringUtils.isBlank(request.getDireccion()),
                    "La dirección de entrega es obligatoria"
            );

            Preconditions.checkArgument(
                    !StringUtils.isBlank(request.getMetodoPago()),
                    "El método de pago es obligatorio"
            );

            Preconditions.checkArgument(
                    request.getItems() != null &&
                    !request.getItems().isEmpty(),
                    "El pedido debe tener al menos un producto"
            );
        }
     public byte[] exportarPedidosExcel() {

        List<Pedido> pedidos = listarPedidos();

        try (Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Pedidos TAKE");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("Cliente");
            header.createCell(2).setCellValue("Teléfono");
            header.createCell(3).setCellValue("Dirección");
            header.createCell(4).setCellValue("Detalle");
            header.createCell(5).setCellValue("Método Pago");
            header.createCell(6).setCellValue("Estado Pago");
            header.createCell(7).setCellValue("Total");
            header.createCell(8).setCellValue("Estado Pedido");
            header.createCell(9).setCellValue("Repartidor");
            header.createCell(10).setCellValue("Fecha");

            int rowIndex = 1;

            for (Pedido pedido : pedidos) {
                Row row = sheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(pedido.getId());

                row.createCell(1).setCellValue(
                        pedido.getCliente() != null ? pedido.getCliente().getNombre() : "-"
                );

                row.createCell(2).setCellValue(
                        pedido.getCliente() != null ? pedido.getCliente().getTelefono() : "-"
                );

                row.createCell(3).setCellValue(
                        pedido.getCliente() != null ? pedido.getCliente().getDireccion() : "-"
                );

                row.createCell(4).setCellValue(
                        pedido.getDetallePedido() != null ? pedido.getDetallePedido() : "-"
                );

                row.createCell(5).setCellValue(
                        pedido.getMetodoPago() != null ? pedido.getMetodoPago() : "-"
                );

                row.createCell(6).setCellValue(
                        pedido.getEstadoPago() != null ? pedido.getEstadoPago() : "-"
                );

                row.createCell(7).setCellValue(
                        pedido.getTotal() != null ? pedido.getTotal().doubleValue() : 0
                );

                row.createCell(8).setCellValue(
                        pedido.getEstado() != null ? pedido.getEstado() : "-"
                );

                row.createCell(9).setCellValue(
                        pedido.getRepartidor() != null ? pedido.getRepartidor().getNombre() : "Sin asignar"
                );

                row.createCell(10).setCellValue(
                        pedido.getFechaCreacion() != null ? pedido.getFechaCreacion().toString() : "-"
                );
            }

            for (int i = 0; i <= 10; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            logger.info("Reporte Excel de pedidos generado correctamente");

            return out.toByteArray();

        } catch (Exception e) {
            logger.error("Error al generar reporte Excel de pedidos", e);
            throw new RuntimeException("No se pudo generar el reporte Excel");
        }
    }
}