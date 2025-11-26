import React, { useState, useMemo, useContext, useEffect } from 'react';
import { RECON_DATA } from './constants';
import { SectionViewer } from './components/SectionViewer';
import { ReconProvider, ReconContext } from './ReconContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { WebContainerProvider } from './WebContainerContext';
import { 
  Search, 
  Menu, 
  X, 
  Radar, 
  Terminal, 
  ListChecks, 
  Zap, 
  BookOpen, 
  Github,
  Settings,
  Target
} from 'lucide-react';

const ICONS: Record<string, any> = {
  'initial-gathering': Radar,
  'automated-scans': Zap,
  'recon-steps': ListChecks,
  'one-liners': Terminal,
  'resources': BookOpen
};

const TargetConfiguration = () => {
  const { target, setTarget, asn, setAsn } = useContext(ReconContext);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 px-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
      >
        <span className="flex items-center"><Target size={12} className="mr-1.5" /> Target Scope</span>
        <Settings size={12} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="bg-gray-950/50 rounded-lg p-3 space-y-3 border border-gray-800 shadow-inner">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Target Domain</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-cyan-400 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              placeholder="example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">ASN / CIDR</label>
            <input
              type="text"
              value={asn}
              onChange={(e) => setAsn(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-yellow-500 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              placeholder="AS12345"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeToggleButton: React.FC = () => {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle(); }}
      className="ml-3 p-1.5 rounded-md text-gray-300 hover:text-cyan-400 hover:bg-gray-800/40 transition-colors"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/></svg>
      )}
    </button>
  )
}

const MainContent = () => {
  const [isCrossOriginIsolated, setIsCrossOriginIsolated] = useState<boolean>(true);

  useEffect(() => {
    try {
      // window.crossOriginIsolated is true when COOP/COEP are set and resources are isolated
      setIsCrossOriginIsolated(Boolean((window as any).crossOriginIsolated));
    } catch (err) {
      setIsCrossOriginIsolated(false);
    }
  }, []);
  const [activeSectionId, setActiveSectionId] = useState<string>(RECON_DATA[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeSection = useMemo(() => 
    RECON_DATA.find(s => s.id === activeSectionId) || RECON_DATA[0]
  , [activeSectionId]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return null;
    return RECON_DATA.flatMap(section => 
      section.items.filter(item => {
        const text = [item.title, item.description, item.content].flat().join(' ').toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      }).map(item => ({ ...item, sectionId: section.id }))
    );
  }, [searchQuery]);

  const handleNavClick = (id: string) => {
    setActiveSectionId(id);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-slate-300 font-sans selection:bg-cyan-900 selection:text-white">
      {/* Cross-origin isolation warning */}
      {!isCrossOriginIsolated && (
        <div className="fixed top-16 left-0 right-0 bg-red-900 text-white z-50 p-3 text-sm text-center">
          SharedArrayBuffer is restricted: This page is not cross-origin isolated. To enable features (e.g. WebContainer), configure your server to send the following response headers: <code>Cross-Origin-Opener-Policy: same-origin</code> and <code>Cross-Origin-Embedder-Policy: require-corp</code>.
        </div>
      )}
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50 md:hidden">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold tracking-wider">
          <Radar />
          <span>R-METH</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggleButton />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold tracking-wider text-xl">
                <Radar />
                <span>R-METH</span>
              </div>
              <div className="flex items-center">
                <ThemeToggleButton />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 sticky top-0 bg-gray-900 z-10 space-y-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Find tool or command..."
                  className="w-full bg-gray-950 border border-gray-700 text-gray-300 text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TargetConfiguration />

            <nav className="px-3 space-y-1 pb-4">
              {RECON_DATA.map((section) => {
                const Icon = ICONS[section.id] || ListChecks;
                const isActive = activeSectionId === section.id && !searchQuery;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleNavClick(section.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ring-1 ring-cyan-500/10 border-l-4 border-l-cyan-500/60' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
                    `}
                  >
                    <Icon size={18} />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-800 shrink-0 bg-gray-900">
             <a href="https://github.com/topics/reconnaissance" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                <Github size={14} />
                <span>Methodology Source</span>
             </a>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-400">Version: {process.env.npm_package_version || 'dev'}</div>
              <div className="flex items-center">
                <ThemeToggleButton />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:pt-0 pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {searchQuery ? (
            <div className="space-y-6">
              <header className="pb-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">Search Results</h2>
                <p className="text-gray-400 mt-1">Found {filteredItems?.length} matches for "{searchQuery}"</p>
              </header>
              {filteredItems && filteredItems.length > 0 ? (
                <div className="space-y-8">
                  {filteredItems.map(item => (
                    <div key={item.id} className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded mr-3 uppercase tracking-wide">
                          {RECON_DATA.find(s => s.id === item.sectionId)?.title}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-200">{item.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                      <button 
                        onClick={() => {
                          setActiveSectionId(item.sectionId as string);
                          setSearchQuery('');
                          setTimeout(() => {
                            const el = document.getElementById(item.id);
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center"
                      >
                        Jump to context &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No results found for your query.</p>
                </div>
              )}
            </div>
          ) : (
            <SectionViewer section={activeSection} />
          )}
          
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ReconProvider>
      <ThemeProvider>
        <WebContainerProvider>
          <MainContent />
        </WebContainerProvider>
      </ThemeProvider>
    </ReconProvider>
  );
};

export default App;
