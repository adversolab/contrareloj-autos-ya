
import { useState, useEffect } from 'react';
import { uploadIdentityDocument, updateRutInfo, getVerificationStatus } from '@/services/vehicleService';
import { toast } from 'sonner';

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
    }
  };

  const handleDocumentBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentBackFile(e.target.files[0]);
    }
  };

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieFile(e.target.files[0]);
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
    
    // Determinar el paso inicial
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

  const handleSubmitRut = async () => {
    setIsLoading(true);
    
    try {
      const { success } = await updateRutInfo(rut);
      if (success) {
        setVerificationStatus(prev => ({ ...prev, hasRut: true }));
        setStep(2);
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
      // Subir frente del documento - usando solo los parámetros esperados
      const frontResponse = await uploadIdentityDocument(documentFrontFile, false);
      
      // Subir reverso del documento - usando solo los parámetros esperados
      const backResponse = await uploadIdentityDocument(documentBackFile, false);
      
      if (frontResponse.url && backResponse.url) {
        setVerificationStatus(prev => ({ ...prev, hasDocuments: true }));
        setStep(3);
      }
    } catch (error) {
      console.error("Error al subir documentos:", error);
      toast.error("Error al subir los documentos");
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
      // Usar solo los parámetros esperados
      const { url } = await uploadIdentityDocument(selfieFile, true);
      
      if (url) {
        setVerificationStatus(prev => ({ ...prev, hasSelfie: true }));
        setStep(4);
      }
    } catch (error) {
      console.error("Error al subir selfie:", error);
      toast.error("Error al subir la selfie");
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
    loadVerificationStatus
  };
};
