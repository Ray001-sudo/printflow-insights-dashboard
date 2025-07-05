
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('🚀 Starting admin setup with working implementation...')

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const email = "bensonandako26@gmail.com";
    const password = "12345678";
    const fullName = "Benson Andako";

    console.log('🔍 Creating admin user in auth.users...')
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError && !createError.message.includes("duplicate key")) {
      console.error('❌ Failed to create user:', createError.message)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: createError.message 
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = createdUser?.user?.id;

    if (!userId) {
      console.log('⚠️ User might already exist, checking profiles table...')
      const { data: existingUsers, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (fetchError || !existingUsers || existingUsers.length === 0) {
        console.error('❌ Failed to find or create user')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to find or create user." 
          }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ User already exists and found in profiles table')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User already exists and found in DB.",
          userId: existingUsers[0].id
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Admin user created with ID:', userId)
    console.log('👤 Upserting admin profile...')

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      role: "admin",
    });

    if (upsertError) {
      console.error('❌ Failed to upsert profile:', upsertError.message)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: upsertError.message 
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Admin profile upserted successfully')
    console.log('🎉 Admin setup completed successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created and role set.",
        userId: userId,
        adminEmail: email,
        note: "Admin can now log in with bensonandako26@gmail.com / 12345678"
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

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
});
