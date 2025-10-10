package Salsamentaria.salsamentaria.controllers;

import Salsamentaria.salsamentaria.User.User;
import Salsamentaria.salsamentaria.User.UserRepository;
import Salsamentaria.salsamentaria.models.*;
import Salsamentaria.salsamentaria.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // ================== CREAR ==================
    @PostMapping("/crear")
    public ResponseEntity<Object> crearVenta(@RequestBody VentaRequest request) {
        try {
            User usuario = usuarioRepository.findById(request.getId_usuario())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Venta venta = new Venta();
            venta.setUsuario(usuario);
            venta.setEstado(Venta.EstadoVenta.PENDIENTE);
            venta.setFecha(LocalDateTime.now());

            double total = 0.0;
            List<DetalleVenta> detalles = new ArrayList<>();

            for (VentaRequest.DetalleRequest detalleReq : request.getDetalles()) {
                Producto producto = productoRepository.findById(detalleReq.getId_producto().intValue())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

                double subtotal = producto.getPrecio() * detalleReq.getCantidad();
                total += subtotal;

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

    // ================== LISTAR ==================
    @GetMapping("/")
    public ResponseEntity<Object> listarVentas() {
        List<Venta> ventas = ventaRepository.findAll();
        return ResponseEntity.ok(ventas);
    }

    // ================== OBTENER POR ID ==================
    @GetMapping("/{id}")
    public ResponseEntity<Object> obtenerVenta(@PathVariable Integer id) {
        return ventaRepository.findById(id)
                .<ResponseEntity<Object>>map(venta -> ResponseEntity.ok(venta))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Venta con id " + id + " no encontrada")));
    }

    // ================== ACTUALIZAR ESTADO ==================
    @PutMapping("/{id}/estado")
    public ResponseEntity<? extends Map<String,? extends Serializable>> actualizarEstado(@PathVariable Integer id, @RequestParam String estado) {
        return ventaRepository.findById(id).map(venta -> {
            try {
                venta.setEstado(Venta.EstadoVenta.valueOf(estado.toUpperCase()));
                ventaRepository.save(venta);
                return ResponseEntity.ok(Map.of(
                        "mensaje", "Estado actualizado",
                        "nuevo_estado", venta.getEstado()
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
            ventaRepository.delete(venta);
            return ResponseEntity.ok(Map.of("mensaje", "Venta eliminada correctamente"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "Venta con id " + id + " no encontrada")));
    }
}
