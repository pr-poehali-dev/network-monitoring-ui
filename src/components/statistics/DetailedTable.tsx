import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Station {
  stationId: number;
  serialNumber: string;
  name: string;
  region: string;
  isOnline: boolean;
  hasError: boolean;
  connectorsCount: number;
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  ignoredSessions: number;
  successRatePct: number;
  effectiveSuccessRatePct: number;
  energyKwhTotal: number;
  energyMwhTotal: number;
  avgSessionDurationSec: number;
  avgEnergyPerSessionKwh: number;
  lastSessionTime?: string;
  lastSuccessfulSessionTime?: string;
  lastFailedSessionTime?: string;
}

interface DetailedTableProps {
  stations: Station[];
}

export default function DetailedTable({ stations }: DetailedTableProps) {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (stationId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(stationId)) {
      newExpanded.delete(stationId);
    } else {
      newExpanded.add(stationId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-xs"></th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-xs">Станция</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-xs">Статус</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-xs">Сессии</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-xs">Успешность</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-xs">Энергия</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-xs">Средняя</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-xs">Последняя сессия</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => {
                const isExpanded = expandedRows.has(station.stationId);
                
                return (
                  <>
                    <tr 
                      key={station.stationId} 
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleRow(station.stationId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Icon 
                            name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                            size={16} 
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-sm">{station.name || station.serialNumber}</div>
                          <div className="text-xs text-gray-500">
                            {station.region} • {station.connectorsCount} конн.
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={station.isOnline ? "default" : "secondary"}
                            className="w-fit text-xs"
                          >
                            {station.isOnline ? 'Online' : 'Offline'}
                          </Badge>
                          {station.hasError && (
                            <Badge variant="destructive" className="w-fit text-xs">
                              Error
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-sm">{station.totalSessions.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          ✓{station.successfulSessions} ✗{station.failedSessions}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-sm text-green-600">
                          {station.effectiveSuccessRatePct.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">
                          ({station.successRatePct.toFixed(1)}% общая)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-sm">{station.energyKwhTotal.toLocaleString()} кВт⋅ч</div>
                        <div className="text-xs text-gray-500">{station.energyMwhTotal.toFixed(2)} МВт⋅ч</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm">{station.avgEnergyPerSessionKwh.toFixed(2)} кВт⋅ч</div>
                        <div className="text-xs text-gray-500">{formatDuration(station.avgSessionDurationSec)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          {formatDate(station.lastSessionTime)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/station/${station.serialNumber}`)}
                        >
                          <Icon name="ExternalLink" size={14} />
                        </Button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={9} className="py-4 px-4">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-700">Детали сессий</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Всего:</span>
                                  <span className="font-medium">{station.totalSessions}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Успешные:</span>
                                  <span className="font-medium text-green-600">{station.successfulSessions}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Ошибки:</span>
                                  <span className="font-medium text-red-600">{station.failedSessions}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Проигнорировано:</span>
                                  <span className="font-medium text-orange-600">{station.ignoredSessions}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-700">Последние события</div>
                              <div className="space-y-1">
                                <div>
                                  <div className="text-gray-500">Любая сессия:</div>
                                  <div className="font-medium">{formatDate(station.lastSessionTime)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Успешная:</div>
                                  <div className="font-medium text-green-600">{formatDate(station.lastSuccessfulSessionTime)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">С ошибкой:</div>
                                  <div className="font-medium text-red-600">{formatDate(station.lastFailedSessionTime)}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-700">ID и координаты</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">ID:</span>
                                  <span className="font-medium">{station.stationId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Серийник:</span>
                                  <span className="font-medium">{station.serialNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Коннекторов:</span>
                                  <span className="font-medium">{station.connectorsCount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
