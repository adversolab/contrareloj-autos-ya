
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signIn, signUp, getCurrentUser } from '@/services/authService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Auth = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar sesión
        if (!email || !password) {
          toast.error("Por favor completa todos los campos");
          setLoading(false);
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
      } else {
        // Registrarse
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
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else if (error) {
          toast.error(error.message || "Error al registrarse");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error en la autenticación");
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
          <CardHeader>
            <div className="flex justify-center">
              <div className="w-full border-b border-gray-200 mb-4">
                <div className="flex">
                  <button
                    className={`flex-1 py-3 px-4 text-center ${isLogin ? 'border-b-2 border-contrareloj font-medium text-contrareloj' : 'text-gray-500'}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 text-center ${!isLogin ? 'border-b-2 border-contrareloj font-medium text-contrareloj' : 'text-gray-500'}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Crear Cuenta
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-gray-600 mb-4">
                  {isLogin 
                    ? "Ingresa tus credenciales para acceder a tu cuenta" 
                    : "Crea una cuenta para empezar a vender o comprar autos"}
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Contraseña</label>
                    {isLogin && (
                      <a href="#" className="text-xs text-contrareloj hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirmar Contraseña</label>
                    <Input
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-contrareloj hover:bg-contrareloj-dark text-white"
                disabled={loading}
              >
                {loading 
                  ? (isLogin ? "Iniciando sesión..." : "Creando cuenta...") 
                  : (isLogin ? "Iniciar sesión" : "Crear cuenta")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
