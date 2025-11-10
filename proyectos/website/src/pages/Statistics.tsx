import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

// Interfaces para tipado basadas en los stored procedures actualizados
interface CompraProveedor {
  CategoryName: string;
  SupplierName: string;
  Minimum: number;
  Maximum: number;
  Average: number;
}

interface VentaCliente {
  CategoryName: string;
  CustomerName: string;
  Minimum: number;
  Maximum: number;
  Average: number;
}

interface TopProducto {
  Year: number;
  ProductName: string;
  Total: number;
}

interface TopCliente {
  Year: number;
  CustomerName: string;
  Total: number;
}

interface TopProveedor {
  Year: number;
  SupplierName: string;
  Total: number;
}

export default function Statistics() {
  const [yearFilter, setYearFilter] = useState("2023");
  const [startYearFilter, setStartYearFilter] = useState("2020");
  const [endYearFilter, setEndYearFilter] = useState("2023");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginación
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Estados para los datos
  const [comprasProveedores, setComprasProveedores] = useState<CompraProveedor[]>([]);
  const [ventasClientes, setVentasClientes] = useState<VentaCliente[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [topProveedores, setTopProveedores] = useState<TopProveedor[]>([]);

  // Estados para años disponibles
  const [years, setYears] = useState<{value: string, label: string}[]>([]);

  // Generar años disponibles
  useEffect(() => {
    const yearsList = [];
    for (let year = 2013; year <= 2026; year++) {
      yearsList.push({
        value: year.toString(),
        label: year.toString()
      });
    }
    setYears(yearsList);
    
    // Cargar datos iniciales
    fetchComprasProveedores();
    fetchVentasClientes();
    fetchTopProductos();
    fetchTopClientes();
    fetchTopProveedores();
  }, []);

  // Función genérica para fetch
  const fetchData = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas de compras a proveedores
  const fetchComprasProveedores = async (page: number = 1, size: number = 50) => {
    const filtro = supplierFilter || categoryFilter ? `${supplierFilter} ${categoryFilter}`.trim() : undefined;
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: size.toString(),
      ...(filtro && { filtro })
    });
    
    const data = await fetchData(`http://localhost:3000/purchase-order-stat?${params.toString()}`);
    setComprasProveedores(data);
    setPageNumber(page);
    setPageSize(size);
  };

  // Estadísticas de ventas a clientes
  const fetchVentasClientes = async (page: number = 1, size: number = 50) => {
    const filtro = customerFilter || categoryFilter ? `${customerFilter} ${categoryFilter}`.trim() : undefined;
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: size.toString(),
      ...(filtro && { filtro })
    });
    
    const data = await fetchData(`http://localhost:3000/invoice-stat?${params.toString()}`);
    setVentasClientes(data);
  };

  // Top 5 productos
  const fetchTopProductos = async () => {
    const data = await fetchData(`http://localhost:3000/products-stat?anio=${yearFilter}`);
    setTopProductos(data);
  };

  // Top 5 clientes
  const fetchTopClientes = async () => {
    const data = await fetchData(`http://localhost:3000/customers-stat?anioInicio=${startYearFilter}&anioFin=${endYearFilter}`);
    setTopClientes(data);
  };

  // Top 5 proveedores
  const fetchTopProveedores = async () => {
    const data = await fetchData(`http://localhost:3000/suppliers-stat?anioInicio=${startYearFilter}&anioFin=${endYearFilter}`);
    setTopProveedores(data);
  };

  const handleReset = () => {
    setSupplierFilter("");
    setCategoryFilter("");
    setCustomerFilter("");
    setYearFilter("2023");
    setStartYearFilter("2020");
    setEndYearFilter("2023");
    setPageNumber(1);
    
    // Recargar datos sin filtros
    fetchComprasProveedores(1, pageSize);
    fetchVentasClientes(1, pageSize);
    fetchTopProductos();
    fetchTopClientes();
    fetchTopProveedores();
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    fetchComprasProveedores(newPage, pageSize);
  };

  // Separar filas de totales por categoría y detalle por proveedor
  const getCategoriaTotals = (data: CompraProveedor[]) => {
    return data.filter(item => item.CategoryName === 'TOTAL CATEGORIA');
  };

  const getProveedorDetails = (data: CompraProveedor[]) => {
    return data.filter(item => item.CategoryName !== 'TOTAL CATEGORIA' && item.SupplierName !== 'TOTAL');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-6 border border-primary/20">
        <h1 className="text-3xl font-bold text-gradient">Estadísticas</h1>
        <p className="text-muted-foreground mt-2">Análisis y reportes de datos del sistema</p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      <Tabs defaultValue="suppliers" className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="products">Top Productos</TabsTrigger>
          <TabsTrigger value="top-customers">Top Clientes</TabsTrigger>
          <TabsTrigger value="top-suppliers">Top Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Compras a Proveedores</CardTitle>
              <CardDescription>
                Montos mínimos, máximos y promedio de compras agrupados por categoría y proveedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Filtrar por proveedor</label>
                  <Input 
                    placeholder="Filtrar por proveedor..." 
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                  />
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Filtrar por categoría</label>
                  <Input 
                    placeholder="Filtrar por categoría..." 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </Card>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={() => fetchComprasProveedores(1, pageSize)} className="flex-1" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>

              {/* Totales por Categoría */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Totales por Categoría</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Monto Mínimo</TableHead>
                      <TableHead>Monto Máximo</TableHead>
                      <TableHead>Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCategoriaTotals(comprasProveedores).map((total, index) => (
                      <TableRow key={`total-${index}`} className="bg-muted/50">
                        <TableCell className="font-medium text-primary">{total.SupplierName}</TableCell>
                        <TableCell className="font-medium">${total.Minimum?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="font-medium">${total.Maximum?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="font-medium">${total.Average?.toFixed(2) || "0.00"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Detalle por Proveedor */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Detalle por Proveedor</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Monto Mínimo</TableHead>
                      <TableHead>Monto Máximo</TableHead>
                      <TableHead>Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getProveedorDetails(comprasProveedores).map((compra, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{compra.CategoryName}</TableCell>
                        <TableCell>{compra.SupplierName}</TableCell>
                        <TableCell>${compra.Minimum?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>${compra.Maximum?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>${compra.Average?.toFixed(2) || "0.00"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Paginación */}
                <div className="flex justify-between items-center p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Página {pageNumber} - Mostrando {comprasProveedores.length} registros
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
                      disabled={comprasProveedores.length < pageSize || loading}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Ventas a Clientes</CardTitle>
              <CardDescription>
                Montos mínimos, máximos y promedio de ventas agrupados por categoría y cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Filtrar por cliente</label>
                  <Input 
                    placeholder="Filtrar por cliente..." 
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                  />
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Filtrar por categoría</label>
                  <Input 
                    placeholder="Filtrar por categoría..." 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </Card>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={() => fetchVentasClientes(1, pageSize)} className="flex-1" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto Mínimo</TableHead>
                    <TableHead>Monto Máximo</TableHead>
                    <TableHead>Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasClientes
                    .filter(venta => venta.CategoryName !== 'TOTAL CATEGORIA' && venta.CustomerName !== 'TOTAL')
                    .map((venta, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{venta.CategoryName}</TableCell>
                      <TableCell>{venta.CustomerName}</TableCell>
                      <TableCell>${venta.Minimum?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>${venta.Maximum?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>${venta.Average?.toFixed(2) || "0.00"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Productos que Generan Más Ganancia</CardTitle>
              <CardDescription>
                Productos ordenados por ganancia en ventas por año
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="p-4 mb-4">
                <label className="text-sm font-medium mb-2 block">Filtrar por año</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchTopProductos} className="flex-1" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Filtrar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Ganancia Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductos.map((producto, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{producto.ProductName}</TableCell>
                      <TableCell>{producto.Year}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${producto.Total?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clientes</CardTitle>
              <CardDescription>
                Clientes ordenados por monto total facturado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Inicio</label>
                  <Select value={startYearFilter} onValueChange={setStartYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Año inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Fin</label>
                  <Select value={endYearFilter} onValueChange={setEndYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Año fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchTopClientes} className="flex-1" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Filtrar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Monto Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClientes.map((cliente, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{cliente.CustomerName}</TableCell>
                      <TableCell>{cliente.Year}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${cliente.Total?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Proveedores</CardTitle>
              <CardDescription>
                Proveedores ordenados por monto total en órdenes de compra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Inicio</label>
                  <Select value={startYearFilter} onValueChange={setStartYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Año inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Fin</label>
                  <Select value={endYearFilter} onValueChange={setEndYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Año fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchTopProveedores} className="flex-1" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Filtrar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Monto Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProveedores.map((proveedor, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{proveedor.SupplierName}</TableCell>
                      <TableCell>{proveedor.Year}</TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        ${proveedor.Total?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}