import React, { useEffect, useState } from 'react';
import { School, Search as SearchIcon } from '@mui/icons-material';
import { collegeApi, type SearchParams } from '../services/api';
import CollegeCardModern from '../components/CollegeCardModern';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Hero, Container, Section, Grid, Input } from '../components/ui';
import theme from '../theme';
import SEO from '../components/SEO';

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
      
      const params: SearchParams = {
        min_rank: 1,
        max_rank: 200000,
        round: 1,
      };
      
      const data = await collegeApi.searchColleges(params);
      
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
      <SEO title="Engineering Colleges" description="Browse 200+ engineering colleges in Karnataka with KCET cutoff data and branch-wise details." />
      {/* Hero Section */}
      <Hero
        icon={<School />}
        title="Engineering Colleges"
        subtitle={`Browse ${colleges.length} colleges offering engineering programs`}
        size="md"
        background="gradient"
      />

      {/* Search & Results */}
      <Section background="default" padding="lg">
        <Container maxWidth="xl">
          <div style={styles.searchOuter}>
            <div style={styles.searchWrapper}>
              <Input
                type="text"
                placeholder="Search by college name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<SearchIcon />}
                style={{ fontSize: theme.typography.fontSize.lg }}
              />
            </div>
            <div style={styles.resultBadge}>
              <span style={styles.resultCount}>
                <strong style={styles.resultNumber}>{filteredColleges.length}</strong>
                <span style={styles.resultLabel}>&nbsp;{filteredColleges.length === 1 ? 'college' : 'colleges'} found</span>
              </span>
            </div>
          </div>

          {filteredColleges.length === 0 ? (
            <div style={styles.emptyState}>
              <School style={styles.emptyIcon} />
              <p style={styles.emptyText}>
                No colleges found matching "{searchTerm}"
              </p>
              <p style={styles.emptyHint}>
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <Grid columns="auto" minItemWidth="320px" gap={5}>
              {filteredColleges.map((college, index) => (
                <div
                  key={college.college_code}
                  style={{ animation: `fadeInUp 0.5s ease-out ${Math.min(index * 0.03, 0.3)}s both` }}
                >
                  <CollegeCardModern
                    collegeCode={college.college_code}
                    collegeName={college.college_name}
                    branchCount={college.branch_count}
                    branches={college.branches}
                  />
                </div>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.background.default,
  },
  searchOuter: {
    maxWidth: '640px',
    margin: '-32px auto 0',
    marginBottom: theme.spacing[8],
    padding: `0 ${theme.spacing[4]}`,
    position: 'relative' as const,
    zIndex: 5,
  },
  searchWrapper: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
    marginBottom: theme.spacing[4],
  },
  resultBadge: {
    display: 'flex',
    justifyContent: 'center',
  },
  resultCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  resultNumber: {
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: theme.typography.fontSize.lg,
  },
  resultLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: 500 as const,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: `${theme.spacing[12]} ${theme.spacing[4]}`,
  },
  emptyIcon: {
    fontSize: '4rem',
    color: theme.colors.neutral[300],
    marginBottom: theme.spacing[3],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  emptyHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
};

export default Colleges;
