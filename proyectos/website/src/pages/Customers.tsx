import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink, MapPin, Navigation } from "lucide-react";
import { useLocation } from "react-router-dom";

// Interfaces para tipado basadas en los procedimientos almacenados
interface Customer {
  CustomerID: number;
  CustomerName: string;
  CustomerCategory: string;
  DeliveryMethod: string;
}

interface CustomerDetails {
  CustomerName: string;
  CustomerCategory: string;
  BuyingGroup: string;
  PrimaryContact: string;
  AlternateContact: string;
  BillToCustomer: number;
  DeliveryMethod: string;
  DeliveryCity: string;
  PostalCode: string;
  PhoneNumber: string;
  FaxNumber: string;
  PaymentDays: number;
  WebsiteURL: string;
  Address: string;
  DeliveryLocation: string;
  // Campos adicionales para coordenadas
  latitud?: number;
  longitud?: number;
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
  
  // Estados para paginación
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
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
          fetchCustomers(pageNumber, pageSize, state.initialSearch, categoryFilter, deliveryMethodFilter);
        }, 100);
      }
    } else {
      fetchCustomers(pageNumber, pageSize);
    }
    
    fetchFiltros();
    fetchTotalCustomers();
  }, [location.state]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      
      // Cargar categorías
      const catResponse = await fetch('http://localhost:3000/customer-categories');
      const categoriasData = await catResponse.json();
      
      // Cargar métodos de entrega
      const metResponse = await fetch('http://localhost:3000/customer-delivery-methods');
      const metodosData = await metResponse.json();
      
      // Transformar datos a formato Filtro
      const categoriasFiltro: Filtro[] = categoriasData.map((cat: any) => ({
        tipo_filtro: 'categorias',
        valor: cat.CategoryName,
        etiqueta: cat.CategoryName
      }));
      
      const metodosFiltro: Filtro[] = metodosData.map((met: any) => ({
        tipo_filtro: 'metodos_entrega',
        valor: met.DeliveryMethodName,
        etiqueta: met.DeliveryMethodName
      }));
      
      setCategorias(categoriasFiltro);
      setMetodosEntrega(metodosFiltro);
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  // Función para obtener el total de clientes
  const fetchTotalCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/total-customers');
      const total = await response.json();
      setTotalCustomers(total);
    } catch (err) {
      console.error('Error fetching total customers:', err);
    }
  };

  const fetchCustomers = async (
    page: number = 1, 
    size: number = 50, 
    customer: string = "", 
    category: string = "", 
    deliveryMethod: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: size.toString(),
        customer: customer ? `%${customer}%` : '%',
        category: category && category !== 'all' ? `%${category}%` : '%'
      });
      
      const url = `http://localhost:3000/customers-list?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCustomers(data);
      setPageNumber(page);
      setPageSize(size);
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
      const response = await fetch(`http://localhost:3000/customer-details?customerId=${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Procesar los datos para extraer coordenadas si están disponibles
      const processedData: CustomerDetails = {
        ...data[0], // La API devuelve un array, tomamos el primer elemento
        // Si DeliveryLocation contiene coordenadas, extraerlas
        latitud: data[0].DeliveryLocation ? parseFloat(data[0].DeliveryLocation.split(',')[0]) : undefined,
        longitud: data[0].DeliveryLocation ? parseFloat(data[0].DeliveryLocation.split(',')[1]) : undefined
      };
      
      setSelectedCustomer(processedData);
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
    fetchCustomers(1, pageSize, searchTerm, categoryFilter, deliveryMethodFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDeliveryMethodFilter("");
    fetchCustomers(1, pageSize);
  };

  const handleViewDetails = (customer: Customer) => {
    fetchCustomerDetails(customer.CustomerID);
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    fetchCustomers(newPage, pageSize, searchTerm, categoryFilter, deliveryMethodFilter);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Clientes</h1>
        <p className="text-muted-foreground mt-2">Consulta y gestiona los clientes registrados</p>
        <p className="text-sm text-muted-foreground mt-1">Total de clientes: {totalCustomers}</p>
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
                  <TableRow key={customer.CustomerID}>
                    <TableCell className="font-medium">{customer.CustomerName}</TableCell>
                    <TableCell>{customer.CustomerCategory}</TableCell>
                    <TableCell>{customer.DeliveryMethod}</TableCell>
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
            
            {/* Paginación */}
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {pageNumber} - Mostrando {customers.length} de {totalCustomers} clientes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={customers.length < pageSize || loading}
                >
                  Siguiente
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{selectedCustomer.CustomerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{selectedCustomer.CustomerCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grupo de Compra</p>
                  <p className="font-medium">{selectedCustomer.BuyingGroup || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Entrega</p>
                  <p className="font-medium">{selectedCustomer.DeliveryMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contacto Primario</p>
                  <p className="font-medium">{selectedCustomer.PrimaryContact || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contacto Alternativo</p>
                  <p className="font-medium">{selectedCustomer.AlternateContact || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente para Facturar ID</p>
                  <p className="font-medium">{selectedCustomer.BillToCustomer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad de Entrega</p>
                  <p className="font-medium">{selectedCustomer.DeliveryCity || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código Postal</p>
                  <p className="font-medium">{selectedCustomer.PostalCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{selectedCustomer.PhoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fax</p>
                  <p className="font-medium">{selectedCustomer.FaxNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Días de Gracia</p>
                  <p className="font-medium">{selectedCustomer.PaymentDays} días</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Sitio Web</p>
                {selectedCustomer.WebsiteURL ? (
                  <a
                    href={selectedCustomer.WebsiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {selectedCustomer.WebsiteURL}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="font-medium">N/A</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{selectedCustomer.Address}</p>
              </div>

              {/* Sección de Mapa de Google Maps */}
              {selectedCustomer.latitud && selectedCustomer.longitud && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">Ubicación en Mapa</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openGoogleMaps(selectedCustomer.latitud!, selectedCustomer.longitud!)}
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
                        Ciudad: {selectedCustomer.DeliveryCity || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Dirección: {selectedCustomer.Address}
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