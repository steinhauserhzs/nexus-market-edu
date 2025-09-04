import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upload function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get JWT from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(jwt);
    if (!user) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const storeId = formData.get('storeId') as string;
    const fileType = formData.get('fileType') as string || 'product-image';
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Uploading file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${user.id}/${fileType}/${timestamp}-${randomId}.${fileExt}`;

    // Determine bucket based on file type
    let bucket = 'store-assets';
    if (file.type.startsWith('image/')) {
      if (fileType === 'store-logo') bucket = 'store-logos';
      else if (fileType === 'store-banner') bucket = 'store-banners';
      else if (fileType === 'user-avatar') bucket = 'user-avatars';
    }

    console.log(`Uploading to bucket: ${bucket}, path: ${fileName}`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);

    // Save asset record if store-related
    if (storeId && bucket === 'store-assets') {
      const { error: dbError } = await supabaseClient
        .from('store_assets')
        .insert({
          store_id: storeId,
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type.startsWith('image/') ? 'image' : 'file',
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't throw here, file is already uploaded
      }
    }

    // Create optimized versions for images
    let optimizedUrls: any = {};
    if (file.type.startsWith('image/') && file.size > 500000) { // 500KB threshold
      console.log('Creating optimized versions for large image');
      
      // Generate thumbnail (300px)
      const thumbnailName = fileName.replace(/\.([^.]+)$/, '_thumb.$1');
      
      try {
        // For now, just return the original URL
        // In production, you'd use image transformation service
        optimizedUrls = {
          thumbnail: publicUrl,
          medium: publicUrl,
          large: publicUrl
        };
      } catch (optimizeError) {
        console.warn('Image optimization failed:', optimizeError);
        optimizedUrls = {
          thumbnail: publicUrl,
          medium: publicUrl,
          large: publicUrl
        };
      }
    }

    const response = {
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucket,
      path: fileName,
      optimized: Object.keys(optimizedUrls).length > 0 ? optimizedUrls : null
    };

    console.log('Upload completed successfully:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-file function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Upload failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});