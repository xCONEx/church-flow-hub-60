
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'scale' | 'course' | 'event' | 'invite' | 'song';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  scaleId?: string;
  courseId?: string;
  eventId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, church } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initialize with some example notifications
    if (user && church) {
      const initialNotifications: Notification[] = [
        {
          id: '1',
          type: 'event',
          title: 'Novos Eventos Disponíveis',
          message: 'Confira os eventos programados para este mês',
          date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
        },
        {
          id: '2',
          type: 'song',
          title: 'Repertório Atualizado',
          message: 'Novas músicas foram adicionadas ao repertório',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
        },
        {
          id: '3',
          type: 'invite',
          title: 'Novos Membros',
          message: 'Convites pendentes precisam de atenção',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
        }
      ];
      
      setNotifications(initialNotifications);
    }
  }, [user, church]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification =>
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (newNotification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString(),
      date: new Date(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
