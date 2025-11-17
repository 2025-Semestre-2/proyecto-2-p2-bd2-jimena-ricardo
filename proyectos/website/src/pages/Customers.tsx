import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink, MapPin, Navigation, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

// Interfaces para tipado
interface Customer {
  id: number;
  nombre: string;
  categoria: string;
  metodo_entrega: string;
}

interface CustomerDetails {
  CustomerID: number;
  nombre_cliente: string;
  categoria: string;
  grupo_compra: string;
  cliente_facturar: number;
  metodo_entrega: string;
  limite_credito: number;
  fecha_apertura_cuenta: string;
  descuento_estandar: number;
  estado_cuenta_enviado: boolean;
  credito_retenido: boolean;
  dias_pago: number;
  ruta_entrega: string;
  posicion_ruta: string;
  sitio_web: string;
}

// Interface para los filtros dinámicos
interface Filtro {
  tipo_filtro: string;
  valor: string;
  etiqueta: string;
}

// Interface para la respuesta de la API
interface ApiResponse {
  clientes: Customer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export default function Customers() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deliveryMethodFilter, setDeliveryMethodFilter] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(50);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargandoTotal, setCargandoTotal] = useState(false);
  
  // Estados para los filtros dinámicos
  const [categorias, setCategorias] = useState<Filtro[]>([]);
  const [metodosEntrega, setMetodosEntrega] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalRegistros / tamanoPagina);

  // Efecto para cargar datos iniciales y manejar navegación
  useEffect(() => {
    // Verificar si hay parámetros de navegación
    const state = location.state as { initialSearch?: string; autoSearch?: boolean };
    
    if (state?.initialSearch) {
      setSearchTerm(state.initialSearch);
      // Si autoSearch es true, realizar búsqueda automática
      if (state.autoSearch) {
        setTimeout(() => {
          fetchCustomers(state.initialSearch, categoryFilter, deliveryMethodFilter);
        }, 100);
      }
    } else {
      fetchCustomers();
    }
    
    fetchFiltros();
  }, [location.state]);

  // Efecto para cargar el total cuando cambian los filtros
  useEffect(() => {
    if (!loading) {
      fetchTotalClientes();
    }
  }, [searchTerm, categoryFilter, deliveryMethodFilter]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      const response = await fetch('http://localhost:3000/api/filtros/clientes');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: Filtro[] = await response.json();
      
      // Separar los filtros por tipo
      setCategorias(data.filter(filtro => filtro.tipo_filtro === 'categorias'));
      setMetodosEntrega(data.filter(filtro => filtro.tipo_filtro === 'metodos_entrega'));
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  const fetchCustomers = async (nombre?: string, categoria?: string, metodoEntrega?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', paginaActual.toString());
      params.append('pageSize', tamanoPagina.toString());
      if (nombre) params.append('filtroNombre', nombre);
      if (categoria && categoria !== 'all') params.append('filtroCategoria', categoria);
      if (metodoEntrega && metodoEntrega !== 'all') params.append('filtroMetodoEntrega', metodoEntrega);
      
      const url = `http://localhost:3000/api/clientes?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      setCustomers(data.clientes || []);
      setTotalRegistros(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los clientes');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalClientes = async () => {
    try {
      setCargandoTotal(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('filtroNombre', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('filtroCategoria', categoryFilter);
      if (deliveryMethodFilter && deliveryMethodFilter !== 'all') params.append('filtroMetodoEntrega', deliveryMethodFilter);
      
      const url = `http://localhost:3000/api/clientes?${params.toString()}&page=1&pageSize=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      setTotalRegistros(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching total customers:', err);
      setTotalRegistros(0);
    } finally {
      setCargandoTotal(false);
    }
  };

  const fetchCustomerDetails = async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3000/api/clientes/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedCustomer(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del cliente');
    }
  };

  // Función para abrir Google Maps en nueva pestaña
  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleSearch = () => {
    setPaginaActual(1); // Resetear a primera página al buscar
    fetchCustomers(searchTerm, categoryFilter, deliveryMethodFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDeliveryMethodFilter("");
    setPaginaActual(1);
    fetchCustomers();
  };

  const handleViewDetails = (customer: Customer) => {
    fetchCustomerDetails(customer.id);
  };

  // Funciones de navegación de paginación
  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
    fetchCustomers(searchTerm, categoryFilter, deliveryMethodFilter);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      irAPagina(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      irAPagina(paginaActual + 1);
    }
  };

  // Efecto para cargar datos cuando cambia la página
  useEffect(() => {
    if (!loading) {
      fetchCustomers(searchTerm, categoryFilter, deliveryMethodFilter);
    }
  }, [paginaActual, tamanoPagina]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  // Formatear porcentaje
  const formatPercentage = (percentage: number) => {
    if (!percentage) return "N/A";
    return `${percentage}%`;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Clientes</h1>
        <p className="text-muted-foreground mt-2">Consulta y gestiona los clientes registrados</p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ animationDelay: '100ms' }}>
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Buscar por nombre</label>
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Card>
        
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Categoría</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={filtrosLoading}>
            <SelectTrigger>
              {filtrosLoading ? (
                <SelectValue placeholder="Cargando categorías..." />
              ) : (
                <SelectValue placeholder="Todas las categorías" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.valor} value={categoria.valor}>
                  {categoria.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtrosLoading && (
            <p className="text-xs text-muted-foreground mt-1">Cargando categorías...</p>
          )}
        </Card>
        
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Método de Entrega</label>
          <Select value={deliveryMethodFilter} onValueChange={setDeliveryMethodFilter} disabled={filtrosLoading}>
            <SelectTrigger>
              {filtrosLoading ? (
                <SelectValue placeholder="Cargando métodos..." />
              ) : (
                <SelectValue placeholder="Todos los métodos" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              {metodosEntrega.map((metodo) => (
                <SelectItem key={metodo.valor} value={metodo.valor}>
                  {metodo.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtrosLoading && (
            <p className="text-xs text-muted-foreground mt-1">Cargando métodos...</p>
          )}
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSearch} className="flex-1" disabled={loading || filtrosLoading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Buscando..." : "Buscar"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="flex-1" disabled={loading || filtrosLoading}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar
        </Button>
      </div>

      {/* Controles de paginación superiores */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select 
              value={tamanoPagina.toString()} 
              onValueChange={(value) => {
                setTamanoPagina(Number(value));
                setPaginaActual(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {cargandoTotal ? (
            "Cargando..."
          ) : (
            `Total: ${totalRegistros} cliente${totalRegistros !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      <Card className="overflow-hidden shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Cargando clientes...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron clientes</p>
            {searchTerm || categoryFilter || deliveryMethodFilter ? (
              <p className="text-sm text-muted-foreground mt-2">
                Intenta ajustar los filtros de búsqueda
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Cliente</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Método de Entrega</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{customer.nombre}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {customer.categoria}
                      </span>
                    </TableCell>
                    <TableCell>{customer.metodo_entrega}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                        disabled={loading}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Controles de paginación inferiores */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {paginaActual} de {totalPaginas}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={paginaAnterior}
                  disabled={paginaActual <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {/* Mostrar números de página */}
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let paginaNumero;
                    if (totalPaginas <= 5) {
                      paginaNumero = i + 1;
                    } else if (paginaActual <= 3) {
                      paginaNumero = i + 1;
                    } else if (paginaActual >= totalPaginas - 2) {
                      paginaNumero = totalPaginas - 4 + i;
                    } else {
                      paginaNumero = paginaActual - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={paginaNumero}
                        variant={paginaActual === paginaNumero ? "default" : "outline"}
                        size="sm"
                        onClick={() => irAPagina(paginaNumero)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {paginaNumero}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={paginaSiguiente}
                  disabled={paginaActual >= totalPaginas || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre del Cliente</p>
                  <p className="font-medium text-lg">{selectedCustomer.nombre_cliente}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{selectedCustomer.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grupo de Compra</p>
                  <p className="font-medium">{selectedCustomer.grupo_compra || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Entrega</p>
                  <p className="font-medium">{selectedCustomer.metodo_entrega}</p>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Límite de Crédito</p>
                  <p className="font-medium">{formatCurrency(selectedCustomer.limite_credito)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descuento Estándar</p>
                  <p className="font-medium">{formatPercentage(selectedCustomer.descuento_estandar)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Días de Pago</p>
                  <p className="font-medium">{selectedCustomer.dias_pago} días</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Apertura Cuenta</p>
                  <p className="font-medium">{formatDate(selectedCustomer.fecha_apertura_cuenta)}</p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado de Cuenta</p>
                  <p className="font-medium">
                    {selectedCustomer.estado_cuenta_enviado ? (
                      <span className="text-green-600">Enviado</span>
                    ) : (
                      <span className="text-orange-600">No Enviado</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crédito</p>
                  <p className="font-medium">
                    {selectedCustomer.credito_retenido ? (
                      <span className="text-red-600">Retenido</span>
                    ) : (
                      <span className="text-green-600">Activo</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ruta de Entrega</p>
                  <p className="font-medium">{selectedCustomer.ruta_entrega || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posición en Ruta</p>
                  <p className="font-medium">{selectedCustomer.posicion_ruta || "N/A"}</p>
                </div>
              </div>

              {/* Sitio Web */}
              <div>
                <p className="text-sm text-muted-foreground">Sitio Web</p>
                {selectedCustomer.sitio_web ? (
                  <a
                    href={selectedCustomer.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {selectedCustomer.sitio_web}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="font-medium">N/A</p>
                )}
              </div>

              {/* Información de Referencia */}
              <div>
                <p className="text-sm text-muted-foreground">Cliente para Facturar ID</p>
                <p className="font-medium">{selectedCustomer.cliente_facturar}</p>
              </div>

              {/* Sección de Ubicación (Placeholder) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Información de Ubicación</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openGoogleMaps(selectedCustomer.nombre_cliente)}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Buscar en Maps
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
                    <p className="font-medium">Información de ubicación detallada</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los datos sensibles de ubicación se almacenan en la base de datos corporativa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}