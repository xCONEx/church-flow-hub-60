

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
  language?: string;
  darkMode?: boolean;
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
  parentDepartmentId?: string; // Para sub-departamentos
  isSubDepartment?: boolean;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  churchId: string;
  departmentId?: string; // Novo campo para associar ao departamento
  instructorId?: string;
  modules: CourseModule[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  createdAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content?: string;
  order: number;
  files: LessonFile[];
  videoUrl?: string;
  duration?: number; // em minutos
  createdAt: Date;
}

export interface LessonFile {
  id: string;
  lessonId: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'other';
  url: string;
  size: number; // em bytes
  uploadedAt: Date;
}

export interface UserCourseProgress {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
  completedLessons: string[];
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

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  churchId: string;
  createdBy: string;
  maxAttendees?: number; // undefined para ilimitado
  isPublic: boolean; // se o evento é aberto ao público
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  qrReaders: string[]; // emails das pessoas que podem ler QR codes
  registrationDeadline?: Date;
  tags: string[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  attendeeId: string; // pode ser userId ou guestId
  attendeeType: 'member' | 'guest';
  qrCode: string; // código único para o QR
  registeredAt: Date;
  checkedIn: boolean;
  checkedInAt?: Date;
  checkedInBy?: string; // email de quem fez o check-in
}

export interface EventGuest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string; // CPF ou outro documento
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

