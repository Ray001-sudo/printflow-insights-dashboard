
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting default admin account setup...')

    // Initialize Supabase Admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Default admin credentials
    const adminEmail = 'bensonandako26@gmail.com'
    const adminPassword = '12345678'
    const adminFullName = 'Benson Andako'

    console.log('🔍 Checking if admin user exists in auth.users...')

    // Check if user already exists in auth.users
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail)
    
    let userId: string

    if (existingUser?.user) {
      // User exists in auth, use existing ID
      userId = existingUser.user.id
      console.log('✅ Admin user found in auth.users:', userId)
    } else {
      // Create new admin user in auth.users using the Admin SDK
      console.log('🆕 Creating new admin user in auth.users...')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email to allow immediate login
        user_metadata: {
          full_name: adminFullName
        }
      })

      if (createError) {
        console.error('Error creating admin user:', createError)
        throw new Error(`Failed to create admin user: ${createError.message}`)
      }

      if (!newUser.user) {
        throw new Error('Failed to create admin user - no user returned')
      }

      userId = newUser.user.id
      console.log('✅ Admin user created in auth.users:', userId)
    }

    // Now handle the profiles table - upsert the admin profile
    console.log('👤 Upserting admin profile...')
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: adminEmail,
        full_name: adminFullName,
        role: 'admin'
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('Error upserting admin profile:', upsertError)
      throw new Error(`Failed to upsert admin profile: ${upsertError.message}`)
    }

    console.log('✅ Admin profile upserted successfully')

    // Test login to verify everything works
    console.log('🔐 Testing admin login credentials...')
    const { data: loginTest, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (loginError || !loginTest.user) {
      console.error('Login test failed:', loginError)
      throw new Error(`Admin login test failed: ${loginError?.message || 'Unknown error'}`)
    }

    // Sign out the test session
    await supabaseAdmin.auth.signOut()
    console.log('✅ Admin login test successful')

    console.log('🎉 Default admin setup completed successfully!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default admin account setup completed successfully',
        adminEmail: adminEmail,
        userId: userId,
        note: 'Admin can now log in immediately with bensonandako26@gmail.com / 12345678'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Setup admin error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred during admin setup',
        details: error.stack || 'No stack trace available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
