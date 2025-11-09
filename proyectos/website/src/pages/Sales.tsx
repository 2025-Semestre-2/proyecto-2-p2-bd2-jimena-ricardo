import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, Link as LinkIcon, Calendar, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

// Interfaces para tipado basadas en los procedimientos almacenados
interface Invoice {
  InvoiceID: number;
  InvoiceDate: string;
  CustomerName: string;
  DeliveryMethod: string;
  Total: number;
}

interface InvoiceHeader {
  InvoiceID: number;
  CustomerName: string;
  DeliveryMethod: string;
  OrderNumber: string;
  ContactPerson: string;
  SalesPerson: string;
  InvoiceDate: string;
  DeliveryInstructions: string;
}

interface InvoiceLine {
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  TaxRate: number;
  TaxAmount: number;
  Total: number;
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
  
  // Estados para paginación
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalInvoices, setTotalInvoices] = useState(0);
  
  // Estados para los filtros dinámicos
  const [metodosEntrega, setMetodosEntrega] = useState<any[]>([]);
  const [filtrosLoading, setFiltrosLoading] = useState(true);

  // Cargar facturas iniciales y filtros
  useEffect(() => {
    const state = location.state as { initialSearch?: string; autoSearch?: boolean };
    
    if (state?.initialSearch) {
      setClienteFilter(state.initialSearch);
      if (state.autoSearch) {
        setTimeout(() => {
          fetchInvoices(
            pageNumber, 
            pageSize,
            state.initialSearch
          );
        }, 100);
      }
    } else {
      fetchInvoices(pageNumber, pageSize);
    }
    
    fetchFiltros();
    fetchTotalInvoices();
  }, [location.state]);

  // Función para cargar los filtros dinámicos
  const fetchFiltros = async () => {
    try {
      setFiltrosLoading(true);
      
      // Cargar métodos de entrega desde la API
      const response = await fetch('http://localhost:3000/customer-delivery-methods');
      const metodosData = await response.json();
      
      // Transformar datos a formato Filtro
      const metodosFiltro = metodosData.map((met: any) => ({
        tipo_filtro: 'metodos_entrega',
        valor: met.DeliveryMethodName,
        etiqueta: met.DeliveryMethodName
      }));
      
      setMetodosEntrega(metodosFiltro);
      
    } catch (err) {
      console.error('Error cargando filtros:', err);
    } finally {
      setFiltrosLoading(false);
    }
  };

  // Función para obtener el total de facturas
  const fetchTotalInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3000/total-invoices');
      const total = await response.json();
      setTotalInvoices(total);
    } catch (err) {
      console.error('Error fetching total invoices:', err);
    }
  };

  const fetchInvoices = async (
    page: number = 1, 
    size: number = 50, 
    customer: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: size.toString(),
        customer: customer ? `%${customer}%` : '%'
      });
      
      const url = `http://localhost:3000/invoices-list?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setInvoices(data);
      setPageNumber(page);
      setPageSize(size);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (id: number) => {
    try {
      setError(null);
      
      // Obtener encabezado de la factura
      const headerResponse = await fetch(`http://localhost:3000/invoice-header?invoiceId=${id}`);
      if (!headerResponse.ok) throw new Error(`Error ${headerResponse.status}`);
      const encabezado = await headerResponse.json();
      
      // Obtener líneas de la factura
      const linesResponse = await fetch(`http://localhost:3000/invoice-lines?invoiceId=${id}`);
      if (!linesResponse.ok) throw new Error(`Error ${linesResponse.status}`);
      const detalles = await linesResponse.json();
      
      setSelectedInvoice({
        encabezado: encabezado[0], // La API devuelve un array, tomamos el primer elemento
        detalles: detalles
      });
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
    fetchInvoices(1, pageSize, clienteFilter);
  };

  const handleReset = () => {
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setClienteFilter("");
    setMetodoEntregaFilter("");
    setMontoMinFilter("");
    setMontoMaxFilter("");
    fetchInvoices(1, pageSize);
  };

  const handleViewDetails = (invoice: Invoice) => {
    fetchInvoiceDetails(invoice.InvoiceID);
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    fetchInvoices(newPage, pageSize, clienteFilter);
  };

  // Calcular total de la factura
  const calculateInvoiceTotal = (lines: InvoiceLine[]) => {
    return lines.reduce((total, line) => total + line.Total, 0);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20">
        <h1 className="text-3xl font-bold text-orange-700 dark:text-orange-400">Ventas</h1>
        <p className="text-muted-foreground mt-2">Consulta las facturas y ventas registradas</p>
        <p className="text-sm text-muted-foreground mt-1">Total de facturas: {totalInvoices}</p>
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

        {/* Cliente */}
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
                  <TableRow key={invoice.InvoiceID}>
                    <TableCell className="font-medium">{invoice.InvoiceID}</TableCell>
                    <TableCell>{new Date(invoice.InvoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.CustomerName}</TableCell>
                    <TableCell>{invoice.DeliveryMethod}</TableCell>
                    <TableCell>${invoice.Total?.toFixed(2) || "0.00"}</TableCell>
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
            
            {/* Paginación */}
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {pageNumber} - Mostrando {invoices.length} de {totalInvoices} facturas
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
                  disabled={invoices.length < pageSize || loading}
                >
                  Siguiente
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
            <DialogTitle>Detalles de la Factura #{selectedInvoice?.encabezado.InvoiceID}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Encabezado de la Factura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Factura</p>
                    <p className="font-medium">{selectedInvoice.encabezado.InvoiceID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre del Cliente</p>
                    <button 
                      onClick={() => navigateToCustomer(selectedInvoice.encabezado.CustomerName)}
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      {selectedInvoice.encabezado.CustomerName}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click para ver detalles del cliente
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Entrega</p>
                    <p className="font-medium">{selectedInvoice.encabezado.DeliveryMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Orden</p>
                    <p className="font-medium">{selectedInvoice.encabezado.OrderNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Persona de Contacto</p>
                    <p className="font-medium">{selectedInvoice.encabezado.ContactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre del Vendedor</p>
                    <p className="font-medium">{selectedInvoice.encabezado.SalesPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de la Factura</p>
                    <p className="font-medium">{new Date(selectedInvoice.encabezado.InvoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Instrucciones de Entrega</p>
                    <p className="font-medium">{selectedInvoice.encabezado.DeliveryInstructions || "N/A"}</p>
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
                      <TableHead>Total Línea</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.detalles.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <button 
                            onClick={() => navigateToInventory(line.ProductName)}
                            className="text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                          >
                            {line.ProductName}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </TableCell>
                        <TableCell>{line.Quantity}</TableCell>
                        <TableCell>${line.UnitPrice.toFixed(2)}</TableCell>
                        <TableCell>{line.TaxRate}%</TableCell>
                        <TableCell>${line.TaxAmount.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${line.Total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={5} className="text-right font-semibold text-lg">
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