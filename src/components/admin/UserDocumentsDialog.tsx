
import React from 'react';
import { UserDocuments } from '@/services/adminService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface UserDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: UserDocuments | null;
  loading: boolean;
  userId: string | null;
  onVerifyUser: (userId: string) => Promise<void>;
  isVerified: boolean;
}

const UserDocumentsDialog: React.FC<UserDocumentsDialogProps> = ({
  open,
  onOpenChange,
  documents,
  loading,
  userId,
  onVerifyUser,
  isVerified
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Documentos de identidad del usuario</DialogTitle>
          <DialogDescription>
            Revisa los documentos de verificación del usuario antes de aprobarlo.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center">
            Cargando documentos...
          </div>
        ) : !documents ? (
          <div className="py-10 text-center">
            No se encontraron documentos para este usuario.
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div>
              <h3 className="font-medium mb-2">RUT</h3>
              <p className="p-2 bg-gray-50 rounded">{documents.rut || 'No proporcionado'}</p>
            </div>
            
            {/* Front of document */}
            {documents.front_url && (
              <div>
                <h3 className="font-medium mb-2">Documento de identidad (frontal)</h3>
                <div className="overflow-hidden rounded-md border">
                  <img 
                    src={documents.front_url} 
                    alt="Frente del documento de identidad" 
                    className="w-full object-contain max-h-60"
                  />
                  <div className="p-3 border-t">
                    <a 
                      href={documents.front_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver imagen en tamaño completo
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Back of document */}
            {documents.back_url && (
              <div>
                <h3 className="font-medium mb-2">Documento de identidad (reverso)</h3>
                <div className="overflow-hidden rounded-md border">
                  <img 
                    src={documents.back_url} 
                    alt="Reverso del documento de identidad" 
                    className="w-full object-contain max-h-60"
                  />
                  <div className="p-3 border-t">
                    <a 
                      href={documents.back_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver imagen en tamaño completo
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback for legacy format */}
            {!documents.front_url && !documents.back_url && documents.identity_document_url && (
              <div>
                <h3 className="font-medium mb-2">Documento de identidad</h3>
                <div className="overflow-hidden rounded-md border">
                  <img 
                    src={documents.identity_document_url} 
                    alt="Documento de identidad" 
                    className="w-full object-contain max-h-60"
                  />
                  <div className="p-3 border-t">
                    <a 
                      href={documents.identity_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver imagen en tamaño completo
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Selfie */}
            {documents.identity_selfie_url && (
              <div>
                <h3 className="font-medium mb-2">Selfie con documento</h3>
                <div className="overflow-hidden rounded-md border">
                  <img 
                    src={documents.identity_selfie_url} 
                    alt="Selfie con documento" 
                    className="w-full object-contain max-h-60"
                  />
                  <div className="p-3 border-t">
                    <a 
                      href={documents.identity_selfie_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver imagen en tamaño completo
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between flex-wrap space-y-2 sm:space-y-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {userId && !loading && !isVerified && (
            <Button 
              onClick={() => userId && onVerifyUser(userId)} 
              className="bg-contrareloj hover:bg-contrareloj-dark"
            >
              Verificar usuario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDocumentsDialog;
