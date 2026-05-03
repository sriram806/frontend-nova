/**
 * Utility to normalize skill names to canonical versions used for exams and AI processing.
 */

const SKILL_MAP: Record<string, string> = {
  // Languages
  'py': 'Python',
  'python3': 'Python',
  'python programming': 'Python',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'cpp': 'C++',
  'c plus plus': 'C++',
  'golang': 'Go',
  'java': 'Java',
  'rb': 'Ruby',
  'ruby on rails': 'Ruby',
  
  // Frontend
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  
  // Backend/Database
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express.js',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  
  // AI/ML
  'ml': 'Machine Learning',
  'ai': 'Artificial Intelligence',
  'pytorch': 'PyTorch',
  'tensorflow': 'TensorFlow',
  'sklearn': 'Scikit-Learn',
  'openai': 'OpenAI',
  
  // Cloud/DevOps
  'aws': 'AWS',
  'k8s': 'Kubernetes',
  'docker': 'Docker',
  'terraform': 'Terraform',
  'cicd': 'CI/CD',
};

/**
 * Normalizes a skill name to its canonical version.
 * If no mapping exists, returns the original name with proper capitalization.
 */
export function normalizeSkillName(name: string): string {
  const lowerName = name.toLowerCase().trim();
  
  if (SKILL_MAP[lowerName]) {
    return SKILL_MAP[lowerName];
  }
  
  // Fallback: Capitalize first letter of each word if not in map
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Returns a list of recommended skills based on a target role.
 */
export function getRecommendedSkillsForRole(role: string): string[] {
  const recommendations: Record<string, string[]> = {
    'Backend': ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'Python', 'Go'],
    'Frontend': ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vite', 'JavaScript', 'HTML5'],
    'FullStack': ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'Next.js', 'Prisma'],
    'AI': ['Python', 'PyTorch', 'OpenAI', 'TensorFlow', 'Machine Learning', 'NLP'],
    'DevOps': ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Ansible'],
  };

  // Find the closest match or return a general set
  const key = Object.keys(recommendations).find(k => role.toLowerCase().includes(k.toLowerCase()));
  return key ? recommendations[key] : ['JavaScript', 'Python', 'Git', 'Docker'];
}
