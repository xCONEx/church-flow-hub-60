
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, FileText, Users, Play, Download } from 'lucide-react';
import { Course, CourseModule, Lesson } from '@/types';

interface CourseDetailsModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnrolled?: boolean;
  progress?: number;
  onEnroll?: () => void;
}

export const CourseDetailsModal = ({ 
  course, 
  open, 
  onOpenChange, 
  isEnrolled = false, 
  progress = 0,
  onEnroll 
}: CourseDetailsModalProps) => {
  if (!course) return null;

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalDuration = course.modules.reduce((acc, module) => 
    acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.duration || 0), 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Curso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{course.modules.length}</p>
                <p className="text-sm text-gray-600">Módulos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-sm text-gray-600">Aulas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</p>
                <p className="text-sm text-gray-600">Duração</p>
              </CardContent>
            </Card>
          </div>

          {/* Progresso (se inscrito) */}
          {isEnrolled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Curso</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descrição e Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Sobre o Curso</h3>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Botão de Inscrição */}
          {!isEnrolled && onEnroll && (
            <div className="text-center">
              <Button onClick={onEnroll} className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Users className="h-4 w-4 mr-2" />
                Inscrever-se no Curso
              </Button>
            </div>
          )}

          {/* Módulos e Aulas */}
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="modules">Conteúdo do Curso</TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Módulo {moduleIndex + 1}: {module.title}
                    </CardTitle>
                    {module.description && (
                      <CardDescription>{module.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {lesson.videoUrl ? (
                                <Play className="h-5 w-5 text-blue-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-sm text-gray-500">
                                  {lesson.duration} minutos
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lesson.files.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                {lesson.files.length} arquivo{lesson.files.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {isEnrolled && (
                              <Button size="sm" variant="outline">
                                Acessar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
