import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn } from "lucide-react";

interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    fullname: string;
    rol: string;
    email: string;
    hiredate: string;
  };
  token?: string;
  message?: string;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Reemplazar con el endpoint real cuando esté disponible
      // const response = await fetch('http://localhost:3000/api/usuarios/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ username, password }),
      // });

      // Simulación de respuesta hasta que el endpoint esté disponible
      const mockResponse: LoginResponse = await new Promise((resolve) => {
        setTimeout(() => {
          // Simulación de credenciales válidas
          if (username === "admin" && password === "admin123") {
            resolve({
              success: true,
              user: {
                id: 1,
                username: "admin",
                fullname: "Jimena Mendez",
                rol: "Administrador",
                email: "admin@sucursal.com",
                hiredate: "2024-01-15"
              },
              token: "mock-jwt-token"
            });
          } else if (username === "corporativo" && password === "corp123") {
            resolve({
              success: true,
              user: {
                id: 2,
                username: "corporativo",
                fullname: "Usuario Corporativo",
                rol: "Corporativo",
                email: "corp@wideworld.com",
                hiredate: "2024-01-10"
              },
              token: "mock-jwt-token"
            });
          } else {
            resolve({
              success: false,
              message: "Credenciales inválidas"
            });
          }
        }, 1000);
      });

      if (mockResponse.success && mockResponse.user) {
        // Guardar información del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        localStorage.setItem('token', mockResponse.token || '');
        
        // Redirigir según el rol
        if (mockResponse.user.rol === "Corporativo") {
          navigate("/estadisticas");
        } else {
          navigate("/");
        }
      } else {
        setError(mockResponse.message || "Error en el inicio de sesión");
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si ya está autenticado
  const isAuthenticated = localStorage.getItem('user');
  if (isAuthenticated) {
    const user = JSON.parse(isAuthenticated);
    if (user.rol === "Corporativo") {
      navigate("/estadisticas");
    } else {
      navigate("/");
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <Card className="w-full max-w-md animate-fade-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Wide World Importers</CardTitle>
          <CardDescription>
            Inicie sesión en su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}