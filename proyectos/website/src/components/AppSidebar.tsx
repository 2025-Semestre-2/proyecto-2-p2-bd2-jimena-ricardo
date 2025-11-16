import { Home, Users, Package, TrendingUp, FileText, BarChart3, Building2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menú para Administradores
const adminMenuItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Proveedores", url: "/proveedores", icon: Package },
  { title: "Inventarios", url: "/inventarios", icon: TrendingUp },
  { title: "Ventas", url: "/ventas", icon: FileText }
];

// Menú para Corporativos
const corporateMenuItems = [
  { title: "Estadísticas", url: "/estadisticas", icon: BarChart3 },
];

export function AppSidebar() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Determinar qué menú mostrar según el rol
  const getMenuItems = () => {
    if (!user) return adminMenuItems; // Por defecto
    
    if (user.rol === "corporativo") {
      return corporateMenuItems;
    } else {
      return adminMenuItems;
    }
  };

  const getBranchName = (branch: string) => {
    const branches: { [key: string]: string } = {
      'SJ': 'San José',
      'LM': 'Limón', 
      'CORP': 'Corporativo'
    };
    return branches[branch] || branch;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* Header del Sidebar con información de sucursal */}
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <Building2 className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold">Wide World</span>
            {user && (
              <span className="text-xs text-muted-foreground">
                {getBranchName(user.branch)}
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Información del usuario en el sidebar */}
        {user && (
          <div className="mt-auto p-4 border-t">
            <div className="flex flex-col space-y-1 text-xs">
              <p className="font-medium truncate">{user.fullname}</p>
              <p className="text-muted-foreground capitalize">
                {user.rol === 'admin' ? 'Administrador' : 'Corporativo'}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}