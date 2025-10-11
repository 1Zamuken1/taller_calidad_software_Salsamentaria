package Salsamentaria.salsamentaria.controllers;

import Salsamentaria.salsamentaria.User.User;
import Salsamentaria.salsamentaria.User.UserRepository;
import Salsamentaria.salsamentaria.models.*;
import Salsamentaria.salsamentaria.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UserRepository usuarioRepository;

    // ================== CREAR VENTA CON VALIDACIÓN Y DESCUENTO DE STOCK ==================
    @PostMapping("/crear")
    public ResponseEntity<Object> crearVenta(@RequestBody VentaRequest request) {
        try {
            // Validar que el usuario existe
            User usuario = usuarioRepository.findById(request.getId_usuario())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Lista para almacenar productos sin stock suficiente
            List<String> erroresStock = new ArrayList<>();

            // VALIDAR STOCK ANTES DE CREAR LA VENTA
            for (VentaRequest.DetalleRequest detalleReq : request.getDetalles()) {
                Producto producto = productoRepository.findById(detalleReq.getId_producto().intValue())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + detalleReq.getId_producto()));

                // Verificar si hay stock suficiente
                if (producto.getStock() == null || producto.getStock() < detalleReq.getCantidad()) {
                    erroresStock.add(String.format("'%s' - Stock disponible: %d, solicitado: %d",
                            producto.getNombre(),
                            producto.getStock() != null ? producto.getStock() : 0,
                            detalleReq.getCantidad()));
                }

                // Verificar si el producto está activo
                if (!producto.getEstado()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "El producto '" + producto.getNombre() + "' no está disponible"));
                }
            }

            // Si hay errores de stock, devolver todos juntos
            if (!erroresStock.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "error", "Stock insuficiente para los siguientes productos",
                                "detalles", erroresStock
                        ));
            }

            // Crear la venta
            Venta venta = new Venta();
            venta.setUsuario(usuario);
            venta.setEstado(Venta.EstadoVenta.PENDIENTE);
            venta.setFecha(LocalDateTime.now());

            double total = 0.0;
            List<DetalleVenta> detalles = new ArrayList<>();

            // Crear detalles y DESCONTAR STOCK
            for (VentaRequest.DetalleRequest detalleReq : request.getDetalles()) {
                Producto producto = productoRepository.findById(detalleReq.getId_producto().intValue())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

                double subtotal = producto.getPrecio() * detalleReq.getCantidad();
                total += subtotal;

                // ⭐ DESCONTAR STOCK
                producto.setStock(producto.getStock() - detalleReq.getCantidad());
                productoRepository.save(producto);

                DetalleVenta detalle = new DetalleVenta();
                detalle.setVenta(venta);
                detalle.setProducto(producto);
                detalle.setCantidad(detalleReq.getCantidad());
                detalle.setPrecioUnitario(producto.getPrecio());
                detalle.setSubtotal(subtotal);

                detalles.add(detalle);
            }

            venta.setDetalles(detalles);
            venta.setTotal(total);

            ventaRepository.save(venta);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Venta registrada correctamente",
                    "total", total,
                    "id_venta", venta.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================== HISTORIAL DE COMPRAS DEL USUARIO AUTENTICADO ==================
    @GetMapping("/mis-compras")
    public ResponseEntity<Object> obtenerMisCompras(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "No autenticado"));
            }

            User usuario = (User) authentication.getPrincipal();
            List<Venta> ventas = ventaRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId());

            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================== OBTENER COMPRAS POR ID DE USUARIO (para admin) ==================
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<Object> obtenerComprasPorUsuario(@PathVariable Integer userId) {
        try {
            User usuario = usuarioRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            List<Venta> ventas = ventaRepository.findByUsuarioIdOrderByFechaDesc(userId);

            return ResponseEntity.ok(Map.of(
                    "usuario", Map.of(
                            "id", usuario.getId(),
                            "nombre", usuario.getNombre(),
                            "email", usuario.getEmail()
                    ),
                    "ventas", ventas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================== LISTAR TODAS LAS VENTAS ==================
    @GetMapping("/")
    public ResponseEntity<Object> listarVentas() {
        List<Venta> ventas = ventaRepository.findAll();
        return ResponseEntity.ok(ventas);
    }

    // ================== OBTENER VENTA POR ID ==================
    @GetMapping("/{id}")
    public ResponseEntity<Object> obtenerVenta(@PathVariable Integer id) {
        return ventaRepository.findById(id)
                .<ResponseEntity<Object>>map(venta -> ResponseEntity.ok(venta))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Venta con id " + id + " no encontrada")));
    }

    // ================== ACTUALIZAR ESTADO ==================
    @PutMapping("/{id}/estado")
    public ResponseEntity<? extends Map<String, ? extends Serializable>> actualizarEstado(
            @PathVariable Integer id, 
            @RequestParam String estado) {
        return ventaRepository.findById(id).map(venta -> {
            try {
                Venta.EstadoVenta estadoAnterior = venta.getEstado();
                Venta.EstadoVenta nuevoEstado = Venta.EstadoVenta.valueOf(estado.toUpperCase());
                
                // Si se cancela una venta PENDIENTE, restaurar el stock
                if (estadoAnterior == Venta.EstadoVenta.PENDIENTE && 
                    nuevoEstado == Venta.EstadoVenta.CANCELADA) {
                    
                    for (DetalleVenta detalle : venta.getDetalles()) {
                        Producto producto = detalle.getProducto();
                        producto.setStock(producto.getStock() + detalle.getCantidad());
                        productoRepository.save(producto);
                    }
                }
                
                venta.setEstado(nuevoEstado);
                ventaRepository.save(venta);
                
                return ResponseEntity.ok(Map.of(
                        "mensaje", "Estado actualizado",
                        "nuevo_estado", venta.getEstado(),
                        "stock_restaurado", estadoAnterior == Venta.EstadoVenta.PENDIENTE && 
                                           nuevoEstado == Venta.EstadoVenta.CANCELADA
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Estado inválido. Valores válidos: COMPLETADA, CANCELADA, PENDIENTE")
                );
            }
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "Venta con id " + id + " no encontrada")));
    }

    // ================== ELIMINAR ==================
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarVenta(@PathVariable Integer id) {
        return ventaRepository.findById(id).map(venta -> {
            // Restaurar stock si la venta estaba PENDIENTE
            if (venta.getEstado() == Venta.EstadoVenta.PENDIENTE) {
                for (DetalleVenta detalle : venta.getDetalles()) {
                    Producto producto = detalle.getProducto();
                    producto.setStock(producto.getStock() + detalle.getCantidad());
                    productoRepository.save(producto);
                }
            }
            
            ventaRepository.delete(venta);
            return ResponseEntity.ok(Map.of("mensaje", "Venta eliminada correctamente"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "Venta con id " + id + " no encontrada")));
    }
}