export interface ZipFileEntry {
  path: string;
  name: string;
  isDir: boolean;
  size: number;
  content?: string;
  mimeType?: string;
}

export interface RepoSummary {
  overview: string;
  techStack: string[];
  keyFeatures: string[];
  targetAudience: string;
  difficultyToUse: string;
  aiVerdict: string;
}

export interface CodeReviewResult {
  summary: string;
  score: number;
  securityFindings: string[];
  performanceTips: string[];
  cleanCodeSuggestions: string[];
  improvedCode?: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
  default_branch: string;
}

export interface GitHubFileNode {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}
