import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { wsService } from '@/services/websocket';
import { useToast } from '@/hooks/use-toast';

interface StationActionsProps {
  onAction: (action: string) => void;
  isStationOnline?: boolean;
  serialNumber?: string;
  stationId?: number;
  currentComment?: string;
}

interface StationFile {
  id: string;
  name: string;
  type: 'schema' | 'photo' | 'firmware' | 'document' | 'other';
  size: number;
  uploadDate: string;
  url?: string; // Для скачивания
}

export default function StationActions({ onAction, isStationOnline = true, serialNumber, stationId, currentComment = '' }: StationActionsProps) {
  const { toast } = useToast();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState(currentComment);
  const [savingComment, setSavingComment] = useState(false);
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

  useEffect(() => {
    setComment(currentComment || '');
  }, [currentComment]);

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
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">Комментарий</p>
              <p className="text-sm text-gray-500">Операционная информация о станции</p>
            </div>
            <Button onClick={() => {
              setComment(currentComment || '');
              setIsCommentDialogOpen(true);
            }}>
              РЕДАКТИРОВАТЬ
            </Button>
          </div>
          {currentComment ? (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentComment}</p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-400 italic">Комментарий не добавлен</p>
            </div>
          )}
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
              disabled
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
              disabled
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
              disabled
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Редактирование комментария
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Введите комментарий к станции..."
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              Комментарий поддерживает несколько строк. Используйте Enter для переноса строки.
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCommentDialogOpen(false)}
              disabled={savingComment}
            >
              Отмена
            </Button>
            <Button 
              onClick={async () => {
                setSavingComment(true);
                try {
                  const result = await wsService.saveStationComment({
                    stationId,
                    serialNumber,
                    comment,
                  });

                  if (result.type === 'response') {
                    toast({
                      title: 'Комментарий сохранен',
                      description: 'Изменения успешно применены',
                    });
                    setIsCommentDialogOpen(false);
                  } else if (result.type === 'error') {
                    toast({
                      title: 'Ошибка',
                      description: result.message || 'Не удалось сохранить комментарий',
                      variant: 'destructive',
                    });
                  }
                } catch (error) {
                  toast({
                    title: 'Ошибка',
                    description: 'Не удалось сохранить комментарий',
                    variant: 'destructive',
                  });
                } finally {
                  setSavingComment(false);
                }
              }}
              disabled={savingComment}
            >
              {savingComment ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}