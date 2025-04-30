
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Car, ShoppingCart, Shield, CreditCard, 
  MessageSquare, HelpCircle, ChevronRight, Search
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const HelpCenter = () => {
  return (
    <>
      <Navbar />
      <main className="pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-contrareloj to-contrareloj-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">Centro de Ayuda</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Encuentra respuestas a tus preguntas sobre cómo comprar y vender vehículos en Contrareloj
            </p>
            <div className="relative max-w-lg mx-auto">
              <Input 
                type="text" 
                placeholder="Buscar respuestas..."
                className="pl-12 py-6 rounded-full text-gray-900 border-white shadow-lg" 
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 mt-12">
          <Tabs defaultValue="funcionamiento" className="w-full">
            <TabsList className="w-full justify-start mb-8 overflow-x-auto flex-nowrap pb-1">
              <TabsTrigger value="funcionamiento" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" /> Funcionamiento
              </TabsTrigger>
              <TabsTrigger value="comprar" className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" /> Comprar
              </TabsTrigger>
              <TabsTrigger value="vender" className="flex items-center">
                <Car className="mr-2 h-4 w-4" /> Vender
              </TabsTrigger>
              <TabsTrigger value="verificacion" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" /> Verificación
              </TabsTrigger>
              <TabsTrigger value="comision" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" /> Comisión
              </TabsTrigger>
              <TabsTrigger value="seguridad" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" /> Seguridad
              </TabsTrigger>
              <TabsTrigger value="contacto" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" /> Contacto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="funcionamiento" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">¿Cómo funciona Contrareloj?</h2>
                    <p className="mb-4 text-lg">
                      Contrareloj es una plataforma de subastas de autos donde cualquier persona puede vender o comprar vehículos en tiempo real, con total transparencia.
                    </p>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Cada auto se publica con un precio inicial y un reloj regresivo.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Si alguien oferta en los últimos 2 minutos, el reloj se extiende automáticamente 2 minutos más.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>El mejor postor al finalizar el tiempo se adjudica el auto.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Contrareloj cobra una comisión del 5% al comprador sobre el precio final.</span>
                      </li>
                    </ul>
                    <div className="mt-6 p-4 bg-contrareloj-light rounded-lg">
                      <p className="text-gray-800 italic">
                        <span className="font-semibold">🕐 ¡Es como MercadoLibre, pero en tiempo real</span> y con una experiencia emocionante y transparente!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comprar" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <ShoppingCart className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">¿Cómo comprar un auto?</h2>
                    <p className="mb-4 text-lg">
                      Comprar en Contrareloj es simple:
                    </p>
                    <ol className="space-y-4 text-gray-700 list-decimal pl-5">
                      <li className="pl-2">
                        Regístrate y verifica tu cuenta (RUT y selfie).
                      </li>
                      <li className="pl-2">
                        Explora las subastas activas desde la página principal.
                      </li>
                      <li className="pl-2">
                        Para ofertar, ingresa un monto mayor al actual.
                      </li>
                      <li className="pl-2">
                        Al ofertar, se simula una retención del 5% como garantía.
                      </li>
                      <li className="pl-2">
                        Si ganas, el sistema te conectará con el vendedor para cerrar la compra y firmar el contrato digital.
                      </li>
                    </ol>
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-amber-800 flex items-center">
                        <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span><strong>⚠️ Importante:</strong> Solo puedes ofertar si tu cuenta está verificada.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vender" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <Car className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">¿Cómo vender un auto?</h2>
                    <p className="mb-4 text-lg">
                      Para publicar tu vehículo:
                    </p>
                    <ol className="space-y-4 text-gray-700 list-decimal pl-5">
                      <li className="pl-2">
                        Inicia sesión y haz clic en "Publicar auto".
                      </li>
                      <li className="pl-2">
                        Completa los datos: marca, modelo, año, kilómetros, estado, etc.
                      </li>
                      <li className="pl-2">
                        Sube fotos claras (interior, exterior, motor).
                      </li>
                      <li className="pl-2">
                        Opcionalmente, puedes solicitar un fotógrafo profesional.
                      </li>
                      <li className="pl-2">
                        Define un precio inicial y, si quieres, un precio de reserva mínimo (oculto).
                      </li>
                      <li className="pl-2">
                        Tu publicación será revisada por el equipo de Contrareloj antes de salir al aire.
                      </li>
                    </ol>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        <strong>📸 Consejo:</strong> Mientras mejores fotos y descripción, mayor interés tendrás.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verificacion" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Verificación de identidad</h2>
                    <p className="mb-4 text-lg">
                      Para ofrecer o vender necesitas verificar tu cuenta:
                    </p>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Sube tu RUT o cédula de identidad vigente.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Sube una selfie clara mostrando tu cara completa.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>También puedes subir una foto sosteniendo el carnet.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>El equipo de Contrareloj revisará tus documentos en menos de 24 horas.</span>
                      </li>
                    </ul>
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800">
                        <strong>🔒 Seguridad:</strong> Esto nos permite prevenir fraudes y asegurar que todas las partes sean reales.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comision" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <CreditCard className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Comisión y pagos</h2>
                    <p className="mb-4 text-lg">
                      Contrareloj no cobra por publicar. Solo cuando se cierra una venta, se aplica una comisión:
                    </p>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>5% del precio final (pagado por el comprador).</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Esta comisión está incluida dentro del precio ofertado, no es un cobro adicional.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Por ahora, esta retención es solo simulada (en el futuro se cobrará directamente).</span>
                      </li>
                    </ul>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700">
                        <strong>Ejemplo:</strong> Si ganas una subasta por $10.000.000, pagas $10.000.000. De ese monto, $500.000 van a Contrareloj como comisión, y el resto al vendedor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seguridad" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Seguridad y confianza</h2>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Todos los usuarios pasan por verificación de identidad.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>No puedes ofertar sin una cuenta confirmada.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Las publicaciones son revisadas antes de ser aprobadas.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>La plataforma registra cada acción para evitar malas prácticas.</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-6 w-6 text-contrareloj flex-shrink-0 mr-2" />
                        <span>Si alguien no cumple, puede ser reportado y bloqueado.</span>
                      </li>
                    </ul>
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-purple-800">
                        <strong>🧠 Próximamente:</strong> En el futuro activaremos validación automática de antecedentes vehiculares.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacto" className="mt-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-start">
                  <div className="bg-contrareloj-light p-3 rounded-full mr-4">
                    <MessageSquare className="h-6 w-6 text-contrareloj" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Contacto</h2>
                    <p className="mb-4 text-lg">
                      ¿Tienes alguna duda que no está aquí?
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 mr-3 text-contrareloj" />
                        <span>Escríbenos a <a href="mailto:soporte@contrareloj.cl" className="text-contrareloj font-medium">soporte@contrareloj.cl</a></span>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 mr-3 text-contrareloj" />
                        <span>O por WhatsApp al <a href="tel:+56912345678" className="text-contrareloj font-medium">+56 9 1234 5678</a></span>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 mr-3 text-contrareloj" />
                        <span>Horario de atención: Lunes a viernes de 10:00 a 18:00 hrs.</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        <strong>💬 Consejo:</strong> También puedes usar el botón de chat en la esquina inferior derecha.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* FAQ Section */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Preguntas frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">¿Qué pasa si gano una subasta?</h3>
                <p className="text-gray-600">Te contactaremos para coordinar la entrega del vehículo y el pago. Tendrás que firmar un contrato digital de compraventa.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">¿Puedo inspeccionar el auto antes?</h3>
                <p className="text-gray-600">Sí, cada anuncio indica si el vehículo puede ser inspeccionado previamente y su ubicación.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">¿Contrareloj revisa los vehículos?</h3>
                <p className="text-gray-600">No realizamos inspección técnica. Recomendamos solicitar todos los antecedentes necesarios al vendedor.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HelpCenter;
