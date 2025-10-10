package Salsamentaria.salsamentaria.controllers;

import Salsamentaria.salsamentaria.models.Categoria;
import Salsamentaria.salsamentaria.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias") // prefijo común para todas las rutas de categorías
public class CategoriaController {

    @Autowired
    private CategoriaRepository repository;

    // Ruta base para comprobar conexión
    @GetMapping("/")
    public String index() {
        return "CONECTADO A CATEGORÍAS";
    }

    // Listar todas las categorías
    @GetMapping
    public List<Categoria> getCategorias() {
        return repository.findAll();
    }

    // Crear nueva categoría
    @PostMapping("/crear")
    public String save(@RequestBody Categoria categoria) {
        repository.save(categoria);
        return "Categoría creada correctamente";
    }

    // Editar una categoría existente
    @PutMapping("/editar/{id_categoria}")
    public String update(@PathVariable Integer id_categoria, @RequestBody Categoria categoriaData) {
        Categoria categoria = repository.findById(id_categoria)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoria.setNombre(categoriaData.getNombre());
        categoria.setDescripcion(categoriaData.getDescripcion());
        repository.save(categoria);
        return "Categoría actualizada correctamente";
    }

    // Eliminar categoría
    @DeleteMapping("/eliminar/{id}")
    public String eliminar(@PathVariable("id") Integer id_categoria) {
        Categoria eliminarCategoria = repository.findById(id_categoria)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        repository.delete(eliminarCategoria);
        return "Categoría eliminada correctamente";
    }
}
