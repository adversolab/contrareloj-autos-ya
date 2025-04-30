
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  createdAt: string | number;
  isEditing: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  getInitials: () => string;
}

const ProfileHeader = ({
  firstName,
  lastName,
  createdAt,
  isEditing,
  onEditClick,
  onSaveClick,
  getInitials
}: ProfileHeaderProps) => {
  const handleButtonClick = () => {
    if (isEditing) {
      onSaveClick();
    } else {
      onEditClick();
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <Avatar className="w-16 h-16 mr-4">
          <AvatarFallback className="text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {firstName && lastName 
              ? `${firstName} ${lastName}` 
              : 'Usuario'}
          </h1>
          <p className="text-gray-500">
            Miembro desde {new Date(createdAt || Date.now()).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
      
      <Button 
        variant={isEditing ? "default" : "outline"}
        className={isEditing ? "bg-contrareloj hover:bg-contrareloj-dark" : ""}
        onClick={handleButtonClick}
      >
        {isEditing ? 'Guardar cambios' : 'Editar perfil'}
      </Button>
    </div>
  );
};

export default ProfileHeader;
