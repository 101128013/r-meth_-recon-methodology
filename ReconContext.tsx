import React, { createContext, useState, ReactNode } from 'react';

interface ReconContextType {
  target: string;
  setTarget: (value: string) => void;
  asn: string;
  setAsn: (value: string) => void;
  org: string;
  setOrg: (value: string) => void;
}

export const ReconContext = createContext<ReconContextType>({
  target: 'target.com',
  setTarget: () => {},
  asn: 'ASXXXXX',
  setAsn: () => {},
  org: 'Target Org',
  setOrg: () => {},
});

export const ReconProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [target, setTarget] = useState('target.com');
  const [asn, setAsn] = useState('ASXXXXX');
  const [org, setOrg] = useState('Target Org');

  return (
    <ReconContext.Provider value={{ target, setTarget, asn, setAsn, org, setOrg }}>
      {children}
    </ReconContext.Provider>
  );
};
