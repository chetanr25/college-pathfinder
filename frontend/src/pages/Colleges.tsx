import React, { useEffect, useState } from 'react';
import { School, Search as SearchIcon } from '@mui/icons-material';
import { collegeApi, type SearchParams } from '../services/api';
import CollegeCardModern from '../components/CollegeCardModern';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import theme from '../theme';

interface GroupedCollege {
  college_code: string;
  college_name: string;
  branches: string[];
  branch_count: number;
}

const Colleges: React.FC = () => {
  const [colleges, setColleges] = useState<GroupedCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all colleges with a wide rank range
      const params: SearchParams = {
        min_rank: 1,
        max_rank: 200000,
        round: 1,
      };
      
      const data = await collegeApi.searchColleges(params);
      
      // Group colleges by college_code
      const collegeMap = new Map<string, GroupedCollege>();
      
      data.colleges.forEach((college) => {
        if (!collegeMap.has(college.college_code)) {
          collegeMap.set(college.college_code, {
            college_code: college.college_code,
            college_name: college.college_name,
            branches: [],
            branch_count: 0,
          });
        }
        
        const grouped = collegeMap.get(college.college_code)!;
        if (college.branch_name && !grouped.branches.includes(college.branch_name)) {
          grouped.branches.push(college.branch_name);
          grouped.branch_count++;
        }
      });
      
      setColleges(Array.from(collegeMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter((college) =>
    college.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.college_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading colleges..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchColleges} />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.iconWrapper}>
            <School style={styles.headerIcon} />
          </div>
          <h1 style={styles.title}>Engineering Colleges</h1>
          <p style={styles.subtitle}>
            Browse {colleges.length} colleges offering engineering programs
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <SearchIcon style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by college name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.resultCount}>
          Showing {filteredColleges.length} of {colleges.length} colleges
        </div>
      </section>

      {/* Colleges Grid */}
      <section style={styles.collegesSection}>
        {filteredColleges.length === 0 ? (
          <div style={styles.emptyState}>
            <School style={styles.emptyIcon} />
            <p style={styles.emptyText}>
              No colleges found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          <div style={styles.collegesGrid}>
            {filteredColleges.map((college) => (
              <CollegeCardModern
                key={college.college_code}
                collegeCode={college.college_code}
                collegeName={college.college_name}
                branchCount={college.branch_count}
                branches={college.branches}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.background.default,
  },
  header: {
    background: theme.colors.primary.gradient,
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.xl,
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[5],
  },
  headerIcon: {
    fontSize: '2.5rem',
    color: theme.colors.text.inverse,
  },
  title: {
    margin: 0,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  searchSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  searchWrapper: {
    position: 'relative' as const,
    marginBottom: theme.spacing[4],
  },
  searchIcon: {
    position: 'absolute' as const,
    left: theme.spacing[4],
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.5rem',
    color: theme.colors.text.secondary,
    pointerEvents: 'none' as const,
  },
  searchInput: {
    width: '100%',
    padding: `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[12]}`,
    fontSize: theme.typography.fontSize.base,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.lg,
    outline: 'none',
    transition: theme.transitions.base,
    background: theme.colors.background.paper,
    boxShadow: theme.shadows.sm,
  },
  resultCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  collegesSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]} ${theme.spacing[12]}`,
  },
  collegesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: theme.spacing[6],
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
  },
  emptyIcon: {
    fontSize: '4rem',
    color: theme.colors.neutral[300],
    marginBottom: theme.spacing[4],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
};

export default Colleges;
