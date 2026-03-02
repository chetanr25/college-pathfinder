/**
 * Utility to parse markdown tables from AI responses
 * and convert them to structured data for TableMessage component
 */

export interface ParsedTable {
  title?: string;
  columns: Array<{
    field: string;
    headerName: string;
    width?: number;
    sortable?: boolean;
    type?: 'string' | 'number';
  }>;
  rows: Array<{ [key: string]: string | number }>;
}

/**
 * Detect if content contains a markdown table
 */
export function hasMarkdownTable(content: string): boolean {
  // Look for markdown table pattern: | header | header |
  const tablePattern = /\|[^\n]+\|\s*\n\|[\s:-]+\|/;
  return tablePattern.test(content);
}

/**
 * Parse markdown table into structured data
 */
export function parseMarkdownTable(content: string): ParsedTable | null {
  const lines = content.split('\n').filter((line) => line.trim());

  // Find table start
  const tableStartIndex = lines.findIndex((line) => line.includes('|'));
  if (tableStartIndex === -1) return null;

  // Extract title (line before table if it's a heading)
  let title: string | undefined;
  if (tableStartIndex > 0) {
    const prevLine = lines[tableStartIndex - 1];
    if (prevLine.startsWith('#')) {
      title = prevLine.replace(/^#+\s*/, '').replace(/^\s*🎓\s*/, '').trim();
    }
  }

  // Extract table lines
  const tableLines = lines
    .slice(tableStartIndex)
    .filter((line) => line.includes('|'));

  if (tableLines.length < 3) return null; // Need header + separator + at least 1 row

  // Parse header
  const headerCells = tableLines[0]
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell);

  const columns = headerCells.map((header, index) => {
    const field = header
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    // Detect column type
    const isNumericColumn =
      header.toLowerCase().includes('rank') ||
      header.toLowerCase().includes('cutoff') ||
      header.toLowerCase().includes('count') ||
      header.toLowerCase().includes('total');

    return {
      field: field || `col_${index}`,
      headerName: header,
      sortable: true,
      type: isNumericColumn ? ('number' as const) : ('string' as const),
    };
  });

  // Parse rows (skip separator line at index 1)
  const rows = tableLines.slice(2).map((line) => {
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell);

    const row: { [key: string]: string | number } = {};

    cells.forEach((cell, index) => {
      if (index < columns.length) {
        const column = columns[index];
        let value: string | number = cell;

        // Convert to number if column is numeric and cell looks like a number
        if (column.type === 'number') {
          const numValue = parseFloat(cell.replace(/,/g, ''));
          if (!isNaN(numValue)) {
            value = numValue;
          }
        }

        row[column.field] = value;
      }
    });

    return row;
  });

  return { title, columns, rows };
}

/**
 * Split content into text and table parts
 */
export function splitContentWithTables(
  content: string
): Array<{ type: 'text' | 'table'; content: string }> {
  const parts: Array<{ type: 'text' | 'table'; content: string }> = [];
  const lines = content.split('\n');

  let currentPart: { type: 'text' | 'table'; lines: string[] } | null = null;
  let inTable = false;

  for (const line of lines) {
    const isTableLine = line.trim().startsWith('|');

    if (isTableLine && !inTable) {
      // Starting a table
      if (currentPart) {
        parts.push({
          type: currentPart.type,
          content: currentPart.lines.join('\n'),
        });
      }
      currentPart = { type: 'table', lines: [line] };
      inTable = true;
    } else if (!isTableLine && inTable) {
      // Ending a table
      if (currentPart) {
        parts.push({
          type: currentPart.type,
          content: currentPart.lines.join('\n'),
        });
      }
      currentPart = { type: 'text', lines: [line] };
      inTable = false;
    } else {
      // Continue current part
      if (!currentPart) {
        currentPart = { type: 'text', lines: [line] };
      } else {
        currentPart.lines.push(line);
      }
    }
  }

  // Add final part
  if (currentPart) {
    parts.push({
      type: currentPart.type,
      content: currentPart.lines.join('\n'),
    });
  }

  return parts.filter((part) => part.content.trim());
}

/**
 * Get highlight rules based on table content
 */
export function getHighlightRules(columns: ParsedTable['columns']) {
  const rules: Array<{
    column: string;
    threshold: number;
    color: 'success' | 'warning' | 'error';
  }> = [];

  // Add rules for cutoff/rank columns
  columns.forEach((col) => {
    if (
      col.type === 'number' &&
      (col.field.includes('cutoff') || col.field.includes('rank'))
    ) {
      rules.push({
        column: col.field,
        threshold: 5000, // Ranks <= 5000 are "good"
        color: 'success',
      });
    }
  });

  return rules;
}
