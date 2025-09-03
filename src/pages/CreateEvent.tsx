import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEOHead from "@/components/ui/seo-head";
import BackNavigation from "@/components/layout/back-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, MapPin, Users, DollarSign, Plus, Trash2 } from "lucide-react";

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface TicketType {
  name: string;
  description: string;
  price_cents: number;
  quantity_available: number;
}

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    venue_id: '',
    category: '',
    event_type: 'paid',
    max_capacity: '',
    banner_url: '',
    contact_email: '',
    contact_phone: '',
    age_restriction: 'all_ages',
    terms_and_conditions: '',
  });

  const [tickets, setTickets] = useState<TicketType[]>([
    { name: '', description: '', price_cents: 0, quantity_available: 0 }
  ]);

  const categories = ['Música', 'Teatro', 'Tecnologia', 'Esporte', 'Arte', 'Negócios', 'Educação'];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVenues();
  }, [user, navigate]);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, city, state')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error: any) {
      console.error('Error fetching venues:', error);
      toast({
        title: "Erro ao carregar locais",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setTickets(prev => [...prev, { name: '', description: '', price_cents: 0, quantity_available: 0 }]);
  };

  const removeTicketType = (index: number) => {
    if (tickets.length > 1) {
      setTickets(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTicket = (index: number, field: string, value: any) => {
    setTickets(prev => prev.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    ));
  };

  const calculatePriceFrom = () => {
    const prices = tickets.filter(t => t.price_cents > 0).map(t => t.price_cents);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.event_date || !formData.venue_id || !formData.category) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const validTickets = tickets.filter(t => t.name && t.price_cents >= 0 && t.quantity_available > 0);
      if (validTickets.length === 0) {
        throw new Error('Adicione pelo menos um tipo de ingresso válido');
      }

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          ...formData,
          organizer_id: user.id,
          max_capacity: parseInt(formData.max_capacity) || null,
          price_from: calculatePriceFrom(),
          status: 'draft',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create tickets
      const ticketPromises = validTickets.map(ticket =>
        supabase.from('event_tickets').insert({
          event_id: event.id,
          ...ticket,
          sale_start_date: new Date().toISOString(),
          sale_end_date: formData.event_date,
        })
      );

      await Promise.all(ticketPromises);

      toast({
        title: "Evento criado com sucesso!",
        description: "Seu evento foi salvo como rascunho. Você pode publicá-lo quando estiver pronto.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <SEOHead 
        title="Criar Evento - Organize seu evento"
        description="Crie e gerencie eventos incríveis. Venda ingressos online de forma fácil e segura."
      />
      
      <div className="min-h-screen bg-background">
        <BackNavigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Criar Novo Evento
              </h1>
              <p className="text-lg text-muted-foreground">
                Organize eventos incríveis e venda ingressos online
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título do Evento *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="Nome do seu evento"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Descreva seu evento em detalhes"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Data e Hora *</Label>
                      <Input
                        id="event_date"
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={(e) => updateFormData('event_date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_capacity">Capacidade Máxima</Label>
                      <Input
                        id="max_capacity"
                        type="number"
                        value={formData.max_capacity}
                        onChange={(e) => updateFormData('max_capacity', e.target.value)}
                        placeholder="Ex: 500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="banner_url">URL da Imagem do Banner</Label>
                    <Input
                      id="banner_url"
                      value={formData.banner_url}
                      onChange={(e) => updateFormData('banner_url', e.target.value)}
                      placeholder="https://exemplo.com/imagem-banner.jpg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Venue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Local do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="venue_id">Selecione o Local *</Label>
                    <Select value={formData.venue_id} onValueChange={(value) => updateFormData('venue_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um local" />
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map(venue => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name} - {venue.city}/{venue.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tipos de Ingresso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Ingresso {index + 1}</h4>
                        {tickets.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTicketType(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome do Ingresso</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => updateTicket(index, 'name', e.target.value)}
                            placeholder="Ex: Pista, VIP, Camarote"
                          />
                        </div>
                        <div>
                          <Label>Preço (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ticket.price_cents / 100}
                            onChange={(e) => updateTicket(index, 'price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Quantidade Disponível</Label>
                          <Input
                            type="number"
                            value={ticket.quantity_available}
                            onChange={(e) => updateTicket(index, 'quantity_available', parseInt(e.target.value || '0'))}
                            placeholder="100"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label>Descrição</Label>
                          <Input
                            value={ticket.description}
                            onChange={(e) => updateTicket(index, 'description', e.target.value)}
                            placeholder="Descreva o que está incluso"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTicketType}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Tipo de Ingresso
                  </Button>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email">Email de Contato</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => updateFormData('contact_email', e.target.value)}
                        placeholder="contato@evento.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone">Telefone de Contato</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => updateFormData('contact_phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="age_restriction">Classificação Etária</Label>
                    <Select value={formData.age_restriction} onValueChange={(value) => updateFormData('age_restriction', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_ages">Livre para todas as idades</SelectItem>
                        <SelectItem value="12+">Maiores de 12 anos</SelectItem>
                        <SelectItem value="16+">Maiores de 16 anos</SelectItem>
                        <SelectItem value="18+">Maiores de 18 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="terms_and_conditions">Termos e Condições</Label>
                    <Textarea
                      id="terms_and_conditions"
                      value={formData.terms_and_conditions}
                      onChange={(e) => updateFormData('terms_and_conditions', e.target.value)}
                      placeholder="Regras e condições do evento"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Criando...' : 'Criar Evento (Rascunho)'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;