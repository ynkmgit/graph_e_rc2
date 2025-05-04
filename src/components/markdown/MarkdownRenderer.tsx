'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) {
    return (
      <p className="text-gray-400 dark:text-gray-500 italic">内容なし</p>
    );
  }
  
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-3 mb-2" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-bold mt-3 mb-1" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-xs font-bold mt-3 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="my-3" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-6 my-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-6 my-3" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-3 text-gray-700 dark:text-gray-300" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            if (inline) {
              return (
                <code 
                  className="px-1.5 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 my-3 overflow-x-auto">
                <code 
                  className={`language-${match?.[1] || ''} text-sm`} 
                  {...props}
                >
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
          tr: ({ node, ...props }) => <tr className="divide-x divide-gray-200 dark:divide-gray-700" {...props} />,
          th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-medium" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-300 dark:border-gray-700" {...props} />,
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto rounded-md my-4"
              alt={props.alt || 'Image'}
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
