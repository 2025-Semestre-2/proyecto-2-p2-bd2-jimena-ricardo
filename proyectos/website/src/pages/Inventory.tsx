import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, Link as LinkIcon, ExternalLink, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swing } from 'swing';

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

// Interface para el formulario de producto
interface ProductFormData {
  nombre_producto: string;
  proveedor_id: number;
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
    nombre_producto: '',
    proveedor_id: 0,
    color: '',
    unidad_empaquetamiento: '',
    empaquetamiento_externo: '',
    cantidad_empaquetamiento: 0,
    marca: '',
    talla_tamano: '',
    impuesto: 0,
    precio_unitario: 0,
    precio_venta: 0,
    paso: '',
    palabras_clave: '',
    cantidad_disponible: 0,
    ubicacion: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados para los filtros dinámicos - SOLO GRUPOS
  const [grupos, setGrupos] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalRegistros / tamanoPagina);

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
      params.append('pagina', paginaActual.toString());
      params.append('tamanoPagina', tamanoPagina.toString());
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

  const fetchTotalInventarios = async () => {
    try {
      setCargandoTotal(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('nombre', searchTerm);
      if (groupFilter && groupFilter !== 'all') params.append('grupo', groupFilter);
      
      const url = `http://localhost:3000/api/inventarios/total?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTotalRegistros(data.Total || 0);
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

  // Funciones CRUD (Simuladas - Comentadas hasta que estén los SPs)
  const crearProducto = async (productoData: ProductFormData) => {
    try {
      setFormLoading(true);
      
      // SIMULACIÓN - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch('http://localhost:3000/api/inventarios', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productoData)
      // });
      
      // if (!response.ok) throw new Error('Error al crear producto');
      
      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar alerta de éxito
      Swing.success('Producto creado exitosamente');
      
      // Recargar productos
      fetchProducts();
      setShowForm(false);
      resetForm();
      
    } catch (err) {
      console.error('Error creando producto:', err);
      Swing.error('Error al crear el producto');
    } finally {
      setFormLoading(false);
    }
  };

  const modificarProducto = async (id: number, productoData: ProductFormData) => {
    try {
      setFormLoading(true);
      
      // SIMULACIÓN - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`http://localhost:3000/api/inventarios/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productoData)
      // });
      
      // if (!response.ok) throw new Error('Error al modificar producto');
      
      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar alerta de éxito
      Swing.success('Producto modificado exitosamente');
      
      // Recargar productos
      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      
    } catch (err) {
      console.error('Error modificando producto:', err);
      Swing.error('Error al modificar el producto');
    } finally {
      setFormLoading(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      // Confirmación antes de eliminar
      if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
      }
      
      // SIMULACIÓN - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`http://localhost:3000/api/inventarios/${id}`, {
      //   method: 'DELETE'
      // });
      
      // if (!response.ok) throw new Error('Error al eliminar producto');
      
      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mostrar alerta de éxito
      Swing.success('Producto eliminado exitosamente');
      
      // Recargar productos
      fetchProducts();
      setSelectedProduct(null);
      
    } catch (err) {
      console.error('Error eliminando producto:', err);
      Swing.error('Error al eliminar el producto');
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      nombre_producto: '',
      proveedor_id: 0,
      color: '',
      unidad_empaquetamiento: '',
      empaquetamiento_externo: '',
      cantidad_empaquetamiento: 0,
      marca: '',
      talla_tamano: '',
      impuesto: 0,
      precio_unitario: 0,
      precio_venta: 0,
      paso: '',
      palabras_clave: '',
      cantidad_disponible: 0,
      ubicacion: ''
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
      nombre_producto: producto.nombre_producto,
      proveedor_id: producto.proveedor_id || 0,
      color: producto.color,
      unidad_empaquetamiento: producto.unidad_empaquetamiento,
      empaquetamiento_externo: producto.empaquetamiento_externo,
      cantidad_empaquetamiento: producto.cantidad_empaquetamiento,
      marca: producto.marca,
      talla_tamano: producto.talla_tamano,
      impuesto: producto.impuesto,
      precio_unitario: producto.precio_unitario,
      precio_venta: producto.precio_venta,
      paso: producto.paso,
      palabras_clave: producto.palabras_clave,
      cantidad_disponible: producto.cantidad_disponible,
      ubicacion: producto.ubicacion
    });
    setShowForm(true);
  };

  // Función para manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      modificarProducto(editingProduct.ProductID, formData);
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
    setPaginaActual(1); // Resetear a primera página al buscar
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

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Inventarios</h1>
            <p className="text-muted-foreground mt-2">Consulta y gestiona los productos en inventario</p>
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
            <p>Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron productos</p>
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
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.nombre_producto}</TableCell>
                    <TableCell>{product.grupo}</TableCell>
                    <TableCell>{product.cantidad_inventario}</TableCell>
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
                  onClick={() => eliminarProducto(selectedProduct.ProductID)}
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
                <label className="text-sm font-medium mb-2 block">Nombre del Producto</label>
                <Input
                  value={formData.nombre_producto}
                  onChange={(e) => setFormData({...formData, nombre_producto: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Proveedor ID</label>
                <Input
                  type="number"
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({...formData, proveedor_id: parseInt(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Unidad de Empaquetamiento</label>
                <Input
                  value={formData.unidad_empaquetamiento}
                  onChange={(e) => setFormData({...formData, unidad_empaquetamiento: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Empaquetamiento Externo</label>
                <Input
                  value={formData.empaquetamiento_externo}
                  onChange={(e) => setFormData({...formData, empaquetamiento_externo: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad de Empaquetamiento</label>
                <Input
                  type="number"
                  value={formData.cantidad_empaquetamiento}
                  onChange={(e) => setFormData({...formData, cantidad_empaquetamiento: parseInt(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Marca</label>
                <Input
                  value={formData.marca}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tamaño/Talla</label>
                <Input
                  value={formData.talla_tamano}
                  onChange={(e) => setFormData({...formData, talla_tamano: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Impuesto (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.impuesto}
                  onChange={(e) => setFormData({...formData, impuesto: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Precio Unitario</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({...formData, precio_unitario: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Precio de Venta</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({...formData, precio_venta: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Paso</label>
                <Input
                  value={formData.paso}
                  onChange={(e) => setFormData({...formData, paso: e.target.value})}
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Palabras Clave</label>
                <Input
                  value={formData.palabras_clave}
                  onChange={(e) => setFormData({...formData, palabras_clave: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad Disponible</label>
                <Input
                  type="number"
                  value={formData.cantidad_disponible}
                  onChange={(e) => setFormData({...formData, cantidad_disponible: parseInt(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Ubicación</label>
                <Input
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                />
              </div>
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
                {formLoading ? 'Guardando...' : (editingProduct ? 'Modificar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}