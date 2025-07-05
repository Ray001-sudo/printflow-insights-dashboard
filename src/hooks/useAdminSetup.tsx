
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to automatically set up the default admin account
 * This ensures that bensonandako26@gmail.com is always available as an admin user
 * for immediate access to the dashboard after deployment.
 * 
 * The hook runs once on app initialization and:
 * 1. Calls the setup-admin Edge Function to handle user creation
 * 2. Creates the user in auth.users using Supabase Admin SDK
 * 3. Ensures the user has an admin profile record
 * 4. Tests login credentials to verify everything works
 * 5. Allows immediate login without email verification
 */
export function useAdminSetup() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    const setupDefaultAdmin = async () => {
      try {
        console.log('🚀 Initializing default admin setup...');
        
        // Call the edge function to setup admin account
        const { data, error } = await supabase.functions.invoke('setup-admin', {
          body: {}
        });

        if (error) {
          console.error('❌ Admin setup error:', error);
          setSetupError(error.message);
          return;
        }

        if (data?.success) {
          console.log('✅ Default admin setup completed:', data.message);
          console.log('👤 Admin user ID:', data.userId);
          console.log('🔐 Ready to login with: bensonandako26@gmail.com / 12345678');
          setSetupComplete(true);
        } else {
          console.error('❌ Admin setup failed:', data?.error);
          setSetupError(data?.error || 'Unknown error during admin setup');
        }
      } catch (error) {
        console.error('❌ Admin setup exception:', error);
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
