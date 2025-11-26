import React from 'react';
import { ReconSection, ContentType } from '../types';
import { CodeBlock } from './CodeBlock';
import { DorkList } from './DorkList';

interface SectionViewerProps {
  section: ReconSection;
}

export const SectionViewer: React.FC<SectionViewerProps> = ({ section }) => {
  return (
    <div className="space-y-12 pb-24">
      <header className="border-b border-gray-800 pb-6">
        <div className="flex items-center space-x-4">
          <span className="inline-block text-xs uppercase px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full tracking-wider">{section.id.replace(/-/g, ' ')}</span>
          <h1 className="text-3xl font-bold text-white tracking-tight">{section.title}</h1>
        </div>
        <div className="h-1 w-20 bg-cyan-500 mt-4 rounded-full"></div>
      </header>

      <div className="space-y-10">
        {section.items.map((item) => (
          <div key={item.id} className="scroll-mt-6" id={item.id}>
            {item.title && (
              <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center">
                <span className="text-cyan-500 mr-2">#</span> {item.title}
              </h3>
            )}
            
            {item.description && (
              <p className="text-gray-400 mb-4 leading-relaxed max-w-4xl">
                {item.description}
              </p>
            )}

            {item.type === ContentType.COMMAND && typeof item.content === 'string' && (
              <CodeBlock code={item.content} language={item.meta?.language} />
            )}

            {item.type === ContentType.SCRIPT && typeof item.content === 'string' && (
              <CodeBlock code={item.content} language={item.meta?.language || 'javascript'} label="Script" />
            )}

            {item.type === ContentType.TEXT && typeof item.content === 'string' && (
              <div className="prose prose-invert max-w-none text-gray-400">
                <p>{item.content}</p>
              </div>
            )}

            {item.type === ContentType.LIST && Array.isArray(item.content) && (
              <ul className="list-disc list-inside space-y-2 text-gray-400 ml-2">
                {item.content.map((li, idx) => (
                  <li key={idx} className="hover:text-gray-200 transition-colors">
                    {li.startsWith('http') ? (
                      <a href={li} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        {li}
                      </a>
                    ) : (
                      <span dangerouslySetInnerHTML={{ 
                        __html: li.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-cyan-300 text-xs">$1</code>') 
                      }} />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {item.type === ContentType.DORK_LIST && Array.isArray(item.content) && (
              <DorkList 
                items={item.content} 
                type={item.title?.toLowerCase().includes('google') ? 'google' : 
                      item.title?.toLowerCase().includes('shodan') ? 'shodan' : 
                      item.title?.toLowerCase().includes('github') ? 'github' : 'default'} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};