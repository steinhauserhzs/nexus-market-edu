import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { owner_id, store_id, niche, consolidated } = await req.json();
    
    // Validate that the requesting user is the owner
    if (owner_id && owner_id !== user.id) {
      throw new Error('Unauthorized: Can only view own KPIs');
    }

    const userId = owner_id || user.id;
    
    // Build query conditions
    let storeCondition = '';
    const queryParams: any[] = [userId];
    
    if (consolidated && niche) {
      // Get KPIs for all stores in the niche
      storeCondition = `
        AND s.niche = $${queryParams.length + 1}
      `;
      queryParams.push(niche);
    } else if (store_id) {
      // Get KPIs for specific store
      storeCondition = `
        AND s.id = $${queryParams.length + 1}
      `;
      queryParams.push(store_id);
    }

    // Calculate date ranges
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Query for sales and revenue data
    const kpiQuery = `
      WITH order_data AS (
        SELECT 
          o.created_at,
          o.total_cents,
          o.user_id,
          oi.quantity,
          oi.unit_price_cents
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        JOIN stores s ON p.store_id = s.id
        WHERE o.status = 'completed'
          AND o.payment_status = 'paid'
          AND s.owner_id = $1
          ${storeCondition}
      )
      SELECT 
        -- Today's metrics
        COUNT(CASE WHEN created_at >= $${queryParams.length + 1} THEN 1 END) as sales_today,
        COALESCE(SUM(CASE WHEN created_at >= $${queryParams.length + 1} THEN total_cents END), 0) as revenue_today_cents,
        
        -- Monthly metrics  
        COUNT(CASE WHEN created_at >= $${queryParams.length + 2} THEN 1 END) as sales_month,
        COALESCE(SUM(CASE WHEN created_at >= $${queryParams.length + 2} THEN total_cents END), 0) as revenue_month_cents,
        COALESCE(SUM(CASE WHEN created_at >= $${queryParams.length + 2} THEN quantity END), 0) as items_sold_month,
        COUNT(DISTINCT CASE WHEN created_at >= $${queryParams.length + 2} THEN user_id END) as new_customers_month
        
      FROM order_data
    `;

    queryParams.push(startOfToday.toISOString());
    queryParams.push(startOfMonth.toISOString());

    console.log('Executing KPI query with params:', queryParams);

    const { data, error } = await supabase.rpc('exec_sql', {
      query: kpiQuery,
      params: queryParams
    });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // If no data, return zeros
    const result = data && data.length > 0 ? data[0] : {
      sales_today: 0,
      sales_month: 0, 
      revenue_today_cents: 0,
      revenue_month_cents: 0,
      items_sold_month: 0,
      new_customers_month: 0
    };

    console.log('KPI result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-seller-kpis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        sales_today: 0,
        sales_month: 0,
        revenue_today_cents: 0,
        revenue_month_cents: 0,
        items_sold_month: 0,
        new_customers_month: 0
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});