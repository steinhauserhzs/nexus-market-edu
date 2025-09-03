import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/ui/seo-head";
import BackNavigation from "@/components/layout/back-navigation";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  ExternalLink,
  Ticket,
  Info,
  Car,
  Accessibility
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventTicket {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  quantity_available: number;
  quantity_sold: number;
}

interface EventImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

interface EventDetails {
  id: string;
  title: string;
  description: string;
  event_date: string;
  category: string;
  event_type: string;
  price_from: number;
  max_capacity: number;
  banner_url: string;
  contact_email: string;
  contact_phone: string;
  age_restriction: string;
  terms_and_conditions: string;
  venues: {
    name: string;
    address: string;
    city: string;
    state: string;
    capacity: number;
    description: string;
    contact_phone: string;
    contact_email: string;
    website_url: string;
    parking_available: boolean;
    accessibility_features: string[];
    facilities: string[];
  };
  event_tickets: EventTicket[];
  event_images: EventImage[];
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues (*),
          event_tickets (*),
          event_images (*)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      console.error('Error fetching event details:', error);
      toast({
        title: "Erro ao carregar evento",
        description: "Evento não encontrado ou indisponível.",
        variant: "destructive",
      });
      navigate('/eventos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event?.event_tickets.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price_cents * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleBuyTickets = () => {
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      toast({
        title: "Selecione os ingressos",
        description: "Escolha pelo menos um ingresso para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Here you would integrate with checkout system
    toast({
      title: "Em desenvolvimento",
      description: "Sistema de compra de ingressos em breve!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 md:h-96 bg-muted rounded-lg mb-8" />
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <Button onClick={() => navigate('/eventos')}>
            Ver Todos os Eventos
          </Button>
        </div>
      </div>
    );
  }

  const primaryImage = event.event_images.find(img => img.is_primary) || event.event_images[0];

  return (
    <>
      <SEOHead 
        title={`${event.title} - Ingressos`}
        description={event.description}
      />
      
      <div className="min-h-screen bg-background">
        <BackNavigation />
        
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img 
            src={primaryImage?.image_url || event.banner_url} 
            alt={primaryImage?.alt_text || event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-6 left-6 right-6">
            <Badge className="mb-4">{event.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                {formatDate(event.event_date)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {event.venues.city}/{event.venues.state}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Sobre o Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {/* Venue Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Local do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{event.venues.name}</h4>
                    <p className="text-muted-foreground">{event.venues.address}</p>
                    <p className="text-muted-foreground">{event.venues.city}/{event.venues.state}</p>
                  </div>
                  
                  {event.venues.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.venues.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      Capacidade: {event.venues.capacity} pessoas
                    </div>
                    {event.venues.parking_available && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4" />
                        Estacionamento disponível
                      </div>
                    )}
                  </div>

                  {event.venues.accessibility_features.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Accessibility className="w-4 h-4" />
                        Acessibilidade
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.venues.accessibility_features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.venues.facilities.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Facilidades</div>
                      <div className="flex flex-wrap gap-1">
                        {event.venues.facilities.map((facility, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2">
                    {event.venues.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4" />
                        {event.venues.contact_phone}
                      </div>
                    )}
                    {event.venues.website_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        <a href={event.venues.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Site do local
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
              {event.terms_and_conditions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Termos e Condições</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {event.terms_and_conditions}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Tickets */}
            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Ingressos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.event_tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{ticket.name}</h4>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {formatPrice(ticket.price_cents)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.quantity_available - ticket.quantity_sold} disponíveis
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketQuantity(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                          disabled={(selectedTickets[ticket.id] || 0) === 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">
                          {selectedTickets[ticket.id] || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketQuantity(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                          disabled={(selectedTickets[ticket.id] || 0) >= (ticket.quantity_available - ticket.quantity_sold)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}

                  {getTotalTickets() > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg text-primary">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleBuyTickets}
                      >
                        Comprar {getTotalTickets()} ingresso{getTotalTickets() > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      Classificação: {event.age_restriction === 'all_ages' ? 'Livre' : event.age_restriction}
                    </div>
                    {event.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {event.contact_phone}
                      </div>
                    )}
                    {event.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {event.contact_email}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;