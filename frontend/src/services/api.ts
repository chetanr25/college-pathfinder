/**
 * API Service Layer
 * 
 * Centralized API calls with proper error handling and TypeScript types
 */

import axios, { AxiosError } from 'axios';

// Base API URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage = error.response?.data 
      ? (error.response.data as any).detail || 'An error occurred'
      : error.message;
    
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Types
export interface College {
  college_code: string;
  college_name: string;
  branch_name?: string;
  cutoff_rank?: number;
}

export interface CollegeList {
  colleges: College[];
  total_count?: number;
}

export interface CutoffTrend {
  college_name: string;
  branch_name: string;
  cutoff_trends: {
    round1: number;
    round2: number;
    round3: number;
  };
}

export interface Branch {
  branch_name: string;
  cutoff_ranks?: {
    round1: number;
    round2: number;
    round3: number;
  };
}

export interface CollegeBranches {
  college_name: string;
  branches: Branch[];
}

export interface SearchParams {
  min_rank?: number;
  max_rank?: number;
  branch?: string;
  round?: number;
}

// API Service
export const collegeApi = {
  /**
   * Get colleges accessible for a given rank
   */
  async getCollegesByRank(rank: number, round: number = 1): Promise<CollegeList> {
    const response = await apiClient.get<CollegeList>(`/colleges/by-rank/${rank}`, {
      params: { round },
    });
    return response.data;
  },

  /**
   * Get colleges offering a specific branch
   */
  async getCollegesByBranch(branch: string, round: number = 1): Promise<CollegeList> {
    const response = await apiClient.get<CollegeList>(`/colleges/by-branch/${encodeURIComponent(branch)}`, {
      params: { round },
    });
    return response.data;
  },

  /**
   * Get cutoff trends for a specific college and branch
   */
  async getCutoffTrends(collegeCode: string, branch: string): Promise<CutoffTrend> {
    const response = await apiClient.get<CutoffTrend>(
      `/colleges/cutoff/${collegeCode}/${encodeURIComponent(branch)}`
    );
    return response.data;
  },

  /**
   * Search colleges with multiple filters
   */
  async searchColleges(params: SearchParams): Promise<CollegeList> {
    const response = await apiClient.get<CollegeList>('/colleges/search', {
      params: {
        min_rank: params.min_rank,
        max_rank: params.max_rank,
        branch: params.branch,
        round: params.round || 1,
      },
    });
    return response.data;
  },

  /**
   * Get branches and cutoff ranks for a specific college
   */
  async getCollegeBranches(collegeCode: string): Promise<CollegeBranches> {
    const response = await apiClient.get<CollegeBranches>(`/colleges/${collegeCode}/branches`);
    return response.data;
  },
};

export const branchApi = {
  /**
   * Get list of all available branches
   */
  async getAllBranches(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/branches/list');
    return response.data;
  },
};

// Export API client for direct use if needed
export default apiClient;
