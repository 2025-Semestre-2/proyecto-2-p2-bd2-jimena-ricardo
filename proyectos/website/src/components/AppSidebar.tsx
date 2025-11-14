import { Home, Users, Package, TrendingUp, FileText, BarChart3 } from "lucide-react";
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
  SidebarHeader,
} from "@/components/ui/sidebar";

// Menú para Administradores
const adminMenuItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Proveedores", url: "/proveedores", icon: Package },
  { title: "Inventarios", url: "/inventarios", icon: TrendingUp },
  { title: "Ventas", url: "/ventas", icon: FileText },
];

// Menú para Corporativos
const corporateMenuItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Estadísticas", url: "/estadisticas", icon: BarChart3 },
];

export function AppSidebar() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Determinar qué menú mostrar según el rol
  const getMenuItems = () => {
    if (!user) return adminMenuItems; // Por defecto
    
    if (user.rol === "Corporativo") {
      return corporateMenuItems;
    } else {
      return adminMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-sidebar-accent-foreground"
                          : "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
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
      </SidebarContent>
    </Sidebar>
  );
}