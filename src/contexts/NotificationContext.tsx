
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'scale' | 'course';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  scaleId?: string;
  courseId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock data para demonstração - em produção virá da API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'scale',
    title: 'Nova Escala',
    message: 'Você foi adicionado à escala "Culto Domingo Manhã" do dia 15/12/2024',
    date: new Date('2024-12-12T10:00:00'),
    read: false,
    scaleId: '1'
  },
  {
    id: '2',
    type: 'course',
    title: 'Novo Curso',
    message: 'Curso "Fundamentos da Adoração" foi adicionado à plataforma',
    date: new Date('2024-12-11T14:30:00'),
    read: false,
    courseId: '1'
  },
  {
    id: '3',
    type: 'scale',
    title: 'Confirmação Pendente',
    message: 'Confirme sua presença na escala "Reunião de Oração" do dia 17/12/2024',
    date: new Date('2024-12-10T16:00:00'),
    read: true,
    scaleId: '2'
  }
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Carregar notificações do usuário
    if (user) {
      // Em produção, filtrar notificações por usuário
      setNotifications(mockNotifications);
    }
  }, [user]);

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
