package Salsamentaria.salsamentaria.repository;

import Salsamentaria.salsamentaria.models.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    
    // Buscar ventas de un usuario ordenadas por fecha descendente (más recientes primero)
    List<Venta> findByUsuarioIdOrderByFechaDesc(Integer usuarioId);
}