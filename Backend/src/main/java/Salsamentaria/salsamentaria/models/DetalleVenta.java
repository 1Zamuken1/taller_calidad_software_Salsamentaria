package Salsamentaria.salsamentaria.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_venta")
@Getter
@Setter
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_venta", nullable = false)
    @JsonIgnoreProperties({"detalles", "usuario"}) // Evitar loop con Venta
    private Venta venta;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    @JsonIgnoreProperties({"detalles", "categoria"}) // Evitar loop con Producto
    private Producto producto;

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "precio_unitario", nullable = false)
    private double precioUnitario;

    @Column(nullable = false)
    private double subtotal;
}