package Salsamentaria.salsamentaria.controllers;

import Salsamentaria.salsamentaria.models.Categoria;
import Salsamentaria.salsamentaria.models.Producto;
import Salsamentaria.salsamentaria.repository.ProductoRepository;
import Salsamentaria.salsamentaria.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api") // opcional, pero recomendable
public class ProductoController {

    @Autowired
    private ProductoRepository repository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping("/")
    public String index(){
        return "CONECTADO";
    }

    @GetMapping("/productos")
    public List<Producto> getProductos(){
        return repository.findAll();
    }

    @PostMapping("/crear")
    public String save(@RequestBody Producto producto){
        repository.save(producto);
        return "Producto Creado Correctamente";
    }

    // ---- Actualización flexible: acepta { "id_categoria": 3 } o varios campos ----
    @PutMapping("/editar/{id}")
    public String update(@PathVariable("id") Integer id_producto, @RequestBody Map<String, Object> data){
        Producto updateProducto = repository.findById(id_producto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Campos opcionales: actualiza sólo si vienen en el body
        if (data.containsKey("nombre")) {
            updateProducto.setNombre((String) data.get("nombre"));
        }
        if (data.containsKey("descripcion")) {
            updateProducto.setDescripcion((String) data.get("descripcion"));
        }
        if (data.containsKey("precio")) {
            Object precioObj = data.get("precio");
            updateProducto.setPrecio(Double.valueOf(precioObj.toString()));
        }
        if (data.containsKey("stock")) {
            Object stockObj = data.get("stock");
            updateProducto.setStock(Integer.valueOf(stockObj.toString()));
        }
        if (data.containsKey("imagen_url")) {
            updateProducto.setImagen_url((String) data.get("imagen_url"));
        }
        if (data.containsKey("estado")) {
            Object estadoObj = data.get("estado");
            updateProducto.setEstado(Boolean.valueOf(estadoObj.toString()));
        }

        // Actualizar categoría por id_categoria (si viene)
        if (data.containsKey("id_categoria")) {
            Integer idCategoria = Integer.valueOf(data.get("id_categoria").toString());
            Categoria categoria = categoriaRepository.findById(idCategoria)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            updateProducto.setCategoria(categoria);
        }

        repository.save(updateProducto);
        return "Producto actualizado correctamente";
    }

    // Eliminar productos
    @DeleteMapping("eliminar/{id_producto}")
    public String eliminar(@PathVariable Integer id_producto) {
        Producto eliminarProducto = repository.findById(id_producto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        repository.delete(eliminarProducto);
        return "Producto Eliminado Correctamente";
    }
}
