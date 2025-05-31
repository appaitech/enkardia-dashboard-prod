
import { useState, useEffect } from 'react';
import { getSelectedClientBusinessId, saveSelectedClientBusinessId } from '@/services/userService';

export const useSelectedBusiness = () => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    getSelectedClientBusinessId()
  );

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    saveSelectedClientBusinessId(businessId);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('selectedBusinessChanged', { 
      detail: { businessId } 
    }));
  };

  useEffect(() => {
    const handleBusinessChange = (event: CustomEvent) => {
      const { businessId } = event.detail;
      setSelectedBusinessId(businessId);
    };

    window.addEventListener('selectedBusinessChanged', handleBusinessChange as EventListener);
    
    return () => {
      window.removeEventListener('selectedBusinessChanged', handleBusinessChange as EventListener);
    };
  }, []);

  return {
    selectedBusinessId,
    setSelectedBusinessId,
    handleBusinessSelect
  };
};
