import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

interface WebContainerContextType {
  instance: WebContainer | null;
  isLoading: boolean;
  error: Error | null;
}

const WebContainerContext = createContext<WebContainerContextType>({
  instance: null,
  isLoading: true,
  error: null,
});

export const useWebContainer = () => useContext(WebContainerContext);

export const WebContainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const bootPromise = useRef<Promise<WebContainer> | null>(null);

  useEffect(() => {
    const boot = async () => {
      if (instance) return;
      if (bootPromise.current) return;
      // Boot WebContainer only when the page is cross-origin isolated.
      try {
        if (typeof window !== 'undefined' && !(window as any).crossOriginIsolated) {
          const err = new Error('Cross-origin isolation is required to boot an in-browser WebContainer. Please set COOP and COEP headers on the host.');
          setError(err);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // If reading crossOriginIsolated throws, log and fail gracefully.
        setError(new Error('Could not determine cross-origin isolation state. WebContainer not started.'));
        setIsLoading(false);
        return;
      }

      try {
        console.log('Booting WebContainer...');
        bootPromise.current = WebContainer.boot();
        const webcontainer = await bootPromise.current;
        console.log('WebContainer booted!');
        
        // Mount a simple file system
        await webcontainer.mount({
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'recon-env',
                type: 'module',
                dependencies: {},
              }, null, 2),
            },
          },
          'README.md': {
            file: {
              contents: '# Recon Environment\n\nWelcome to your sandboxed terminal.',
            },
          },
        });

        setInstance(webcontainer);
      } catch (err) {
        console.error('Failed to boot WebContainer:', err);
        setError(err instanceof Error ? err : new Error('Failed to boot WebContainer'));
      } finally {
        setIsLoading(false);
      }
    };

    boot();
  }, []);

  return (
    <WebContainerContext.Provider value={{ instance, isLoading, error }}>
      {children}
    </WebContainerContext.Provider>
  );
};
