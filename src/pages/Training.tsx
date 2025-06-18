
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddCourseDialog } from '@/components/AddCourseDialog';
import { Department } from '@/types';

export const Training = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // Mock departments básico
  const [departments] = useState<Department[]>([
    { 
      id: '1', 
      name: 'Louvor', 
      type: 'louvor', 
      churchId: '1',
      collaborators: [], 
      createdAt: new Date() 
    },
    { 
      id: '2', 
      name: 'Mídia', 
      type: 'midia', 
      churchId: '1',
      collaborators: [], 
      createdAt: new Date() 
    },
  ]);

  const handleAddCourse = (courseData: { name: string; description?: string; departmentId?: string }) => {
    const newCourse = {
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

  const getEnrolledCourses = () => {
    if (!user) return [];
    const userEnrollments = enrollments.filter(e => e.userId === user.id);
    return courses.filter(course => userEnrollments.some(e => e.courseId === course.id));
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
            <TabsTrigger value="enrolled">Meus Cursos ({getEnrolledCourses().length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum curso disponível
                </h3>
                <p className="text-gray-600">
                  {(user?.role === 'admin' || user?.role === 'leader') 
                    ? "Comece criando o primeiro curso para seu departamento." 
                    : "Aguarde a criação de cursos pelos administradores."
                  }
                </p>
                {(user?.role === 'admin' || user?.role === 'leader') && (
                  <div className="mt-6">
                    <AddCourseDialog
                      departments={departments}
                      trigger={
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Curso
                        </Button>
                      }
                      onAdd={handleAddCourse}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
    </DashboardLayout>
  );
};
