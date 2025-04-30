
import React from 'react';
import { Input } from '@/components/ui/input';

interface ProfileFormProps {
  isEditing: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  biddingCount: number;
  sellingCount: number;
  draftsCount: number;
  favoritesCount: number;
  wonCount: number;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPhone: (value: string) => void;
  setCity: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
}

const ProfileForm = ({
  isEditing,
  firstName,
  lastName,
  phone,
  city,
  email,
  newPassword,
  confirmPassword,
  biddingCount,
  sellingCount,
  draftsCount,
  favoritesCount,
  wonCount,
  setFirstName,
  setLastName,
  setPhone,
  setCity,
  setNewPassword,
  setConfirmPassword
}: ProfileFormProps) => {
  if (isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <Input 
            type="text" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Apellido</label>
          <Input 
            type="text" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input 
            type="email" 
            value={email || ''}
            disabled
            className="w-full bg-gray-100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Teléfono</label>
          <Input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
            placeholder="+56 9 1234 5678"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Ciudad</label>
          <Input 
            type="text" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full"
            placeholder="Santiago"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Cambiar contraseña</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              type="password" 
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
            />
            <Input 
              type="password" 
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-1">Email</h2>
        <p>{email || 'No disponible'}</p>
      </div>
      
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-1">Teléfono</h2>
        <p>{phone || 'No especificado'}</p>
      </div>
      
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-1">Ciudad</h2>
        <p>{city || 'No especificada'}</p>
      </div>
      
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-1">Estadísticas</h2>
        <p>
          {biddingCount} ofertas • 
          {sellingCount} ventas • 
          {draftsCount} borradores • 
          {favoritesCount} favoritos •
          {wonCount} ganados
        </p>
      </div>
    </div>
  );
};

export default ProfileForm;
