package Salsamentaria.salsamentaria.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_producto;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    private Integer stock;

    private String imagen_url;

    @Column(nullable = false)
    private Boolean estado = true;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @OneToMany(mappedBy = "producto")
    @JsonIgnore // ← AGREGAR ESTA ANOTACIÓN para evitar serialización infinita
    private List<DetalleVenta> detalles;
}