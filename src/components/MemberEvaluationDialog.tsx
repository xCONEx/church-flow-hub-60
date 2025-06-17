
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface MemberEvaluationDialogProps {
  trigger: React.ReactNode;
  member: {
    id: string;
    name: string;
    department?: string;
    departmentId?: string;
  };
  onEvaluationSaved?: () => void;
}

export const MemberEvaluationDialog = ({ trigger, member, onEvaluationSaved }: MemberEvaluationDialogProps) => {
  const { user, church } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState({
    overallRating: [4],
    technicalSkills: [4],
    leadershipSkills: [4],
    commitment: [4],
    teamwork: [4],
    punctuality: [4],
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !church || !user) return;

    setIsLoading(true);
    try {
      console.log('Salvando avaliação:', evaluation);

      const { error } = await supabase
        .from('member_evaluations')
        .upsert({
          member_id: member.id,
          evaluator_id: user.id,
          church_id: church.id,
          department_id: member.departmentId || null,
          overall_rating: evaluation.overallRating[0],
          technical_skills: evaluation.technicalSkills[0],
          leadership_skills: evaluation.leadershipSkills[0],
          commitment: evaluation.commitment[0],
          teamwork: evaluation.teamwork[0],
          punctuality: evaluation.punctuality[0],
          notes: evaluation.notes,
          evaluation_date: new Date().toISOString()
        }, {
          onConflict: 'member_id,evaluator_id,church_id,department_id'
        });

      if (error) {
        console.error('Erro ao salvar avaliação:', error);
        toast({
          title: "Erro ao salvar avaliação",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Avaliação salva com sucesso!",
        description: `A avaliação de ${member.name} foi salva.`
      });

      onEvaluationSaved?.();
      setOpen(false);
      
      // Reset form
      setEvaluation({
        overallRating: [4],
        technicalSkills: [4],
        leadershipSkills: [4],
        commitment: [4],
        teamwork: [4],
        punctuality: [4],
        notes: ''
      });
    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro ao salvar avaliação",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const RatingSlider = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string; 
    value: number[]; 
    onChange: (value: number[]) => void;
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center space-x-1">
          {Array.from({ length: value[0] }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          {Array.from({ length: 5 - value[0] }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-300" />
          ))}
          <span className="ml-2 text-sm text-gray-600">{value[0]}/5</span>
        </div>
      </div>
      <Slider
        value={value}
        onValueChange={onChange}
        max={5}
        min={1}
        step={1}
        className="w-full"
        disabled={isLoading}
      />
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Membro</DialogTitle>
          <DialogDescription>
            Avalie o desempenho de {member.name} {member.department && `no departamento ${member.department}`}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <RatingSlider
              label="Avaliação Geral"
              value={evaluation.overallRating}
              onChange={(value) => setEvaluation(prev => ({ ...prev, overallRating: value }))}
              description="Avaliação geral do desempenho do membro"
            />
            
            <RatingSlider
              label="Habilidades Técnicas"
              value={evaluation.technicalSkills}
              onChange={(value) => setEvaluation(prev => ({ ...prev, technicalSkills: value }))}
              description="Competência técnica na área de atuação"
            />
            
            <RatingSlider
              label="Habilidades de Liderança"
              value={evaluation.leadershipSkills}
              onChange={(value) => setEvaluation(prev => ({ ...prev, leadershipSkills: value }))}
              description="Capacidade de liderar e influenciar positivamente"
            />
            
            <RatingSlider
              label="Comprometimento"
              value={evaluation.commitment}
              onChange={(value) => setEvaluation(prev => ({ ...prev, commitment: value }))}
              description="Dedicação e responsabilidade com as atividades"
            />
            
            <RatingSlider
              label="Trabalho em Equipe"
              value={evaluation.teamwork}
              onChange={(value) => setEvaluation(prev => ({ ...prev, teamwork: value }))}
              description="Capacidade de trabalhar colaborativamente"
            />
            
            <RatingSlider
              label="Pontualidade"
              value={evaluation.punctuality}
              onChange={(value) => setEvaluation(prev => ({ ...prev, punctuality: value }))}
              description="Pontualidade e assiduidade"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={evaluation.notes}
              onChange={(e) => setEvaluation(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Adicione observações sobre o desempenho, pontos fortes, áreas de melhoria..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
