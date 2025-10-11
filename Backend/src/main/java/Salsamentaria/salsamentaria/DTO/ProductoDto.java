package Salsamentaria.salsamentaria.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductoDto {
    private Integer id_producto;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String imagen_url;
    private Boolean estado;
    private String nombreCategoria; // Opcional: para mostrar el nombre de la categoría
    private Integer idCategoria;     // Opcional: para mostrar el ID de la categoría
}
