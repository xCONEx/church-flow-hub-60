
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
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  churchId: string;
  leaderId?: string;
  collaborators: string[];
  type: 'louvor' | 'louvor-juniores' | 'louvor-teens' | 'midia' | 'midia-juniores' | 'sonoplastia' | 'instrumentos' | 'custom';
  createdAt: Date;
}

export interface Scale {
  id: string;
  title: string;
  date: Date;
  churchId: string;
  departmentId: string;
  createdBy: string;
  collaborators: {
    userId: string;
    role: string;
    confirmed: boolean;
    invitedAt: Date;
  }[];
  songs?: string[];
  notes?: string;
  status: 'draft' | 'published' | 'completed';
  createdAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo?: string;
  genre?: string;
  youtubeUrl?: string;
  cifraUrl?: string;
  lyrics?: string;
  churchId: string;
  addedBy: string;
  tags: string[];
  createdAt: Date;
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
