import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleTabContentProps {
  title: string;
  content: string;
}

export default function SimpleTabContent({ title, content }: SimpleTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">{content}</p>
      </CardContent>
    </Card>
  );
}