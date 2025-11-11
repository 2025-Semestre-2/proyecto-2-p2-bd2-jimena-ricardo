import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, Link as LinkIcon, Calendar, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

// Interfaces para tipado
interface Invoice {
  id: number;
  fecha: string;
  cliente: string;
  metodo_entrega: string;
  monto: number;
}

interface InvoiceHeader {
  numero_factura: string;
  nombre_cliente: string;
  metodo_entrega: string;
  numero_orden: string;
  persona_contacto: string;
  nombre_vendedor: string;
  fecha_factura: string;
  instrucciones_entrega: string;
}

interface InvoiceLine {
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  impuesto_aplicado: number;
  monto_impuesto: number;
  ganancia_linea: number;
  total_linea: number;
}

interface InvoiceDetails {
  encabezado: InvoiceHeader;
  detalles: InvoiceLine[];
}

export default function Sales() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  const [clienteFilter, setClienteFilter] = useState("");
  const [metodoEntregaFilter, setMetodoEntregaFilter] = useState("");
  const [montoMinFilter, setMontoMinFilter] = useState("");
  const [montoMaxFilter, setMontoMaxFilter] = useState("");
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(50);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargandoTotal, setCargandoTotal] = useState(false);
  
  // Estados para los filtros dinámicos - SOLO métodos de entrega
  const [metodosEntrega, setMetodosEntrega] = useState<any[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalRegistros / tamanoPagina);

  // Cargar facturas iniciales y filtros
  useEffect(() => {
    // Verificar si hay parámetros de navegación para cliente
    const state = location.state as { initialSearch?: string; autoSearch?: boolean };
    
    if (state?.initialSearch) {
      setClienteFilter(state.initialSearch);
      // Si autoSearch es true, realizar búsqueda automática
      if (state.autoSearch) {
        setTimeout(() => {
          const fechaInicioStr = fechaInicio ? format(fechaInicio, "yyyy-MM-dd") : undefined;
          const fechaFinStr = fechaFin ? format(fechaFin, "yyyy-MM-dd") : undefined;
          
          fetchInvoices(
            state.initialSearch, 
            fechaInicioStr, 
            fechaFinStr, 
            metodoEntregaFilter,
            montoMinFilter,
            montoMaxFilter
          );
        }, 100);
      }
    } else {
      fetchInvoices();
    }
    
    fetchFiltros();
  }, [location.state]);

  // Efecto para cargar el total cuando cambian los filtros
  useEffect(() => {
    if (!loading) {
      fetchTotalVentas();
    }
  }, [clienteFilter, fechaInicio, fechaFin, metodoEntregaFilter, montoMinFilter, montoMaxFilter]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      const response = await fetch('http://localhost:3000/api/filtros/ventas');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetodosEntrega(data.filter((filtro: any) => filtro.tipo_filtro === 'metodos_entrega'));
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  const fetchInvoices = async (
    cliente?: string, 
    fechaInicio?: string, 
    fechaFin?: string, 
    metodoEntrega?: string,
    montoMin?: string,
    montoMax?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('pagina', paginaActual.toString());
      params.append('tamanoPagina', tamanoPagina.toString());
      if (cliente) params.append('cliente', cliente);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (metodoEntrega && metodoEntrega !== 'all') params.append('metodoEntrega', metodoEntrega);
      if (montoMin) params.append('montoMin', montoMin);
      if (montoMax) params.append('montoMax', montoMax);
      
      const url = `http://localhost:3000/api/ventas?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalVentas = async () => {
    try {
      setCargandoTotal(true);
      const params = new URLSearchParams();
      if (clienteFilter) params.append('cliente', clienteFilter);
      if (fechaInicio) params.append('fechaInicio', format(fechaInicio, "yyyy-MM-dd"));
      if (fechaFin) params.append('fechaFin', format(fechaFin, "yyyy-MM-dd"));
      if (metodoEntregaFilter && metodoEntregaFilter !== 'all') params.append('metodoEntrega', metodoEntregaFilter);
      if (montoMinFilter) params.append('montoMin', montoMinFilter);
      if (montoMaxFilter) params.append('montoMax', montoMaxFilter);
      
      const url = `http://localhost:3000/api/ventas/total?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTotalRegistros(data.Total || 0);
    } catch (err) {
      console.error('Error fetching total invoices:', err);
      setTotalRegistros(0);
    } finally {
      setCargandoTotal(false);
    }
  };

  const fetchInvoiceDetails = async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3000/api/ventas/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedInvoice(data);
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles de la factura');
    }
  };

  // Función para navegar a la página de clientes
  const navigateToCustomer = (customerName: string) => {
    navigate('/clientes', { 
      state: { 
        initialSearch: customerName,
        autoSearch: true
      } 
    });
    setSelectedInvoice(null);
  };

  // Función para navegar a la página de inventarios
  const navigateToInventory = (productName: string) => {
    navigate('/inventarios', { 
      state: { 
        initialSearch: productName,
        autoSearch: true
      } 
    });
    setSelectedInvoice(null);
  };

  const handleSearch = () => {
    setPaginaActual(1); // Resetear a primera página al buscar
    const fechaInicioStr = fechaInicio ? format(fechaInicio, "yyyy-MM-dd") : undefined;
    const fechaFinStr = fechaFin ? format(fechaFin, "yyyy-MM-dd") : undefined;
    
    fetchInvoices(
      clienteFilter, 
      fechaInicioStr, 
      fechaFinStr, 
      metodoEntregaFilter,
      montoMinFilter,
      montoMaxFilter
    );
  };

  const handleReset = () => {
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setClienteFilter("");
    setMetodoEntregaFilter("");
    setMontoMinFilter("");
    setMontoMaxFilter("");
    setPaginaActual(1);
    fetchInvoices();
  };

  const handleViewDetails = (invoice: Invoice) => {
    fetchInvoiceDetails(invoice.id);
  };

  // Funciones de navegación de paginación
  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
    const fechaInicioStr = fechaInicio ? format(fechaInicio, "yyyy-MM-dd") : undefined;
    const fechaFinStr = fechaFin ? format(fechaFin, "yyyy-MM-dd") : undefined;
    
    fetchInvoices(
      clienteFilter, 
      fechaInicioStr, 
      fechaFinStr, 
      metodoEntregaFilter,
      montoMinFilter,
      montoMaxFilter
    );
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
      const fechaInicioStr = fechaInicio ? format(fechaInicio, "yyyy-MM-dd") : undefined;
      const fechaFinStr = fechaFin ? format(fechaFin, "yyyy-MM-dd") : undefined;
      
      fetchInvoices(
        clienteFilter, 
        fechaInicioStr, 
        fechaFinStr, 
        metodoEntregaFilter,
        montoMinFilter,
        montoMaxFilter
      );
    }
  }, [paginaActual, tamanoPagina]);

  // Calcular total de la factura
  const calculateInvoiceTotal = (lines: InvoiceLine[]) => {
    return lines.reduce((total, line) => total + line.total_linea, 0);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20">
        <h1 className="text-3xl font-bold text-orange-700 dark:text-orange-400">Ventas</h1>
        <p className="text-muted-foreground mt-2">Consulta las facturas y ventas registradas</p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ animationDelay: '100ms' }}>
        {/* Fecha Inicio */}
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fechaInicio && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {fechaInicio ? format(fechaInicio, "PPP") : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={fechaInicio}
                onSelect={setFechaInicio}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </Card>

        {/* Fecha Fin */}
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fechaFin && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {fechaFin ? format(fechaFin, "PPP") : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={fechaFin}
                onSelect={setFechaFin}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </Card>

        {/* Cliente - AHORA ES INPUT */}
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Cliente</label>
          <Input
            placeholder="Buscar por cliente..."
            value={clienteFilter}
            onChange={(e) => setClienteFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Card>

        {/* Método de Entrega */}
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Método de Entrega</label>
          <Select value={metodoEntregaFilter} onValueChange={setMetodoEntregaFilter} disabled={filtrosLoading}>
            <SelectTrigger>
              {filtrosLoading ? (
                <SelectValue placeholder="Cargando métodos..." />
              ) : (
                <SelectValue placeholder="Todos los métodos" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              {metodosEntrega.map((method: any) => (
                <SelectItem key={method.valor} value={method.valor}>
                  {method.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtrosLoading && (
            <p className="text-xs text-muted-foreground mt-1">Cargando métodos...</p>
          )}
        </Card>

        {/* Monto Mínimo */}
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Monto Mínimo</label>
          <Input
            type="number"
            placeholder="Monto mínimo..."
            value={montoMinFilter}
            onChange={(e) => setMontoMinFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Card>

        {/* Monto Máximo */}
        <Card className="p-6 hover-lift">
          <label className="text-sm font-medium mb-2 block">Monto Máximo</label>
          <Input
            type="number"
            placeholder="Monto máximo..."
            value={montoMaxFilter}
            onChange={(e) => setMontoMaxFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
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
            `Total: ${totalRegistros} factura${totalRegistros !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <Card className="overflow-hidden shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <p>Cargando facturas...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p>No se encontraron facturas</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método de Entrega</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{new Date(invoice.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.cliente}</TableCell>
                    <TableCell>{invoice.metodo_entrega}</TableCell>
                    <TableCell>${invoice.monto?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(invoice)}
                        disabled={loading}
                      >
                        Ver Detalles
                      </Button>
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

      {/* Modal de Detalles */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Factura #{selectedInvoice?.encabezado.numero_factura}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Encabezado de la Factura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Factura</p>
                    <p className="font-medium">{selectedInvoice.encabezado.numero_factura}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre del Cliente</p>
                    <button 
                      onClick={() => navigateToCustomer(selectedInvoice.encabezado.nombre_cliente)}
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      {selectedInvoice.encabezado.nombre_cliente}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click para ver detalles del cliente
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Entrega</p>
                    <p className="font-medium">{selectedInvoice.encabezado.metodo_entrega}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Orden</p>
                    <p className="font-medium">{selectedInvoice.encabezado.numero_orden || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Persona de Contacto</p>
                    <p className="font-medium">{selectedInvoice.encabezado.persona_contacto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre del Vendedor</p>
                    <p className="font-medium">{selectedInvoice.encabezado.nombre_vendedor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de la Factura</p>
                    <p className="font-medium">{new Date(selectedInvoice.encabezado.fecha_factura).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Instrucciones de Entrega</p>
                    <p className="font-medium">{selectedInvoice.encabezado.instrucciones_entrega || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Detalle de la Factura</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.detalles.length} producto(s) en esta factura
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Impuesto</TableHead>
                      <TableHead>Monto Imp.</TableHead>
                      <TableHead>Ganancia</TableHead>
                      <TableHead>Total Línea</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.detalles.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <button 
                            onClick={() => navigateToInventory(line.nombre_producto)}
                            className="text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                          >
                            {line.nombre_producto}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </TableCell>
                        <TableCell>{line.cantidad}</TableCell>
                        <TableCell>${line.precio_unitario.toFixed(2)}</TableCell>
                        <TableCell>{line.impuesto_aplicado}%</TableCell>
                        <TableCell>${line.monto_impuesto.toFixed(2)}</TableCell>
                        <TableCell>${line.ganancia_linea.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${line.total_linea.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={6} className="text-right font-semibold text-lg">
                        Total de la Factura:
                      </TableCell>
                      <TableCell className="font-bold text-lg text-primary">
                        ${calculateInvoiceTotal(selectedInvoice.detalles).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}