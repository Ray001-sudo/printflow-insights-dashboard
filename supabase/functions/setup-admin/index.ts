
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
    console.log('Setting up default admin account...')

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

    console.log('Checking if admin user exists...')

    // Check if user already exists in auth.users
    const { data: existingAuthUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail)
    
    let userId: string

    if (existingAuthUser && existingAuthUser.user) {
      // User exists in auth, use existing ID
      userId = existingAuthUser.user.id
      console.log('Admin user found in auth.users:', userId)
    } else {
      // Create new admin user in auth.users
      console.log('Creating new admin user in auth.users...')
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email to allow immediate login
        user_metadata: {
          full_name: adminFullName
        }
      })

      if (createAuthError) {
        console.error('Error creating admin user in auth:', createAuthError)
        throw new Error(`Failed to create auth user: ${createAuthError.message}`)
      }

      if (!newAuthUser.user) {
        throw new Error('Failed to create admin user - no user returned')
      }

      userId = newAuthUser.user.id
      console.log('Admin user created in auth.users:', userId)
    }

    // Now handle the profiles table - check if profile exists
    console.log('Checking profiles table for user:', userId)
    const { data: existingProfile, error: getProfileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (getProfileError) {
      console.error('Error checking profile:', getProfileError)
      throw new Error(`Failed to check profile: ${getProfileError.message}`)
    }

    if (existingProfile) {
      // Profile exists, ensure role is admin
      console.log('Profile exists, updating role to admin...')
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          role: 'admin',
          email: adminEmail,
          full_name: adminFullName
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile role:', updateError)
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }
      console.log('Profile role updated to admin')
    } else {
      // Create new profile with admin role
      console.log('Creating new profile with admin role...')
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: adminEmail,
          full_name: adminFullName,
          role: 'admin'
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        throw new Error(`Failed to create profile: ${insertError.message}`)
      }
      console.log('Admin profile created successfully')
    }

    console.log('Default admin setup completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default admin account setup completed successfully',
        adminEmail: adminEmail,
        userId: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Setup admin error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred during admin setup'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
