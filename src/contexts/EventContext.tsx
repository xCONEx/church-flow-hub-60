
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, EventRegistration, EventGuest } from '@/types';
import { useAuth } from './AuthContext';

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
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Mock data para desenvolvimento
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Conferência de Jovens 2024',
    description: 'Uma conferência especial para jovens com palestras, música e fellowship.',
    date: new Date('2024-12-20'),
    location: 'Auditório Principal',
    churchId: '1',
    createdBy: '1',
    maxAttendees: 200,
    isPublic: true,
    status: 'published',
    qrReaders: ['admin@igreja.com', 'lider@igreja.com'],
    registrationDeadline: new Date('2024-12-18'),
    tags: ['jovens', 'conferência'],
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: '2',
    title: 'Retiro Espiritual',
    description: 'Fim de semana de renovação espiritual em local reservado.',
    date: new Date('2024-12-15'),
    location: 'Chácara Bethel',
    churchId: '1',
    createdBy: '2',
    maxAttendees: 50,
    isPublic: false,
    status: 'published',
    qrReaders: ['lider@igreja.com'],
    registrationDeadline: new Date('2024-12-10'),
    tags: ['retiro', 'espiritual'],
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
  }
];

const mockRegistrations: EventRegistration[] = [
  {
    id: '1',
    eventId: '1',
    attendeeId: '3',
    attendeeType: 'member',
    qrCode: 'QR-EVT1-USER3-2024',
    registeredAt: new Date('2024-11-05'),
    checkedIn: false,
  }
];

const mockGuests: EventGuest[] = [];

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, church } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(mockRegistrations);
  const [guests, setGuests] = useState<EventGuest[]>(mockGuests);
  const [isLoading, setIsLoading] = useState(false);

  const activeEvents = events.filter(event => 
    event.status === 'published' && 
    event.date > new Date() &&
    event.churchId === church?.id
  );

  const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
    setIsLoading(true);
    
    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title || '',
      description: eventData.description || '',
      date: eventData.date || new Date(),
      location: eventData.location || '',
      churchId: church?.id || '',
      createdBy: user?.id || '',
      maxAttendees: eventData.maxAttendees,
      isPublic: eventData.isPublic || false,
      status: 'draft',
      qrReaders: eventData.qrReaders || [],
      registrationDeadline: eventData.registrationDeadline,
      tags: eventData.tags || [],
      image: eventData.image,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setEvents(prev => [...prev, newEvent]);
    setIsLoading(false);
    return newEvent;
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    setIsLoading(true);
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...eventData, updatedAt: new Date() }
        : event
    ));
    setIsLoading(false);
  };

  const deleteEvent = async (eventId: string) => {
    setIsLoading(true);
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setRegistrations(prev => prev.filter(reg => reg.eventId !== eventId));
    setIsLoading(false);
  };

  const registerForEvent = async (eventId: string, attendeeData?: Partial<EventGuest>): Promise<EventRegistration> => {
    setIsLoading(true);

    let attendeeId = user?.id || '';
    let attendeeType: 'member' | 'guest' = 'member';

    // Se tem dados de convidado, criar o convidado
    if (attendeeData && !user) {
      const newGuest: EventGuest = {
        id: Date.now().toString(),
        name: attendeeData.name || '',
        email: attendeeData.email || '',
        phone: attendeeData.phone,
        document: attendeeData.document,
        createdAt: new Date(),
      };
      
      setGuests(prev => [...prev, newGuest]);
      attendeeId = newGuest.id;
      attendeeType = 'guest';
    }

    const qrCode = `QR-EVT${eventId}-${attendeeType.toUpperCase()}${attendeeId}-${Date.now()}`;
    
    const newRegistration: EventRegistration = {
      id: Date.now().toString(),
      eventId,
      attendeeId,
      attendeeType,
      qrCode,
      registeredAt: new Date(),
      checkedIn: false,
    };

    setRegistrations(prev => [...prev, newRegistration]);
    setIsLoading(false);
    return newRegistration;
  };

  const checkInAttendee = async (registrationId: string, readerEmail: string) => {
    setIsLoading(true);
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
    setIsLoading(false);
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
      isLoading,
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
