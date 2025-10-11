package Salsamentaria.salsamentaria.models;

import Salsamentaria.salsamentaria.User.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ventas")
@Getter
@Setter
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnoreProperties({"ventas", "password", "authorities", "accountNonExpired", 
                           "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User usuario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private Double total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoVenta estado;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"venta"}) // Evitar loop
    private List<DetalleVenta> detalles;

    public enum EstadoVenta {
        COMPLETADA, CANCELADA, PENDIENTE
    }
}