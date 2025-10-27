export interface College {
  code: string;
  name: string;
  branches: string[];
  cutoffs: Record<string, number>;
}

export interface CollegeList {
  colleges: College[];
  total_count: number;
}

export interface CutoffTrend {
  college_code: string;
  branch: string;
  rounds: {
    round: number;
    cutoff_rank: number;
  }[];
}

export interface SearchFilters {
  minRank?: number;
  maxRank?: number;
  branch?: string;
  round: number;
}