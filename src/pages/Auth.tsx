
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { signIn, signUp, getCurrentUser } from '@/services/authService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Auth = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        // Si el usuario ya está autenticado, redirigir a la página anterior o a la principal
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/');
        }
      }
      setIsChecking(false);
    };

    // Obtener URL de redirección de los parámetros de consulta
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }

    checkAuth();
  }, [navigate, redirectUrl]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { email, password } = loginForm;
      
      if (!email || !password) {
        toast.error("Por favor completa todos los campos");
        return;
      }
      
      const { user, error } = await signIn(email, password);
      
      if (user) {
        toast.success("Inicio de sesión exitoso");
        // Redirigir al usuario a la página anterior o a la principal
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/');
        }
      } else if (error) {
        toast.error(error.message || "Error al iniciar sesión");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { email, password, confirmPassword } = signupForm;
      
      if (!email || !password || !confirmPassword) {
        toast.error("Por favor completa todos los campos");
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
      
      const { user, error } = await signUp(email, password);
      
      if (user) {
        toast.success("Registro exitoso. Verifica tu correo electrónico para confirmar tu cuenta.");
        // En un entorno de producción, normalmente redirigirías a una página de confirmación
        // Por ahora, solo limpiamos el formulario
        setSignupForm({ email: '', password: '', confirmPassword: '' });
        // Cambiar a la pestaña de inicio de sesión
        document.querySelector('[data-state="inactive"][data-value="login"]')?.click();
      } else if (error) {
        toast.error(error.message || "Error al registrarse");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Cargando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-contrareloj">CONTRA</span>
            <span className="text-contrareloj-black">RELOJ</span>
          </h1>
          <p className="text-gray-600">Subastas de autos en línea</p>
        </div>
        
        <Card className="max-w-md mx-auto">
          <Tabs defaultValue="login">
            <CardHeader>
              <div className="flex justify-center">
                <TabsList className="w-full">
                  <TabsTrigger value="login" className="flex-1">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1">Crear Cuenta</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent>
                  <CardDescription className="mb-4">
                    Ingresa tus credenciales para acceder a tu cuenta
                  </CardDescription>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Contraseña</label>
                        <a href="#" className="text-xs text-contrareloj hover:underline">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>
                      <Input
                        name="password"
                        type="password"
                        placeholder="********"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-contrareloj hover:bg-contrareloj-dark text-white"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent>
                  <CardDescription className="mb-4">
                    Crea una cuenta para empezar a vender o comprar autos
                  </CardDescription>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contraseña</label>
                      <Input
                        name="password"
                        type="password"
                        placeholder="********"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirmar Contraseña</label>
                      <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="********"
                        value={signupForm.confirmPassword}
                        onChange={handleSignupChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-contrareloj hover:bg-contrareloj-dark text-white"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
