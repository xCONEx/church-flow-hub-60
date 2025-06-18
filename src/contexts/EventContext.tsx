
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, EventRegistration, EventGuest } from '@/types';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase } from '@/integrations/supabase/client';

interface EventContextType {
  events: Event[];
  activeEvents: Event[];
  registrations: EventRegistration[];
  guests: EventGuest[];
  createEvent: (eventData: Partial<Event>) => Promise<Event>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  registerForEvent: (eventId: string, attendeeData?: Partial<EventGuest>) => Promise<EventRegistration>;
  checkInAttendee: (registrationId: string, readerEmail: string) => Promise<void>;
  getEventRegistrations: (eventId: string) => EventRegistration[];
  loading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, church } = useAuth();
  const { addNotification } = useNotifications();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [loading, setLoading] = useState(false);

  const activeEvents = events.filter(event => 
    event.status === 'published' && 
    event.date > new Date() &&
    event.churchId === church?.id
  );

  const loadEvents = async () => {
    if (!church?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('church_id', church.id)
        .order('date', { ascending: true });

      if (error) throw error;

      const mappedEvents: Event[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: new Date(event.date),
        location: event.location,
        churchId: event.church_id,
        createdBy: event.created_by,
        maxAttendees: event.max_attendees,
        isPublic: event.is_public,
        status: event.status,
        qrReaders: event.qr_readers || [],
        registrationDeadline: event.registration_deadline ? new Date(event.registration_deadline) : undefined,
        tags: event.tags || [],
        image: event.image,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    if (!church?.id) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events!inner(church_id)
        `)
        .eq('events.church_id', church.id);

      if (error) throw error;

      const mappedRegistrations: EventRegistration[] = (data || []).map(reg => ({
        id: reg.id,
        eventId: reg.event_id,
        attendeeId: reg.attendee_id,
        attendeeType: reg.attendee_type as 'member' | 'guest',
        qrCode: reg.qr_code,
        registeredAt: new Date(reg.registered_at),
        checkedIn: reg.checked_in,
        checkedInAt: reg.checked_in_at ? new Date(reg.checked_in_at) : undefined,
        checkedInBy: reg.checked_in_by,
      }));

      setRegistrations(mappedRegistrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  useEffect(() => {
    if (church?.id) {
      loadEvents();
      loadRegistrations();
    }
  }, [church?.id]);

  const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
    if (!church?.id || !user?.id) throw new Error('Church or user not found');

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title || '',
          description: eventData.description || '',
          date: eventData.date?.toISOString() || new Date().toISOString(),
          location: eventData.location || '',
          church_id: church.id,
          created_by: user.id,
          max_attendees: eventData.maxAttendees,
          is_public: eventData.isPublic || false,
          status: 'draft',
          qr_readers: eventData.qrReaders || [],
          registration_deadline: eventData.registrationDeadline?.toISOString(),
          tags: eventData.tags || [],
          image: eventData.image,
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        date: new Date(data.date),
        location: data.location,
        churchId: data.church_id,
        createdBy: data.created_by,
        maxAttendees: data.max_attendees,
        isPublic: data.is_public,
        status: data.status,
        qrReaders: data.qr_readers || [],
        registrationDeadline: data.registration_deadline ? new Date(data.registration_deadline) : undefined,
        tags: data.tags || [],
        image: data.image,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date?.toISOString(),
          location: eventData.location,
          max_attendees: eventData.maxAttendees,
          is_public: eventData.isPublic,
          status: eventData.status,
          qr_readers: eventData.qrReaders,
          registration_deadline: eventData.registrationDeadline?.toISOString(),
          tags: eventData.tags,
          image: eventData.image,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      const event = events.find(e => e.id === eventId);
      const wasPublished = event?.status === 'published';
      const isBeingPublished = eventData.status === 'published' && !wasPublished;
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...eventData, updatedAt: new Date() }
          : event
      ));

      if (isBeingPublished && event) {
        addNotification({
          type: 'event',
          title: 'Novo Evento Publicado',
          message: `O evento "${event.title}" foi publicado. Inscrições abertas!`,
          eventId: event.id
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== eventId));
      setRegistrations(prev => prev.filter(reg => reg.eventId !== eventId));
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string, attendeeData?: Partial<EventGuest>): Promise<EventRegistration> => {
    setLoading(true);

    try {
      let attendeeId = user?.id || '';
      let attendeeType: 'member' | 'guest' = 'member';

      if (attendeeData && !user) {
        const { data: guestData, error: guestError } = await supabase
          .from('event_guests')
          .insert({
            name: attendeeData.name || '',
            email: attendeeData.email || '',
            phone: attendeeData.phone,
            document: attendeeData.document,
          })
          .select()
          .single();

        if (guestError) throw guestError;

        const newGuest: EventGuest = {
          id: guestData.id,
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          document: guestData.document,
          createdAt: new Date(guestData.created_at),
        };
        
        setGuests(prev => [...prev, newGuest]);
        attendeeId = newGuest.id;
        attendeeType = 'guest';
      }

      const qrCode = `QR-EVT${eventId}-${attendeeType.toUpperCase()}${attendeeId}-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          attendee_id: attendeeId,
          attendee_type: attendeeType,
          qr_code: qrCode,
        })
        .select()
        .single();

      if (error) throw error;

      const newRegistration: EventRegistration = {
        id: data.id,
        eventId: data.event_id,
        attendeeId: data.attendee_id,
        attendeeType: data.attendee_type as 'member' | 'guest',
        qrCode: data.qr_code,
        registeredAt: new Date(data.registered_at),
        checkedIn: data.checked_in,
        checkedInAt: data.checked_in_at ? new Date(data.checked_in_at) : undefined,
        checkedInBy: data.checked_in_by,
      };

      setRegistrations(prev => [...prev, newRegistration]);
      return newRegistration;
    } finally {
      setLoading(false);
    }
  };

  const checkInAttendee = async (registrationId: string, readerEmail: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: readerEmail,
        })
        .eq('id', registrationId);

      if (error) throw error;

      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId
          ? {
              ...reg,
              checkedIn: true,
              checkedInAt: new Date(),
              checkedInBy: readerEmail
            }
          : reg
      ));
    } finally {
      setLoading(false);
    }
  };

  const getEventRegistrations = (eventId: string): EventRegistration[] => {
    return registrations.filter(reg => reg.eventId === eventId);
  };

  return (
    <EventContext.Provider value={{
      events,
      activeEvents,
      registrations,
      guests,
      createEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      checkInAttendee,
      getEventRegistrations,
      loading,
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
