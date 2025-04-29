
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between">
        {steps.map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                currentStep === index + 1 ? 'bg-contrareloj text-white' :
                currentStep > index + 1 ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > index + 1 ? '✓' : index + 1}
            </div>
            <span className={`text-sm mt-2 ${currentStep === index + 1 ? 'font-medium' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-3">
        <div className="absolute h-1 w-full bg-gray-200 rounded"></div>
        <div 
          className={`absolute h-1 bg-contrareloj rounded`}
          style={{ width: `${(currentStep - 1) * (100 / (steps.length - 1))}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
