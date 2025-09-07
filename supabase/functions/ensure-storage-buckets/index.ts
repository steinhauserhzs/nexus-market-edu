import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requiredBuckets = [
      { id: 'avatars', name: 'avatars', public: true },
      { id: 'products', name: 'products', public: true },
      { id: 'stores', name: 'stores', public: true },
      { id: 'member-areas', name: 'member-areas', public: false },
      { id: 'documents', name: 'documents', public: false }
    ];

    const results = [];
    let created = 0;
    let errors = 0;

    console.log('Checking and creating storage buckets...');

    for (const bucket of requiredBuckets) {
      try {
        // Check if bucket exists
        const { data: existingBucket } = await supabaseClient.storage.getBucket(bucket.id);
        
        if (!existingBucket) {
          console.log(`Creating bucket: ${bucket.id}`);
          
          // Create bucket
          const { data, error } = await supabaseClient.storage.createBucket(bucket.id, {
            public: bucket.public,
            allowedMimeTypes: [
              'image/jpeg',
              'image/png', 
              'image/gif',
              'image/webp',
              'application/pdf',
              'text/plain',
              'video/mp4',
              'audio/mpeg'
            ]
          });

          if (error) {
            console.error(`Error creating bucket ${bucket.id}:`, error);
            results.push({ bucket: bucket.id, status: 'error', message: error.message });
            errors++;
          } else {
            console.log(`Successfully created bucket: ${bucket.id}`);
            results.push({ bucket: bucket.id, status: 'created', message: 'Bucket created successfully' });
            created++;

            // Create basic RLS policies for private buckets
            if (!bucket.public) {
              try {
                // Insert RLS policies for storage objects
                await supabaseClient.sql`
                  INSERT INTO storage.policies (bucket_id, name, definition, check_definition, command)
                  VALUES 
                    (${bucket.id}, 'Users can view own files', 'auth.uid()::text = (storage.foldername(name))[1]', null, 'SELECT'),
                    (${bucket.id}, 'Users can upload own files', 'auth.uid()::text = (storage.foldername(name))[1]', 'auth.uid()::text = (storage.foldername(name))[1]', 'INSERT')
                  ON CONFLICT (bucket_id, name) DO NOTHING
                `;
                console.log(`Created RLS policies for bucket: ${bucket.id}`);
              } catch (policyError) {
                console.warn(`Could not create policies for ${bucket.id}:`, policyError);
              }
            }
          }
        } else {
          console.log(`Bucket ${bucket.id} already exists`);
          results.push({ bucket: bucket.id, status: 'exists', message: 'Bucket already exists' });
        }
      } catch (bucketError) {
        console.error(`Error processing bucket ${bucket.id}:`, bucketError);
        results.push({ bucket: bucket.id, status: 'error', message: bucketError.message });
        errors++;
      }
    }

    console.log(`Storage buckets check complete. Created: ${created}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        created,
        errors,
        results,
        message: `Storage buckets verified. Created ${created} new buckets${errors > 0 ? `, ${errors} errors` : ''}.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in ensure-storage-buckets function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao verificar/criar buckets de storage'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});