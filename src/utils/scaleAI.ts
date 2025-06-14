
// Simulação de análise de experiência dos membros
const memberExperienceData = {
  '1': { // Ana Karolina
    totalScales: 45,
    confirmationRate: 0.92,
    roles: ['Vocal Principal', 'Vocal Contralto'],
    preferredTimes: ['09:00', '19:00'],
    departments: ['Louvor'],
    lastParticipation: new Date('2024-01-25'),
    skill_level: 'avançado'
  },
  '2': { // Yuri Adriel
    totalScales: 38,
    confirmationRate: 0.88,
    roles: ['Guitarra', 'Violão'],
    preferredTimes: ['19:00', '19:30'],
    departments: ['Louvor'],
    lastParticipation: new Date('2024-01-24'),
    skill_level: 'avançado'
  },
  '3': { // Arthur Cota
    totalScales: 32,
    confirmationRate: 0.85,
    roles: ['Bateria'],
    preferredTimes: ['09:00', '19:00'],
    departments: ['Louvor'],
    lastParticipation: new Date('2024-01-26'),
    skill_level: 'intermediário'
  },
  '4': { // Guilherme Mancebo
    totalScales: 28,
    confirmationRate: 0.79,
    roles: ['Teclado'],
    preferredTimes: ['09:00'],
    departments: ['Louvor'],
    lastParticipation: new Date('2024-01-20'),
    skill_level: 'intermediário'
  },
  '5': { // João Pedro
    totalScales: 25,
    confirmationRate: 0.76,
    roles: ['Baixo', 'Projeção'],
    preferredTimes: ['19:00'],
    departments: ['Louvor', 'Mídia'],
    lastParticipation: new Date('2024-01-23'),
    skill_level: 'iniciante'
  },
  '6': { // Oswaldo Begotti
    totalScales: 42,
    confirmationRate: 0.94,
    roles: ['Fotografia'],
    preferredTimes: ['09:00', '19:00'],
    departments: ['Mídia'],
    lastParticipation: new Date('2024-01-27'),
    skill_level: 'avançado'
  },
  '7': { // Alexandre Jr.
    totalScales: 35,
    confirmationRate: 0.90,
    roles: ['Sonoplastia'],
    preferredTimes: ['19:00'],
    departments: ['Mídia'],
    lastParticipation: new Date('2024-01-26'),
    skill_level: 'avançado'
  },
  '8': { // Haira Bianca
    totalScales: 18,
    confirmationRate: 0.83,
    roles: ['Ministro(a)'],
    preferredTimes: ['09:00', '19:00'],
    departments: ['Ministração'],
    lastParticipation: new Date('2024-01-22'),
    skill_level: 'intermediário'
  }
};

interface ScaleRequirements {
  department: string;
  time: string;
  date: Date;
  serviceType: string;
}

interface MemberSuggestion {
  member: any;
  role: string;
  score: number;
  reason: string;
}

export const generateScaleSuggestions = (
  requirements: ScaleRequirements,
  availableMembers: any[]
): { [department: string]: MemberSuggestion[] } => {
  const suggestions: { [department: string]: MemberSuggestion[] } = {};

  // Definir roles necessários por departamento
  const departmentRoles = {
    'Louvor': ['Vocal Principal', 'Guitarra', 'Bateria', 'Baixo', 'Teclado'],
    'Mídia': ['Projeção', 'Sonoplastia', 'Fotografia'],
    'Ministração': ['Ministro(a)'],
    'Recepção': ['Recepcionista'],
    'Palavra': ['Pregador'],
    'Oração': ['Intercessor']
  };

  const roles = departmentRoles[requirements.department as keyof typeof departmentRoles] || [];

  roles.forEach(role => {
    const candidateMembers = availableMembers.filter(member => {
      const experience = memberExperienceData[member.id as keyof typeof memberExperienceData];
      return experience && experience.roles.includes(role);
    });

    const scoredMembers = candidateMembers.map(member => {
      const experience = memberExperienceData[member.id as keyof typeof memberExperienceData];
      if (!experience) return null;

      let score = 0;
      let reasons = [];

      // Pontuação baseada na taxa de confirmação
      score += experience.confirmationRate * 30;
      if (experience.confirmationRate > 0.85) {
        reasons.push('Alta taxa de confirmação');
      }

      // Pontuação baseada na experiência total
      const experienceScore = Math.min(experience.totalScales / 50, 1) * 25;
      score += experienceScore;
      if (experience.totalScales > 30) {
        reasons.push('Muita experiência');
      }

      // Pontuação por horário preferido
      if (experience.preferredTimes.includes(requirements.time)) {
        score += 20;
        reasons.push('Horário preferido');
      }

      // Pontuação por última participação (balanceamento)
      const daysSinceLastParticipation = Math.abs(
        (requirements.date.getTime() - experience.lastParticipation.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastParticipation > 7) {
        score += 15;
        reasons.push('Tempo adequado desde última participação');
      }

      // Pontuação por nível de habilidade
      const skillBonus = {
        'avançado': 10,
        'intermediário': 5,
        'iniciante': 2
      };
      score += skillBonus[experience.skill_level as keyof typeof skillBonus] || 0;

      return {
        member,
        role,
        score: Math.round(score),
        reason: reasons.join(', ') || 'Disponível para a função'
      };
    }).filter(Boolean) as MemberSuggestion[];

    // Ordenar por pontuação e pegar os top 3
    scoredMembers.sort((a, b) => b.score - a.score);
    
    if (!suggestions[requirements.department]) {
      suggestions[requirements.department] = [];
    }
    
    suggestions[requirements.department].push(...scoredMembers.slice(0, 3));
  });

  return suggestions;
};

export const generateBalancedTeam = (
  requirements: ScaleRequirements,
  availableMembers: any[]
): { [department: string]: any[] } => {
  const suggestions = generateScaleSuggestions(requirements, availableMembers);
  const balancedTeam: { [department: string]: any[] } = {};

  Object.entries(suggestions).forEach(([department, memberSuggestions]) => {
    // Agrupar por role
    const roleGroups: { [role: string]: MemberSuggestion[] } = {};
    memberSuggestions.forEach(suggestion => {
      if (!roleGroups[suggestion.role]) {
        roleGroups[suggestion.role] = [];
      }
      roleGroups[suggestion.role].push(suggestion);
    });

    // Selecionar o melhor membro para cada role
    const selectedMembers = Object.values(roleGroups).map(group => {
      return group[0]; // Pegar o primeiro (maior pontuação)
    });

    balancedTeam[department] = selectedMembers.map(suggestion => ({
      ...suggestion.member,
      confirmed: false,
      aiSuggestion: true,
      aiScore: suggestion.score,
      aiReason: suggestion.reason
    }));
  });

  return balancedTeam;
};
