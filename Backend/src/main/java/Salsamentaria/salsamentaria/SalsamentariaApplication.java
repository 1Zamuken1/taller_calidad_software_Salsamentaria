package Salsamentaria.salsamentaria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication(scanBasePackages = "Salsamentaria.salsamentaria")
public class SalsamentariaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalsamentariaApplication.class, args);
    }

    // Configuración global de CORS para todas las rutas
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Todas las rutas
                        .allowedOrigins("http://localhost:4200") // Solo Angular
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
