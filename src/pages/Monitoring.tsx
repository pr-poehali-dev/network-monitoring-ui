import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAllStationsErrors } from '@/hooks/useWebSocket';

const errorSourceLabels: Record<string, string> = {
  sig1: 'Кнопка аварийной остановки',
  sig2: 'Двери открыты',
  sig3: 'Сработал датчик воды',
  sig4: 'Сработал датчик удара',
  sig5: 'Пожарная сигнализация',
  sig6: 'Низкое напряжение',
  sig7: 'Ошибка связи с ПЛК',
  signal: 'Сигнал',
  rectifier: 'Выпрямитель',
  ocpp: 'OCPP отключен',
  connector: 'Коннектор'
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getErrorSeverity(code: string): 'critical' | 'warning' | 'info' {
  if (code === 'sig1' || code === 'sig3' || code === 'sig5') return 'critical';
  if (code === 'sig2' || code === 'sig6' || code === 'ocpp_disconnected') return 'warning';
  return 'info';
}

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('week');
  const [regionFilter, setRegionFilter] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();
  
  const { errorsData, loading, error, loadAllErrors } = useAllStationsErrors();

  useEffect(() => {
    let from: string | undefined;
    let to: string | undefined;
    const now = new Date();
    
    switch (periodFilter) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        to = now.toISOString();
        break;
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        to = now.toISOString();
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        to = now.toISOString();
        break;
    }

    const filters: Record<string, any> = {};
    if (regionFilter) filters.region = regionFilter;
    
    loadAllErrors(from, to, false, true, 10, 10000, Object.keys(filters).length > 0 ? filters : undefined);
  }, [periodFilter, regionFilter, loadAllErrors]);

  const stations = errorsData?.stations || [];
  const summary = errorsData?.summary;

  const filteredStations = stations.filter((station: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      station.name?.toLowerCase().includes(search) ||
      station.serialNumber?.toLowerCase().includes(search) ||
      station.address?.toLowerCase().includes(search) ||
      station.region?.toLowerCase().includes(search)
    );
  });

  const stationsWithActiveErrors = filteredStations.filter((s: any) => s.hasActiveErrors);
  const criticalStations = stationsWithActiveErrors.filter((s: any) => 
    s.activeErrors?.some((e: any) => getErrorSeverity(e.code) === 'critical')
  );

  const regions = [...new Set(stations.map((s: any) => s.region).filter(Boolean))];

  return (
    <Layout>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Icon name="AlertTriangle" size={24} className="text-red-500" />
              <h1 className="text-xl font-semibold">Мониторинг ошибок сети</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <Icon name="Loader2" className="h-6 w-6 animate-spin" />
              <span>Загрузка данных об ошибках...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <Icon name="AlertCircle" className="h-5 w-5" />
            <div>
              <div className="font-medium">Ошибка загрузки данных</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && errorsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Всего станций</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary?.stationsTotal || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} />
                    Станций с ошибками
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {summary?.stationsWithActiveErrors || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={16} />
                    Критичных
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {criticalStations.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Всего активных ошибок</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary?.activeErrorsTotal || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Поиск по названию, серийному номеру, адресу..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Все регионы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Все регионы</SelectItem>
                        {regions.map((region: string) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Сегодня</SelectItem>
                        <SelectItem value="week">Последние 7 дней</SelectItem>
                        <SelectItem value="month">Текущий месяц</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="active" className="relative">
                  Активные ошибки
                  {stationsWithActiveErrors.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {stationsWithActiveErrors.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="critical" className="relative">
                  Критичные
                  {criticalStations.length > 0 && (
                    <>
                      <Badge variant="destructive" className="ml-2 text-xs animate-pulse">
                        {criticalStations.length}
                      </Badge>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    </>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">Все станции</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {stationsWithActiveErrors.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                        <Icon name="CheckCircle" className="h-12 w-12" />
                        <div className="text-center">
                          <div className="font-medium text-lg">Нет активных ошибок</div>
                          <div className="text-sm">Все станции работают нормально</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  stationsWithActiveErrors.map((station: any) => (
                    <Card 
                      key={station.stationId} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-red-500"
                      onClick={() => navigate(`/station/${station.serialNumber}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {station.name || station.serialNumber}
                              <Badge variant="destructive" className="text-xs">
                                {station.activeErrorsCount} ошибок
                              </Badge>
                            </CardTitle>
                            <div className="text-sm text-gray-600 mt-1">
                              {station.address} • {station.region}
                            </div>
                          </div>
                          <Icon name="ExternalLink" className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {station.activeErrors?.map((err: any, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Icon 
                                  name={getErrorSeverity(err.code) === 'critical' ? 'AlertTriangle' : 'AlertCircle'} 
                                  className={`h-5 w-5 ${getErrorSeverity(err.code) === 'critical' ? 'text-red-600' : 'text-orange-500'}`}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {err.name || errorSourceLabels[err.code] || err.code}
                                  </div>
                                  {err.details && (
                                    <div className="text-xs text-gray-600 mt-0.5">{err.details}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-red-600">
                                  {formatDuration(err.durationSec || 0)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  с {formatDateTime(err.since)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="critical" className="space-y-4">
                {criticalStations.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                        <Icon name="CheckCircle" className="h-12 w-12" />
                        <div className="text-center">
                          <div className="font-medium text-lg">Нет критичных ошибок</div>
                          <div className="text-sm">Серьёзных проблем не обнаружено</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  criticalStations.map((station: any) => (
                    <Card 
                      key={station.stationId} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-red-600 bg-red-50/20"
                      onClick={() => navigate(`/station/${station.serialNumber}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <Icon name="AlertTriangle" className="h-5 w-5 text-red-600" />
                              {station.name || station.serialNumber}
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                КРИТИЧНО
                              </Badge>
                            </CardTitle>
                            <div className="text-sm text-gray-600 mt-1">
                              {station.address} • {station.region}
                            </div>
                          </div>
                          <Icon name="ExternalLink" className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {station.activeErrors
                            ?.filter((err: any) => getErrorSeverity(err.code) === 'critical')
                            .map((err: any, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-200"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Icon name="AlertTriangle" className="h-5 w-5 text-red-600" />
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-red-900">
                                    {err.name || errorSourceLabels[err.code] || err.code}
                                  </div>
                                  {err.details && (
                                    <div className="text-xs text-red-700 mt-0.5">{err.details}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-red-700">
                                  {formatDuration(err.durationSec || 0)}
                                </div>
                                <div className="text-xs text-red-600 mt-0.5">
                                  с {formatDateTime(err.since)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="all">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Станция</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Регион</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Статус</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Активных ошибок</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">История (период)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStations.map((station: any) => (
                            <tr 
                              key={station.stationId}
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/station/${station.serialNumber}`)}
                            >
                              <td className="py-3 px-4">
                                <div className="font-medium text-sm">{station.name || station.serialNumber}</div>
                                <div className="text-xs text-gray-500">{station.address}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm">{station.region || '—'}</div>
                              </td>
                              <td className="py-3 px-4">
                                {station.hasActiveErrors ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Ошибка
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    OK
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {station.activeErrorsCount > 0 ? (
                                  <span className="text-sm font-medium text-red-600">
                                    {station.activeErrorsCount}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">0</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {station.history?.length || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
