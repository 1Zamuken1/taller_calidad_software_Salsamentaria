package Salsamentaria.salsamentaria.User;

import Salsamentaria.salsamentaria.models.Venta;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "usuarios", uniqueConstraints = {@UniqueConstraint(columnNames = {"email"})})
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String email;

    @JsonIgnore // No serializar la contraseña en respuestas JSON
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Rol rol;
    
    private Boolean estado = true;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore // Evitar loop de serialización con Venta
    private List<Venta> ventas;

    @Override
    @JsonIgnore // No serializar authorities
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return estado;
    }
}