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
interface Supplier {
  id: number;
  nombre: string;
  categoria: string;
  metodo_entrega: string;
}

interface SupplierDetails {
  SupplierID: number;
  codigo_proveedor: string;
  nombre_proveedor: string;
  categoria: string;
  contacto_primario: string;
  contacto_alternativo: string;
  metodo_entrega: string;
  ciudad_entrega: string;
  codigo_postal_entrega: string;
  telefono: string;
  fax: string;
  sitio_web: string;
  direccion_entrega: string;
  direccion_entrega2: string;
  nombre_banco: string;
  numero_cuenta: string;
  dias_gracia_pago: number;
  latitud: number;
  longitud: number;
}

// Interface para los filtros dinámicos
interface Filtro {
  tipo_filtro: string;
  valor: string;
  etiqueta: string;
}

export default function Suppliers() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deliveryMethodFilter, setDeliveryMethodFilter] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDetails | null>(null);
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
          fetchSuppliers(state.initialSearch, categoryFilter, deliveryMethodFilter);
        }, 100);
      }
    } else {
      fetchSuppliers();
    }
    
    fetchFiltros();
  }, [location.state]);


  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      const response = await fetch('http://localhost:3000/api/filtros/proveedores');
      
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

  const fetchSuppliers = async (nombre?: string, categoria?: string, metodoEntrega?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (nombre) params.append('nombre', nombre);
      if (categoria && categoria !== 'all') params.append('categoria', categoria);
      if (metodoEntrega && metodoEntrega !== 'all') params.append('metodoEntrega', metodoEntrega);
      
      const url = `http://localhost:3000/api/proveedores?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetails = async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3000/api/proveedores/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedSupplier(data);
    } catch (err) {
      console.error('Error fetching supplier details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del proveedor');
    }
  };

  // Función para abrir Google Maps en nueva pestaña
  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleSearch = () => {
    fetchSuppliers(searchTerm, categoryFilter, deliveryMethodFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDeliveryMethodFilter("");
    fetchSuppliers();
  };

  const handleViewDetails = (supplier: Supplier) => {
    fetchSupplierDetails(supplier.id);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Proveedores</h1>
        <p className="text-muted-foreground mt-2">Consulta y gestiona los proveedores registrados</p>
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
            <p>Cargando proveedores...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Proveedor</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Método de Entrega</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.nombre}</TableCell>
                  <TableCell>{supplier.categoria}</TableCell>
                  <TableCell>{supplier.metodo_entrega}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(supplier)}
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

      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Proveedor</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{selectedSupplier.codigo_proveedor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{selectedSupplier.nombre_proveedor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{selectedSupplier.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Entrega</p>
                  <p className="font-medium">{selectedSupplier.metodo_entrega}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contacto Primario</p>
                  <p className="font-medium">{selectedSupplier.contacto_primario}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contacto Alternativo</p>
                  <p className="font-medium">{selectedSupplier.contacto_alternativo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad</p>
                  <p className="font-medium">{selectedSupplier.ciudad_entrega}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código Postal</p>
                  <p className="font-medium">{selectedSupplier.codigo_postal_entrega}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{selectedSupplier.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fax</p>
                  <p className="font-medium">{selectedSupplier.fax || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium">{selectedSupplier.nombre_banco || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                  <p className="font-medium">{selectedSupplier.numero_cuenta || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Días de Gracia</p>
                  <p className="font-medium">{selectedSupplier.dias_gracia_pago} días</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Sitio Web</p>
                {selectedSupplier.sitio_web ? (
                  <a
                    href={selectedSupplier.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {selectedSupplier.sitio_web}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="font-medium">N/A</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Dirección de Entrega</p>
                <p className="font-medium">
                  {selectedSupplier.direccion_entrega} {selectedSupplier.direccion_entrega2 && `, ${selectedSupplier.direccion_entrega2}`}
                </p>
              </div>

              {/* Sección de Mapa de Google Maps */}
              {selectedSupplier.latitud && selectedSupplier.longitud && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">Ubicación en Mapa</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openGoogleMaps(selectedSupplier.latitud, selectedSupplier.longitud)}
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Abrir en Google Maps
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      title="Ubicación del proveedor"
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: '8px' }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${selectedSupplier.latitud},${selectedSupplier.longitud}&z=15&output=embed`}
                    />
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Latitud:</span>
                      <span className="ml-2 font-mono">{selectedSupplier.latitud.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitud:</span>
                      <span className="ml-2 font-mono">{selectedSupplier.longitud.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback cuando no hay coordenadas */}
              {(!selectedSupplier.latitud || !selectedSupplier.longitud) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Localización</p>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
                      <p className="font-medium">Ubicación no disponible</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ciudad: {selectedSupplier.ciudad_entrega}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Dirección: {selectedSupplier.direccion_entrega}
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