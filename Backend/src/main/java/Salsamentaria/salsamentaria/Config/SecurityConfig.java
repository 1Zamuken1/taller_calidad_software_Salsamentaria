package Salsamentaria.salsamentaria.Config;

import Salsamentaria.salsamentaria.JWT.JwtAutenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración de seguridad para la aplicación.
 * Implementa autenticación stateless con JWT y protección mediante roles.
 * 
 * @author Juan Barrios
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAutenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authProvider;

    /**
     * Configura la cadena de filtros de seguridad.
     * 
     * CSRF está deshabilitado de forma segura porque:
     * - La aplicación usa autenticación JWT (stateless)
     * - No se utilizan cookies de sesión
     * - Cumple con las recomendaciones de OWASP para REST APIs
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // CSRF deshabilitado de forma segura para API REST stateless con JWT
                // Justificación: Esta aplicación no usa cookies de sesión, por lo tanto
                // no es vulnerable a ataques CSRF. Los tokens JWT se envían vía headers.
                // Ref: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
                .csrf(csrf -> csrf.disable())
                
                .httpBasic(basic -> basic.disable())
                .authorizeHttpRequests(auth -> auth
                        // Rutas públicas
                        .requestMatchers("/auth/**").permitAll()
                        
                        // Rutas solo para ADMIN
                        .requestMatchers("/api/productos/admin").hasRole("ADMIN")
                        .requestMatchers("/api/crear", "/api/editar/**", "/api/eliminar/**").hasRole("ADMIN")
                        .requestMatchers("/api/categorias/crear", "/api/categorias/editar/**", "/api/categorias/eliminar/**").hasRole("ADMIN")
                        .requestMatchers("/api/ventas/", "/api/ventas/usuario/**", "/api/ventas/*/estado").hasRole("ADMIN")
                        
                        // Rutas autenticadas (ADMIN y CLIENTE)
                        .requestMatchers("/api/productos", "/api/productos/**").authenticated()
                        .requestMatchers("/api/categorias", "/api/categorias/").authenticated()
                        .requestMatchers("/api/ventas/crear", "/api/ventas/mis-compras").authenticated()
                        .requestMatchers("/api/usuarios/me").authenticated()
                        
                        .anyRequest().permitAll()
                )
                .sessionManagement(sessionManager ->
                        sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Configura CORS para permitir peticiones desde el frontend.
     * Restringido únicamente a localhost:4200 en desarrollo.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}