package Salsamentaria.salsamentaria.controllers;

import Salsamentaria.salsamentaria.DTO.ProductoDto;
import Salsamentaria.salsamentaria.DTO.ProductoAdminDto;
import Salsamentaria.salsamentaria.models.Categoria;
import Salsamentaria.salsamentaria.models.Producto;
import Salsamentaria.salsamentaria.repository.ProductoRepository;
import Salsamentaria.salsamentaria.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductoController {

    @Autowired
    private ProductoRepository repository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping("/")
    public String index(){
        return "CONECTADO";
    }

    // Endpoint para CLIENTES - Solo productos activos
    @GetMapping("/productos")
    public List<ProductoDto> getProductos(){
        List<Producto> productos = repository.findAll();
        
        System.out.println("=== Cliente: Productos encontrados: " + productos.size());
        
        return productos.stream()
            .filter(p -> p.getEstado()) // Solo productos activos
            .map(p -> {
                ProductoDto dto = ProductoDto.builder()
                    .id_producto(p.getId_producto())
                    .nombre(p.getNombre())
                    .descripcion(p.getDescripcion())
                    .precio(p.getPrecio())
                    .stock(p.getStock())
                    .imagen_url(p.getImagen_url())
                    .estado(p.getEstado())
                    .build();
                
                if (p.getCategoria() != null) {
                    dto.setIdCategoria(p.getCategoria().getId_categoria());
                    dto.setNombreCategoria(p.getCategoria().getNombre());
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    // Endpoint para ADMIN - Todos los productos con DTO
    @GetMapping("/productos/admin")
    public List<ProductoAdminDto> getProductosAdmin(){
        System.out.println("=== Admin: Cargando todos los productos ===");
        List<Producto> productos = repository.findAll();
        System.out.println("Total productos en BD: " + productos.size());
        
        return productos.stream()
            .map(p -> {
                ProductoAdminDto.CategoriaDto categoriaDto = null;
                if (p.getCategoria() != null) {
                    categoriaDto = ProductoAdminDto.CategoriaDto.builder()
                        .id_categoria(p.getCategoria().getId_categoria())
                        .nombre(p.getCategoria().getNombre())
                        .descripcion(p.getCategoria().getDescripcion())
                        .build();
                    
                    System.out.println("  - ID: " + p.getId_producto() + 
                                     ", Nombre: " + p.getNombre() + 
                                     ", Estado: " + p.getEstado() + 
                                     ", Imagen: " + (p.getImagen_url() != null ? "Sí" : "No") +
                                     ", Categoría: " + p.getCategoria().getNombre());
                } else {
                    System.out.println("  - ID: " + p.getId_producto() + 
                                     ", Nombre: " + p.getNombre() + 
                                     ", Estado: " + p.getEstado() + 
                                     ", Imagen: " + (p.getImagen_url() != null ? "Sí" : "No") +
                                     ", Categoría: NULL");
                }
                
                return ProductoAdminDto.builder()
                    .id_producto(p.getId_producto())
                    .nombre(p.getNombre())
                    .descripcion(p.getDescripcion())
                    .precio(p.getPrecio())
                    .stock(p.getStock())
                    .imagen_url(p.getImagen_url())
                    .estado(p.getEstado())
                    .categoria(categoriaDto)
                    .build();
            })
            .collect(Collectors.toList());
    }

    @PostMapping("/crear")
    public String save(@RequestBody Map<String, Object> data){
        System.out.println("=== Creando producto ===");
        System.out.println("Datos recibidos: " + data);
        
        Producto producto = new Producto();
        producto.setNombre((String) data.get("nombre"));
        producto.setDescripcion((String) data.get("descripcion"));
        producto.setPrecio(Double.valueOf(data.get("precio").toString()));
        producto.setStock(Integer.valueOf(data.get("stock").toString()));
        producto.setImagen_url((String) data.get("imagen_url"));
        producto.setEstado(data.containsKey("estado") ? 
                          Boolean.valueOf(data.get("estado").toString()) : true);

        if (data.containsKey("id_categoria")) {
            Integer idCategoria = Integer.valueOf(data.get("id_categoria").toString());
            Categoria categoria = categoriaRepository.findById(idCategoria)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(categoria);
        }

        repository.save(producto);
        System.out.println("Producto creado con ID: " + producto.getId_producto());
        return "Producto Creado Correctamente";
    }

    @PutMapping("/editar/{id}")
    public String update(@PathVariable("id") Integer id_producto, @RequestBody Map<String, Object> data){
        System.out.println("=== Actualizando producto ID: " + id_producto + " ===");
        System.out.println("Datos recibidos: " + data);
        
        Producto updateProducto = repository.findById(id_producto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (data.containsKey("nombre")) {
            updateProducto.setNombre((String) data.get("nombre"));
        }
        if (data.containsKey("descripcion")) {
            updateProducto.setDescripcion((String) data.get("descripcion"));
        }
        if (data.containsKey("precio")) {
            updateProducto.setPrecio(Double.valueOf(data.get("precio").toString()));
        }
        if (data.containsKey("stock")) {
            updateProducto.setStock(Integer.valueOf(data.get("stock").toString()));
        }
        if (data.containsKey("imagen_url")) {
            updateProducto.setImagen_url((String) data.get("imagen_url"));
        }
        if (data.containsKey("estado")) {
            updateProducto.setEstado(Boolean.valueOf(data.get("estado").toString()));
        }

        if (data.containsKey("id_categoria")) {
            Integer idCategoria = Integer.valueOf(data.get("id_categoria").toString());
            Categoria categoria = categoriaRepository.findById(idCategoria)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            updateProducto.setCategoria(categoria);
        }

        repository.save(updateProducto);
        System.out.println("Producto actualizado correctamente");
        return "Producto actualizado correctamente";
    }

    @DeleteMapping("/eliminar/{id_producto}")
    public String eliminar(@PathVariable Integer id_producto) {
        System.out.println("=== Eliminando producto ID: " + id_producto + " ===");
        Producto eliminarProducto = repository.findById(id_producto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        repository.delete(eliminarProducto);
        System.out.println("Producto eliminado");
        return "Producto Eliminado Correctamente";
    }
}