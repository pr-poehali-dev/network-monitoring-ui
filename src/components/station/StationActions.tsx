import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface StationActionsProps {
  onAction: (action: string) => void;
}

interface StationFile {
  id: string;
  name: string;
  type: 'schema' | 'photo' | 'firmware' | 'document' | 'other';
  size: number;
  uploadDate: string;
  url?: string; // Для скачивания
}

export default function StationActions({ onAction }: StationActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StationFile[]>([
    {
      id: '1',
      name: 'Электрическая схема v2.1.pdf',
      type: 'schema',
      size: 2547621,
      uploadDate: '2024-09-20'
    },
    {
      id: '2', 
      name: 'Фото установки.jpg',
      type: 'photo',
      size: 1245680,
      uploadDate: '2024-09-18'
    },
    {
      id: '3',
      name: 'firmware_v1.4.2.bin',
      type: 'firmware', 
      size: 524288,
      uploadDate: '2024-09-15'
    }
  ]);

  const handleExternalLink = (url: string, name: string) => {
    // Пока заглушка - в будущем будет реальная ссылка
    alert(`Переход на ${name}\nURL: ${url}`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'schema': return 'FileText';
      case 'photo': return 'Image';
      case 'firmware': return 'Cpu';
      case 'document': return 'FileText';
      default: return 'File';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'schema': return 'text-blue-600';
      case 'photo': return 'text-green-600';
      case 'firmware': return 'text-purple-600';
      case 'document': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const newFiles: StationFile[] = Array.from(uploadedFiles).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0]
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Очищаем input для возможности загрузки того же файла снова
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (fileName: string): StationFile['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp':
        return 'photo';
      case 'bin': case 'hex': case 'fw':
        return 'firmware';
      case 'pdf': case 'dwg': case 'sch':
        return fileName.toLowerCase().includes('схем') ? 'schema' : 'document';
      case 'doc': case 'docx': case 'txt': case 'md':
        return 'document';
      default:
        return 'other';
    }
  };

  const handleDownload = (file: StationFile) => {
    // В реальном приложении здесь будет скачивание файла
    alert(`Скачивание файла: ${file.name}`);
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Действия</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Комментарий</p>
            <p className="text-sm text-gray-500">Редактировать операционную информацию</p>
          </div>
          <Button onClick={() => onAction('editComment')}>
            РЕДАКТИРОВАТЬ
          </Button>
        </div>

        <Separator />

        {/* Файлы станции */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm text-gray-700">Файлы станции</h4>
            <Button 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Icon name="Plus" size={16} />
              ЗАГРУЗИТЬ
            </Button>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.bin,.hex,.fw,.dwg,.sch,.doc,.docx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                <Icon name="FolderOpen" size={24} className="mx-auto mb-2 text-gray-400" />
                Файлы не загружены
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon 
                      name={getFileIcon(file.type)} 
                      size={16} 
                      className={getFileTypeColor(file.type)} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(file)}
                      className="h-8 w-8 p-0"
                      title="Скачать"
                    >
                      <Icon name="Download" size={14} />
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(file.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Поддерживаются: PDF, изображения, прошивки, документы
          </div>
        </div>

        <Separator />

        {/* Внешние ссылки */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Внешние системы</h4>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="BarChart3" size={18} className="text-blue-600" />
              <div>
                <p className="font-medium">Визуализация Агавы</p>
                <p className="text-sm text-gray-500">Мониторинг и аналитика в реальном времени</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExternalLink('https://agava.visualization.com/station/1', 'Визуализацию Агавы')}
              className="flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="Router" size={18} className="text-green-600" />
              <div>
                <p className="font-medium">Настройки роутера</p>
                <p className="text-sm text-gray-500">Конфигурация сетевого оборудования</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExternalLink('https://router.config.com/station/1', 'настройки роутера')}
              className="flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="Building2" size={18} className="text-orange-600" />
              <div>
                <p className="font-medium">Bitrix24</p>
                <p className="text-sm text-gray-500">Карточка станции в CRM системе</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExternalLink('https://company.bitrix24.ru/crm/station/1', 'Bitrix24')}
              className="flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}