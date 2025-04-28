
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const FilterSection = () => {
  return (
    <div className="bg-white shadow-sm p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <Button variant="ghost" size="sm" className="text-gray-500 flex items-center">
          <Filter className="h-4 w-4 mr-1" />
          Limpiar filtros
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toyota">Toyota</SelectItem>
              <SelectItem value="ford">Ford</SelectItem>
              <SelectItem value="chevrolet">Chevrolet</SelectItem>
              <SelectItem value="hyundai">Hyundai</SelectItem>
              <SelectItem value="kia">Kia</SelectItem>
              <SelectItem value="nissan">Nissan</SelectItem>
              <SelectItem value="mazda">Mazda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corolla">Corolla</SelectItem>
              <SelectItem value="ranger">Ranger</SelectItem>
              <SelectItem value="sail">Sail</SelectItem>
              <SelectItem value="accent">Accent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023 o más reciente</SelectItem>
              <SelectItem value="2020">2020 o más reciente</SelectItem>
              <SelectItem value="2015">2015 o más reciente</SelectItem>
              <SelectItem value="2010">2010 o más reciente</SelectItem>
              <SelectItem value="2000">2000 o más reciente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Precio máximo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000000">$5.000.000</SelectItem>
              <SelectItem value="10000000">$10.000.000</SelectItem>
              <SelectItem value="15000000">$15.000.000</SelectItem>
              <SelectItem value="20000000">$20.000.000</SelectItem>
              <SelectItem value="30000000">$30.000.000</SelectItem>
              <SelectItem value="50000000">$50.000.000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de vehículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedán</SelectItem>
              <SelectItem value="suv">SUV / Crossover</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="pickup">Camioneta</SelectItem>
              <SelectItem value="station">Station Wagon</SelectItem>
              <SelectItem value="deportivo">Deportivo</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white">
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
};

export default FilterSection;
