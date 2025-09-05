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
  profile?: {
    full_name: string;
    avatar_url: string;
  };
  liked_by_user?: boolean;
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
  profile?: {
    full_name: string;
    avatar_url: string;
  };
  liked_by_user?: boolean;
  replies?: CommunityComment[];
}

export const useCommunity = (storeId?: string) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: CommunityComment[] }>({});
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('store_id', storeId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      // Check which posts are liked by current user
      let postsWithLikes = data || [];
      
      if (user) {
        const { data: likes } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsWithLikes.map(p => p.id));

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        
        postsWithLikes = postsWithLikes.map(post => ({
          ...post,
          liked_by_user: likedPostIds.has(post.id)
        }));
      }

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error in loadPosts:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId, user]);

  const loadComments = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      // Check which comments are liked by current user
      let commentsWithLikes = data || [];
      
      if (user) {
        const { data: likes } = await supabase
          .from('community_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsWithLikes.map(c => c.id));

        const likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);
        
        commentsWithLikes = commentsWithLikes.map(comment => ({
          ...comment,
          liked_by_user: likedCommentIds.has(comment.id)
        }));
      }

      // Organize comments in a tree structure
      const commentMap = new Map<string, CommunityComment>();
      const rootComments: CommunityComment[] = [];

      // First pass: create map of all comments
      commentsWithLikes.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree
      commentsWithLikes.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!);
        }
      });

      setComments(prev => ({
        ...prev,
        [postId]: rootComments
      }));
    } catch (error) {
      console.error('Error in loadComments:', error);
    }
  }, [user]);

  const createPost = useCallback(async (
    title: string,
    content: string,
    contentId?: string
  ) => {
    if (!user || !storeId) return;

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          store_id: storeId,
          user_id: user.id,
          content_id: contentId,
          title,
          content
        })
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return;
      }

      setPosts(prev => [{ ...data, liked_by_user: false }, ...prev]);
      return data;
    } catch (error) {
      console.error('Error in createPost:', error);
    }
  }, [user, storeId]);

  const createComment = useCallback(async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_id: parentId,
          content
        })
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        return;
      }

      // Update comments count on post
      await supabase.rpc('increment_comments_count', { post_id: postId });
      
      // Update local state
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        )
      );

      // Reload comments for this post
      loadComments(postId);
      
      return data;
    } catch (error) {
      console.error('Error in createComment:', error);
    }
  }, [user, loadComments]);

  const toggleLike = useCallback(async (
    postId?: string,
    commentId?: string
  ) => {
    if (!user) return;

    try {
      if (postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (post.liked_by_user) {
          // Unlike
          await supabase
            .from('community_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);

          await supabase.rpc('decrement_likes_count_post', { post_id: postId });
          
          setPosts(prev =>
            prev.map(p =>
              p.id === postId
                ? { ...p, likes_count: p.likes_count - 1, liked_by_user: false }
                : p
            )
          );
        } else {
          // Like
          await supabase
            .from('community_likes')
            .insert({
              user_id: user.id,
              post_id: postId
            });

          await supabase.rpc('increment_likes_count_post', { post_id: postId });
          
          setPosts(prev =>
            prev.map(p =>
              p.id === postId
                ? { ...p, likes_count: p.likes_count + 1, liked_by_user: true }
                : p
            )
          );
        }
      }

      if (commentId) {
        // Similar logic for comments
        const allComments = Object.values(comments).flat();
        const findComment = (comments: CommunityComment[]): CommunityComment | undefined => {
          for (const comment of comments) {
            if (comment.id === commentId) return comment;
            if (comment.replies) {
              const found = findComment(comment.replies);
              if (found) return found;
            }
          }
        };
        
        const comment = findComment(allComments);
        if (!comment) return;

        if (comment.liked_by_user) {
          // Unlike comment
          await supabase
            .from('community_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('comment_id', commentId);

          await supabase.rpc('decrement_likes_count_comment', { comment_id: commentId });
        } else {
          // Like comment
          await supabase
            .from('community_likes')
            .insert({
              user_id: user.id,
              comment_id: commentId
            });

          await supabase.rpc('increment_likes_count_comment', { comment_id: commentId });
        }

        // Reload comments to update UI
        if (comment.post_id) {
          loadComments(comment.post_id);
        }
      }
    } catch (error) {
      console.error('Error in toggleLike:', error);
    }
  }, [user, posts, comments, loadComments]);

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
          loadPosts(); // Reload posts when changes occur
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