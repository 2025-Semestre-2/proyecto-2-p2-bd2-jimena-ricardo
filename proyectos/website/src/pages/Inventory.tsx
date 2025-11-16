import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Interfaces para tipado
interface Product {
  id: number;
  nombre_producto: string;
  grupo: string;
  cantidad_inventario: number;
}

interface ProductDetails {
  StockItemID: number;
  nombre_producto: string;
  nombre_proveedor: string;
  proveedor_id: number;
  color: string;
  unidad_empaquetamiento: string;
  empaquetamiento_externo: string;
  cantidad_empaquetamiento: number;
  marca: string;
  tamano: string;
  impuesto: number;
  precio_unitario: number;
  precio_venta: number;
  paso: number;
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

// Interface para el formulario de producto
interface ProductFormData {
  StockItemName: string;
  SupplierID: number;
  ColorID?: number;
  UnitPackageID: number;
  OuterPackageID: number;
  QuantityPerOuter: number;
  Brand?: string;
  Size?: string;
  TaxRate: number;
  UnitPrice: number;
  RecommendedRetailPrice?: number;
  LeadTimeDays: number;
  Barcode?: string;
  IsChillerStock?: boolean;
  TypicalWeightPerUnit?: number;
  MarketingComments?: string;
  InternalComments?: string;
}

// Interface para la respuesta de la API
interface ApiResponse {
  inventarios: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
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
  
  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(50);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargandoTotal, setCargandoTotal] = useState(false);
  
