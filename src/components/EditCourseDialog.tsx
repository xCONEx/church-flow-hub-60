
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Course, CourseModule, Lesson } from '@/types';

interface EditCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Course) => void;
}

export const EditCourseDialog = ({ course, open, onOpenChange, onSave }: EditCourseDialogProps) => {
  const [editedCourse, setEditedCourse] = useState<Course | null>(course);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');

  if (!course || !editedCourse) return null;

  const handleSave = () => {
    if (editedCourse) {
      onSave(editedCourse);
      onOpenChange(false);
    }
  };

  const addModule = () => {
    if (!newModuleTitle.trim()) return;
    
    const newModule: CourseModule = {
      id: Date.now().toString(),
      courseId: editedCourse.id,
      title: newModuleTitle.trim(),
      order: editedCourse.modules.length + 1,
      lessons: [],
      createdAt: new Date()
    };

    setEditedCourse({
      ...editedCourse,
      modules: [...editedCourse.modules, newModule],
      updatedAt: new Date()
    });
    setNewModuleTitle('');
  };

  const addLesson = (moduleId: string) => {
    if (!newLessonTitle.trim()) return;

    const newLesson: Lesson = {
      id: Date.now().toString(),
      moduleId,
      title: newLessonTitle.trim(),
      order: editedCourse.modules.find(m => m.id === moduleId)?.lessons.length || 0 + 1,
      files: [],
      createdAt: new Date()
    };

    setEditedCourse({
      ...editedCourse,
      modules: editedCourse.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      ),
      updatedAt: new Date()
    });
    setNewLessonTitle('');
  };

  const deleteModule = (moduleId: string) => {
    setEditedCourse({
      ...editedCourse,
      modules: editedCourse.modules.filter(m => m.id !== moduleId),
      updatedAt: new Date()
    });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setEditedCourse({
      ...editedCourse,
      modules: editedCourse.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: module.lessons.filter(l => l.id !== lessonId) }
          : module
      ),
      updatedAt: new Date()
    });
  };

  const updateModule = (moduleId: string, title: string, description?: string) => {
    setEditedCourse({
      ...editedCourse,
      modules: editedCourse.modules.map(module =>
        module.id === moduleId
          ? { ...module, title, description }
          : module
      ),
      updatedAt: new Date()
    });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setEditedCourse({
      ...editedCourse,
      modules: editedCourse.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              )
            }
          : module
      ),
      updatedAt: new Date()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Curso: {course.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Nome do Curso</Label>
                <Input
                  value={editedCourse.name}
                  onChange={(e) => setEditedCourse({ ...editedCourse, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editedCourse.description || ''}
                  onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={editedCourse.tags.join(', ')}
                  onChange={(e) => setEditedCourse({ 
                    ...editedCourse, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Módulos do Curso</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do novo módulo"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-64"
                />
                <Button onClick={addModule} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {editedCourse.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingModule === module.id ? (
                          <div className="space-y-2">
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(module.id, e.target.value, module.description)}
                            />
                            <Textarea
                              value={module.description || ''}
                              onChange={(e) => updateModule(module.id, module.title, e.target.value)}
                              placeholder="Descrição do módulo"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setEditingModule(null)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingModule(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <CardTitle>{module.title}</CardTitle>
                            {module.description && <p className="text-sm text-gray-600 mt-1">{module.description}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingModule(module.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteModule(module.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Aulas</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nome da nova aula"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="w-48"
                          />
                          <Button size="sm" onClick={() => addLesson(module.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex justify-between items-center p-2 border rounded">
                          <div className="flex-1">
                            {editingLesson === lesson.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Duração (min)"
                                    value={lesson.duration || ''}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { duration: parseInt(e.target.value) || undefined })}
                                    className="w-32"
                                  />
                                  <Input
                                    placeholder="URL do vídeo"
                                    value={lesson.videoUrl || ''}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => setEditingLesson(null)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingLesson(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                {lesson.duration && <p className="text-sm text-gray-600">{lesson.duration} min</p>}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingLesson(lesson.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteLesson(module.id, lesson.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
