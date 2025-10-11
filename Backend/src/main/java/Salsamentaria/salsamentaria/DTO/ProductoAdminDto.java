package Salsamentaria.salsamentaria.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductoAdminDto {
    private Integer id_producto;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String imagen_url;
    private Boolean estado;
    
    // Información de la categoría anidada
    private CategoriaDto categoria;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoriaDto {
        private Integer id_categoria;
        private String nombre;
        private String descripcion;
    }
}