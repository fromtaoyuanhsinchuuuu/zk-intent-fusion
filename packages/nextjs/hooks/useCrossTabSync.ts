import { useEffect } from 'react';
import { useIntentStore } from '~~/lib/intentStore';

/**
 * Hook to sync Zustand store across browser tabs
 * This listens to localStorage changes and updates the store
 */
export function useCrossTabSync() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'intent-storage' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          // Force update the store with the new state
          useIntentStore.setState(newState.state);
        } catch (error) {
          console.error('Failed to sync cross-tab state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
}
