import React, { useState } from 'react';
import { Copy, Check, Search, ExternalLink } from 'lucide-react';

interface DorkListProps {
  items: string[];
  type: 'google' | 'shodan' | 'github' | 'default';
}

export const DorkList: React.FC<DorkListProps> = ({ items, type }) => {
  return (
    <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
      {items.map((dork, index) => (
        <DorkItem key={index} dork={dork} type={type} />
      ))}
    </div>
  );
};

const DorkItem: React.FC<{ dork: string; type: string }> = ({ dork, type }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(dork);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSearchUrl = (dork: string, type: string) => {
    const encoded = encodeURIComponent(dork);
    if (type === 'google') return `https://www.google.com/search?q=${encoded}`;
    if (type === 'shodan') return `https://www.shodan.io/search?query=${encoded}`;
    if (type === 'github') return `https://github.com/search?q=${encoded}&type=code`;
    return null;
  };

  const searchUrl = getSearchUrl(dork, type);

  return (
    <div className="flex flex-col bg-gray-800/50 border border-gray-700/50 rounded p-3 hover:border-gray-600 transition-colors group">
      <div className="font-mono text-xs text-cyan-400 mb-2 break-all">{dork}</div>
      <div className="flex items-center justify-end space-x-2 mt-auto">
        {searchUrl && (
          <a 
            href={searchUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={`Search on ${type}`}
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-green-400 transition-colors"
          title="Copy Dork"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};