
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SellProvider, useSellContext } from '@/contexts/SellContext';
import { useSellCarSteps } from '@/hooks/useSellCarSteps';

// Components
import StepIndicator from '@/components/sell/StepIndicator';
import BasicInfoForm from '@/components/sell/BasicInfoForm';
import PhotosAndDetailsForm from '@/components/sell/PhotosAndDetailsForm';
import AuctionConditionsForm from '@/components/sell/AuctionConditionsForm';
import ReviewAndPaymentForm from '@/components/sell/ReviewAndPaymentForm';
import AuthDialog from '@/components/sell/AuthDialog';
import AuthRequiredScreen from '@/components/sell/AuthRequiredScreen';
import ProfileRequiredScreen from '@/components/sell/ProfileRequiredScreen';

const SellCarContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId') || searchParams.get('draft');
  
  const {
    step,
    setStep,
    isLoggedIn,
    isCheckingAuth,
    isAuthDialogOpen,
    setIsAuthDialogOpen,
    isProcessing,
    userProfile,
    carInfo,
    features,
    uploadedPhotos,
    additionalDetails,
    autofactReport,
    auctionInfo,
    handleInputChange,
    handleSelectChange,
    handleFeatureChange,
    handleAdditionalDetailsChange,
    handleImageUpload,
    handleAutofactReportChange,
    handleDeletePhoto,
    handleServiceChange,
    handleAuctionInfoChange,
    prevStep,
    loadDraftData
  } = useSellContext();

  const {
    saveStep1,
    saveStep2,
    saveStep3,
    finishProcess
  } = useSellCarSteps();

  // Load draft data if draftId is present
  useEffect(() => {
    if (draftId && isLoggedIn && !isCheckingAuth) {
      console.log('Loading draft with ID:', draftId);
      loadDraftData(draftId);
    }
  }, [draftId, isLoggedIn, isCheckingAuth, loadDraftData]);

  // Handle finish process with redirect
  const handleFinish = async () => {
    const success = await finishProcess();
    if (success) {
      // Wait a second before redirecting to show the message
      setTimeout(() => {
        // Redirect to the profile page to see draft auctions
        navigate(`/perfil`);
      }, 2000);
    }
  };

  // Redirigir a inicio de sesión si no está logueado
  if (!isCheckingAuth && !isLoggedIn) {
    return (
      <AuthRequiredScreen 
        isAuthDialogOpen={isAuthDialogOpen} 
        setIsAuthDialogOpen={setIsAuthDialogOpen} 
      />
    );
  }
  
  // Mostrar mensaje de completar perfil si está logueado pero no tiene perfil completo
  if (!isCheckingAuth && isLoggedIn && userProfile && 
      (!userProfile.first_name || !userProfile.last_name || !userProfile.phone)) {
    return <ProfileRequiredScreen userProfile={userProfile} />;
  }

  const stepLabels = [
    'Información básica',
    'Fotos y detalles',
    'Condiciones de subasta',
    'Revisión y pago'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Draft indicator */}
          {draftId && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                📝 Continuando con borrador guardado
              </p>
              <p className="text-blue-600 text-sm">
                Puedes continuar donde lo dejaste o modificar la información.
              </p>
            </div>
          )}

          {/* Steps indicator */}
          <StepIndicator currentStep={step} steps={stepLabels} />
          
          {/* Step Forms */}
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Información Básica del Vehículo'}
                {step === 2 && 'Fotos y Detalles'}
                {step === 3 && 'Condiciones de la Subasta'}
                {step === 4 && 'Revisión y Pago'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Completa los datos básicos de tu vehículo para empezar'}
                {step === 2 && 'Agrega fotos de calidad y especifica las características de tu vehículo'}
                {step === 3 && 'Define cómo quieres que sea la subasta de tu vehículo'}
                {step === 4 && 'Revisa la información y completa el pago para publicar tu anuncio'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step === 1 && (
                <BasicInfoForm 
                  carInfo={carInfo}
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onSubmit={saveStep1}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 2 && (
                <PhotosAndDetailsForm
                  uploadedPhotos={uploadedPhotos}
                  features={features}
                  additionalDetails={additionalDetails}
                  autofactReport={autofactReport}
                  onImageUpload={handleImageUpload}
                  onFeatureChange={handleFeatureChange}
                  onAdditionalDetailsChange={handleAdditionalDetailsChange}
                  onAutofactReportChange={handleAutofactReportChange}
                  onDeletePhoto={handleDeletePhoto}
                  onPrevStep={prevStep}
                  onSubmit={saveStep2}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 3 && (
                <AuctionConditionsForm
                  auctionInfo={auctionInfo}
                  onAuctionInfoChange={handleAuctionInfoChange}
                  onServiceChange={handleServiceChange}
                  onPrevStep={prevStep}
                  onSubmit={saveStep3}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 4 && (
                <ReviewAndPaymentForm
                  carInfo={carInfo}
                  auctionInfo={auctionInfo}
                  onPrevStep={prevStep}
                  onEditInfo={() => setStep(1)}
                  onSubmit={handleFinish}
                  isProcessing={isProcessing}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen}
        redirectUrl="/vender"
      />
    </div>
  );
};

const SellCar = () => (
  <SellProvider>
    <SellCarContent />
  </SellProvider>
);

export default SellCar;
