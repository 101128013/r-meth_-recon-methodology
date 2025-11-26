import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionViewer } from '../components/SectionViewer';
import { ReconSection, ContentType } from '../types';

const sampleSection: ReconSection = {
  id: 'test-section',
  title: 'Test Section',
  items: [
    { id: 't-1', title: 'Cmd', type: ContentType.COMMAND, content: `echo test`, meta: { language: 'bash' } },
    { id: 't-2', title: 'Text', type: ContentType.TEXT, content: 'Some text' },
    { id: 't-3', title: 'List', type: ContentType.LIST, content: ['one', 'two'] }
  ]
};

describe('SectionViewer', () => {
  it('renders section title and items', () => {
    render(<SectionViewer section={sampleSection} />);

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Cmd')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
  });
});
