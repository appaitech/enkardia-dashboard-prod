
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface MonthSelectorProps {
  availableMonths: string[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  comparisonMonths: string[];
  onComparisonMonthsChange: (months: string[]) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  availableMonths,
  selectedMonth,
  onMonthSelect,
  comparisonMonths,
  onComparisonMonthsChange
}) => {
  const handleComparisonToggle = (month: string) => {
    if (comparisonMonths.includes(month)) {
      onComparisonMonthsChange(comparisonMonths.filter(m => m !== month));
    } else if (comparisonMonths.length < 3) { // Limit to 3 comparison months
      onComparisonMonthsChange([...comparisonMonths, month]);
    }
  };

  return (
    <Card className="bg-blue-50/50 border-blue-100">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <Label className="text-blue-900 font-medium">Primary Month</Label>
            </div>
            <Select value={selectedMonth} onValueChange={onMonthSelect}>
              <SelectTrigger className="bg-white border-blue-200">
                <SelectValue placeholder="Select a month to analyze" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-2">
            <Label className="text-blue-900 font-medium mb-3 block">
              Compare with (select up to 3 months)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableMonths
                .filter(month => month !== selectedMonth)
                .map((month) => (
                  <label
                    key={month}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-blue-100/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={comparisonMonths.includes(month)}
                      onChange={() => handleComparisonToggle(month)}
                      disabled={!comparisonMonths.includes(month) && comparisonMonths.length >= 3}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-800">{month}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthSelector;
