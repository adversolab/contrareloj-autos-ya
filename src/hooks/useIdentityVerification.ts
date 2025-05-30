import { useState, useEffect } from 'react';
import { uploadIdentityFile } from '@/services/storageService';
import { updateRutInfo, getVerificationStatus } from '@/services/vehicleService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/services/authService';

export interface VerificationStatus {
  isVerified: boolean;
  hasRut: boolean;
  hasDocuments: boolean;
  hasSelfie: boolean;
}

export const useIdentityVerification = () => {
  const [step, setStep] = useState(1);
  const [rut, setRut] = useState('');
  const [documentFrontFile, setDocumentFrontFile] = useState<File | null>(null);
  const [documentBackFile, setDocumentBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isVerified: false,
    hasRut: false,
    hasDocuments: false,
    hasSelfie: false
  });

  const formatRut = (value: string) => {
    // Eliminar todo lo que no sea número o K
    const cleaned = value.replace(/[^0-9kK]/g, '');
    
    // Si está vacío, devolver vacío
    if (!cleaned) return '';
    
    // Separar el dígito verificador
    const dv = cleaned.slice(-1);
    const numbers = cleaned.slice(0, -1);
    
    // Formatear con puntos
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formatted}-${dv}`;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(formatRut(e.target.value));
  };

  const handleDocumentFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFrontFile(e.target.files[0]);
    } else {
      setDocumentFrontFile(null);
    }
  };

  const handleDocumentBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentBackFile(e.target.files[0]);
    } else {
      setDocumentBackFile(null);
    }
  };

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieFile(e.target.files[0]);
    } else {
      setSelfieFile(null);
    }
  };

  const loadVerificationStatus = async () => {
    const status = await getVerificationStatus();
    setVerificationStatus({
      isVerified: status.isVerified,
      hasRut: status.hasRut,
      hasDocuments: status.hasDocuments,
      hasSelfie: status.hasSelfie
    });
    
    // Determine initial step
    if (!status.hasRut) {
      setStep(1);
    } else if (!status.hasDocuments) {
      setStep(2);
    } else if (!status.hasSelfie) {
      setStep(3);
    } else {
      setStep(4);
    }
  };

  // Add a function to go back to the previous step
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitRut = async () => {
    setIsLoading(true);
    
    try {
      const { success } = await updateRutInfo(rut);
      if (success) {
        setVerificationStatus(prev => ({ ...prev, hasRut: true }));
        setStep(2);
        toast.success("RUT guardado correctamente");
      }
    } catch (error) {
      console.error("Error al guardar RUT:", error);
      toast.error("Error al guardar el RUT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!documentFrontFile || !documentBackFile) {
      toast.error("Debes subir ambos lados del documento");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("Usuario no autenticado");
      }
      
      const userId = currentUser.id;
      
      // Generate unique filenames with file extensions
      const frontFileName = `${userId}_front_${Date.now()}.${documentFrontFile.name.split('.').pop()}`;
      const backFileName = `${userId}_back_${Date.now()}.${documentBackFile.name.split('.').pop()}`;
      
      console.log("Uploading front document:", frontFileName);
      
      // First, upload the front of the document
      const frontResponse = await uploadIdentityFile(documentFrontFile, frontFileName);
      
      if (!frontResponse.success) {
        console.error("Front document upload error:", frontResponse);
        throw new Error("Error al subir el frente del documento");
      }
      
      console.log("Uploading back document:", backFileName);
      
      // Then, upload the back of the document
      const backResponse = await uploadIdentityFile(documentBackFile, backFileName);
      
      if (!backResponse.success) {
        console.error("Back document upload error:", backResponse);
        throw new Error("Error al subir el reverso del documento");
      }
      
      // Combine the URLs into a single JSON field to store in the database
      const documentUrls = {
        front: frontResponse.url,
        back: backResponse.url
      };
      
      console.log("Updating profile with document URLs:", documentUrls);
      
      // Update profile with the document URLs as a single JSON field
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          identity_document_url: JSON.stringify(documentUrls),
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error("Error al guardar referencias de documentos");
      }
      
      // If all was successful, update the state and advance to the next step
      setVerificationStatus(prev => ({ ...prev, hasDocuments: true }));
      setStep(3);
      toast.success("Documentos subidos correctamente");
    } catch (error: any) {
      console.error("Error al subir documentos:", error);
      toast.error(error.message || "Error al subir los documentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSelfie = async () => {
    if (!selfieFile) {
      toast.error("Debes subir una selfie con tu documento");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("Usuario no autenticado");
      }
      
      const userId = currentUser.id;
      
      // Generate unique filename
      const selfieFileName = `${userId}_selfie_${Date.now()}.${selfieFile.name.split('.').pop()}`;
      
      console.log("Uploading selfie:", selfieFileName);
      
      // Upload the selfie
      const selfieResponse = await uploadIdentityFile(selfieFile, selfieFileName, true);
      
      if (!selfieResponse.success || !selfieResponse.url) {
        console.error("Selfie upload error:", selfieResponse);
        throw new Error("Error al subir la selfie");
      }
      
      // Update profile with the selfie URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          identity_selfie_url: selfieResponse.url
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error("Error al guardar referencia de selfie");
      }
      
      // If all was successful, update the state and advance to the next step
      setVerificationStatus(prev => ({ ...prev, hasSelfie: true }));
      setStep(4);
      toast.success("Selfie subida correctamente");
    } catch (error: any) {
      console.error("Error al subir selfie:", error);
      toast.error(error.message || "Error al subir la selfie");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    rut,
    documentFrontFile,
    documentBackFile,
    selfieFile,
    isLoading,
    verificationStatus,
    handleRutChange,
    handleDocumentFrontFileChange,
    handleDocumentBackFileChange,
    handleSelfieFileChange,
    handleSubmitRut,
    handleSubmitDocument,
    handleSubmitSelfie,
    loadVerificationStatus,
    goToPreviousStep // New function to go back to previous step
  };
};
