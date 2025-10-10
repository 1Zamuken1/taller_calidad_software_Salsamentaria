package Salsamentaria.salsamentaria.models;

import java.util.List;

public class VentaRequest {

    private Integer id_usuario; // coincide con la columna de BD
    private List<DetalleRequest> detalles;

    public Integer getId_usuario() { return id_usuario; }
    public void setId_usuario(Integer id_usuario) { this.id_usuario = id_usuario; }

    public List<DetalleRequest> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleRequest> detalles) { this.detalles = detalles; }

    public static class DetalleRequest {
        private Integer id_producto; // coincide con la columna de BD
        private int cantidad;

        public Integer getId_producto() { return id_producto; }
        public void setId_producto(Integer id_producto) { this.id_producto = id_producto; }

        public int getCantidad() { return cantidad; }
        public void setCantidad(int cantidad) { this.cantidad = cantidad; }
    }
}
