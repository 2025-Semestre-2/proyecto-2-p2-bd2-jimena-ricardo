import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';

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

interface Filtro {
  tipo_filtro: string;
  valor: string;
  etiqueta: string;
}

interface OpcionCombobox {
  id: number;
  nombre: string;
}

interface ProductFormData {
  StockItemName: string;
  SupplierName: string;
  ColorName: string;
  UnitPackageName: string;
  OuterPackageName: string;
  QuantityPerOuter: number;
  Brand: string;
  Size: string;
  TaxRate: number;
  UnitPrice: number;
  RecommendedRetailPrice?: number;
  LeadTimeDays: number;
  Barcode: string;
  IsChillerStock: boolean;
  TypicalWeightPerUnit?: number;
  MarketingComments: string;
  InternalComments: string;
  StockGroupNames: string;
}

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
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(50);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargandoTotal, setCargandoTotal] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    StockItemName: '',
    SupplierName: '',
    ColorName: '',
    UnitPackageName: '',
    OuterPackageName: '',
    QuantityPerOuter: 0,
    Brand: '',
    Size: '',
    TaxRate: 0,
    UnitPrice: 0,
    RecommendedRetailPrice: 0,
    LeadTimeDays: 0,
    Barcode: '',
    IsChillerStock: false,
    TypicalWeightPerUnit: 1.0,
    MarketingComments: '',
    InternalComments: '',
    StockGroupNames: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const [proveedores, setProveedores] = useState<OpcionCombobox[]>([]);
  const [colores, setColores] = useState<OpcionCombobox[]>([]);
  const [tiposPaquete, setTiposPaquete] = useState<OpcionCombobox[]>([]);
  const [gruposStock, setGruposStock] = useState<OpcionCombobox[]>([]);
  const [opcionesCargando, setOpcionesCargando] = useState(false);

  const [grupos, setGrupos] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  const totalPaginas = Math.ceil(totalRegistros / tamanoPagina);

  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
      timer: 3000,
      timerProgressBar: true
    });
  };

  const showErrorAlert = (title: string, message: string) => {
    Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc2626'
    });
  };

  const showConfirmAlert = (title: string, message: string): Promise<boolean> => {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => {
      return result.isConfirmed;
    });
  };

  const showLoadingAlert = (title: string) => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const closeAlert = () => {
    Swal.close();
  };

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
    fetchOpcionesCombobox();
  }, [location.state]);

  useEffect(() => {
    if (!loading) {
      fetchTotalInventarios();
    }
  }, [searchTerm, groupFilter]);

  const fetchOpcionesCombobox = async () => {
    try {
      setOpcionesCargando(true);
      const response = await fetch('http://localhost:3000/api/inventarios/opciones');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProveedores(data.proveedores || []);
      setColores(data.colores || []);
      setTiposPaquete(data.tiposPaquete || []);
      setGruposStock(data.gruposStock || []);
      
    } catch (err) {
      console.error('Error cargando opciones:', err);
      showErrorAlert('Error', 'No se pudieron cargar las opciones del formulario');
    } finally {
      setOpcionesCargando(false);
    }
  };

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
      showErrorAlert('Error', 'No se pudieron cargar los filtros');
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      setProducts(data.inventarios || []);
      setTotalRegistros(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los productos';
      setError(errorMessage);
      showErrorAlert('Error', errorMessage);
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedProduct(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los detalles del producto';
      setError(errorMessage);
      showErrorAlert('Error', errorMessage);
    }
  };

  const fetchProductoParaEditar = async (id: number) => {
    try {
      setFormLoading(true);
      showLoadingAlert('Cargando datos del producto...');
      
      const response = await fetch(`http://localhost:3000/api/inventarios/${id}/editar`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEditingProduct(data);
      
      setFormData({
        StockItemName: data.StockItemName || '',
        SupplierName: data.SupplierName || '',
        ColorName: data.ColorName || '',
        UnitPackageName: data.UnitPackageName || '',
        OuterPackageName: data.OuterPackageName || '',
        QuantityPerOuter: data.QuantityPerOuter || 0,
        Brand: data.Brand || '',
        Size: data.Size || '',
        TaxRate: data.TaxRate || 0,
        UnitPrice: data.UnitPrice || 0,
        RecommendedRetailPrice: data.RecommendedRetailPrice || 0,
        LeadTimeDays: data.LeadTimeDays || 0,
        Barcode: data.Barcode || '',
        IsChillerStock: data.IsChillerStock || false,
        TypicalWeightPerUnit: data.TypicalWeightPerUnit || 1.0,
        MarketingComments: data.MarketingComments || '',
        InternalComments: data.InternalComments || '',
        StockGroupNames: data.StockGroupNames || ''
      });
      
      setShowForm(true);
      closeAlert();
      
    } catch (err) {
      console.error('Error cargando producto para editar:', err);
      closeAlert();
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      showErrorAlert('Error', `No se pudieron cargar los datos del producto: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };

  const crearProducto = async (productoData: ProductFormData) => {
    try {
      setFormLoading(true);
      showLoadingAlert('Creando producto...');
      
      const response = await fetch('http://localhost:3000/api/inventarios', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productoData,
          TypicalWeightPerUnit: productoData.TypicalWeightPerUnit || 1.0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Error al crear producto');
      }
      
      const result = await response.json();
      
      closeAlert();
      showSuccessAlert('¡Éxito!', 'Producto creado exitosamente');
      
      fetchProducts();
      setShowForm(false);
      resetForm();
      
    } catch (err) {
      console.error('Error creando producto:', err);
      closeAlert();
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('Proveedor no encontrado')) {
        showErrorAlert('Error de Proveedor', 'El proveedor seleccionado no existe. Por favor, seleccione un proveedor válido.');
      } else if (errorMessage.includes('Tipo de paquete')) {
        showErrorAlert('Error de Paquete', 'El tipo de paquete seleccionado no existe. Por favor, seleccione tipos de paquete válidos.');
      } else {
        showErrorAlert('Error', `No se pudo crear el producto: ${errorMessage}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const modificarProducto = async (id: number, productoData: ProductFormData) => {
    try {
      setFormLoading(true);
      showLoadingAlert('Actualizando producto...');
      
      const response = await fetch(`http://localhost:3000/api/inventarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productoData,
          TypicalWeightPerUnit: productoData.TypicalWeightPerUnit || 1.0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Error al modificar producto');
      }
      
      const result = await response.json();
      
      closeAlert();
      showSuccessAlert('¡Éxito!', 'Producto modificado exitosamente');
      
      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      
    } catch (err) {
      console.error('Error modificando producto:', err);
      closeAlert();
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('Ya existe un producto con el nombre') || errorMessage.includes('Nombre duplicado')) {
        showErrorAlert('Nombre Duplicado', 'Ya existe un producto con ese nombre. Por favor, use un nombre diferente.');
      } else if (errorMessage.includes('Producto no encontrado')) {
        showErrorAlert('Producto No Encontrado', 'El producto que intenta modificar no existe.');
      } else if (errorMessage.includes('Proveedor no encontrado') || errorMessage.includes('Tipo de paquete')) {
        showErrorAlert('Error de Datos', 'Los datos de referencia no existen. Verifique el proveedor y tipos de paquete.');
      } else {
        showErrorAlert('Error', `No se pudo modificar el producto: ${errorMessage}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const eliminarProducto = async (id: number, nombre: string) => {
    const confirmed = await showConfirmAlert(
      '¿Eliminar producto?',
      `¿Estás seguro de que deseas eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      showLoadingAlert('Eliminando producto...');
      
      const response = await fetch(`http://localhost:3000/api/inventarios/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Error al eliminar producto');
      }
      
      const result = await response.json();
      
      closeAlert();
      showSuccessAlert('¡Éxito!', 'Producto eliminado exitosamente');
      
      fetchProducts();
      setSelectedProduct(null);
      
    } catch (err) {
      console.error('Error eliminando producto:', err);
      closeAlert();
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('tiene registros relacionados')) {
        showErrorAlert('No Se Puede Eliminar', 'El producto tiene registros relacionados en órdenes de venta, facturas u órdenes de compra. No se puede eliminar.');
      } else if (errorMessage.includes('no existe')) {
        showErrorAlert('Producto No Encontrado', 'El producto que intenta eliminar no existe.');
      } else {
        showErrorAlert('Error', `No se pudo eliminar el producto: ${errorMessage}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      StockItemName: '',
      SupplierName: '',
      ColorName: '',
      UnitPackageName: '',
      OuterPackageName: '',
      QuantityPerOuter: 0,
      Brand: '',
      Size: '',
      TaxRate: 0,
      UnitPrice: 0,
      RecommendedRetailPrice: 0,
      LeadTimeDays: 0,
      Barcode: '',
      IsChillerStock: false,
      TypicalWeightPerUnit: 1.0,
      MarketingComments: '',
      InternalComments: '',
      StockGroupNames: ''
    });
  };

  const abrirFormularioCrear = () => {
    setEditingProduct(null);
    resetForm();
    setShowForm(true);
  };

  const abrirFormularioEditar = (producto: Product) => {
    fetchProductoParaEditar(producto.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica del formulario
    if (!formData.StockItemName.trim()) {
      showErrorAlert('Error de Validación', 'El nombre del producto es obligatorio.');
      return;
    }
    
    if (!formData.SupplierName) {
      showErrorAlert('Error de Validación', 'Debe seleccionar un proveedor.');
      return;
    }
    
    if (!formData.UnitPackageName) {
      showErrorAlert('Error de Validación', 'Debe seleccionar una unidad de empaquetamiento.');
      return;
    }
    
    if (!formData.OuterPackageName) {
      showErrorAlert('Error de Validación', 'Debe seleccionar un empaquetamiento externo.');
      return;
    }
    
    if (editingProduct) {
      modificarProducto(editingProduct.StockItemID, formData);
    } else {
      crearProducto(formData);
    }
  };

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

  useEffect(() => {
    if (!loading) {
      fetchProducts(searchTerm, groupFilter);
    }
  }, [paginaActual, tamanoPagina]);

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
                  <TableHead className="text-center">Acciones</TableHead>
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
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(product)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirFormularioEditar(product)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Modificar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarProducto(product.id, product.nombre_producto)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
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
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <label className="text-sm font-medium mb-2 block">Proveedor *</label>
                <Select 
                  value={formData.SupplierName} 
                  onValueChange={(value) => setFormData({...formData, SupplierName: value})}
                  disabled={opcionesCargando}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.nombre}>
                        {proveedor.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <Select 
                  value={formData.ColorName} 
                  onValueChange={(value) => setFormData({...formData, ColorName: value})}
                  disabled={opcionesCargando}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colores.map((color) => (
                      <SelectItem key={color.id} value={color.nombre}>
                        {color.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Unidad Empaquetamiento *</label>
                <Select 
                  value={formData.UnitPackageName} 
                  onValueChange={(value) => setFormData({...formData, UnitPackageName: value})}
                  disabled={opcionesCargando}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPaquete.map((paquete) => (
                      <SelectItem key={paquete.id} value={paquete.nombre}>
                        {paquete.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Empaquetamiento Externo *</label>
                <Select 
                  value={formData.OuterPackageName} 
                  onValueChange={(value) => setFormData({...formData, OuterPackageName: value})}
                  disabled={opcionesCargando}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empaque externo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPaquete.map((paquete) => (
                      <SelectItem key={paquete.id} value={paquete.nombre}>
                        {paquete.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad por Empaque *</label>
                <Input
                  type="number"
                  value={formData.QuantityPerOuter}
                  onChange={(e) => setFormData({...formData, QuantityPerOuter: parseInt(e.target.value) || 0})}
                  required
                  min="1"
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
                  min="0"
                  max="100"
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
                  min="0"
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
                  min="0"
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
                  min="0"
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
              
              <div>
                <label className="text-sm font-medium mb-2 block">Peso Típico por Unidad (kg)</label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.TypicalWeightPerUnit || 1.0}
                  onChange={(e) => setFormData({...formData, TypicalWeightPerUnit: parseFloat(e.target.value) || 1.0})}
                  min="0.001"
                  placeholder="Peso típico por unidad"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Grupos de Stock</label>
                <Select 
                  value={formData.StockGroupNames} 
                  onValueChange={(value) => setFormData({...formData, StockGroupNames: value})}
                  disabled={opcionesCargando}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupos" />
                  </SelectTrigger>
                  <SelectContent>
                    {gruposStock.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.nombre}>
                        {grupo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Los campos marcados con * son obligatorios. 
                Asegúrese de que el nombre del producto sea único en el sistema.
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