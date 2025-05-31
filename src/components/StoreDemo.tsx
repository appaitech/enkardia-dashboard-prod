
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/hooks/useAppStore';

const StoreDemo: React.FC = () => {
  const { testReduxValue, setTestReduxValue } = useAppStore();
  const [inputValue, setInputValue] = React.useState('');

  const handleUpdateValue = () => {
    if (inputValue.trim()) {
      setTestReduxValue(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Global State Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current stored value:</p>
          <p className="font-semibold bg-gray-100 p-2 rounded">
            {testReduxValue}
          </p>
        </div>
        
        <div className="space-y-2">
          <Input
            placeholder="Enter new value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUpdateValue()}
          />
          <Button onClick={handleUpdateValue} className="w-full">
            Update Global State
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          This value persists across page refreshes and is accessible from any component in the app.
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreDemo;
