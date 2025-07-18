import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 日付範囲フィルターの型定義
interface DateRangeFilterProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date?: Date) => void;
  onDateToChange: (date?: Date) => void;
}

// 日付範囲フィルターコンポーネント
export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">日付</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="date-from" className="text-sm font-normal">
            開始日
          </Label>
          <Input
            id="date-from"
            type="date"
            value={formatDateForInput(dateFrom)}
            onChange={(e) =>
              onDateFromChange(parseDateFromInput(e.target.value))
            }
            className="mt-1"
          />
        </div>
        <div className="text-center text-sm text-gray-400">〜</div>
        <div>
          <Label htmlFor="date-to" className="text-sm font-normal">
            終了日
          </Label>
          <Input
            id="date-to"
            type="date"
            value={formatDateForInput(dateTo)}
            onChange={(e) => onDateToChange(parseDateFromInput(e.target.value))}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
