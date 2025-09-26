import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface StationFiltersAndSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  ownerFilter: string;
  setOwnerFilter: (value: string) => void;
  appFilter: string;
  setAppFilter: (value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function StationFiltersAndSearch({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  cityFilter,
  setCityFilter,
  ownerFilter,
  setOwnerFilter,
  appFilter,
  setAppFilter,
  clearFilters,
  hasActiveFilters
}: StationFiltersAndSearchProps) {
  return (
    <div className="space-y-4">
      {/* Основные фильтры */}
      <div className="flex items-center justify-between">
        <div></div>
        
        {/* Поиск и сортировка */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск станций..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="sessions">По сессиям</SelectItem>
              <SelectItem value="energy">По энергии</SelectItem>
              <SelectItem value="errors">По ошибкам</SelectItem>
              <SelectItem value="city">По городу</SelectItem>
              <SelectItem value="owner">По собственнику</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Дополнительные фильтры */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Фильтр по городу..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="pl-9 w-48"
          />
        </div>

        <div className="relative">
          <Icon name="Building" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Фильтр по собственнику..."
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="pl-9 w-48"
          />
        </div>

        <div className="relative">
          <Icon name="Smartphone" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Фильтр по приложению..."
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="pl-9 w-48"
          />
        </div>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearFilters}
          >
            <Icon name="X" size={16} className="mr-1" />
            Сбросить фильтры
          </Button>
        )}
      </div>
    </div>
  );
}