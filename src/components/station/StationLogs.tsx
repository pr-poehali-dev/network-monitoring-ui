import Icon from '@/components/ui/icon';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'error' | 'info';
  message: string;
}

interface StationLogsProps {
  mockLogs: LogEntry[];
}

export default function StationLogs({ mockLogs }: StationLogsProps) {
  return (
    <div className="xl:col-span-1 flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Icon name="FileText" size={20} />
        <h3 className="text-lg font-semibold">OCPP Логи</h3>
      </div>
      
      <div className="flex-1 bg-white border rounded-lg overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 font-mono text-sm space-y-3">
            {mockLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {log.type === 'request' ? (
                      <Icon name="ArrowRight" size={16} className="text-blue-500 mt-0.5" />
                    ) : log.type === 'response' ? (
                      <Icon name="ArrowLeft" size={16} className="text-green-500 mt-0.5" />
                    ) : (
                      <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {log.message.split('\n')[0]}
                    </div>
                    {log.message.includes('\n') && (
                      <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap font-mono">
                        {log.message.split('\n').slice(1).join('\n')}
                      </pre>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-500 text-right">
                  <div>{log.timestamp.split(' ')[0]}</div>
                  <div>{log.timestamp.split(' ')[1]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}