  // Estados para CRUD
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetails | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    StockItemName: '',
    SupplierID: 0,
    ColorID: undefined,
    UnitPackageID: 0,
    OuterPackageID: 0,
    QuantityPerOuter: 0,
    Brand: '',
    Size: '',
    TaxRate: 0,
    UnitPrice: 0,
    RecommendedRetailPrice: 0,
    LeadTimeDays: 0,
    Barcode: '',
    IsChillerStock: false,
    TypicalWeightPerUnit: 0,
    MarketingComments: '',
    InternalComments: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados para los filtros dinámicos
  const [grupos, setGrupos] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalRegistros / tamanoPagina);

  // Cargar productos iniciales y filtros
  useEffect(() => {
    const state = location.state as { initialSearch?: string; autoSearch?: boolean };
    
    if (state?.initialSearch) {
      setSearchTerm(state.initialSearch);
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

  // Efecto para cargar el total cuando cambian los filtros
  useEffect(() => {
    if (!loading) {
      fetchTotalInventarios();
    }
  }, [searchTerm, groupFilter]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      const response = await fetch('http://localhost:3000/api/filtros/inventarios');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: Filtro[] = await response.json();
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
      params.append('page', paginaActual.toString());
      params.append('pageSize', tamanoPagina.toString());
      if (nombre) params.append('filtroNombre', nombre);
      if (grupo && grupo !== 'all') params.append('filtroGrupo', grupo);
      
      const url = `http://localhost:3000/api/inventarios?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      setProducts(data.inventarios || []);
      setTotalRegistros(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalInventarios = async () => {
    try {
      setCargandoTotal(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('filtroNombre', searchTerm);
      if (groupFilter && groupFilter !== 'all') params.append('filtroGrupo', groupFilter);
      
      const url = `http://localhost:3000/api/inventarios?${params.toString()}&page=1&pageSize=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      setTotalRegistros(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching total products:', err);
      setTotalRegistros(0);
    } finally {
      setCargandoTotal(false);
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

  // FUNCIONES CRUD CON REPLICACIÓN AUTOMÁTICA
  // NOTA: La replicación se maneja automáticamente en los stored procedures
  // sp_CreateProducto, sp_UpdateProducto, sp_DeleteProducto

  const crearProducto = async (productoData: ProductFormData) => {
    try {
      setFormLoading(true);
      
      const response = await fetch('http://localhost:3000/api/inventarios', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear producto');
      }
      
      const result = await response.json();
      
      // Éxito - El producto se replicará automáticamente a todas las bases de datos
      // mediante triggers o procesos de replicación configurados en SQL Server
      alert('✅ Producto creado exitosamente. Se replicará automáticamente a todas las sucursales.');
      
      // Recargar productos
      fetchProducts();
      setShowForm(false);
      resetForm();
      
    } catch (err) {
      console.error('Error creando producto:', err);
      alert(`❌ Error al crear el producto: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setFormLoading(false);
    }
  };

  const modificarProducto = async (id: number, productoData: ProductFormData) => {
    try {
      setFormLoading(true);
      
      const response = await fetch(`http://localhost:3000/api/inventarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al modificar producto');
      }
      
      const result = await response.json();
      
      // Éxito - La modificación se replicará automáticamente
      alert('✅ Producto modificado exitosamente. Los cambios se replicarán automáticamente a todas las sucursales.');
      
      // Recargar productos
      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      
    } catch (err) {
      console.error('Error modificando producto:', err);
      alert(`❌ Error al modificar el producto: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setFormLoading(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      // Confirmación antes de eliminar
      if (!confirm('¿Estás seguro de que deseas eliminar este producto?\n\nEsta acción eliminará el producto de todas las sucursales.')) {
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/inventarios/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar producto');
      }
      
      const result = await response.json();
      
      // Éxito - La eliminación se replicará automáticamente
      alert('✅ Producto eliminado exitosamente. Se eliminará automáticamente de todas las sucursales.');
      
      // Recargar productos
      fetchProducts();
      setSelectedProduct(null);
      
    } catch (err) {
      console.error('Error eliminando producto:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Manejar errores específicos de restricciones de base de datos
      if (errorMessage.includes('órdenes de venta') || errorMessage.includes('órdenes de compra')) {
        alert(`❌ No se puede eliminar el producto: ${errorMessage}`);
      } else {
        alert(`❌ Error al eliminar el producto: ${errorMessage}`);
      }
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      StockItemName: '',
      SupplierID: 0,
      ColorID: undefined,
      UnitPackageID: 0,
      OuterPackageID: 0,
      QuantityPerOuter: 0,
      Brand: '',
      Size: '',
      TaxRate: 0,
      UnitPrice: 0,
      RecommendedRetailPrice: 0,
      LeadTimeDays: 0,
      Barcode: '',
      IsChillerStock: false,
      TypicalWeightPerUnit: 0,
      MarketingComments: '',
      InternalComments: ''
    });
  };

  // Función para abrir formulario de creación
  const abrirFormularioCrear = () => {
    setEditingProduct(null);
    resetForm();
    setShowForm(true);
  };

  // Función para abrir formulario de edición
  const abrirFormularioEditar = (producto: ProductDetails) => {
    setEditingProduct(producto);
    setFormData({
      StockItemName: producto.nombre_producto,
      SupplierID: producto.proveedor_id,
      // ColorID: producto.color_id, // Necesitarías mapear el color a un ID
      UnitPackageID: 0, // Necesitarías mapear el empaquetamiento a un ID
      OuterPackageID: 0, // Necesitarías mapear el empaquetamiento externo a un ID
      QuantityPerOuter: producto.cantidad_empaquetamiento,
      Brand: producto.marca,
      Size: producto.tamano,
      TaxRate: producto.impuesto,
      UnitPrice: producto.precio_unitario,
      RecommendedRetailPrice: producto.precio_venta,
      LeadTimeDays: producto.paso,
      Barcode: producto.ubicacion,
      IsChillerStock: false, // Necesitarías obtener este dato
      TypicalWeightPerUnit: 0, // Necesitarías obtener este dato
      MarketingComments: '',
      InternalComments: ''
    });
    setShowForm(true);
  };

  // Función para manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      modificarProducto(editingProduct.StockItemID, formData);
    } else {
      crearProducto(formData);
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
    setPaginaActual(1);
    fetchProducts(searchTerm, groupFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setGroupFilter("");
    setPaginaActual(1);
    fetchProducts();
  };

  const handleViewDetails = (product: Product) => {
    fetchProductDetails(product.id);
  };

  // Funciones de navegación de paginación
  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
    fetchProducts(searchTerm, groupFilter);
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
      fetchProducts(searchTerm, groupFilter);
    }
  }, [paginaActual, tamanoPagina]);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Inventarios</h1>
            <p className="text-muted-foreground mt-2">
              Consulta y gestiona los productos en inventario
              <br />
              <span className="text-xs text-green-600">
                🔄 Los cambios se replican automáticamente a todas las sucursales
              </span>
            </p>
          </div>
          <Button onClick={abrirFormularioCrear} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      {/* Filtros principales */}
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
            `Total: ${totalRegistros} producto${totalRegistros !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      {/* Tabla de resultados */}
      <Card className="overflow-hidden shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron productos</p>
            {searchTerm || groupFilter ? (
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
                  <TableHead>Nombre del Producto</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Cantidad en Inventario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{product.nombre_producto}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {product.grupo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        product.cantidad_inventario > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.cantidad_inventario}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(product)}
                          disabled={loading}
                        >
                          Ver Detalles
                        </Button>
                      </div>
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

      {/* Modal de detalles */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 gap-4 flex-1">
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
                    <p className="text-sm text-muted-foreground">Tamaño</p>
                    <p className="font-medium">{selectedProduct.tamano || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impuesto</p>
                    <p className="font-medium">{selectedProduct.impuesto}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio Unitario</p>
                    <p className="font-medium">{formatCurrency(selectedProduct.precio_unitario)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio Venta</p>
                    <p className="font-medium">{formatCurrency(selectedProduct.precio_venta)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Time (Días)</p>
                    <p className="font-medium">{selectedProduct.paso}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Palabras Clave</p>
                <p className="font-medium">{selectedProduct.palabras_clave || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad Disponible</p>
                  <p className={`font-medium ${
                    selectedProduct.cantidad_disponible > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedProduct.cantidad_disponible}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación/Barcode</p>
                  <p className="font-medium">{selectedProduct.ubicacion || "N/A"}</p>
                </div>
              </div>

              {/* Botones de acción en detalles */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => abrirFormularioEditar(selectedProduct)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modificar
                </Button>
                <Button
                  onClick={() => eliminarProducto(selectedProduct.StockItemID)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de formulario para crear/editar producto */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modificar Producto' : 'Crear Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Nombre del Producto *</label>
                <Input
                  value={formData.StockItemName}
                  onChange={(e) => setFormData({...formData, StockItemName: e.target.value})}
                  required
                  placeholder="Ingrese el nombre del producto"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">ID del Proveedor *</label>
                <Input
                  type="number"
                  value={formData.SupplierID}
                  onChange={(e) => setFormData({...formData, SupplierID: parseInt(e.target.value) || 0})}
                  required
                  placeholder="ID del proveedor"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">ID del Color</label>
                <Input
                  type="number"
                  value={formData.ColorID || ''}
                  onChange={(e) => setFormData({...formData, ColorID: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="ID del color (opcional)"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">ID Unidad Empaquetamiento *</label>
                <Input
                  type="number"
                  value={formData.UnitPackageID}
                  onChange={(e) => setFormData({...formData, UnitPackageID: parseInt(e.target.value) || 0})}
                  required
                  placeholder="ID unidad empaquetamiento"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">ID Empaquetamiento Externo *</label>
                <Input
                  type="number"
                  value={formData.OuterPackageID}
                  onChange={(e) => setFormData({...formData, OuterPackageID: parseInt(e.target.value) || 0})}
                  required
                  placeholder="ID empaquetamiento externo"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad por Empaque *</label>
                <Input
                  type="number"
                  value={formData.QuantityPerOuter}
                  onChange={(e) => setFormData({...formData, QuantityPerOuter: parseInt(e.target.value) || 0})}
                  required
                  placeholder="Cantidad por empaque externo"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Marca</label>
                <Input
                  value={formData.Brand}
                  onChange={(e) => setFormData({...formData, Brand: e.target.value})}
                  placeholder="Marca del producto"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tamaño</label>
                <Input
                  value={formData.Size}
                  onChange={(e) => setFormData({...formData, Size: e.target.value})}
                  placeholder="Tamaño o talla"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Impuesto (%) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.TaxRate}
                  onChange={(e) => setFormData({...formData, TaxRate: parseFloat(e.target.value) || 0})}
                  required
                  placeholder="Porcentaje de impuesto"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Precio Unitario *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.UnitPrice}
                  onChange={(e) => setFormData({...formData, UnitPrice: parseFloat(e.target.value) || 0})}
                  required
                  placeholder="Precio unitario"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Precio Venta Recomendado</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.RecommendedRetailPrice || ''}
                  onChange={(e) => setFormData({...formData, RecommendedRetailPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                  placeholder="Precio de venta recomendado"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Lead Time (Días) *</label>
                <Input
                  type="number"
                  value={formData.LeadTimeDays}
                  onChange={(e) => setFormData({...formData, LeadTimeDays: parseInt(e.target.value) || 0})}
                  required
                  placeholder="Días de lead time"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Código de Barras</label>
                <Input
                  value={formData.Barcode}
                  onChange={(e) => setFormData({...formData, Barcode: e.target.value})}
                  placeholder="Código de barras"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Comentarios de Marketing</label>
                <Input
                  value={formData.MarketingComments}
                  onChange={(e) => setFormData({...formData, MarketingComments: e.target.value})}
                  placeholder="Comentarios para marketing"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Comentarios Internos</label>
                <Input
                  value={formData.InternalComments}
                  onChange={(e) => setFormData({...formData, InternalComments: e.target.value})}
                  placeholder="Comentarios internos"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Nota:</strong> Los cambios en productos se replicarán automáticamente 
                a todas las sucursales (San José y Limón) mediante triggers de SQL Server.
              </p>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingProduct ? 'Modificando...' : 'Creando...'}
                  </>
                ) : (
                  editingProduct ? 'Modificar Producto' : 'Crear Producto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}