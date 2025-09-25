import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface StationActionsProps {
  onAction: (action: string) => void;
}

export default function StationActions({ onAction }: StationActionsProps) {
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
      </CardContent>
    </Card>
  );
}