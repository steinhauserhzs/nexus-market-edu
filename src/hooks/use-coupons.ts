import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CouponValidation {
  valid: boolean;
  coupon_id?: string;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed_amount';
  name?: string;
  error?: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_cents: number;
  maximum_discount_cents?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  store_id?: string;
  product_ids?: string[];
  created_at: string;
  updated_at: string;
}

export function useCoupons() {
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async (
    code: string, 
    orderTotalCents: number, 
    productIds?: string[]
  ): Promise<CouponValidation> => {
    if (!code.trim()) {
      return { valid: false, error: 'Código do cupom é obrigatório' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_coupon_code: code.toUpperCase(),
        p_order_total_cents: orderTotalCents,
        p_product_ids: productIds || null
      });

      if (error) throw error;
      
      return (data as unknown) as CouponValidation;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { 
        valid: false, 
        error: 'Erro ao validar cupom. Tente novamente.' 
      };
    } finally {
      setIsValidating(false);
    }
  };

  const applyCouponUsage = async (
    couponId: string,
    userId: string,
    orderId: string,
    discountAppliedCents: number
  ) => {
    try {
      const { error } = await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          order_id: orderId,
          discount_applied_cents: discountAppliedCents
        });

      if (error) throw error;

      // Update coupon used count
      await supabase.rpc('increment_coupon_usage', {
        coupon_id: couponId
      });

    } catch (error) {
      console.error('Error applying coupon usage:', error);
      throw error;
    }
  };

  const getCouponsForStore = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          ...couponData,
          code: couponData.code.toUpperCase(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cupom criado com sucesso!",
        description: `Cupom ${data.code} foi criado e está ativo.`,
      });

      return data as Coupon;
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Erro ao criar cupom",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cupom atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      return data as Coupon;
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Erro ao atualizar cupom",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleCouponStatus = async (id: string, isActive: boolean) => {
    return updateCoupon(id, { is_active: isActive });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(coupon.discount_value / 100);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return {
    validateCoupon,
    applyCouponUsage,
    getCouponsForStore,
    createCoupon,
    updateCoupon,
    toggleCouponStatus,
    formatDiscount,
    formatPrice,
    isValidating,
    isCreating
  };
}