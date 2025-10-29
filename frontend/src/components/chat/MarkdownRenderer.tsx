import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code({node, inline, className, children, ...props}: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus as any}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props} style={{
              background: '#f4f4f4',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }}>
              {children}
            </code>
          );
        },
        h1: ({children}) => <h1 style={{fontSize: '1.8em', marginTop: '0.5em', marginBottom: '0.5em', fontWeight: 'bold'}}>{children}</h1>,
        h2: ({children}) => <h2 style={{fontSize: '1.5em', marginTop: '0.5em', marginBottom: '0.5em', fontWeight: 'bold'}}>{children}</h2>,
        h3: ({children}) => <h3 style={{fontSize: '1.3em', marginTop: '0.4em', marginBottom: '0.4em', fontWeight: 'bold'}}>{children}</h3>,
        p: ({children}) => <p style={{marginBottom: '0.8em', lineHeight: '1.6'}}>{children}</p>,
        ul: ({children}) => <ul style={{marginLeft: '1.5em', marginBottom: '0.8em', lineHeight: '1.6'}}>{children}</ul>,
        ol: ({children}) => <ol style={{marginLeft: '1.5em', marginBottom: '0.8em', lineHeight: '1.6'}}>{children}</ol>,
        li: ({children}) => <li style={{marginBottom: '0.3em'}}>{children}</li>,
        table: ({children}) => (
          <div style={{overflowX: 'auto', marginBottom: '1em'}}>
            <table style={{borderCollapse: 'collapse', width: '100%', minWidth: '400px'}}>
              {children}
            </table>
          </div>
        ),
        th: ({children}) => <th style={{border: '1px solid #ddd', padding: '8px', background: '#f4f4f4', fontWeight: 'bold', textAlign: 'left'}}>{children}</th>,
        td: ({children}) => <td style={{border: '1px solid #ddd', padding: '8px'}}>{children}</td>,
        blockquote: ({children}) => (
          <blockquote style={{
            borderLeft: '4px solid #4F46E5',
            paddingLeft: '1em',
            marginLeft: '0',
            marginBottom: '1em',
            fontStyle: 'italic',
            color: '#666'
          }}>
            {children}
          </blockquote>
        ),
        a: ({href, children}) => (
          <a href={href} style={{color: '#4F46E5', textDecoration: 'none', fontWeight: 500}} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        strong: ({children}) => <strong style={{fontWeight: 600}}>{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
