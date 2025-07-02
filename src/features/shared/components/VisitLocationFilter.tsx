// src/features/shared/components/VisitLocationFilter.tsx
// 市区町村や日付でのフィルター機能

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 型定義をここに直接定義
interface CityFilterProps {
  selectedCities: string[];
  availableCities: string[];
  onCityChange: (cities: string[]) => void;
}

interface DateRangeFilterProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date?: Date) => void;
  onDateToChange: (date?: Date) => void;
}

// 市区町村フィルターコンポーネント
export function CityFilter({ selectedCities, availableCities, onCityChange }: CityFilterProps) {
  const handleCityToggle = (city: string, checked: boolean) => {
    if (checked) {
      onCityChange([...selectedCities, city]);
    } else {
      onCityChange(selectedCities.filter((c: string) => c !== city));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">市区町村</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableCities.map((city: string) => (
          <div key={city} className="flex items-center space-x-2">
            <Checkbox
              id={`city-${city}`}
              checked={selectedCities.includes(city)}
              onCheckedChange={(checked) => handleCityToggle(city, checked as boolean)}
            />
            <Label 
              htmlFor={`city-${city}`} 
              className="text-sm font-normal cursor-pointer"
            >
              {city}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// 日付範囲フィルターコンポーネント
export function DateRangeFilter({ 
  dateFrom, 
  dateTo, 
  onDateFromChange, 
  onDateToChange 
}: DateRangeFilterProps) {
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
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
            onChange={(e) => onDateFromChange(parseDateFromInput(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="text-center text-gray-400 text-sm">〜</div>
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