# Database Schema

## Overview

The application uses SQLite database (`backend/data/kcet_2024.db`) containing KCET 2024 admission data.

## Table: `kcet_2024`

| Column | Type | Description |
|--------|------|-------------|
| `college_code` | TEXT | Unique college identifier |
| `college_name` | TEXT | Full college name |
| `branch_name` | TEXT | Engineering branch name |
| `GM_rank_r1` | INTEGER | General Merit cutoff rank for Round 1 |
| `GM_rank_r2` | INTEGER | General Merit cutoff rank for Round 2 |
| `GM_rank_r3` | INTEGER | General Merit cutoff rank for Round 3 |

## Data Statistics

- **Colleges**: 1000+
- **Engineering Branches**: 20+
- **Counseling Rounds**: 3
- **Total Records**: ~30,000+ college-branch combinations

## Example Query

```sql
SELECT college_code, college_name, branch_name, GM_rank_r1, GM_rank_r2, GM_rank_r3
FROM kcet_2024
WHERE GM_rank_r1 <= 5000
ORDER BY GM_rank_r1 ASC
LIMIT 10;
```

