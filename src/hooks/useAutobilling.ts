import { useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';

/**
 * Custom hook for handling autobilling functionality
 * Automatically generates bills based on hospital price list when certain events occur
 */
export function useAutobilling() {
  const { autoGenerateBills, autobillingConfig } = useHospital();

  /**
   * Trigger autobilling for all unbilled services
   */
  const triggerAutobilling = () => {
    // Only trigger if autobilling is enabled
    if (autobillingConfig.enabled) {
      autoGenerateBills();
    }
  };

  /**
   * Automatically trigger autobilling when the component mounts
   * This can be used on the main dashboard or billing page
   */
  const useAutoBillingOnMount = () => {
    useEffect(() => {
      // Only trigger if autobilling is enabled
      if (autobillingConfig.enabled) {
        // Delay the autobilling slightly to ensure all data is loaded
        const timer = setTimeout(() => {
          triggerAutobilling();
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [autobillingConfig.enabled]);
  };

  return {
    triggerAutobilling,
    useAutoBillingOnMount,
    autobillingConfig
  };
}