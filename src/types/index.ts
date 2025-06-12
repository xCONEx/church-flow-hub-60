
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'master' | 'admin' | 'leader' | 'collaborator' | 'member';
  churchId?: string;
  departmentId?: string;
  avatar?: string;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  skills?: string[];
  joinedAt: Date;
  lastActive?: Date;
}

export interface Church {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  adminId: string;
  departments: Department[];
  serviceTypes: string[]; // Types of services/cultos
  courses: Course[];
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  churchId: string;
  leaderId?: string;
  collaborators: string[];
  type: 'louvor' | 'louvor-juniores' | 'louvor-teens' | 'midia' | 'midia-juniores' | 'sonoplastia' | 'instrumentos' | 'recepcao' | 'ministracao' | 'palavra' | 'oracao' | 'custom';
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  churchId: string;
  createdAt: Date;
}

export interface Scale {
  id: string;
  title: string;
  date: Date;
  serviceType: string; // Changed from departmentId
  churchId: string;
  departmentId: string;
  createdBy: string;
  collaborators: {
    userId: string;
    role: string;
    confirmed: boolean;
    invitedAt: Date;
  }[];
  songs?: ScaleSong[];
  agenda?: AgendaItem[];
  notes?: string;
  status: 'draft' | 'published' | 'completed';
  createdAt: Date;
}

export interface ScaleSong {
  songId: string;
  title: string;
  artist: string;
  originalKey: string;
  scaleKey: string; // Key for this scale
  order: number;
  notes?: string;
  links?: string[];
}

export interface AgendaItem {
  id: string;
  time: string;
  block: string;
  description: string;
  key?: string;
  notes?: string;
  order: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo?: string;
  bpm?: number;
  genre?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  cifraUrl?: string;
  lyrics?: string;
  churchId: string;
  addedBy: string;
  tags: string[];
  createdAt: Date;
}

export interface Invite {
  id: string;
  email: string;
  name: string;
  role: 'leader' | 'collaborator';
  departmentId: string;
  churchId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthContextType {
  user: User | null;
  church: Church | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}
