
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
    // Initialize Supabase Admin client
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

    console.log('Setting up default admin account...')

    // Check if user already exists in auth.users
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail)
    
    let userId: string

    if (existingUser && existingUser.user) {
      // User exists, use existing ID
      userId = existingUser.user.id
      console.log('Admin user already exists in auth.users')
    } else {
      // Create new admin user
      console.log('Creating new admin user...')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: adminFullName
        }
      })

      if (createError) {
        console.error('Error creating admin user:', createError)
        throw createError
      }

      if (!newUser.user) {
        throw new Error('Failed to create admin user')
      }

      userId = newUser.user.id
      console.log('Admin user created successfully')
    }

    // Now ensure the user exists in profiles table with admin role
    const { data: existingProfile, error: getProfileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (getProfileError && getProfileError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking profile:', getProfileError)
      throw getProfileError
    }

    if (existingProfile) {
      // Profile exists, update role to admin
      console.log('Updating existing profile to admin role...')
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile role:', updateError)
        throw updateError
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
        throw insertError
      }
      console.log('Admin profile created successfully')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default admin account setup completed',
        adminEmail: adminEmail
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
