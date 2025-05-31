
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  testReduxValue: string;
  setTestReduxValue: (value: string) => void;
  
  // Add more state properties here as needed
  // Example: user preferences, app settings, etc.
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      testReduxValue: 'test value',
      
      // Actions
      setTestReduxValue: (value: string) => set({ testReduxValue: value }),
    }),
    {
      name: 'app-storage', // localStorage key
      // Optional: you can specify which parts of state to persist
      partialize: (state) => ({ testReduxValue: state.testReduxValue }),
    }
  )
);
