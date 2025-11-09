import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink, MapPin, Navigation } from "lucide-react";
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
  contacto_primario: string;
  contacto_alternativo: string;
  cliente_facturar: number;
  metodo_entrega: string;
  ciudad_entrega: string;
  codigo_postal: string;
  telefono: string;
  fax: string;
  dias_gracia_pago: number;
  sitio_web: string;
  direccion_entrega: string;
  direccion_entrega2: string;
  codigo_postal_entrega: string;
  latitud: number;
  longitud: number;
}

// Interface para los filtros dinámicos
interface Filtro {
  tipo_filtro: string;
  valor: string;
  etiqueta: string;
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
  
  // Estados para los filtros dinámicos
  const [categorias, setCategorias] = useState<Filtro[]>([]);
  const [metodosEntrega, setMetodosEntrega] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

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
      if (nombre) params.append('nombre', nombre);
      if (categoria && categoria !== 'all') params.append('categoria', categoria);
      if (metodoEntrega && metodoEntrega !== 'all') params.append('metodoEntrega', metodoEntrega);
      
      const url = `http://localhost:3000/api/clientes?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los clientes');
    } finally {
      setLoading(false);
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
  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleSearch = () => {
    fetchCustomers(searchTerm, categoryFilter, deliveryMethodFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDeliveryMethodFilter("");
    fetchCustomers();
  };

  const handleViewDetails = (customer: Customer) => {
    fetchCustomerDetails(customer.id);
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

      <Card className="overflow-hidden shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <p>Cargando clientes...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron clientes</p>
          </div>
        ) : (
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
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.nombre}</TableCell>
                  <TableCell>{customer.categoria}</TableCell>
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
        )}
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{selectedCustomer.nombre_cliente}</p>
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
                <div>
                  <p className="text-sm text-muted-foreground">Contacto Primario</p>
                  <p className="font-medium">{selectedCustomer.contacto_primario || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contacto Alternativo</p>
                  <p className="font-medium">{selectedCustomer.contacto_alternativo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente para Facturar ID</p>
                  <p className="font-medium">{selectedCustomer.cliente_facturar}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad de Entrega</p>
                  <p className="font-medium">{selectedCustomer.ciudad_entrega || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código Postal</p>
                  <p className="font-medium">{selectedCustomer.codigo_postal || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{selectedCustomer.telefono || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fax</p>
                  <p className="font-medium">{selectedCustomer.fax || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Días de Gracia</p>
                  <p className="font-medium">{selectedCustomer.dias_gracia_pago} días</p>
                </div>
              </div>

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

              <div>
                <p className="text-sm text-muted-foreground">Dirección de Entrega</p>
                <p className="font-medium">
                  {selectedCustomer.direccion_entrega} {selectedCustomer.direccion_entrega2 && `, ${selectedCustomer.direccion_entrega2}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Código Postal de Entrega</p>
                <p className="font-medium">{selectedCustomer.codigo_postal_entrega || "N/A"}</p>
              </div>

              {/* Sección de Mapa de Google Maps */}
              {selectedCustomer.latitud && selectedCustomer.longitud && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">Ubicación en Mapa</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openGoogleMaps(selectedCustomer.latitud, selectedCustomer.longitud)}
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Abrir en Google Maps
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      title="Ubicación del cliente"
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: '8px' }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${selectedCustomer.latitud},${selectedCustomer.longitud}&z=15&output=embed`}
                    />
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Latitud:</span>
                      <span className="ml-2 font-mono">{selectedCustomer.latitud.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitud:</span>
                      <span className="ml-2 font-mono">{selectedCustomer.longitud.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback cuando no hay coordenadas */}
              {(!selectedCustomer.latitud || !selectedCustomer.longitud) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Localización</p>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
                      <p className="font-medium">Ubicación no disponible</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ciudad: {selectedCustomer.ciudad_entrega || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Dirección: {selectedCustomer.direccion_entrega}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}