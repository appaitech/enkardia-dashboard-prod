
import { useStore } from '@/store/useStore';

// Helper hook for accessing specific parts of the store
export const useAppStore = () => {
  const testReduxValue = useStore((state) => state.testReduxValue);
  const setTestReduxValue = useStore((state) => state.setTestReduxValue);

  return {
    testReduxValue,
    setTestReduxValue,
  };
};

// You can create more specific hooks for different parts of your state
export const useTestValue = () => {
  return useStore((state) => ({
    value: state.testReduxValue,
    setValue: state.setTestReduxValue,
  }));
};
