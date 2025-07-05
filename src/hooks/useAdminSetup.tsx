
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to automatically set up the default admin account
 * This ensures that bensonandako26@gmail.com is always available as an admin user
 * for immediate access to the dashboard after deployment.
 */
export function useAdminSetup() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    const setupDefaultAdmin = async () => {
      try {
        console.log('Initializing default admin setup...');
        
        // Call the edge function to setup admin account
        const { data, error } = await supabase.functions.invoke('setup-admin', {
          body: {}
        });

        if (error) {
          console.error('Admin setup error:', error);
          setSetupError(error.message);
          return;
        }

        if (data?.success) {
          console.log('Default admin setup completed:', data.message);
          setSetupComplete(true);
        } else {
          console.error('Admin setup failed:', data?.error);
          setSetupError(data?.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Admin setup exception:', error);
        setSetupError(error instanceof Error ? error.message : 'Setup failed');
      }
    };

    // Only run setup once when the app initializes
    if (!setupComplete && !setupError) {
      setupDefaultAdmin();
    }
  }, [setupComplete, setupError]);

  return { setupComplete, setupError };
}
