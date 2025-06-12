
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, GraduationCap, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddDepartmentDialog } from '@/components/AddDepartmentDialog';
import { AddServiceTypeDialog } from '@/components/AddServiceTypeDialog';
import { AddCourseDialog } from '@/components/AddCourseDialog';
import { Department, Course } from '@/types';

export const ChurchSettings = () => {
  const { user, church } = useAuth();
  
  // Mock data for departments, service types, and courses
  const [departments, setDepartments] = useState<Department[]>([
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
    { 
      id: '3', 
      name: 'Ministração', 
      type: 'ministracao', 
      churchId: '1',
      leaderId: '8', 
      collaborators: [], 
      createdAt: new Date() 
    },
  ]);

  const [serviceTypes, setServiceTypes] = useState([
    'Culto Domingo Manhã',
    'Culto Domingo Noite', 
    'Reunião de Oração',
    'Culto de Jovens',
    'Ensaio Geral',
    'Evento Especial'
  ]);

  const [courses, setCourses] = useState<Course[]>([
    { 
      id: '1', 
      name: 'Curso de Vocal', 
      description: 'Técnicas básicas de canto', 
      churchId: '1',
      createdAt: new Date() 
    },
    { 
      id: '2', 
      name: 'Treinamento de Mídia', 
      description: 'Operação de equipamentos audiovisuais', 
      churchId: '1',
      createdAt: new Date() 
    },
    { 
      id: '3', 
      name: 'Liderança Ministerial', 
      description: 'Formação de líderes', 
      churchId: '1',
      createdAt: new Date() 
    },
  ]);

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout title="Acesso Negado">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Apenas administradores podem acessar as configurações da igreja.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Configurações da Igreja">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Igreja</h2>
          <p className="text-gray-600">Gerencie departamentos, tipos de cultos e cursos</p>
        </div>

        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Departamentos</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Tipos de Cultos</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Cursos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Departamentos</CardTitle>
                    <CardDescription>Gerencie os departamentos da igreja</CardDescription>
                  </div>
                  <AddDepartmentDialog
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Departamento
                      </Button>
                    }
                    onAdd={(dept) => setDepartments([...departments, { 
                      ...dept, 
                      id: Date.now().toString(), 
                      churchId: '1',
                      createdAt: new Date() 
                    }])}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{dept.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{dept.type}</p>
                        <p className="text-sm text-gray-500">{dept.collaborators.length} colaboradores</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tipos de Cultos</CardTitle>
                    <CardDescription>Configure os tipos de cultos e eventos</CardDescription>
                  </div>
                  <AddServiceTypeDialog
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Tipo de Culto
                      </Button>
                    }
                    onAdd={(type) => setServiceTypes([...serviceTypes, type])}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{type}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cursos</CardTitle>
                    <CardDescription>Gerencie os cursos e treinamentos</CardDescription>
                  </div>
                  <AddCourseDialog
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Curso
                      </Button>
                    }
                    onAdd={(course) => setCourses([...courses, { 
                      ...course, 
                      id: Date.now().toString(), 
                      churchId: '1',
                      createdAt: new Date() 
                    }])}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <p className="text-sm text-gray-500">
                          Criado em {course.createdAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
