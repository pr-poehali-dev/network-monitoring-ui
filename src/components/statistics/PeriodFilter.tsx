import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface PeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border p-4">
      <Icon name="Calendar" className="h-5 w-5 text-gray-500" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Период:</span>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Выберите период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">За все время</SelectItem>
            <SelectItem value="today">Сегодня</SelectItem>
            <SelectItem value="week">Последние 7 дней</SelectItem>
            <SelectItem value="month">Текущий месяц</SelectItem>
            <SelectItem value="year">Текущий год</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
