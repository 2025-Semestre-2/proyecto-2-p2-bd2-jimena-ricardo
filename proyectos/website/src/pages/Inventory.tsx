import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Interfaces para tipado basadas en los procedimientos almacenados
interface Product {
  StockItemID: number;
  ProductName: string;
  StockGroup: string;
  QuantityOnHand: number;
}

interface ProductDetails {
  ProductName: string;
  SupplierName: string;
  Color: string;
  UnitPackageType: string;
  OuterPackageType: string;
  RecommendedRetailPrice: number;
  Weight: number;
  SearchDetails: string;
  QuantityPerOuter: number;
  Brand: string;
  Size: string;
  TaxRate: number;
  UnitPrice: number;
  QuantityOnHand: number;
  BinLocation: string;
}

// Interface para formulario de producto
interface ProductFormData {
  ProductName: string;
  StockGroup: string;
  SupplierName: string;
  Color: string;
  UnitPackageType: string;
  OuterPackageType: string;
  RecommendedRetailPrice: number;
  Weight: number;
  QuantityPerOuter: number;
  Brand: string;
  Size: string;
  TaxRate: number;
  UnitPrice: number;
  BinLocation: string;
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
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Estado para formulario
  const [formData, setFormData] = useState<ProductFormData>({
    ProductName: "",
    StockGroup: "",
    SupplierName: "",
    Color: "",
    UnitPackageType: "",
    OuterPackageType: "",
    RecommendedRetailPrice: 0,
    Weight: 0,
    QuantityPerOuter: 1,
    Brand: "",
    Size: "",
    TaxRate: 0,
    UnitPrice: 0,
    BinLocation: ""
  });

