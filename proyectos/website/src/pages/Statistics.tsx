import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, Building2, BarChart3 } from "lucide-react";

// Interfaces para tipado
interface CompraProveedor {
  proveedor: string;
  categoria: string;
  monto_minimo: number;
  monto_maximo: number;
  compra_promedio: number;
}

interface VentaCliente {
  cliente: string;
  categoria: string;
  monto_minimo: number;
  monto_maximo: number;
  venta_promedio: number;
}

interface TopProducto {
  producto: string;
  anio: number;
  ganancia_total: number;
  ranking: number;
}

interface TopCliente {
  cliente: string;
  anio: number;
  cantidad_facturas: number;
  monto_total: number;
  ranking: number;
}

interface TopProveedor {
  proveedor: string;
  anio: number;
  cantidad_ordenes: number;
  monto_total: number;
  ranking: number;
}

// Interface para los filtros dinámicos
interface Filtro {
  tipo_filtro: string;
  valor: string;
  etiqueta: string;
}

export default function Statistics() {
  const [yearFilter, setYearFilter] = useState("2023");
  const [startYearFilter, setStartYearFilter] = useState("2020");
  const [endYearFilter, setEndYearFilter] = useState("2023");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState<"consolidada" | "SJ" | "LM">("consolidada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para los datos
  const [comprasProveedores, setComprasProveedores] = useState<CompraProveedor[]>([]);
  const [ventasClientes, setVentasClientes] = useState<VentaCliente[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [topProveedores, setTopProveedores] = useState<TopProveedor[]>([]);

  // Estados para los filtros dinámicos
  const [aniosProductos, setAniosProductos] = useState<Filtro[]>([]);
  const [aniosRango, setAniosRango] = useState<Filtro[]>([]);
  const [categoriasProveedores, setCategoriasProveedores] = useState<Filtro[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Obtener información del usuario actual
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Cargar filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      const response = await fetch('http://localhost:3000/api/filtros/estadisticas');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: Filtro[] = await response.json();
      
      setAniosProductos(data.filter(filtro => filtro.tipo_filtro === 'anios_productos'));
      setAniosRango(data.filter(filtro => filtro.tipo_filtro === 'anios_rango'));
      setCategoriasProveedores(data.filter(filtro => filtro.tipo_filtro === 'categorias_proveedores'));
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  // Función genérica para fetch con filtro de sucursal
  const fetchData = async (url: string, includeBranchFilter: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      // Agregar parámetro de sucursal si es necesario
      const finalUrl = includeBranchFilter 
        ? `${url}${url.includes('?') ? '&' : '?'}sucursal=${branchFilter}`
        : url;
      
      const response = await fetch(finalUrl);
      
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
  const fetchComprasProveedores = async () => {
    const filtro = supplierFilter || categoryFilter ? `${supplierFilter} ${categoryFilter}`.trim() : undefined;
    const baseUrl = `http://localhost:3000/api/estadisticas/compras-proveedores`;
    const params = new URLSearchParams();
    
    if (filtro) params.append('filtro', filtro);
    params.append('sucursal', branchFilter);
    
    const url = `${baseUrl}?${params.toString()}`;
    const data = await fetchData(url, false); // Ya incluimos el parámetro en la URL
    setComprasProveedores(data.estadisticas || data);
  };

  // Estadísticas de ventas a clientes
  const fetchVentasClientes = async () => {
    const filtro = customerFilter || categoryFilter ? `${customerFilter} ${categoryFilter}`.trim() : undefined;
    const baseUrl = `http://localhost:3000/api/estadisticas/ventas-clientes`;
    const params = new URLSearchParams();
    
    if (filtro) params.append('filtro', filtro);
    params.append('sucursal', branchFilter);
    
    const url = `${baseUrl}?${params.toString()}`;
    const data = await fetchData(url, false);
    setVentasClientes(data.estadisticas || data);
  };

  // Top 5 productos
  const fetchTopProductos = async () => {
    const baseUrl = `http://localhost:3000/api/estadisticas/top5-productos-ganancia`;
    const params = new URLSearchParams();
    
    params.append('anio', yearFilter);
    params.append('sucursal', branchFilter);
    
    const url = `${baseUrl}?${params.toString()}`;
    const data = await fetchData(url, false);
    setTopProductos(data);
  };

  // Top 5 clientes
  const fetchTopClientes = async () => {
    const baseUrl = `http://localhost:3000/api/estadisticas/top5-clientes-facturas`;
    const params = new URLSearchParams();
    
    params.append('anioInicio', startYearFilter);
    params.append('anioFin', endYearFilter);
    params.append('sucursal', branchFilter);
    
    const url = `${baseUrl}?${params.toString()}`;
    const data = await fetchData(url, false);
    setTopClientes(data);
  };

  // Top 5 proveedores
  const fetchTopProveedores = async () => {
    const baseUrl = `http://localhost:3000/api/estadisticas/top5-proveedores-ordenes`;
    const params = new URLSearchParams();
    
    params.append('anioInicio', startYearFilter);
    params.append('anioFin', endYearFilter);
    params.append('sucursal', branchFilter);
    
    const url = `${baseUrl}?${params.toString()}`;
    const data = await fetchData(url, false);
    setTopProveedores(data);
  };

  // Cargar datos iniciales y filtros
  useEffect(() => {
    fetchFiltros();
    fetchComprasProveedores();
    fetchVentasClientes();
    fetchTopProductos();
    fetchTopClientes();
    fetchTopProveedores();
  }, []);

  // Efecto para recargar datos cuando cambia el filtro de sucursal
  useEffect(() => {
    if (!filtrosLoading) {
      fetchComprasProveedores();
      fetchVentasClientes();
      fetchTopProductos();
      fetchTopClientes();
      fetchTopProveedores();
    }
  }, [branchFilter]);

  const handleReset = () => {
    setSupplierFilter("");
    setCategoryFilter("");
    setCustomerFilter("");
    setYearFilter("2023");
    setStartYearFilter("2020");
    setEndYearFilter("2023");
    setBranchFilter("consolidada");
    
    // Recargar datos sin filtros
    fetchComprasProveedores();
    fetchVentasClientes();
    fetchTopProductos();
    fetchTopClientes();
    fetchTopProveedores();
  };

  // Filtrar filas que no son totales
  const filterNonTotalRows = (data: any[], field: string) => {
    return data.filter(item => !item[field]?.includes('TOTAL'));
  };

  // Obtener nombre de sucursal para mostrar
  const getBranchDisplayName = (branch: string) => {
    const branches: { [key: string]: string } = {
      'consolidada': 'Consolidada',
      'SJ': 'San José',
      'LM': 'Limón'
    };
    return branches[branch] || branch;
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Estadísticas</h1>
            <p className="text-muted-foreground mt-2">Análisis y reportes de datos del sistema</p>
          </div>
          
          {/* Filtro de Sucursal */}
          <Card className="w-64">
            <CardContent className="p-4">
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vista de Estadísticas
              </label>
              <Select value={branchFilter} onValueChange={(value: "consolidada" | "SJ" | "LM") => setBranchFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidada" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Consolidada (Todas)
                  </SelectItem>
                  <SelectItem value="SJ" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    San José
                  </SelectItem>
                  <SelectItem value="LM" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Limón
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {branchFilter === 'consolidada' 
                  ? 'Mostrando datos de todas las sucursales' 
                  : `Mostrando datos de sucursal ${getBranchDisplayName(branchFilter)}`
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      {/* Indicador de sucursal actual */}
      <Card className={`border-l-4 ${
        branchFilter === 'consolidada' ? 'border-l-blue-500 bg-blue-50' :
        branchFilter === 'SJ' ? 'border-l-green-500 bg-green-50' :
        'border-l-orange-500 bg-orange-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                branchFilter === 'consolidada' ? 'bg-blue-100 text-blue-600' :
                branchFilter === 'SJ' ? 'bg-green-100 text-green-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {branchFilter === 'consolidada' ? <BarChart3 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold">
                  Vista: {getBranchDisplayName(branchFilter)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {branchFilter === 'consolidada' 
                    ? 'Datos consolidados de todas las sucursales' 
                    : `Estadísticas específicas de ${getBranchDisplayName(branchFilter)}`
                  }
                </p>
              </div>
            </div>
            {user?.rol === 'admin' && branchFilter !== 'consolidada' && (
              <div className="text-sm text-muted-foreground">
                Sucursal actual: {user.branch === 'SJ' ? 'San José' : 'Limón'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <CardTitle>Montos de Compras a Proveedores</CardTitle>
              <CardDescription>
                Montos más altos, bajos y compra promedio agrupados por proveedor y categoría
                {branchFilter !== 'consolidada' && (
                  <span className="text-blue-600 font-medium">
                    {' '}(Sucursal {getBranchDisplayName(branchFilter)})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Filtrar por nombre</label>
                  <Input 
                    placeholder="Filtrar por nombre..." 
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                  />
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Filtrar por categoría</label>
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
                      {categoriasProveedores.map((categoria) => (
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
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchComprasProveedores} className="flex-1" disabled={loading || filtrosLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading || filtrosLoading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto Más Alto</TableHead>
                    <TableHead>Monto Más Bajo</TableHead>
                    <TableHead>Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterNonTotalRows(comprasProveedores, 'proveedor').map((compra, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{compra.proveedor}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {compra.categoria}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(compra.monto_maximo)}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        {formatCurrency(compra.monto_minimo)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(compra.compra_promedio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Montos de Ventas a Clientes</CardTitle>
              <CardDescription>
                Montos más altos, bajos y ventas promedio agrupados por cliente y categoría
                {branchFilter !== 'consolidada' && (
                  <span className="text-green-600 font-medium">
                    {' '}(Sucursal {getBranchDisplayName(branchFilter)})
                  </span>
                )}
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
                <Button onClick={fetchVentasClientes} className="flex-1" disabled={loading || filtrosLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading || filtrosLoading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto Más Alto</TableHead>
                    <TableHead>Monto Más Bajo</TableHead>
                    <TableHead>Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterNonTotalRows(ventasClientes, 'cliente').map((venta, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{venta.cliente}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {venta.categoria}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(venta.monto_maximo)}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        {formatCurrency(venta.monto_minimo)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(venta.venta_promedio)}
                      </TableCell>
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
                {branchFilter !== 'consolidada' && (
                  <span className="text-purple-600 font-medium">
                    {' '}(Sucursal {getBranchDisplayName(branchFilter)})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="p-4 mb-4">
                <label className="text-sm font-medium mb-2 block">Filtrar por año</label>
                <Select value={yearFilter} onValueChange={setYearFilter} disabled={filtrosLoading}>
                  <SelectTrigger>
                    {filtrosLoading ? (
                      <SelectValue placeholder="Cargando años..." />
                    ) : (
                      <SelectValue placeholder="Seleccionar año" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {aniosProductos.map((anio) => (
                      <SelectItem key={anio.valor} value={anio.valor}>
                        {anio.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filtrosLoading && (
                  <p className="text-xs text-muted-foreground mt-1">Cargando años...</p>
                )}
              </Card>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchTopProductos} className="flex-1" disabled={loading || filtrosLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Filtrar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading || filtrosLoading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Ganancia Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductos.map((producto) => (
                    <TableRow key={producto.ranking}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {producto.ranking}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{producto.producto}</TableCell>
                      <TableCell>{producto.anio}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(producto.ganancia_total)}
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
              <CardTitle>Top 5 Clientes con Más Facturas</CardTitle>
              <CardDescription>
                Clientes ordenados por cantidad de facturas y monto total facturado
                {branchFilter !== 'consolidada' && (
                  <span className="text-orange-600 font-medium">
                    {' '}(Sucursal {getBranchDisplayName(branchFilter)})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Inicio</label>
                  <Select value={startYearFilter} onValueChange={setStartYearFilter} disabled={filtrosLoading}>
                    <SelectTrigger>
                      {filtrosLoading ? (
                        <SelectValue placeholder="Cargando años..." />
                      ) : (
                        <SelectValue placeholder="Año inicio" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {aniosRango.map((anio) => (
                        <SelectItem key={anio.valor} value={anio.valor}>
                          {anio.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filtrosLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Cargando años...</p>
                  )}
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Fin</label>
                  <Select value={endYearFilter} onValueChange={setEndYearFilter} disabled={filtrosLoading}>
                    <SelectTrigger>
                      {filtrosLoading ? (
                        <SelectValue placeholder="Cargando años..." />
                      ) : (
                        <SelectValue placeholder="Año fin" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {aniosRango.map((anio) => (
                        <SelectItem key={anio.valor} value={anio.valor}>
                          {anio.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filtrosLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Cargando años...</p>
                  )}
                </Card>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchTopClientes} className="flex-1" disabled={loading || filtrosLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Filtrar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading || filtrosLoading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Cantidad de Facturas</TableHead>
                    <TableHead>Monto Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClientes.map((cliente) => (
                    <TableRow key={`${cliente.cliente}-${cliente.anio}`}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 rounded-full text-xs">
                          {cliente.ranking}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{cliente.cliente}</TableCell>
                      <TableCell>{cliente.anio}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {cliente.cantidad_facturas}
                        </span>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(cliente.monto_total)}
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
              <CardTitle>Top 5 Proveedores con Más Órdenes</CardTitle>
              <CardDescription>
                Proveedores ordenados por cantidad de órdenes de compra y monto total
                {branchFilter !== 'consolidada' && (
                  <span className="text-blue-600 font-medium">
                    {' '}(Sucursal {getBranchDisplayName(branchFilter)})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Inicio</label>
                  <Select value={startYearFilter} onValueChange={setStartYearFilter} disabled={filtrosLoading}>
                    <SelectTrigger>
                      {filtrosLoading ? (
                        <SelectValue placeholder="Cargando años..." />
                      ) : (
                        <SelectValue placeholder="Año inicio" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {aniosRango.map((anio) => (
                        <SelectItem key={anio.valor} value={anio.valor}>
                          {anio.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filtrosLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Cargando años...</p>
                  )}
                </Card>
                <Card className="p-4">
                  <label className="text-sm font-medium mb-2 block">Año Fin</label>
                  <Select value={endYearFilter} onValueChange={setEndYearFilter} disabled={filtrosLoading}>
                    <SelectTrigger>
                      {filtrosLoading ? (
                        <SelectValue placeholder="Cargando años..." />
                      ) : (
                        <SelectValue placeholder="Año fin" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {aniosRango.map((anio) => (
                        <SelectItem key={anio.valor} value={anio.valor}>
                          {anio.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filtrosLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Cargando años...</p>
                  )}
                </Card>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={fetchTopProveedores} className="flex-1" disabled={loading || filtrosLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Buscando..." : "Filtrar"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading || filtrosLoading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Cantidad de Órdenes</TableHead>
                    <TableHead>Monto Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProveedores.map((proveedor) => (
                    <TableRow key={`${proveedor.proveedor}-${proveedor.anio}`}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {proveedor.ranking}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{proveedor.proveedor}</TableCell>
                      <TableCell>{proveedor.anio}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {proveedor.cantidad_ordenes}
                        </span>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(proveedor.monto_total)}
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