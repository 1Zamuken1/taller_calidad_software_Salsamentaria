package Salsamentaria.salsamentaria.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Integer id;
    private String nombre;    // ← Agregar esto
    private String email;     // ← Opcional
    private String rol;       // ← Opcional
}