  // Estados para paginación
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalStock, setTotalStock] = useState(0);
  
  // Estados para los filtros dinámicos - SOLO GRUPOS
  const [grupos, setGrupos] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Cargar productos iniciales y filtros
  useEffect(() => {
    const state = location.state as { initialSearch?: string; autoSearch?: boolean };
    
    if (state?.initialSearch) {
      setSearchTerm(state.initialSearch);
      if (state.autoSearch) {
        setTimeout(() => {
          fetchProducts(pageNumber, pageSize, state.initialSearch, groupFilter);
        }, 100);
      }
    } else {
      fetchProducts(pageNumber, pageSize);
    }
    
    fetchFiltros();
    fetchTotalStock();
  }, [location.state]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      
      const gruposEstaticos: Filtro[] = [
        { tipo_filtro: 'grupos', valor: 'Audio Video', etiqueta: 'Audio Video' },
        { tipo_filtro: 'grupos', valor: 'Clothing', etiqueta: 'Ropa' },
        { tipo_filtro: 'grupos', valor: 'Computing', etiqueta: 'Computación' },
        { tipo_filtro: 'grupos', valor: 'Fashion', etiqueta: 'Moda' },
        { tipo_filtro: 'grupos', valor: 'Home Appliances', etiqueta: 'Electrodomésticos' },
        { tipo_filtro: 'grupos', valor: 'Packaging Materials', etiqueta: 'Materiales de Empaque' },
        { tipo_filtro: 'grupos', valor: 'Novelty Items', etiqueta: 'Artículos Novedosos' },
        { tipo_filtro: 'grupos', valor: 'Toys', etiqueta: 'Juguetes' }
      ];
      
      setGrupos(gruposEstaticos);
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  // Función para obtener el total de productos en stock
  const fetchTotalStock = async () => {
    try {
      const response = await fetch('http://localhost:3000/total-stock');
      const total = await response.json();
      setTotalStock(total);
    } catch (err) {
      console.error('Error fetching total stock:', err);
    }
  };

  const fetchProducts = async (
    page: number = 1, 
    size: number = 50, 
    product: string = "", 
    group: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: size.toString(),
        product: product ? `%${product}%` : '%',
        group: group && group !== 'all' ? `%${group}%` : '%'
      });
      
      const url = `http://localhost:3000/stock-list?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setPageNumber(page);
      setPageSize(size);
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
      const response = await fetch(`http://localhost:3000/stock-details?productId=${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedProduct(data[0]);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del producto');
    }
  };

  // Funciones para CRUD (Placeholder - para demostración)
  const handleCreateProduct = async () => {
    try {
      // Simular creación de producto
      console.log('Creando producto:', formData);
      
      // Aquí iría la llamada real a la API cuando esté implementada
      // await fetch('http://localhost:3000/create-product', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simular replicación
      console.log('✅ Producto creado y replicado a todas las bases de datos');
      
      // Recargar productos
      fetchProducts(pageNumber, pageSize, searchTerm, groupFilter);
      setShowCreateModal(false);
      resetForm();
      
      // Mostrar mensaje de éxito
      alert('Producto creado exitosamente y replicado a todas las sucursales');
      
    } catch (err) {
      console.error('Error creando producto:', err);
      alert('Error al crear el producto');
    }
  };

  const handleEditProduct = async () => {
    try {
      if (!productToEdit) return;
      
      // Simular edición de producto
      console.log('Editando producto:', productToEdit.StockItemID, formData);
      
      // Aquí iría la llamada real a la API cuando esté implementada
      // await fetch(`http://localhost:3000/update-product/${productToEdit.StockItemID}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simular replicación
      console.log('✅ Producto modificado y replicado a todas las bases de datos');
      
      // Recargar productos
      fetchProducts(pageNumber, pageSize, searchTerm, groupFilter);
      setShowEditModal(false);
      resetForm();
      
      // Mostrar mensaje de éxito
      alert('Producto modificado exitosamente y replicado a todas las sucursales');
      
    } catch (err) {
      console.error('Error editando producto:', err);
      alert('Error al modificar el producto');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      if (!productToDelete) return;
      
      // Simular eliminación de producto
      console.log('Eliminando producto:', productToDelete.StockItemID);
      
      // Aquí iría la llamada real a la API cuando esté implementada
      // await fetch(`http://localhost:3000/delete-product/${productToDelete.StockItemID}`, {
      //   method: 'DELETE'
      // });
      
      // Simular replicación
      console.log('✅ Producto eliminado y replicado a todas las bases de datos');
      
      // Recargar productos
      fetchProducts(pageNumber, pageSize, searchTerm, groupFilter);
      setShowDeleteModal(false);
      
      // Mostrar mensaje de éxito
      alert('Producto eliminado exitosamente y replicado a todas las sucursales');
      
    } catch (err) {
      console.error('Error eliminando producto:', err);
      alert('Error al eliminar el producto');
    }
  };

  // Funciones para abrir modales
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (product: Product) => {
    setProductToEdit(product);
    // Cargar datos actuales del producto en el formulario
    setFormData({
      ProductName: product.ProductName,
      StockGroup: product.StockGroup,
      SupplierName: "",
      Color: "",
      UnitPackageType: "",
      OuterPackageType: "",
      RecommendedRetailPrice: 0,
      Weight: 0,
      QuantityPerOuter: 1,
      Brand: "",
      Size: "",
      TaxRate: 0,
      UnitPrice: 0,
      BinLocation: ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      ProductName: "",
      StockGroup: "",
      SupplierName: "",
      Color: "",
      UnitPackageType: "",
      OuterPackageType: "",
      RecommendedRetailPrice: 0,
      Weight: 0,
      QuantityPerOuter: 1,
      Brand: "",
      Size: "",
      TaxRate: 0,
      UnitPrice: 0,
      BinLocation: ""
    });
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
    fetchProducts(1, pageSize, searchTerm, groupFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setGroupFilter("");
    fetchProducts(1, pageSize);
  };

  const handleViewDetails = (product: Product) => {
    fetchProductDetails(product.StockItemID);
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, pageSize, searchTerm, groupFilter);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Inventarios</h1>
            <p className="text-muted-foreground mt-2">Consulta y gestiona los productos en inventario</p>
            <p className="text-sm text-muted-foreground mt-1">Total de productos: {totalStock}</p>
          </div>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
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
                  <TableRow key={product.StockItemID}>
                    <TableCell className="font-medium">{product.ProductName}</TableCell>
                    <TableCell>{product.StockGroup}</TableCell>
                    <TableCell>{product.QuantityOnHand}</TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(product)}
                          disabled={loading}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(product)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Paginación */}
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {pageNumber} - Mostrando {products.length} de {totalStock} productos
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
                  disabled={products.length < pageSize || loading}
                >
                  Siguiente
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre del Producto</p>
                  <p className="font-medium">{selectedProduct.ProductName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <button 
                    onClick={() => searchSupplierByName(selectedProduct.SupplierName)}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    {selectedProduct.SupplierName}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click para ver detalles del proveedor
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{selectedProduct.Color || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unidad de Empaquetamiento</p>
                  <p className="font-medium">{selectedProduct.UnitPackageType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empaquetamiento Externo</p>
                  <p className="font-medium">{selectedProduct.OuterPackageType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad por Empaque</p>
                  <p className="font-medium">{selectedProduct.QuantityPerOuter}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-medium">{selectedProduct.Brand || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tamaño</p>
                  <p className="font-medium">{selectedProduct.Size || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Impuesto</p>
                  <p className="font-medium">{selectedProduct.TaxRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Unitario</p>
                  <p className="font-medium">${selectedProduct.UnitPrice?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Recomendado</p>
                  <p className="font-medium">${selectedProduct.RecommendedRetailPrice?.toFixed(2) || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peso</p>
                  <p className="font-medium">{selectedProduct.Weight || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Detalles de Búsqueda</p>
                <p className="font-medium">{selectedProduct.SearchDetails || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad Disponible</p>
                  <p className="font-medium">{selectedProduct.QuantityOnHand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación en Almacén</p>
                  <p className="font-medium">{selectedProduct.BinLocation || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Crear Producto */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre del Producto</label>
                <Input
                  value={formData.ProductName}
                  onChange={(e) => setFormData({...formData, ProductName: e.target.value})}
                  placeholder="Ingrese nombre del producto"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Grupo</label>
                <Select value={formData.StockGroup} onValueChange={(value) => setFormData({...formData, StockGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.valor} value={grupo.valor}>
                        {grupo.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Proveedor</label>
                <Input
                  value={formData.SupplierName}
                  onChange={(e) => setFormData({...formData, SupplierName: e.target.value})}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Input
                  value={formData.Color}
                  onChange={(e) => setFormData({...formData, Color: e.target.value})}
                  placeholder="Color del producto"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Precio Unitario</label>
                <Input
                  type="number"
                  value={formData.UnitPrice}
                  onChange={(e) => setFormData({...formData, UnitPrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tasa de Impuesto (%)</label>
                <Input
                  type="number"
                  value={formData.TaxRate}
                  onChange={(e) => setFormData({...formData, TaxRate: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Al guardar, este producto será replicado a todas las bases de datos de las sucursales
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProduct}>
              Crear Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Producto */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre del Producto</label>
                <Input
                  value={formData.ProductName}
                  onChange={(e) => setFormData({...formData, ProductName: e.target.value})}
                  placeholder="Ingrese nombre del producto"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Grupo</label>
                <Select value={formData.StockGroup} onValueChange={(value) => setFormData({...formData, StockGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.valor} value={grupo.valor}>
                        {grupo.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Precio Unitario</label>
                <Input
                  type="number"
                  value={formData.UnitPrice}
                  onChange={(e) => setFormData({...formData, UnitPrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tasa de Impuesto (%)</label>
                <Input
                  type="number"
                  value={formData.TaxRate}
                  onChange={(e) => setFormData({...formData, TaxRate: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Nota:</strong> Al guardar, los cambios serán replicados a todas las bases de datos de las sucursales
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditProduct}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Eliminar Producto */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>¿Está seguro que desea eliminar el producto <strong>{productToDelete?.ProductName}</strong>?</p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                <strong>Advertencia:</strong> Esta acción eliminará el producto de todas las bases de datos de las sucursales
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}