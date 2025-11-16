import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, TrendingUp, FileText, BarChart3, Sparkles, MapPin, Database, Layers, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const adminModules = [
  {
    title: "Clientes",
    description: "Consulta y gestiona los clientes registrados en el sistema",
    icon: Users,
    link: "/clientes",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    title: "Proveedores",
    description: "Administra la información de proveedores y sus categorías",
    icon: Package,
    link: "/proveedores",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    title: "Inventarios",
    description: "Controla los productos y existencias en el inventario",
    icon: TrendingUp,
    link: "/inventarios",
    gradient: "from-green-500 to-green-600"
  },
  {
    title: "Ventas",
    description: "Revisa las facturas y transacciones de ventas realizadas",
    icon: FileText,
    link: "/ventas",
    gradient: "from-orange-500 to-orange-600"
  }
];

const corporateModules = [
  {
    title: "Estadísticas",
    description: "Análisis y reportes estadísticos consolidados de todas las sucursales",
    icon: BarChart3,
    link: "/estadisticas",
    gradient: "from-cyan-500 to-cyan-600"
  },
];

export default function Home() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    // Si es corporativo, redirigir a estadísticas automáticamente
    if (user?.rol === "corporativo") {
      navigate("/estadisticas");
    }
  }, [user, navigate]);

  // Si es corporativo, no mostrar el home
  if (user?.rol === "corporativo") {
    return null;
  }

  const getBranchName = (branch: string) => {
    const branches: { [key: string]: string } = {
      'SJ': 'San José',
      'LM': 'Limón', 
      'CORP': 'Corporativo'
    };
    return branches[branch] || branch;
  };

  const getRoleDisplayName = (rol: string) => {
    const roles: { [key: string]: string } = {
      'admin': 'Administrador',
      'corporativo': 'Corporativo'
    };
    return roles[rol] || rol;
  };

  const modules = user?.rol === "corporativo" ? corporateModules : adminModules;

  return (
    <div className="space-y-10">
      {/* Hero Section con información de sucursal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-8 md:p-12 text-primary-foreground shadow-2xl animate-fade-up">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Wide World Importers</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
              <MapPin className="h-4 w-4" />
              <span>Sucursal {getBranchName(user?.branch)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
              <span>{getRoleDisplayName(user?.rol)}</span>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl">
            Sistema de Gestión Empresarial Distribuido
          </p>
          <p className="mt-4 text-primary-foreground/80 max-w-3xl">
            Gestiona clientes, proveedores, inventarios y ventas con análisis estadísticos en tiempo real.
            Base de datos distribuida con replicación y fragmentación optimizada.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link 
                key={module.title} 
                to={module.link}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full hover-lift cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${module.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {module.description}
                    </CardDescription>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Cards con información técnica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '600ms' }}>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Database className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-blue-600 dark:text-blue-400 ml-2">Base de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">SQL Server</p>
            <p className="text-sm text-muted-foreground mt-2">
              {user?.branch === 'SJ' ? 'WWISJ' : user?.branch === 'LM' ? 'WWILM' : 'WWICorp'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Layers className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-purple-600 dark:text-purple-400 ml-2">Arquitectura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">Distribuida</p>
            <p className="text-sm text-muted-foreground mt-2">Fragmentación + Replicación</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Zap className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-600 dark:text-green-400 ml-2">Optimización</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">Stored Procs</p>
            <p className="text-sm text-muted-foreground mt-2">Máximo rendimiento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}