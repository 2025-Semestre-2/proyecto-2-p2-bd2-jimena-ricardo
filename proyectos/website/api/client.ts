const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Clientes
  async getClientes(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/clientes?${queryString}`);
  }

  async getClienteDetalles(id: number) {
    return this.request(`/clientes/${id}`);
  }

  // Proveedores
  async getProveedores(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/proveedores?${queryString}`);
  }

  async getProveedorDetalles(id: number) {
    return this.request(`/proveedores/${id}`);
  }

  // Inventarios
  async getInventarios(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/inventarios?${queryString}`);
  }

  async getProductoDetalles(id: number) {
    return this.request(`/inventarios/${id}`);
  }

  async createProducto(data: any) {
    return this.request('/inventarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProducto(id: number, data: any) {
    return this.request(`/inventarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProducto(id: number) {
    return this.request(`/inventarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Ventas
  async getVentas(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/ventas?${queryString}`);
  }

  async getVentaDetalles(id: number) {
    return this.request(`/ventas/${id}`);
  }

  // Estadísticas
  async getEstadisticasComprasProveedores(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/estadisticas/compras-proveedores?${queryString}`);
  }

  async getEstadisticasVentasClientes(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/estadisticas/ventas-clientes?${queryString}`);
  }

  async getTop5ProductosGanancia(anio: number) {
    return this.request(`/estadisticas/top5-productos-ganancia?anio=${anio}`);
  }

  async getTop5ClientesFacturas(anioInicio: number, anioFin: number) {
    return this.request(`/estadisticas/top5-clientes-facturas?anioInicio=${anioInicio}&anioFin=${anioFin}`);
  }

  async getTop5ProveedoresOrdenes(anioInicio: number, anioFin: number) {
    return this.request(`/estadisticas/top5-proveedores-ordenes?anioInicio=${anioInicio}&anioFin=${anioFin}`);
  }

  // Filtros
  async getFiltrosClientes() {
    return this.request('/filtros/clientes');
  }

  async getFiltrosProveedores() {
    return this.request('/filtros/proveedores');
  }

  async getFiltrosInventarios() {
    return this.request('/filtros/inventarios');
  }

  async getFiltrosVentas() {
    return this.request('/filtros/ventas');
  }

  async getFiltrosEstadisticas() {
    return this.request('/filtros/estadisticas');
  }

  async getAniosDisponibles(modulo?: string) {
    const queryString = modulo ? `?modulo=${modulo}` : '';
    return this.request(`/filtros/anios${queryString}`);
  }
}

export const apiClient = new ApiClient();