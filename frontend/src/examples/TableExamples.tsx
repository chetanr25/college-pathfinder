
import TableMessage from '../components/chat/TableMessage';

const TableExamples = () => {
  // Example 1: College Branches Table
  const branchesExample = {
    title: 'Branches at R. V. College of Engineering',
    columns: [
      { field: 'branch_name', headerName: 'Branch Name', sortable: true, type: 'string' as const },
      { field: 'round_1_cutoff', headerName: 'Round 1 Cutoff', sortable: true, type: 'number' as const },
      { field: 'round_2_cutoff', headerName: 'Round 2 Cutoff', sortable: true, type: 'number' as const },
      { field: 'round_3_cutoff', headerName: 'Round 3 Cutoff', sortable: true, type: 'number' as const },
    ],
    rows: [
      { branch_name: 'CS Computers', round_1_cutoff: 290, round_2_cutoff: 359, round_3_cutoff: 501 },
      { branch_name: 'DS Comp. Sc. Engg- Data Sc.', round_1_cutoff: 459, round_2_cutoff: 560, round_3_cutoff: 745 },
      { branch_name: 'AI Artificial Intelligence', round_1_cutoff: 462, round_2_cutoff: 6236, round_3_cutoff: 7404 },
      { branch_name: 'IE Info.Science', round_1_cutoff: 489, round_2_cutoff: 626, round_3_cutoff: 795 },
      { branch_name: 'CA CS (AI, Machine Learning)', round_1_cutoff: 530, round_2_cutoff: 643, round_3_cutoff: 888 },
      { branch_name: 'CY CS- Cyber Security', round_1_cutoff: 604, round_2_cutoff: 786, round_3_cutoff: 1017 },
      { branch_name: 'EC Electronics', round_1_cutoff: 746, round_2_cutoff: 880, round_3_cutoff: 1354 },
      { branch_name: 'EE Electrical', round_1_cutoff: 1105, round_2_cutoff: 3328, round_3_cutoff: 4202 },
      { branch_name: 'ET Elec. Telecommn. Engg.', round_1_cutoff: 1240, round_2_cutoff: 2119, round_3_cutoff: 2347 },
      { branch_name: 'SE Aero Space Engg.', round_1_cutoff: 1809, round_2_cutoff: 2396, round_3_cutoff: 3824 },
      { branch_name: 'ME Mechanical', round_1_cutoff: 3958, round_2_cutoff: 6296, round_3_cutoff: 8395 },
      { branch_name: 'BT Bio Technology', round_1_cutoff: 5881, round_2_cutoff: 7376, round_3_cutoff: 8563 },
      { branch_name: 'CH Chemical', round_1_cutoff: 8603, round_2_cutoff: 14575, round_3_cutoff: 13853 },
    ],
    highlightRules: [
      { column: 'round_1_cutoff', threshold: 5000, color: 'success' as const },
      { column: 'round_2_cutoff', threshold: 5000, color: 'success' as const },
      { column: 'round_3_cutoff', threshold: 5000, color: 'success' as const },
    ],
  };

  // Example 2: College Comparison Table
  const comparisonExample = {
    title: 'College Comparison - Computer Science',
    columns: [
      { field: 'college_name', headerName: 'College Name', sortable: true, type: 'string' as const },
      { field: 'total_branches', headerName: 'Total Branches', sortable: true, type: 'number' as const },
      { field: 'best_cutoff', headerName: 'Best Cutoff', sortable: true, type: 'number' as const },
      { field: 'avg_cutoff', headerName: 'Avg Cutoff', sortable: true, type: 'number' as const },
    ],
    rows: [
      { college_name: 'R. V. College of Engineering', total_branches: 16, best_cutoff: 290, avg_cutoff: 3618 },
      { college_name: 'M S Ramaiah Institute of Technology', total_branches: 17, best_cutoff: 1254, avg_cutoff: 10140 },
      { college_name: 'BMS College of Engineering', total_branches: 15, best_cutoff: 1687, avg_cutoff: 12453 },
      { college_name: 'Dayananda Sagar College of Engineering', total_branches: 20, best_cutoff: 4024, avg_cutoff: 18410 },
    ],
    highlightRules: [
      { column: 'best_cutoff', threshold: 5000, color: 'success' as const },
      { column: 'avg_cutoff', threshold: 10000, color: 'success' as const },
    ],
  };

  // Example 3: Rank Analysis Table
  const rankAnalysisExample = {
    title: 'Your Options for Rank 5000 - Best Matches',
    columns: [
      { field: 'college_name', headerName: 'College', sortable: true, type: 'string' as const },
      { field: 'branch', headerName: 'Branch', sortable: true, type: 'string' as const },
      { field: 'cutoff_rank', headerName: 'Cutoff Rank', sortable: true, type: 'number' as const },
      { field: 'margin', headerName: 'Your Margin', sortable: true, type: 'number' as const },
    ],
    rows: [
      { college_name: 'R. V. College of Engineering', branch: 'ME Mechanical', cutoff_rank: 3958, margin: 1042 },
      { college_name: 'PESU Ring Road Campus', branch: 'CE Civil', cutoff_rank: 4312, margin: 688 },
      { college_name: 'Dayananda Sagar', branch: 'AI Artificial Intelligence', cutoff_rank: 4962, margin: 38 },
      { college_name: 'Ramaiah Institute', branch: 'EC Electronics', cutoff_rank: 4789, margin: 211 },
      { college_name: 'BMS College', branch: 'ET Electronics Telecomm', cutoff_rank: 4521, margin: 479 },
    ],
    highlightRules: [
      { column: 'cutoff_rank', threshold: 5000, color: 'success' as const },
    ],
  };

  return (
    <div style={{ padding: '20px', background: '#f3f4f6' }}>
      <h1>📊 Interactive Table Examples</h1>
      <p>These examples show how tables will render in the chat interface:</p>

      <div style={{ marginTop: '30px' }}>
        <h2>Example 1: College Branches</h2>
        <p>
          <strong>Features:</strong> Sortable columns, Search bar, CSV export, Color-coded cutoffs, Rank badges
        </p>
        <TableMessage {...branchesExample} />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Example 2: College Comparison</h2>
        <p>
          <strong>Features:</strong> Compare multiple colleges side-by-side
        </p>
        <TableMessage {...comparisonExample} />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Example 3: Rank Analysis Results</h2>
        <p>
          <strong>Features:</strong> Shows margin between your rank and cutoff
        </p>
        <TableMessage {...rankAnalysisExample} />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '8px' }}>
        <h3>🎯 Try These Interactions:</h3>
        <ul>
          <li>
            <strong>Sort:</strong> Click any column header to sort ascending/descending
          </li>
          <li>
            <strong>Search:</strong> Click the magnifying glass icon and search for "CS" or "Mechanical"
          </li>
          <li>
            <strong>Export:</strong> Click the download icon to export table as CSV
          </li>
          <li>
            <strong>Scroll:</strong> Tables taller than 400px will scroll vertically
          </li>
          <li>
            <strong>Hover:</strong> Hover over rows to see highlight effect
          </li>
        </ul>

        <h3>📱 Responsive Design:</h3>
        <p>
          Try resizing your browser window - tables automatically adapt to different screen sizes with horizontal
          scrolling on mobile devices.
        </p>

        <h3>🎨 Color Coding:</h3>
        <ul>
          <li>
            <span style={{ background: '#d4edda', padding: '2px 8px', borderRadius: '4px' }}>Green</span> - Excellent
            ranks (≤ 5000)
          </li>
          <li>
            <span style={{ background: '#fff3cd', padding: '2px 8px', borderRadius: '4px' }}>Yellow</span> - Good ranks
            (5001-10000)
          </li>
          <li>
            <span style={{ background: '#f8d7da', padding: '2px 8px', borderRadius: '4px' }}>Red</span> - Competitive
            ranks (&gt; 10000)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TableExamples;
