import React, { useState, useContext, useEffect, useRef } from 'react';
import { Check, Copy, Terminal, Play, RotateCcw, Monitor, X, Minus, Square, Command } from 'lucide-react';
import { ReconContext } from '../ReconContext';
import { useWebContainer } from '../WebContainerContext';

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
  timestamp?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash', label }) => {
  const [copied, setCopied] = useState(false);
  const { target } = useContext(ReconContext);
  
  // Helper to process the template variables for the "Template" view
  const getProcessedCode = () => {
    return code
      .replace(/target\.com/g, target || 'target.com')
      .replace(/ASXXXXX/g, 'AS12345') // Default or context
      .replace(/Target Org/g, 'Target Corp');
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="my-10 relative group">
      {/* Glow Effect behind the terminal */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
      
      <div className="relative rounded-xl overflow-hidden bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
        
        {/* Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5 select-none backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5 group/controls">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-inner" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-inner" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-inner" />
            </div>
            <div className="ml-4 flex items-center space-x-2 text-xs font-medium text-gray-500/80">
              <Terminal size={12} className="text-gray-600" />
              <span className="text-gray-400">{label || 'Terminal'}</span>
              <span className="text-gray-700">—</span>
              <span className="text-gray-500">{language}</span>
            </div>
          </div>
          
           <div className="flex items-center space-x-3">
             <button
              onClick={(e) => { e.stopPropagation(); handleCopy(getProcessedCode()); }}
              className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-cyan-400 transition-colors focus:outline-none hover:bg-white/5 px-2 py-1 rounded-md"
              title="Copy Command"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Template</span>
                </>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleCopy(code); }}
              className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-cyan-400 transition-colors focus:outline-none hover:bg-white/5 px-2 py-1 rounded-md"
              title="Copy Raw Command"
            >
              <Copy size={12} />
              <span>Copy Raw</span>
            </button>
          </div>
        </div>

        {/* Terminal Content Area */}
        <div className="flex flex-col md:flex-row">
          <div className="w-full">
             <TerminalEmulator initialCommand={getProcessedCode()} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface TerminalEmulatorProps {
  initialCommand: string;
}

const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({ initialCommand }) => {
  const { target } = useContext(ReconContext);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState(initialCommand);
  const [commandHistory, setCommandHistory] = useState<string[]>([initialCommand]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update initial command when context changes if the user hasn't typed much
  useEffect(() => {
    if (history.length === 0) {
      setCurrentInput(initialCommand);
    }
  }, [initialCommand, history.length]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
    // Scroll to bottom on input change or history change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentInput, history]);

  const { instance } = useWebContainer();

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    
    // Add Input Line
    const inputLine: TerminalLine = { type: 'input', content: cmd };
    setHistory(prev => [...prev, inputLine]);
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(null);
    setCurrentInput('');

    if (!trimmedCmd) return;

    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }

    if (!instance) {
      setHistory(prev => [...prev, { type: 'output', content: '\x1b[31mError: Terminal environment not ready (WebContainer booting...)\x1b[0m' }]);
      return;
    }

    try {
      const process = await instance.spawn('jsh', ['-c', trimmedCmd]);
      
      process.output.pipeTo(new WritableStream({
        write(data) {
          setHistory(prev => [...prev, { type: 'output', content: data }]);
        }
      }));

      await process.exit;
    } catch (error) {
      setHistory(prev => [...prev, { type: 'output', content: `\x1b[31mError: ${error}\x1b[0m` }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== null) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        } else {
          setHistoryIndex(null);
          setCurrentInput('');
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
       e.preventDefault();
       setHistory(prev => [...prev, { type: 'input', content: currentInput + '^C' }]);
       setCurrentInput('');
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Simple ANSI code stripper/formatter for output
  const formatOutput = (text: string) => {
    return text.replace(/\x1b\[[0-9;]*m/g, ''); 
  };

  return (
    <div 
      className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto font-mono text-sm"
      onClick={focusInput}
    >
      {/* Welcome Message */}
      {history.length === 0 && (
        <div className="mb-4 text-gray-500 select-none">
          <p>Last login: {new Date().toLocaleString()} on ttys001</p>
          <p>Type a command to start reconnaissance...</p>
          <br />
        </div>
      )}

      {/* History */}
      {history.map((line, idx) => (
        <div key={idx} className="mb-1 break-all whitespace-pre-wrap animate-fadeIn">
          {line.type === 'input' ? (
             <div className="flex text-gray-100">
               <span className="text-green-400 font-bold mr-2 shrink-0">➜</span>
               <span className="text-cyan-300 mr-2 shrink-0">~</span>
               <span>{line.content}</span>
             </div>
          ) : (
             <div className={`leading-relaxed opacity-90 ${line.content.startsWith('Error:') || line.content.includes('Error:') ? 'text-red-400 bg-red-500/10 p-1 rounded border-l-2 border-red-500' : 'text-gray-300'}`}>
               {formatOutput(line.content)}
             </div>
          )}
        </div>
      ))}

      {/* Active Line */}
      <div className="flex relative group/input">
         <span className="text-green-400 font-bold mr-2 shrink-0 select-none">➜</span>
         <span className="text-cyan-300 mr-2 shrink-0 select-none">~</span>
         <div className="flex-1 relative">
           <textarea
             ref={inputRef}
             value={currentInput}
             onChange={(e) => setCurrentInput(e.target.value)}
             onKeyDown={handleKeyDown}
             className="w-full bg-transparent text-gray-100 placeholder-gray-600 resize-none outline-none border-none p-0 m-0 font-mono block caret-gray-100"
             placeholder="Type a command or press Enter to run"
             aria-label="Terminal input"
             rows={1}
             spellCheck={false}
             autoComplete="off"
             autoCorrect="off"
             autoCapitalize="off"
           />
         </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
