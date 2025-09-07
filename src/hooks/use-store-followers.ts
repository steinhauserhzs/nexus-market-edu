import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useStoreFollowers(storeId?: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchFollowStatus();
      fetchFollowersCount();
    }
  }, [storeId, user]);

  const fetchFollowStatus = async () => {
    if (!user || !storeId) return;

    try {
      const { data } = await supabase.rpc('user_follows_store', { 
        store_id: storeId 
      });
      setIsFollowing(data || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchFollowersCount = async () => {
    if (!storeId) return;

    try {
      const { data } = await supabase.rpc('get_store_followers_count', { 
        store_id: storeId 
      });
      setFollowersCount(data || 0);
    } catch (error) {
      console.error('Error fetching followers count:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !storeId) {
      toast.error("Você precisa estar logado para seguir lojas");
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('store_followers')
          .delete()
          .eq('user_id', user.id)
          .eq('store_id', storeId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success("Você parou de seguir esta loja");
      } else {
        // Follow
        const { error } = await supabase
          .from('store_followers')
          .insert({
            user_id: user.id,
            store_id: storeId
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success("Você agora segue esta loja!");
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error("Erro ao atualizar status de seguidor");
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    loading,
    toggleFollow
  };
}