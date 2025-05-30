
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FinancialYearMonthSelectorProps {
  availableMonths: string[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  comparisonMonths: string[];
  onComparisonMonthsChange: (months: string[]) => void;
}

const FinancialYearMonthSelector: React.FC<FinancialYearMonthSelectorProps> = ({
  availableMonths,
  selectedMonth,
  onMonthSelect,
  comparisonMonths,
  onComparisonMonthsChange
}) => {
  const handleAddComparisonMonth = (month: string) => {
    if (month !== selectedMonth && !comparisonMonths.includes(month) && comparisonMonths.length < 3) {
      onComparisonMonthsChange([...comparisonMonths, month]);
    }
  };

  const handleRemoveComparisonMonth = (monthToRemove: string) => {
    onComparisonMonthsChange(comparisonMonths.filter(month => month !== monthToRemove));
  };

  const availableComparisonMonths = availableMonths.filter(
    month => month !== selectedMonth && !comparisonMonths.includes(month)
  );

  if (availableMonths.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Month Selection & Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Month Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Primary Month
            </label>
            <Select value={selectedMonth} onValueChange={onMonthSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comparison Month Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Add Comparison Month ({comparisonMonths.length}/3)
            </label>
            <Select 
              value="" 
              onValueChange={handleAddComparisonMonth}
              disabled={comparisonMonths.length >= 3 || availableComparisonMonths.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add month to compare" />
              </SelectTrigger>
              <SelectContent>
                {availableComparisonMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Primary Month */}
        {selectedMonth && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Selected Month
            </label>
            <div>
              <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                {selectedMonth}
              </Badge>
            </div>
          </div>
        )}

        {/* Comparison Months */}
        {comparisonMonths.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Comparison Months
            </label>
            <div className="flex flex-wrap gap-2">
              {comparisonMonths.map((month) => (
                <Badge 
                  key={month} 
                  variant="secondary" 
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  {month}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-green-200"
                    onClick={() => handleRemoveComparisonMonth(month)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {comparisonMonths.length > 0 && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComparisonMonthsChange([])}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All Comparisons
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialYearMonthSelector;
