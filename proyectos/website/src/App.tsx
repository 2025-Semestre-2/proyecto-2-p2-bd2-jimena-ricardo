import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para verificar rol específico
const RoleProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: string 
}) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  
  if (user.rol !== allowedRole) {
    // Redirigir según el rol
    if (user.rol === "Corporativo") {
      return <Navigate to="/estadisticas" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas para Administradores */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="Administrador">
                <Layout />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="clientes" element={<Customers />} />
            <Route path="proveedores" element={<Suppliers />} />
            <Route path="inventarios" element={<Inventory />} />
            <Route path="ventas" element={<Sales />} />
          </Route>

          {/* Ruta para Corporativos (solo Estadísticas) */}
          <Route path="/estadisticas" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="Corporativo">
                <Layout />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }>
            <Route index element={<Statistics />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;