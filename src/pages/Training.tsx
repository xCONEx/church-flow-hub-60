
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Users, Search, Filter, Star, Play, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddCourseDialog } from '@/components/AddCourseDialog';
import { CourseDetailsModal } from '@/components/CourseDetailsModal';
import { Course, Department } from '@/types';

export const Training = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  // Mock departments
  const [departments] = useState<Department[]>([
    { 
      id: '1', 
      name: 'Louvor', 
      type: 'louvor', 
      churchId: '1',
      leaderId: '2', 
      collaborators: ['2', '3'], 
      createdAt: new Date() 
    },
    { 
      id: '2', 
      name: 'Mídia', 
      type: 'midia', 
      churchId: '1',
      collaborators: ['6', '7'], 
      createdAt: new Date() 
    },
  ]);

  // Mock courses with modules and lessons
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      name: 'Curso de Vocal',
      description: 'Técnicas básicas e avançadas de canto para o ministério de louvor',
      churchId: '1',
      departmentId: '1',
      instructorId: '2',
      isActive: true,
      tags: ['vocal', 'louvor', 'básico'],
      modules: [
        {
          id: '1',
          courseId: '1',
          title: 'Fundamentos do Canto',
          description: 'Respiração, postura e aquecimento vocal',
          order: 1,
          lessons: [
            {
              id: '1',
              moduleId: '1',
              title: 'Respiração Diafragmática',
              content: 'Aprenda a respirar corretamente para cantar',
              order: 1,
              duration: 15,
              files: [
                {
                  id: '1',
                  lessonId: '1',
                  name: 'Exercícios de Respiração.pdf',
                  type: 'pdf',
                  url: '#',
                  size: 1024000,
                  uploadedAt: new Date()
                }
              ],
              videoUrl: 'https://youtube.com/watch?v=example',
              createdAt: new Date()
            },
            {
              id: '2',
              moduleId: '1',
              title: 'Aquecimento Vocal',
              order: 2,
              duration: 20,
              files: [],
              createdAt: new Date()
            }
          ],
          createdAt: new Date()
        },
        {
          id: '2',
          courseId: '1',
          title: 'Técnicas Avançadas',
          order: 2,
          lessons: [
            {
              id: '3',
              moduleId: '2',
              title: 'Vibrato e Melismas',
              order: 1,
              duration: 25,
              files: [],
              createdAt: new Date()
            }
          ],
          createdAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Operação de Mesa de Som',
      description: 'Como operar equipamentos de áudio durante os cultos',
      churchId: '1',
      departmentId: '2',
      instructorId: '6',
      isActive: true,
      tags: ['áudio', 'técnico', 'sonoplastia'],
      modules: [
        {
          id: '3',
          courseId: '2',
          title: 'Básico de Áudio',
          order: 1,
          lessons: [
            {
              id: '4',
              moduleId: '3',
              title: 'Conhecendo a Mesa',
              order: 1,
              duration: 30,
              files: [],
              createdAt: new Date()
            }
          ],
          createdAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Filtrar cursos baseado no departamento do usuário
  const getAvailableCourses = () => {
    if (!user) return [];
    
    return courses.filter(course => {
      // Se o curso não tem departamento específico, está disponível para todos
      if (!course.departmentId) return true;
      
      // Se o usuário é admin, pode ver todos os cursos
      if (user.role === 'admin') return true;
      
      // Se o usuário tem departamento, pode ver cursos do seu departamento
      if (user.departmentId && course.departmentId === user.departmentId) return true;
      
      return false;
    });
  };

  const filteredCourses = getAvailableCourses().filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCourse = (courseData: { name: string; description?: string; departmentId?: string }) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: courseData.name,
      description: courseData.description || '',
      churchId: '1',
      departmentId: courseData.departmentId,
      instructorId: user?.id,
      isActive: true,
      tags: [],
      modules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCourses([...courses, newCourse]);
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  return (
    <DashboardLayout title="Treinamento">
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Treinamento</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Acesse cursos e treinamentos do seu departamento
            </p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'leader') && (
            <AddCourseDialog
              departments={departments}
              trigger={
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Curso
                </Button>
              }
              onAdd={handleAddCourse}
            />
          )}
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Cursos Disponíveis</TabsTrigger>
            <TabsTrigger value="enrolled">Meus Cursos</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum curso encontrado
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Tente buscar por outros termos.' : 'Não há cursos disponíveis para o seu departamento no momento.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCourses.map((course) => {
                  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
                  const totalDuration = course.modules.reduce((acc, module) => 
                    acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.duration || 0), 0), 0
                  );
                  const department = departments.find(d => d.id === course.departmentId);

                  return (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {department?.name || 'Geral'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {totalLessons} aulas
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {Math.round(totalDuration / 60)}h
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {course.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <Button className="w-full" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum curso inscrito
                </h3>
                <p className="text-gray-600">
                  Inscreva-se em cursos para começar seu aprendizado.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CourseDetailsModal
        course={selectedCourse}
        open={showCourseDetails}
        onOpenChange={setShowCourseDetails}
        onEnroll={() => {
          // Implementar lógica de inscrição
          console.log('Inscrevendo no curso:', selectedCourse?.name);
        }}
      />
    </DashboardLayout>
  );
};
