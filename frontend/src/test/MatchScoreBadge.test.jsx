import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MatchScoreBadge from '../components/MatchScoreBadge';

describe('MatchScoreBadge Component', () => {
  it('renders score percentage correctly', () => {
    render(<MatchScoreBadge score={85} />);
    expect(screen.getByText(/85% Match/i)).toBeInTheDocument();
  });

  it('renders high match indicator styling', () => {
    render(<MatchScoreBadge score={92} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-emerald-700');
  });

  it('renders moderate match indicator styling', () => {
    render(<MatchScoreBadge score={65} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-blue-700');
  });

  it('shows breakdown reasons when clicked', () => {
    const reasons = ['Direct skill match in React, Node.js', 'Matching full-time availability'];

    render(
      <MatchScoreBadge
        score={85}
        reasons={reasons}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText(/Why this recommendation\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct skill match in React, Node.js/i)).toBeInTheDocument();
  });
});
