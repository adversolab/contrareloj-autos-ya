
import React from 'react';

interface StepsIndicatorProps {
  currentStep: number;
}

const StepsIndicator: React.FC<StepsIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between mb-8">
      <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-contrareloj' : 'text-gray-400'}`}>
        <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-contrareloj' : 'border-gray-300'}`}>
          1
        </div>
        <span className="text-xs mt-1">RUT</span>
      </div>
      <div className={`flex-1 border-t-2 self-center ${currentStep >= 2 ? 'border-contrareloj' : 'border-gray-300'}`}></div>
      <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-contrareloj' : 'text-gray-400'}`}>
        <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-contrareloj' : 'border-gray-300'}`}>
          2
        </div>
        <span className="text-xs mt-1">Documento</span>
      </div>
      <div className={`flex-1 border-t-2 self-center ${currentStep >= 3 ? 'border-contrareloj' : 'border-gray-300'}`}></div>
      <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-contrareloj' : 'text-gray-400'}`}>
        <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-contrareloj' : 'border-gray-300'}`}>
          3
        </div>
        <span className="text-xs mt-1">Selfie</span>
      </div>
    </div>
  );
};

export default StepsIndicator;
