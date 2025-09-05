import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users } from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  store_id: string;
  created_by: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: string;
  metadata: any;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string;
  };
}

interface RealTimeChatProps {
  storeId: string;
}

export default function RealTimeChat({ storeId }: RealTimeChatProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadRooms();
  }, [storeId]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
      joinRoom(selectedRoom);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`room-${selectedRoom}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${selectedRoom}`,
          },
          async (payload) => {
            const newMessage = payload.new as ChatMessage;
            // Get profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newMessage.user_id)
              .single();
            
            setMessages(prev => [...prev, { ...newMessage, profile }]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
      
      // Auto-select first room if available
      if (data && data.length > 0) {
        setSelectedRoom(data[0].id);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles for all messages
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const messagesWithProfiles = data?.map(message => ({
        ...message,
        profile: profilesMap.get(message.user_id) || { full_name: 'Unknown', avatar_url: '' },
      })) || [];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      // Check if already a participant
      const { data: existing } = await supabase
        .from('chat_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        // Join the room
        await supabase
          .from('chat_participants')
          .insert({
            room_id: roomId,
            user_id: user.id,
          });
      } else {
        // Update last seen
        await supabase
          .from('chat_participants')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          room_id: selectedRoom,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text',
        });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Rooms Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Salas de Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedRoom(room.id)}
              >
                <div className="flex flex-col items-start">
                  <span>{room.name}</span>
                  {room.is_private && (
                    <Badge variant="secondary" className="text-xs">Privada</Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>
            {selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name : 'Selecione uma sala'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedRoom ? (
            <div className="flex flex-col h-[450px]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.user_id !== user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.profile?.avatar_url} />
                          <AvatarFallback>
                            {message.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${message.user_id === user?.id ? 'order-first' : ''}`}>
                        {message.user_id !== user?.id && (
                          <p className="text-sm font-semibold mb-1">
                            {message.profile?.full_name}
                          </p>
                        )}
                        <div className={`rounded-lg p-3 ${
                          message.user_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {message.user_id === user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.profile?.avatar_url} />
                          <AvatarFallback>
                            {message.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[450px]">
              <p className="text-muted-foreground">Selecione uma sala para começar a conversar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}