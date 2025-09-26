import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchAndFilters({ searchTerm, setSearchTerm }: SearchAndFiltersProps) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск по станции или ошибке..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Icon name="Filter" size={16} className="mr-2" />
          Фильтры
        </Button>
        <Button variant="outline" size="sm">
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт
        </Button>
      </div>
    </div>
  );
}