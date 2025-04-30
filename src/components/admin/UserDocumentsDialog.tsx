
import React, { useState } from 'react';
import { UserDocuments } from '@/services/admin/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>User ID documents</DialogTitle>
            <DialogDescription>
              Review user verification documents before approval.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-10 text-center">
              Loading documents...
            </div>
          ) : !documents ? (
            <div className="py-10 text-center">
              No documents found for this user.
            </div>
          ) : (
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="font-medium mb-2">RUT</h3>
                <p className="p-2 bg-gray-50 rounded">{documents.rut || 'Not provided'}</p>
              </div>
              
              {/* Front of document */}
              {documents.front_url && (
                <div>
                  <h3 className="font-medium mb-2">ID Document (front)</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={documents.front_url} 
                      alt="Front of ID document" 
                      className="w-full object-contain cursor-pointer"
                      onClick={() => setEnlargedImage(documents.front_url)}
                    />
                  </div>
                </div>
              )}

              {/* Back of document */}
              {documents.back_url && (
                <div>
                  <h3 className="font-medium mb-2">ID Document (back)</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={documents.back_url} 
                      alt="Back of ID document" 
                      className="w-full object-contain cursor-pointer"
                      onClick={() => setEnlargedImage(documents.back_url)}
                    />
                  </div>
                </div>
              )}

              {/* Fallback for legacy format */}
              {!documents.front_url && !documents.back_url && documents.identity_document_url && (
                <div>
                  <h3 className="font-medium mb-2">ID Document</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={documents.identity_document_url} 
                      alt="ID document" 
                      className="w-full object-contain cursor-pointer"
                      onClick={() => setEnlargedImage(documents.identity_document_url)}
                    />
                  </div>
                </div>
              )}

              {/* Selfie */}
              {documents.identity_selfie_url && (
                <div>
                  <h3 className="font-medium mb-2">Selfie with document</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={documents.identity_selfie_url} 
                      alt="Selfie with document" 
                      className="w-full object-contain cursor-pointer"
                      onClick={() => setEnlargedImage(documents.identity_selfie_url)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-between flex-wrap space-y-2 sm:space-y-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {userId && !loading && !isVerified && (
              <Button 
                onClick={() => userId && onVerifyUser(userId)} 
                className="bg-green-600 hover:bg-green-700"
              >
                Verify user
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90" onClick={() => setEnlargedImage(null)}>
          <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center p-4">
            <Button 
              variant="outline" 
              className="absolute top-4 right-4 rounded-full p-2 bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={enlargedImage} 
              alt="Enlarged document" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserDocumentsDialog;
