import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, GraduationCap, Trash2, Edit, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddDepartmentDialog } from '@/components/AddDepartmentDialog';
import { AddServiceTypeDialog } from '@/components/AddServiceTypeDialog';
import { AddCourseDialog } from '@/components/AddCourseDialog';
import { Department, Course } from '@/types';
import { Badge } from '@/components/ui/badge';

export const ChurchSettings = () => {
  const { user, church } = useAuth();
  
  // Mock data for departments, service types, and courses with sub-departments
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
    { 
      id: '4', 
      name: 'Fotografia', 
      type: 'midia', 
      churchId: '1',
      parentDepartmentId: '2',
      isSubDepartment: true,
      collaborators: ['9', '10'], 
      createdAt: new Date() 
    },
    { 
      id: '5', 
      name: 'Vídeo', 
      type: 'midia', 
      churchId: '1',
      parentDepartmentId: '2',
      isSubDepartment: true,
      collaborators: ['11'], 
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
      modules: [],
      tags: ['vocal', 'louvor'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: '2', 
      name: 'Treinamento de Mídia', 
      description: 'Operação de equipamentos audiovisuais', 
      churchId: '1',
      modules: [],
      tags: ['midia', 'equipamentos'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: '3', 
      name: 'Liderança Ministerial', 
      description: 'Formação de líderes', 
      churchId: '1',
      modules: [],
      tags: ['lideranca', 'ministerio'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ]);

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id && dept.parentDepartmentId !== id));
  };

  const handleDeleteServiceType = (index: number) => {
    setServiceTypes(serviceTypes.filter((_, i) => i !== index));
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

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

  const getDepartmentHierarchy = () => {
    const parentDepts = departments.filter(dept => !dept.isSubDepartment);
    return parentDepts.map(parent => ({
      ...parent,
      subDepartments: departments.filter(dept => dept.parentDepartmentId === parent.id)
    }));
  };

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
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Configurações da Igreja</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Gerencie departamentos, tipos de cultos e cursos</p>
        </div>

        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="departments" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-4">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Departamentos</span>
              <span className="sm:hidden">Deptos</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-4">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Tipos de Cultos</span>
              <span className="sm:hidden">Cultos</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-4">
              <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
              <span>Cursos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Departamentos</CardTitle>
                    <CardDescription className="text-sm">Gerencie os departamentos e sub-departamentos da igreja</CardDescription>
                  </div>
                  <AddDepartmentDialog
                    departments={departments}
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Novo Departamento</span>
                        <span className="sm:hidden">Novo</span>
                      </Button>
                    }
                    onAdd={(dept) => setDepartments([...departments, { 
                      ...dept, 
                      id: Date.now().toString(), 
                      churchId: '1',
                      type: dept.type as Department['type'],
                      createdAt: new Date() 
                    }])}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getDepartmentHierarchy().map((dept) => (
                    <div key={dept.id} className="space-y-2">
                      {/* Departamento Pai */}
                      <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg bg-card">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base truncate">{dept.name}</h3>
                          <p className="text-xs md:text-sm text-gray-600 capitalize">{dept.type}</p>
                          <p className="text-xs text-gray-500">{dept.collaborators.length} colaboradores</p>
                        </div>
                        <div className="flex space-x-1 md:space-x-2 ml-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            onClick={() => handleDeleteDepartment(dept.id)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Sub-departamentos */}
                      {dept.subDepartments.map((subDept) => (
                        <div key={subDept.id} className="ml-4 md:ml-6 flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{subDept.name}</h4>
                              <p className="text-xs text-gray-500">{subDept.collaborators.length} colaboradores</p>
                            </div>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                              onClick={() => handleDeleteDepartment(subDept.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Tipos de Cultos</CardTitle>
                    <CardDescription className="text-sm">Configure os tipos de cultos e eventos</CardDescription>
                  </div>
                  <AddServiceTypeDialog
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Novo Tipo de Culto</span>
                        <span className="sm:hidden">Novo</span>
                      </Button>
                    }
                    onAdd={(type) => setServiceTypes([...serviceTypes, type])}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {serviceTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{type}</h3>
                      </div>
                      <div className="flex space-x-1 md:space-x-2 ml-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => handleDeleteServiceType(index)}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
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
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Cursos</CardTitle>
                    <CardDescription className="text-sm">Gerencie os cursos e treinamentos</CardDescription>
                  </div>
                  <AddCourseDialog
                    departments={departments}
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Novo Curso</span>
                        <span className="sm:hidden">Novo</span>
                      </Button>
                    }
                    onAdd={handleAddCourse}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => {
                    const department = departments.find(d => d.id === course.departmentId);
                    return (
                      <div key={course.id} className="flex items-start justify-between p-3 md:p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm md:text-base">{course.name}</h3>
                            {department && (
                              <Badge variant="outline" className="text-xs">
                                {department.name}
                              </Badge>
                            )}
                          </div>
                          {course.description && (
                            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Criado em {course.createdAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex space-x-1 md:space-x-2 ml-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
