
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  compact?: boolean;
  detailed?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, compact = false, detailed = false }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      ended: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const urgentTime = timeLeft.days === 0 && timeLeft.hours < 1;

  if (compact) {
    return (
      <div className={`timer-container text-sm flex items-center ${urgentTime ? 'text-red-500' : ''}`}>
        <Clock className="mr-1 h-4 w-4" />
        {timeLeft.ended ? (
          <span>Finalizada</span>
        ) : (
          <span>
            {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
            {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')}:
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
        )}
      </div>
    );
  }

  // If detailed is true, show a more elaborate countdown
  if (detailed) {
    return (
      <div className={`timer-container text-xl ${urgentTime ? 'text-red-500' : ''}`}>
        <div className="flex items-center mb-1">
          <Clock className="mr-2 h-5 w-5" />
          <span className="font-medium">Tiempo restante</span>
        </div>
        {timeLeft.ended ? (
          <div className="text-2xl font-bold">Subasta finalizada</div>
        ) : (
          <div className="flex items-center space-x-2">
            {timeLeft.days > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{timeLeft.days}</span>
                <span className="text-xs uppercase">días</span>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-xs uppercase">horas</span>
            </div>
            
            <span className="text-2xl font-bold">:</span>
            
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-xs uppercase">min</span>
            </div>
            
            <span className="text-2xl font-bold">:</span>
            
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-xs uppercase">seg</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default countdown display
  return (
    <div className={`timer-container text-xl ${urgentTime ? 'text-red-500' : ''}`}>
      <Clock className="mr-2 h-5 w-5" />
      {timeLeft.ended ? (
        <span>Subasta finalizada</span>
      ) : (
        <div className="flex items-center space-x-2">
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-2xl">{timeLeft.days}</span>
              <span className="text-xs uppercase">días</span>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <span className="text-2xl">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-xs uppercase">horas</span>
          </div>
          
          <span className="text-2xl">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-2xl">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-xs uppercase">min</span>
          </div>
          
          <span className="text-2xl">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-2xl">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-xs uppercase">seg</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
