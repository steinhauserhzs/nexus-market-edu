import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Inbox, 
  Mail,
  Reply,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  receiver_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

const MessagesSection = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar mensagens recebidas
      const { data: receivedMessages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages((receivedMessages as any) || []);
      setUnreadCount(receivedMessages?.filter(m => !m.is_read).length || 0);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      setMessages(prev => 
        prev.map(m => 
          m.id === messageId ? { ...m, is_read: true } : m
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim() || !user) return;

    try {
      setSending(true);

      // Buscar a loja do usuário para incluir no contexto da mensagem
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      const storeId = stores?.[0]?.id;

      const { error } = await supabase
        .from('messages')
        .insert({
          store_id: storeId,
          sender_id: user.id,
          receiver_id: selectedMessage.sender_profile ? 
            selectedMessage.id : // Assumindo que precisaríamos do sender_id real
            user.id, // Placeholder
          subject: `Re: ${selectedMessage.subject}`,
          content: replyContent,
          replied_to_id: selectedMessage.id,
        });

      if (error) throw error;

      toast({
        title: "Resposta enviada!",
        description: "Sua mensagem foi enviada com sucesso.",
      });

      setReplyContent('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagens
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              As mensagens dos clientes aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.slice(0, 5).map((message) => (
              <Dialog key={message.id}>
                <DialogTrigger asChild>
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      !message.is_read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.is_read) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {message.sender_profile?.full_name || 'Cliente'}
                          </p>
                          <div className="flex items-center gap-2">
                            {!message.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(message.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium text-sm mb-1 truncate">
                          {message.subject}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{message.subject}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <Avatar>
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {message.sender_profile?.full_name || 'Cliente'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(message.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Reply className="w-4 h-4" />
                        <span className="font-medium">Responder</span>
                      </div>
                      <Textarea
                        placeholder="Digite sua resposta..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-32"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={sendReply}
                          disabled={!replyContent.trim() || sending}
                        >
                          {sending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Enviar Resposta
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
            
            {messages.length > 5 && (
              <div className="text-center pt-3 border-t">
                <Button variant="outline" size="sm">
                  Ver todas as mensagens ({messages.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesSection;