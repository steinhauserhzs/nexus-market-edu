import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommunityPost {
  id: string;
  store_id: string;
  user_id: string;
  content_id?: string;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string;
    avatar_url: string;
  };
  liked_by_user: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string;
    avatar_url: string;
  };
  liked_by_user: boolean;
  replies: CommunityComment[];
}

export const useCommunity = (storeId?: string) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!storeId) return;
    
    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles separately
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Check which posts the current user has liked
      const currentUser = await supabase.auth.getUser();
      const { data: userLikes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', currentUser.data.user?.id || '')
        .in('post_id', postsData?.map(p => p.id) || []);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);

      const postsWithLikes = postsData?.map(post => ({
        ...post,
        profile: profilesMap.get(post.user_id) || { full_name: 'Unknown', avatar_url: '' },
        liked_by_user: likedPostIds.has(post.id),
      })) || [];

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const loadComments = useCallback(async (postId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles separately
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Check which comments the current user has liked
      const currentUser = await supabase.auth.getUser();
      const { data: userLikes } = await supabase
        .from('community_likes')
        .select('comment_id')
        .eq('user_id', currentUser.data.user?.id || '')
        .in('comment_id', commentsData?.map(c => c.id) || []);

      const likedCommentIds = new Set(userLikes?.map(l => l.comment_id) || []);

      // Organize comments in a tree structure
      const commentMap = new Map();
      const rootComments: CommunityComment[] = [];

      commentsData?.forEach(comment => {
        const commentWithLikes = {
          ...comment,
          profile: profilesMap.get(comment.user_id) || { full_name: 'Unknown', avatar_url: '' },
          liked_by_user: likedCommentIds.has(comment.id),
          replies: [],
        };
        
        commentMap.set(comment.id, commentWithLikes);
        
        if (!comment.parent_id) {
          rootComments.push(commentWithLikes);
        }
      });

      // Add replies to their parents
      commentsData?.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(commentMap.get(comment.id));
          }
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, []);

  const createPost = useCallback(async (title: string, content: string, contentId?: string) => {
    if (!user || !storeId) return;

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          store_id: storeId,
          user_id: user.id,
          content_id: contentId || null,
          title,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }, [user, storeId]);

  const createComment = useCallback(async (postId: string, content: string, parentId?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          content,
          parent_id: parentId || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update comments count manually
      const { data: currentPost } = await supabase
        .from('community_posts')
        .select('comments_count')
        .eq('id', postId)
        .single();

      if (currentPost) {
        await supabase
          .from('community_posts')
          .update({ 
            comments_count: currentPost.comments_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', postId);
      }

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }, [user]);

  const toggleLike = useCallback(async (postId?: string, commentId?: string) => {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) return;

    try {
      if (postId) {
        // Check if already liked
        const { data: existingLike } = await supabase
          .from('community_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', currentUser.data.user.id)
          .single();

        if (existingLike) {
          // Remove like
          await supabase
            .from('community_likes')
            .delete()
            .eq('id', existingLike.id);
          
          // Update likes count manually
          const { data: currentPost } = await supabase
            .from('community_posts')
            .select('likes_count')
            .eq('id', postId)
            .single();

          if (currentPost) {
            await supabase
              .from('community_posts')
              .update({ 
                likes_count: Math.max(0, currentPost.likes_count - 1),
                updated_at: new Date().toISOString()
              })
              .eq('id', postId);
          }
        } else {
          // Add like
          await supabase
            .from('community_likes')
            .insert({
              post_id: postId,
              user_id: currentUser.data.user.id,
            });
          
          // Update likes count manually
          const { data: currentPost } = await supabase
            .from('community_posts')
            .select('likes_count')
            .eq('id', postId)
            .single();

          if (currentPost) {
            await supabase
              .from('community_posts')
              .update({ 
                likes_count: currentPost.likes_count + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', postId);
          }
        }

        // Update local state
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: existingLike ? post.likes_count - 1 : post.likes_count + 1,
              liked_by_user: !existingLike,
            };
          }
          return post;
        }));
      }

      if (commentId) {
        // Similar logic for comments
        const { data: existingLike } = await supabase
          .from('community_likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.data.user.id)
          .single();

        if (existingLike) {
          await supabase
            .from('community_likes')
            .delete()
            .eq('id', existingLike.id);
          
          // Update likes count manually
          const { data: currentComment } = await supabase
            .from('community_comments')
            .select('likes_count')
            .eq('id', commentId)
            .single();

          if (currentComment) {
            await supabase
              .from('community_comments')
              .update({ 
                likes_count: Math.max(0, currentComment.likes_count - 1),
                updated_at: new Date().toISOString()
              })
              .eq('id', commentId);
          }
        } else {
          await supabase
            .from('community_likes')
            .insert({
              comment_id: commentId,
              user_id: currentUser.data.user.id,
            });
          
          // Update likes count manually
          const { data: currentComment } = await supabase
            .from('community_comments')
            .select('likes_count')
            .eq('id', commentId)
            .single();

          if (currentComment) {
            await supabase
              .from('community_comments')
              .update({ 
                likes_count: currentComment.likes_count + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', commentId);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!storeId) return;

    const postsChannel = supabase
      .channel('community_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
          filter: `store_id=eq.${storeId}`
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [storeId, loadPosts]);

  return {
    posts,
    comments,
    loading,
    loadPosts,
    loadComments,
    createPost,
    createComment,
    toggleLike
  };
};