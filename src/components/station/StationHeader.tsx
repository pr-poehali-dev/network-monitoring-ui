import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'charging' | 'error' | 'offline';
}

interface StationHeaderProps {
  station: ChargingStation;
}

export default function StationHeader({ station }: StationHeaderProps) {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к списку</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Station Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="MapPin" size={20} className="text-gray-400" />
            <h1 className="text-2xl font-bold">{station.name}</h1>
          </div>
          <p className="text-gray-500">{station.location}</p>
        </div>
      </div>
    </>
  );
}