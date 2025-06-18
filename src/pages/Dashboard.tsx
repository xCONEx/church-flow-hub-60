
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Music, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRepertoire } from '@/hooks/useRepertoire';
import { useMembers } from '@/hooks/useMembers';
import { useInvites } from '@/hooks/useInvites';
import { useEvents } from '@/contexts/EventContext';

export const Dashboard = () => {
  const { user, church } = useAuth();
  const { songs, isLoading: songsLoading } = useRepertoire();
  const { members, isLoading: membersLoading } = useMembers();
  const { invites, isLoading: invitesLoading } = useInvites();
  const { activeEvents, loading: eventsLoading } = useEvents();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // Compile recent activities from all data sources
    const activities = [];

    // Add recent songs
    const recentSongs = songs.slice(0, 2);
    recentSongs.forEach(song => {
      activities.push({
        id: `song-${song.id}`,
        description: 'Nova música adicionada ao repertório',
        details: `"${song.title}" por ${song.artist}`,
        timestamp: song.createdAt,
        type: 'song'
      });
    });

    // Add recent invites
    const recentInvites = invites.slice(0, 2);
    recentInvites.forEach(invite => {
      activities.push({
        id: `invite-${invite.id}`,
        description: 'Novo convite enviado',
        details: `Convite para ${invite.name} (${invite.role})`,
        timestamp: invite.createdAt,
        type: 'invite'
      });
    });

    // Add recent events
    const recentEvents = activeEvents.slice(0, 1);
    recentEvents.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        description: 'Novo evento criado',
        details: event.title,
        timestamp: new Date(event.createdAt),
        type: 'event'
      });
    });

    // Sort by timestamp and take only the most recent
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivities(activities.slice(0, 3));
  }, [songs, invites, activeEvents]);

  const stats = [
    {
      title: 'Próx�mos Eventos',
      value: eventsLoading ? '...' : activeEvents.length.toString(),
      description: 'Ativos',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Membros Ativos',
      value: membersLoading ? '...' : members.length.toString(),
      description: 'Total cadastrados',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Músicas',
      value: songsLoading ? '...' : songs.length.toString(),
      description: 'No repertório',
      icon: Music,
      color: 'text-purple-600'
    },
    {
      title: 'Convites',
      value: invitesLoading ? '...' : invites.filter(i => i.status === 'pending').length.toString(),
      description: 'Pendentes',
      icon: Bell,
      color: 'text-orange-600'
    }
  ];

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `há ${minutes} min`;
    } else if (hours < 24) {
      return `há ${hours}h`;
    } else {
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'song': return 'bg-purple-500';
      case 'invite': return 'bg-blue-500';
      case 'event': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao {church?.name || 'painel da igreja'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>
                Eventos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsLoading ? (
                  <div className="text-center py-4 text-gray-500">Carregando eventos...</div>
                ) : activeEvents.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nenhum evento programado</div>
                ) : (
                  activeEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {event.location}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas atividades da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nenhuma atividade recente</div>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
