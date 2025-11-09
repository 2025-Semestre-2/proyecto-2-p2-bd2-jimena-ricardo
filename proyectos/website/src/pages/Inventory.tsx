import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Interfaces para tipado
interface Product {
  id: number;
  nombre_producto: string;
  grupo: string;
  cantidad_inventario: number;
}

interface ProductDetails {
  ProductID: number;
  nombre_producto: string;
  nombre_proveedor: string;
  proveedor_id?: number;
  color: string;
  unidad_empaquetamiento: string;
  empaquetamiento_externo: string;
  cantidad_empaquetamiento: number;
  marca: string;
  talla_tamano: string;
  impuesto: number;
  precio_unitario: number;
  precio_venta: number;
  paso: string;
  palabras_clave: string;
  cantidad_disponible: number;
  ubicacion: string;
}

// Interface para los filtros dinámicos
interface Filtro {
  tipo_filtro: string;
  valor: string;
  etiqueta: string;
}

export default function Inventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los filtros dinámicos - SOLO GRUPOS
  const [grupos, setGrupos] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Cargar productos iniciales y filtros
  useEffect(() => {
    // Verificar si hay parámetros de navegación para producto
    const state = location.state as { initialSearch?: string; autoSearch?: boolean };
    
    if (state?.initialSearch) {
      setSearchTerm(state.initialSearch);
      // Si autoSearch es true, realizar búsqueda automática
      if (state.autoSearch) {
        setTimeout(() => {
          fetchProducts(state.initialSearch, groupFilter);
        }, 100);
      }
    } else {
      fetchProducts();
    }
    
    fetchFiltros();
  }, [location.state]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      const response = await fetch('http://localhost:3000/api/filtros/inventarios');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: Filtro[] = await response.json();
      
      // SOLO cargar grupos (quitamos marcas y colores)
      setGrupos(data.filter(filtro => filtro.tipo_filtro === 'grupos'));
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  const fetchProducts = async (nombre?: string, grupo?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (nombre) params.append('nombre', nombre);
      if (grupo && grupo !== 'all') params.append('grupo', grupo);
      
      const url = `http://localhost:3000/api/inventarios?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3000/api/inventarios/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedProduct(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del producto');
    }
  };

  // Función para buscar proveedor por nombre
  const searchSupplierByName = (supplierName: string) => {
    navigate('/proveedores', { 
      state: { 
        initialSearch: supplierName,
        autoSearch: true
      } 
    });
    setSelectedProduct(null);
  };

  const handleSearch = () => {
    fetchProducts(searchTerm, groupFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setGroupFilter("");
    fetchProducts();
  };

  const handleViewDetails = (product: Product) => {
    fetchProductDetails(product.id);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Inventarios</h1>
        <p className="text-muted-foreground mt-2">Consulta y gestiona los productos en inventario</p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      {/* Filtros principales - SOLO NOMBRE Y GRUPO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ animationDelay: '100ms' }}>
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
          <label className="text-sm font-medium mb-2 block">Grupo</label>
          <Select value={groupFilter} onValueChange={setGroupFilter} disabled={filtrosLoading}>
            <SelectTrigger>
              {filtrosLoading ? (
                <SelectValue placeholder="Cargando grupos..." />
              ) : (
                <SelectValue placeholder="Todos los grupos" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.valor} value={grupo.valor}>
                  {grupo.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtrosLoading && (
            <p className="text-xs text-muted-foreground mt-1">Cargando grupos...</p>
          )}
        </Card>
      </div>

      {/* Botones de búsqueda */}
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

      {/* Tabla de resultados */}
      <Card className="overflow-hidden shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <p>Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Cantidad en Inventario</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nombre_producto}</TableCell>
                  <TableCell>{product.grupo}</TableCell>
                  <TableCell>{product.cantidad_inventario}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(product)}
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

      {/* Modal de detalles */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre del Producto</p>
                  <p className="font-medium">{selectedProduct.nombre_producto}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <button 
                    onClick={() => searchSupplierByName(selectedProduct.nombre_proveedor)}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    {selectedProduct.nombre_proveedor}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click para ver detalles del proveedor
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{selectedProduct.color || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unidad de Empaquetamiento</p>
                  <p className="font-medium">{selectedProduct.unidad_empaquetamiento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empaquetamiento Externo</p>
                  <p className="font-medium">{selectedProduct.empaquetamiento_externo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad de Empaquetamiento</p>
                  <p className="font-medium">{selectedProduct.cantidad_empaquetamiento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-medium">{selectedProduct.marca || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tallas / Tamaño</p>
                  <p className="font-medium">{selectedProduct.talla_tamano || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impuesto</p>
                  <p className="font-medium">{selectedProduct.impuesto}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Unitario</p>
                  <p className="font-medium">${selectedProduct.precio_unitario?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Venta</p>
                  <p className="font-medium">${selectedProduct.precio_venta?.toFixed(2) || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paso</p>
                  <p className="font-medium">{selectedProduct.paso || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Palabras Clave</p>
                <p className="font-medium">{selectedProduct.palabras_clave || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad Disponible</p>
                  <p className="font-medium">{selectedProduct.cantidad_disponible}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{selectedProduct.ubicacion || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}