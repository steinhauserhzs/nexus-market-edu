import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useCommunity } from '@/hooks/use-community';
import { Heart, MessageCircle, Pin, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityHubProps {
  storeId: string;
}

export default function CommunityHub({ storeId }: CommunityHubProps) {
  const { posts, comments, loading, loadPosts, loadComments, createPost, createComment, toggleLike } = useCommunity(storeId);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    
    try {
      await createPost(newPost.title, newPost.content);
      setNewPost({ title: '', content: '' });
      setShowCreatePost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!newComment) return;
    
    try {
      await createComment(postId, newComment);
      setNewComment('');
      loadComments(postId);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handlePostClick = (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
    } else {
      setSelectedPost(postId);
      loadComments(postId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comunidade</h2>
        <Button 
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Publicação
        </Button>
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Publicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título da publicação"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <Textarea
              placeholder="Conte o que você está pensando..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePost}>Publicar</Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {posts.map((post) => (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={post.profile.avatar_url} />
                  <AvatarFallback>
                    {post.profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{post.profile.full_name}</span>
                    {post.is_pinned && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Fixado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div onClick={() => handlePostClick(post.id)}>
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-muted-foreground mb-4">{post.content}</p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={cn(
                    "flex items-center gap-2",
                    post.liked_by_user && "text-red-500"
                  )}
                >
                  <Heart className={cn("h-4 w-4", post.liked_by_user && "fill-current")} />
                  {post.likes_count}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handlePostClick(post.id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count}
                </Button>
              </div>

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  
                  {/* New Comment */}
                  <div className="flex gap-4">
                    <Textarea
                      placeholder="Escreva um comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={() => handleCreateComment(post.id)}>
                      Comentar
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                      {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.profile.avatar_url} />
                          <AvatarFallback>
                            {comment.profile.full_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="font-semibold text-sm mb-1">
                              {comment.profile.full_name}
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleLike(undefined, comment.id)}
                              className={cn(
                                "text-xs",
                                comment.liked_by_user && "text-red-500"
                              )}
                            >
                              <Heart className={cn("h-3 w-3 mr-1", comment.liked_by_user && "fill-current")} />
                              {comment.likes_count}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma publicação ainda. Seja o primeiro a compartilhar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}